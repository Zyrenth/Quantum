
import { log } from 'console';
import { existsSync, readFileSync } from 'fs';
import { createSpinner } from 'nanospinner';
import { join } from 'path';
import prompts from 'prompts';
import semver from 'semver';

import { Config } from '../interfaces/configs.js';
import { CLI } from './cli.js';
import { convertToJs, format } from './compile.js';
import { getImports, getPlaceholderImports, resolvePath } from './imports.js';
import { info, item, wipePreviousLine } from './log.js';
import { installPackages, uninstallPackages } from './packages.js';
import Project, { InstallStatus } from './project.js';
import { Remote } from './remote.js';
import { trycatch } from './trycatch.js';

export interface Contents {
    components: {
        [component: string]: {
            name: string;
            id: string;
            content: string;
            dependencies: string[];
            utils: string[];
            packages: string[];
            version: string;
            remote: string;
            installed: boolean;
        }
    };
    utils: {
        [util: string]: {
            name: string;
            id: string;
            content: string;
            dependencies: string[];
            utils: string[];
            packages: string[];
            version: string;
            remote: string;
            installed: boolean;
        }
    };
}

enum ProcessMode {
    Install,
    Update,
    Uninstall,
}

interface ProcessedFile {
    content: string;
    dependencies: string[];
    utils: string[];
    packages: string[];
}

export type InputComponents = {
    id: string;
    remote: string;
    version: string;
}[];

export class Components {
    private config: Config;
    private project: Project;

    private componentsPath: string;
    private utilsPath: string;

    private debug: boolean;
    private noInput: boolean;
    private fileNameOverride: string;
    private forceOverride: boolean;
    private skipPackages: boolean;
    private dependenciesToKeep: string[];

    private remote: Remote;

    private contents: Contents = {
        components: {},
        utils: {},
    };

    private spinner = createSpinner('');

    /**
     * @description Component manager.
     * @param config Project configuration.
     * @param remoteConfig Remote configuration.
     * @param noInput Whether to skip user input. (--yes CLI flag)
     * @param skipPackages Whether to skip package installation. (--skip-package CLI flag)
     */
    constructor(config: Config, debug: boolean, noInput: boolean, fileNameOverride: string, forceOverride: boolean, skipPackages: boolean, dependenciesToKeep: string[]) {
        this.remote = new Remote(config);
        this.project = new Project();

        this.config = config;

        this.componentsPath = resolvePath(config.paths.components) as string;
        this.utilsPath = resolvePath(config.paths.utils) as string;

        this.debug = debug;
        this.noInput = noInput;
        this.fileNameOverride = fileNameOverride;
        this.forceOverride = forceOverride;
        this.skipPackages = skipPackages;
        this.dependenciesToKeep = dependenciesToKeep;
    }

    public async install(components: InputComponents): Promise<void> {
        this.spinner.start({
            text: 'Collecting install data...',
        });

        const finishTask = this.spinner[this.debug ? 'success' : 'update'];
        const updateTask = this.spinner.update;
        // eslint-disable-next-line no-unused-vars
        const failTask = this.spinner.error;
        const warnTask = this.spinner.warn;
        const concludeTask = this.spinner.success;

        const remotes = components.map((component) => component.remote).filter((remote, index, self) => index === self.findIndex((t) => t === remote));

        for (const remote of remotes) {
            const remoteConfig = await this.remote.getRemoteConfig(remote, false, !this.debug);

            if (!remoteConfig) {
                warnTask({
                    text: `Remote ${remote} not found.`,
                });

                process.exit(1);
            }

            if (remoteConfig.environment !== 'production' && !CLI.getIgnoreDevWarning()) {
                if (this.spinner.isSpinning()) {
                    this.spinner.stop();
                    wipePreviousLine();
                }

                const confirm = await prompts({
                    type: 'confirm',
                    name: 'value',
                    message: 'One or more remotes are not production remotes. Do you want to continue?'
                }, {
                    onCancel: () => {
                        process.exit(1);
                    },
                });

                if (!confirm.value) {
                    concludeTask({
                        text: 'Installation cancelled.',
                    });

                    return;
                }

                CLI.setIgnoreDevWarning(true);

                break;
            } else if (remoteConfig.environment !== 'production' && CLI.getIgnoreDevWarning()) {
                warnTask({
                    text: 'One or more remotes are not production remotes, components installed from those might not be stable.',
                });
            }
        }

        for (const component of components) {
            await this.processComponents(component.id, component, ProcessMode.Install);
        }

        const utils = Object.values(this.contents.components).flatMap((component) => component.utils.map((util) => ({
            id: util,
            remote: component.remote,
        }))).flat().filter((util, index, self) => index === self.findIndex((t) => t.id === util.id && t.remote === util.remote));

        for (const util of utils) {
            await this.processUtils(util.id, util.remote, ProcessMode.Install);
        }

        finishTask({
            text: 'Collected install data.',
        });

        updateTask({
            text: 'Collecting and installing packages...',
        });

        let packages = [
            ...Object.values(this.contents.components).flatMap((component) => component.packages),
            ...Object.values(this.contents.utils).flatMap((util) => util.packages),
        ].filter((pkg, index, self) => self.indexOf(pkg) === index);

        const installedPackages: string[] = [];

        const [result] = await trycatch(() => JSON.parse(readFileSync(join('package.json'), 'utf-8')));

        if (result) {
            // @ts-ignore
            installedPackages.push(...Object.keys(result?.dependencies ?? {}));
            // @ts-ignore
            installedPackages.push(...Object.keys(result?.devDependencies ?? {}));
        }

        const componentsToInstall = Object.values(this.contents.components).filter((component) => components.some((comp) => comp.id === component.id && comp.remote === component.remote));
        const dependenciesToInstall = Object.values(this.contents.components).filter((component) => !components.some((comp) => comp.id === component.id && comp.remote === component.remote));

        log('');

        info('Install overview:');
        log('Components:');
        componentsToInstall
            .forEach((component) => item(`${component.name}${component?.installed ? ' \x1b[32m✔ Installed' : ''} \x1b[90m(${component.id} from ${component.remote})\x1b[0m`));
        dependenciesToInstall
            .forEach((dependency) => item(`${dependency.name} \x1b[96mℹ Dependency${dependency?.installed ? ' \x1b[32m✔ Installed' : ''} \x1b[90m(${dependency.id} from ${dependency.remote})\x1b[0m`));
        componentsToInstall.length === 0 && dependenciesToInstall.length === 0 && item('\x1b[90mNo components to install.\x1b[0m');

        log('');

        log('Utils:');
        utils
            .map(util => Object.values(this.contents.utils).find(u => u.id === util.id && u.remote === util.remote))
            .forEach((util) => item(`${util?.name}${util?.installed ? ' \x1b[32m✔ Installed' : ''} \x1b[90m(${util?.id} from ${util?.remote})\x1b[0m`));
        utils.length === 0 && item('\x1b[90mNo utils to install.\x1b[0m');

        log('');

        log('Packages:');
        packages.forEach((pkg) => item(`${pkg}${installedPackages.includes(pkg) ? ' \x1b[32m✔ Installed' : ''}\x1b[0m`));
        packages.length === 0 && item('\x1b[90mNo packages to install.\x1b[0m');

        log('');

        if (componentsToInstall.length === 0 && dependenciesToInstall.length === 0) {
            concludeTask({
                text: 'No components to install.',
            });

            return;
        }

        packages = packages.filter((pkg) => !installedPackages.includes(pkg));

        updateTask({
            text: 'Installing packages...',
        }).start();

        if (!this.skipPackages) {
            if (packages.length > 0) {
                await installPackages(packages, false, () => {
                    warnTask({
                        text: 'Failed to install packages. Skipping package installation.',
                    });
                });
            } else {
                warnTask({
                    text: 'No packages to install. Skipping package installation.',
                });
            }
        } else {
            warnTask({
                text: 'Skipping package installation.',
            });
        }

        finishTask({
            text: 'Installed packages.',
        });

        updateTask({
            text: 'Installing components...',
        });

        for (const component of Object.values(this.contents.components).filter((component) => !component.installed)) {
            const dependencyReplacements: {
                [dependency: string]: string;
            } = {};
            const utilReplacements: {
                [util: string]: string;
            } = {};

            for (const dependency of component.dependencies) {
                const [, error] = await trycatch(async () => dependencyReplacements[dependency] = Object.values(this.contents.components).find((c) => c.id === dependency && c.remote === component.remote)?.name ?? '');

                if (error) {
                    warnTask({
                        text: `Dependency ${dependency} not found.`,
                    });

                    continue;
                }
            }

            for (const util of component.utils) {
                utilReplacements[util] = Object.values(this.contents.utils).find((u) => u.id === util && u.remote === component.remote)?.name ?? '';
            }

            component.content = this.processImports(component.content, this.config.paths.components, dependencyReplacements);
            component.content = this.processImports(component.content, this.config.paths.utils, utilReplacements);

            this.project.addComponent(component.name, component.id, component.remote, component.version, component.content);

            finishTask({
                text: `Installed component ${component.id}.`,
            });
        }

        updateTask({
            text: 'Installing utils...',
        });

        for (const util of Object.values(this.contents.utils).filter((component) => !component.installed)) {
            const dependencyReplacements: {
                [dependency: string]: string;
            } = {};
            const utilReplacements: {
                [util: string]: string
            } = {};

            for (const dependency of util.dependencies) {
                const [, error] = await trycatch(async () => dependencyReplacements[dependency] = Object.values(this.contents.components).find((c) => c.id === dependency && c.remote === util.remote)?.name ?? '');

                if (error) {
                    warnTask({
                        text: `Dependency ${dependency} not found.`,
                    });

                    continue;
                }
            }

            for (const ut of util.utils) {
                utilReplacements[ut] = Object.values(this.contents.utils).find((u) => u.id === ut && u.remote === util.remote)?.name ?? '';
            }

            util.content = this.processImports(util.content, this.config.paths.components, dependencyReplacements);
            util.content = this.processImports(util.content, this.config.paths.utils, utilReplacements);

            this.project.addUtil(util.name, util.id, util.remote, util.version, util.content);

            finishTask({
                text: `Installed util ${util.id}.`,
            });
        }

        concludeTask({
            text: 'Installation complete.',
        });
    }

    public async update(components: InputComponents): Promise<void> {
        this.spinner.start({
            text: 'Collecting update data...',
        });

        const finishTask = this.spinner[this.debug ? 'success' : 'update'];
        const updateTask = this.spinner.update;
        // eslint-disable-next-line no-unused-vars
        const failTask = this.spinner.error;
        const warnTask = this.spinner.warn;
        const concludeTask = this.spinner.success;

        const remotes = components.map((component) => component.remote).filter((remote, index, self) => index === self.findIndex((t) => t === remote));

        for (const remote of remotes) {
            const remoteConfig = await this.remote.getRemoteConfig(remote, false, !this.debug);

            if (!remoteConfig) {
                warnTask({
                    text: `Remote ${remote} not found.`,
                });

                process.exit(1);
            }

            if (remoteConfig.environment !== 'production' && !CLI.getIgnoreDevWarning()) {
                if (this.spinner.isSpinning()) {
                    this.spinner.stop();
                    wipePreviousLine();
                }

                const confirm = await prompts({
                    type: 'confirm',
                    name: 'value',
                    message: 'One or more remotes are not production remotes. Do you want to continue?'
                }, {
                    onCancel: () => {
                        process.exit(1);
                    },
                });

                if (!confirm.value) {
                    concludeTask({
                        text: 'Update cancelled.',
                    });

                    return;
                }

                CLI.setIgnoreDevWarning(true);

                break;
            } else if (remoteConfig.environment !== 'production' && CLI.getIgnoreDevWarning()) {
                warnTask({
                    text: 'One or more remotes are not production remotes, components installed from those might not be stable.',
                });
            }
        }

        for (const component of components) {
            await this.processComponents(component.id, component, ProcessMode.Update);
        }

        const utils = Object.values(this.contents.components).flatMap((component) => component.utils.map((util) => ({
            id: util,
            remote: component.remote,
        }))).flat().filter((util, index, self) => index === self.findIndex((t) => t.id === util.id && t.remote === util.remote));

        for (const util of utils) {
            await this.processUtils(util.id, util.remote, ProcessMode.Update);
        }

        finishTask({
            text: 'Collected update data.',
        });

        updateTask({
            text: 'Collecting and updating packages...',
        });

        let packages = [
            ...Object.values(this.contents.components).flatMap((component) => component.packages),
            ...Object.values(this.contents.utils).flatMap((util) => util.packages),
        ].filter((pkg, index, self) => self.indexOf(pkg) === index);

        const installedPackages: string[] = [];

        const [result] = await trycatch(() => JSON.parse(readFileSync(join('package.json'), 'utf-8')));

        if (result) {
            // @ts-ignore
            installedPackages.push(...Object.keys(result?.dependencies ?? {}));
            // @ts-ignore
            installedPackages.push(...Object.keys(result?.devDependencies ?? {}));
        }

        const componentsToUpdate = Object.values(this.contents.components).filter((component) => components.some((comp) => comp.id === component.id && comp.remote === component.remote));
        const dependenciesToUpdate = Object.values(this.contents.components).filter((component) => !components.some((comp) => comp.id === component.id && comp.remote === component.remote));

        log('');

        info('Update overview:');
        log('Components:');
        componentsToUpdate
            .forEach((component) => item(`${component.name} \x1b[90m(${component.id} from ${component.remote})\x1b[0m`));
        dependenciesToUpdate
            .forEach((dependency) => item(`${dependency.name} \x1b[96mℹ Dependency \x1b[90m(${dependency.id} from ${dependency.remote})\x1b[0m`));
        componentsToUpdate.length === 0 && dependenciesToUpdate.length === 0 && item('\x1b[90mNo components to update.\x1b[0m');

        log('');

        log('Utils:');
        utils
            .map(util => Object.values(this.contents.utils).find(u => u.id === util.id && u.remote === util.remote))
            .forEach((util) => item(`${util?.name} \x1b[90m(${util?.id} from ${util?.remote})\x1b[0m`));
        utils.length === 0 && item('\x1b[90mNo utils to update.\x1b[0m');

        log('');

        log('Packages:');
        packages.forEach((pkg) => item(`${pkg}${installedPackages.includes(pkg) ? ' \x1b[32m✔ Installed' : ''}\x1b[0m`));
        packages.length === 0 && item('\x1b[90mNo packages to update.\x1b[0m');

        log('');

        if (componentsToUpdate.length === 0 && dependenciesToUpdate.length === 0) {
            concludeTask({
                text: 'No components to update.',
            });

            return;
        }

        packages = packages.filter((pkg) => !installedPackages.includes(pkg));

        updateTask({
            text: 'Updating packages...',
        }).start();

        if (!this.skipPackages) {
            if (packages.length > 0) {
                await installPackages(packages, false, () => {
                    warnTask({
                        text: 'Failed to update packages. Skipping package updates.',
                    });
                });
            } else {
                warnTask({
                    text: 'No packages to update. Skipping package updates.',
                });
            }
        } else {
            warnTask({
                text: 'Skipping package updates.',
            });
        }

        finishTask({
            text: 'Updated packages.',
        });

        updateTask({
            text: 'Updating components...',
        });

        for (const component of Object.values(this.contents.components)) {
            const dependencyReplacements: {
                [dependency: string]: string;
            } = {};
            const utilReplacements: {
                [util: string]: string;
            } = {};

            for (const dependency of component.dependencies) {
                const [, error] = await trycatch(async () => dependencyReplacements[dependency] = Object.values(this.contents.components).find((c) => c.id === dependency && c.remote === component.remote)?.name ?? '');

                if (error) {
                    warnTask({
                        text: `Dependency ${dependency} not found.`,
                    });

                    continue;
                }
            }

            for (const util of component.utils) {
                utilReplacements[util] = Object.values(this.contents.utils).find((u) => u.id === util && u.remote === component.remote)?.name ?? '';
            }

            component.content = this.processImports(component.content, this.config.paths.components, dependencyReplacements);
            component.content = this.processImports(component.content, this.config.paths.utils, utilReplacements);

            this.project.addComponent(component.name, component.id, component.remote, component.version, component.content);

            finishTask({
                text: `Updated component ${component.id}.`,
            });
        }

        updateTask({
            text: 'Updating utils...',
        });

        for (const util of Object.values(this.contents.utils)) {
            const dependencyReplacements: {
                [dependency: string]: string;
            } = {};
            const utilReplacements: {
                [util: string]: string;
            } = {};

            for (const dependency of util.dependencies) {
                const [, error] = await trycatch(async () => dependencyReplacements[dependency] = Object.values(this.contents.components).find((c) => c.id === dependency && c.remote === util.remote)?.name ?? '');

                if (error) {
                    warnTask({
                        text: `Dependency ${dependency} not found.`,
                    });

                    continue;
                }
            }

            for (const ut of util.utils) {
                utilReplacements[ut] = Object.values(this.contents.utils).find((u) => u.id === ut && u.remote === util.remote)?.name ?? '';
            }

            util.content = this.processImports(util.content, this.config.paths.components, dependencyReplacements);
            util.content = this.processImports(util.content, this.config.paths.utils, utilReplacements);

            this.project.addUtil(util.name, util.id, util.remote, util.version, util.content);

            finishTask({
                text: `Updated util ${util.id}.`,
            });
        }

        concludeTask({
            text: 'Update complete.',
        });
    }


    public async repair(components: InputComponents): Promise<void> {
        this.spinner.start({
            text: 'Collecting repair data...',
        });

        const finishTask = this.spinner[this.debug ? 'success' : 'update'];
        const updateTask = this.spinner.update;
        // eslint-disable-next-line no-unused-vars
        const failTask = this.spinner.error;
        const warnTask = this.spinner.warn;
        const concludeTask = this.spinner.success;

        const remotes = components.map((component) => component.remote).filter((remote, index, self) => index === self.findIndex((t) => t === remote));

        for (const remote of remotes) {
            const remoteConfig = await this.remote.getRemoteConfig(remote, false, !this.debug);

            if (!remoteConfig) {
                warnTask({
                    text: `Remote ${remote} not found.`,
                });

                process.exit(1);
            }

            if (remoteConfig.environment !== 'production' && !CLI.getIgnoreDevWarning()) {
                if (this.spinner.isSpinning()) {
                    this.spinner.stop();
                    wipePreviousLine();
                }

                const confirm = await prompts({
                    type: 'confirm',
                    name: 'value',
                    message: 'One or more remotes are not production remotes. Do you want to continue?'
                }, {
                    onCancel: () => {
                        process.exit(1);
                    },
                });

                if (!confirm.value) {
                    concludeTask({
                        text: 'Repair cancelled.',
                    });

                    return;
                }

                CLI.setIgnoreDevWarning(true);

                break;
            } else if (remoteConfig.environment !== 'production' && CLI.getIgnoreDevWarning()) {
                warnTask({
                    text: 'One or more remotes are not production remotes, components installed from those might not be stable.',
                });
            }
        }

        for (const component of components) {
            await this.processComponents(component.id, component, ProcessMode.Update);
        }

        const utils = Object.values(this.contents.components).flatMap((component) => component.utils.map((util) => ({
            id: util,
            remote: component.remote,
        }))).flat().filter((util, index, self) => index === self.findIndex((t) => t.id === util.id && t.remote === util.remote));

        for (const util of utils) {
            await this.processUtils(util.id, util.remote, ProcessMode.Update);
        }

        finishTask({
            text: 'Collected repair data.',
        });

        updateTask({
            text: 'Collecting and installing packages...',
        });

        let packages = [
            ...Object.values(this.contents.components).flatMap((component) => component.packages),
            ...Object.values(this.contents.utils).flatMap((util) => util.packages),
        ].filter((pkg, index, self) => self.indexOf(pkg) === index);

        const installedPackages: string[] = [];

        const [result] = await trycatch(() => JSON.parse(readFileSync(join('package.json'), 'utf-8')));

        if (result) {
            // @ts-ignore
            installedPackages.push(...Object.keys(result?.dependencies ?? {}));
            // @ts-ignore
            installedPackages.push(...Object.keys(result?.devDependencies ?? {}));
        }

        const componentsToRepair = Object.values(this.contents.components).filter((component) => components.some((comp) => comp.id === component.id && comp.remote === component.remote));
        const dependenciesToRepair = Object.values(this.contents.components).filter((component) => !components.some((comp) => comp.id === component.id && comp.remote === component.remote));

        log('');

        info('Repair overview:');
        log('Components:');
        componentsToRepair
            .forEach((component) => item(`${component.name} \x1b[90m(${component.id} from ${component.remote})\x1b[0m`));
        dependenciesToRepair
            .forEach((dependency) => item(`${dependency.name} \x1b[96mℹ Dependency \x1b[90m(${dependency.id} from ${dependency.remote})\x1b[0m`));
        componentsToRepair.length === 0 && dependenciesToRepair.length === 0 && item('\x1b[90mNo components to repair.\x1b[0m');

        log('');

        log('Utils:');
        utils
            .map(util => Object.values(this.contents.utils).find(u => u.id === util.id && u.remote === util.remote))
            .forEach((util) => item(`${util?.name} \x1b[90m(${util?.id} from ${util?.remote})\x1b[0m`));
        utils.length === 0 && item('\x1b[90mNo utils to repair.\x1b[0m');

        log('');

        log('Packages:');
        packages.forEach((pkg) => item(`${pkg}${installedPackages.includes(pkg) ? ' \x1b[32m✔ Installed' : ''}\x1b[0m`));
        packages.length === 0 && item('\x1b[90mNo packages to install.\x1b[0m');

        log('');

        if (componentsToRepair.length === 0 && dependenciesToRepair.length === 0) {
            concludeTask({
                text: 'No components to repair.',
            });

            return;
        }

        packages = packages.filter((pkg) => !installedPackages.includes(pkg));

        updateTask({
            text: 'Installing packages...',
        }).start();

        if (!this.skipPackages) {
            if (packages.length > 0) {
                await installPackages(packages, false, () => {
                    warnTask({
                        text: 'Failed to install packages. Skipping package installation.',
                    });
                });
            } else {
                warnTask({
                    text: 'No packages to install. Skipping package installation.',
                });
            }
        } else {
            warnTask({
                text: 'Skipping package installation.',
            });
        }

        finishTask({
            text: 'Installed packages.',
        });

        updateTask({
            text: 'Repairing components...',
        });

        for (const component of Object.values(this.contents.components)) {
            const dependencyReplacements: {
                [dependency: string]: string;
            } = {};
            const utilReplacements: {
                [util: string]: string;
            } = {};

            for (const dependency of component.dependencies) {
                const [, error] = await trycatch(async () => dependencyReplacements[dependency] = Object.values(this.contents.components).find((c) => c.id === dependency && c.remote === component.remote)?.name ?? '');

                if (error) {
                    warnTask({
                        text: `Dependency ${dependency} not found.`,
                    });

                    continue;
                }
            }

            for (const util of component.utils) {
                utilReplacements[util] = Object.values(this.contents.utils).find((u) => u.id === util && u.remote === component.remote)?.name ?? '';
            }

            component.content = this.processImports(component.content, this.config.paths.components, dependencyReplacements);
            component.content = this.processImports(component.content, this.config.paths.utils, utilReplacements);

            this.project.addComponent(component.name, component.id, component.remote, component.version, component.content);

            finishTask({
                text: `Repaired component ${component.id}.`,
            });
        }

        updateTask({
            text: 'Repairing utils...',
        });

        for (const util of Object.values(this.contents.utils)) {
            const dependencyReplacements: {
                [dependency: string]: string;
            } = {};
            const utilReplacements: {
                [util: string]: string;
            } = {};

            for (const dependency of util.dependencies) {
                const [, error] = await trycatch(async () => dependencyReplacements[dependency] = Object.values(this.contents.components).find((c) => c.id === dependency && c.remote === util.remote)?.name ?? '');

                if (error) {
                    warnTask({
                        text: `Dependency ${dependency} not found.`,
                    });

                    continue;
                }
            }

            for (const ut of util.utils) {
                utilReplacements[ut] = Object.values(this.contents.utils).find((u) => u.id === ut && u.remote === util.remote)?.name ?? '';
            }

            util.content = this.processImports(util.content, this.config.paths.components, dependencyReplacements);
            util.content = this.processImports(util.content, this.config.paths.utils, utilReplacements);

            this.project.addUtil(util.name, util.id, util.remote, util.version, util.content);

            finishTask({
                text: `Repaired util ${util.id}.`,
            });
        }

        concludeTask({
            text: 'Repair complete.',
        });
    }

    public async uninstall(components: InputComponents): Promise<void> {
        this.spinner.start({
            text: 'Collecting component data...',
        });

        const finishTask = this.spinner[this.debug ? 'success' : 'update'];
        const updateTask = this.spinner.update;
        // eslint-disable-next-line no-unused-vars
        const failTask = this.spinner.error;
        const warnTask = this.spinner.warn;
        const concludeTask = this.spinner.success;

        for (const [, component] of Object.entries(this.config?.components ?? {})) {
            await this.processComponents(component.id, component, ProcessMode.Uninstall);
        }

        for (const util of Object.values(this.config?.utils ?? {})) {
            await this.processUtils(util.id, util.remote, ProcessMode.Uninstall);
        }

        const processedComponents = Object.values(this.contents.components);
        const processedUtils = Object.values(this.contents.utils);

        const processedComponentsToUninstall = processedComponents.filter(component => components.some(comp => comp.id === component.id && comp.remote === component.remote));

        const componentsToRemove = processedComponents
            .filter(component => processedComponentsToUninstall.some(c => c.id === component.id && c.remote === component.remote))
            .filter(component => {
                const componentsReferencingComponent = processedComponents.filter(c => c.dependencies.includes(component.name));
                const componentsWeUninstall = processedComponentsToUninstall;

                return componentsReferencingComponent.every(c => componentsWeUninstall.some(cu => cu.id === c.id && cu.remote === c.remote));
            });

        const componentSummary = processedComponentsToUninstall.map(component => ({
            canUninstall: componentsToRemove.some(c => c.id === component.id && c.remote === component.remote),
            component,
        }));

        let dependenciesToRemove = processedComponents
            .filter(component => !components.some(comp => comp.id === component.id && comp.remote === component.remote))
            .filter(component => !componentsToRemove.some(c => c.id === component.id && c.remote === component.remote))
            .filter(component => {
                const componentsReferencingComponent = processedComponents.filter(c => c.dependencies.includes(component.name));
                const componentsWeUninstall = processedComponentsToUninstall;

                return componentsReferencingComponent.length > 0 && componentsReferencingComponent.every(c => componentsWeUninstall.some(cu => cu.id === c.id && cu.remote === c.remote));
            });

        if (this.dependenciesToKeep.length > 0 || this.noInput) {
            dependenciesToRemove = dependenciesToRemove.filter(dependency => !this.dependenciesToKeep.includes(dependency.name));
        } else if (dependenciesToRemove.length > 0) {
            const prompt = await prompts({
                type: 'multiselect',
                name: 'value',
                message: 'Select dependencies to uninstall:',
                choices: dependenciesToRemove.map(dependency => ({
                    title: `${dependency.name}\x1b[0m \x1b[90m${dependency.version}\x1b[0m`,
                    value: dependency.name,
                })),
            }, {
                onCancel: () => {
                    process.exit(1);
                },
            });

            dependenciesToRemove = dependenciesToRemove.filter(dependency => prompt.value.includes(dependency.name));
        }

        const utilsToRemove = processedUtils
            .filter(util => {
                const componentsReferencingUtil = processedComponents.filter(c => c.utils.includes(util.name));
                const componentsWeUninstall = [
                    ...componentsToRemove,
                    ...dependenciesToRemove,
                ];

                return componentsReferencingUtil.every(c => componentsWeUninstall.some(cu => cu.id === c.id && cu.remote === c.remote));
            });

        const packagesToRemove = [
            ...componentsToRemove.flatMap(component => component.packages),
            ...dependenciesToRemove.flatMap(component => component.packages),
            ...utilsToRemove.flatMap(util => util.packages),
        ]
            .filter((pkg, index, self) => self.indexOf(pkg) === index)
            .filter(pkg => {
                const contentsReferencingPackage = [
                    ...processedComponents.filter(component => component.packages.includes(pkg)),
                    ...processedUtils.filter(util => util.packages.includes(pkg)),
                ];

                const contentsWeUninstall = [
                    ...componentsToRemove,
                    ...dependenciesToRemove,
                    ...utilsToRemove,
                ];

                return contentsReferencingPackage.every(c => contentsWeUninstall.some(cu => cu.id === c.id && cu.remote === c.remote));
            });

        finishTask({
            text: 'Collected component data.',
        });

        updateTask({
            text: 'Collecting packages...',
        });

        concludeTask({
            text: 'Collected packages.',
        });

        wipePreviousLine();

        log('');

        info('Uninstall overview:');
        log('Components:');
        componentSummary
            .forEach((component) => item(`${component.canUninstall ? '' : '\x1b[31m'}${component.component.name} \x1b[90m(${component.component.id} from ${component.component.remote})\x1b[0m`, component.canUninstall ? '' : '\n\x1b[31m    ✖ Cannot uninstall due to being a dependency.\x1b[0m'));
        dependenciesToRemove
            .forEach((dependency) => item(`${dependency.name} \x1b[96mℹ Dependency \x1b[90m(${dependency.id} from ${dependency.remote})\x1b[0m`));
        componentSummary.length === 0 && dependenciesToRemove.length === 0 && item('\x1b[90mNo components to uninstall.\x1b[0m');

        log('');

        log('Utils:');
        utilsToRemove
            .map(util => Object.values(this.contents.utils).find(u => u.id === util.id && u.remote === util.remote))
            .forEach((util) => item(`${util?.name} \x1b[90m(${util?.id} from ${util?.remote})\x1b[0m`));
        utilsToRemove.length === 0 && item('\x1b[90mNo utils to uninstall.\x1b[0m');

        log('');

        log('Packages:');
        packagesToRemove.forEach((pkg) => item(pkg));
        packagesToRemove.length === 0 && item('\x1b[90mNo packages to uninstall.\x1b[0m');

        log('');

        if (componentsToRemove.length === 0 && dependenciesToRemove.length === 0) {
            concludeTask({
                text: 'No components to uninstall.',
            });

            return;
        }

        if (!this.noInput) {
            const confirm = await prompts({
                type: 'confirm',
                name: 'value',
                message: 'Are you sure you want to uninstall the components and utils?',
            }, {
                onCancel: () => {
                    process.exit(1);
                },
            });

            if (!confirm.value) {
                concludeTask({
                    text: 'Uninstallation cancelled.',
                });

                return;
            }

            const packages = packagesToRemove.length === 0 ? { value: true } : await prompts({
                type: 'confirm',
                name: 'value',
                message: 'Do you want to uninstall the packages?',
            }, {
                onCancel: () => {
                    process.exit(1);
                },
            });

            if (!packages.value) {
                this.skipPackages = true;
            }
        }

        updateTask({
            text: 'Uninstalling packages...',
        }).start();

        if (!this.skipPackages) {
            if (packagesToRemove.length > 0) {
                await uninstallPackages(packagesToRemove, () => {
                    warnTask({
                        text: 'Failed to uninstall packages. Skipping package uninstallation.',
                    });
                });
            } else {
                warnTask({
                    text: 'No packages to uninstall. Skipping package uninstallation.',
                });
            }
        } else {
            warnTask({
                text: 'Skipping package uninstallation.',
            });
        }

        finishTask({
            text: 'Uninstalled packages.',
        });

        updateTask({
            text: 'Uninstalling components...',
        });

        for (const component of [...componentsToRemove, ...dependenciesToRemove]) {
            this.project.removeComponent(component.name);

            finishTask({
                text: `Uninstalled component ${component.id}.`,
            });
        }

        updateTask({
            text: 'Uninstalling utils...',
        });

        for (const util of utilsToRemove) {
            const utilName = Object.entries(this.contents.utils).find(([, u]) => u.id === util.id && u.remote === util.remote)?.[0];

            if (!utilName) {
                warnTask({
                    text: `Util ${util.id} not found.`,
                });

                continue;
            }

            this.project.removeUtil(utilName);

            finishTask({
                text: `Uninstalled util ${util.id}.`,
            });
        }

        concludeTask({
            text: 'Uninstallation complete.',
        });
    }

    private async processComponents(id: string, component: InputComponents[0], mode: ProcessMode): Promise<void> {
        const finishTask = this.spinner[this.debug ? 'success' : 'update'];
        const updateTask = this.spinner.update;
        // eslint-disable-next-line no-unused-vars
        const failTask = this.spinner.error;
        const warnTask = this.spinner.warn;
        // eslint-disable-next-line no-unused-vars
        const concludeTask = this.spinner.success;

        if (Object.values(this.contents.components).find((c) => c.id === id && c.remote === component.remote)) return;

        if (this.spinner.isSpinning()) {
            this.spinner.stop();
            wipePreviousLine();
        }

        const rc = (await this.remote.getRemoteConfig(component.remote, false, !this.debug));

        if (!rc) {
            warnTask({
                text: `Remote ${component.remote} not found. Skipping component...`,
            });

            return;
        }

        const remoteAbbreviation = Components.filterFileName(
            rc?.name
                .split(' ')
                .map((word) => word[0])
                .join('')
                .substring(0, 4)
                .toUpperCase()
        );

        if (this.debug) updateTask({
            text: `Collecting component ${id}...`,
        });

        if (!rc?.components[id]) {
            warnTask({
                text: `Component ${id} not found in remote ${component.remote}. Skipping component...`,
            });

            return;
        }

        if (!semver.valid(rc.components[id].version)) {
            warnTask({
                text: `Component ${id} has an invalid version. Skipping component...`,
            });

            return;
        }

        const installStatus = this.project.getComponentInstallStatus(id, component.remote);

        const componentContent: Contents['components'][string] = {
            id,
            name: id,
            content: '',
            dependencies: [],
            utils: [],
            packages: [],
            version: rc.components[id].version,
            remote: component.remote,
            installed: false,
        };

        if (installStatus === InstallStatus.FullyInstalled && mode === ProcessMode.Install) {
            warnTask({
                text: `Component ${id} is already installed.`,
            });

            componentContent.installed = true;
        } else if (installStatus === InstallStatus.FileExistsNotInstalled && mode === ProcessMode.Install) {
            warnTask({
                text: `${component} component's file already exists but is not installed.`,
            });

            if (this.noInput && !this.forceOverride) {
                warnTask({
                    text: `Skipping component ${id}...`,
                });

                return;
            } else if (!this.noInput && !this.forceOverride) {
                if (this.spinner.isSpinning()) {
                    this.spinner.stop();
                    wipePreviousLine();
                }

                const choice = await prompts({
                    type: 'confirm',
                    name: 'value',
                    message: 'Do you want to overwrite it?',
                }, {
                    onCancel: () => {
                        process.exit(1);
                    },
                });

                this.spinner.start();

                if (!choice.value) {
                    warnTask({
                        text: `Skipping component ${id}...`,
                    });

                    return;
                }
            }
        } else if (installStatus === InstallStatus.NotInstalledAndConflicting && mode === ProcessMode.Install) {
            warnTask({
                text: `Component ${id} is not installed and has conflicting components.`,
            });

            if (this.noInput && !this.fileNameOverride) {
                warnTask({
                    text: `Skipping component ${id}...`,
                });

                return;
            } else if (this.fileNameOverride) {
                componentContent.name = Components.filterFileName(this.fileNameOverride);

                if (existsSync(join(this.componentsPath, `${componentContent.name}.${this.config.format === 'tsx' ? 'tsx' : 'jsx'}`)) && !this.forceOverride) {
                    warnTask({
                        text: `Provided name ${componentContent.name} already exists. Skipping component... (Use --force to override)`,
                    });

                    return;
                } else if (existsSync(join(this.componentsPath, `${componentContent.name}.${this.config.format === 'tsx' ? 'tsx' : 'jsx'}`)) && this.forceOverride) {
                    warnTask({
                        text: `Overwriting component ${id}...`,
                    });
                }
            } else {
                if (this.spinner.isSpinning()) {
                    this.spinner.stop();
                    wipePreviousLine();
                }

                const choice = await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Please select a name option to resolve the conflict:',
                    choices: [
                        {
                            title: `${remoteAbbreviation}-${id}`,
                            value: '{{abbr}}-{{id}}',
                        },
                        {
                            title: this.forceOverride ? `${id}\x1b[0m \x1b[90m(Override)\x1b[0m \x1b[33m⚠ Not recommended\x1b[0m` : `\x1b[0m\x1b[90m${id} (Override) \x1b[31mNot available, use --force to override.\x1b[0m`,
                            value: '{{id}}',
                            disabled: !this.forceOverride,
                        },
                        {
                            title: `Skip ${id}\x1b[0m \x1b[33m⚠ Not recommended\x1b[0m`,
                            value: 1,
                        },
                        {
                            title: 'Custom',
                            value: 2,
                        }
                    ],
                }, {
                    onCancel: () => {
                        process.exit(1);
                    },
                });

                this.spinner.start();

                if (choice.value === 1) {
                    warnTask({
                        text: `Skipping component ${id}...`,
                    });

                    return;
                } else if (choice.value === 2) {
                    if (this.spinner.isSpinning()) {
                        this.spinner.stop();
                        wipePreviousLine();
                    }

                    info('Available placeholders:');
                    item('{{abbr}}', 'Remote abbreviation');
                    item('{{id}}', 'Component\'s name');

                    console.log('');

                    const custom = await prompts({
                        type: 'text',
                        name: 'value',
                        message: 'Please enter a custom name:',
                        hint: '{{abbr}}-{{id}}',
                    }, {
                        onCancel: () => {
                            process.exit(1);
                        },
                    });

                    this.spinner.start();

                    if (custom.value === '') {
                        warnTask({
                            text: `Skipping component ${id}...`,
                        });

                        return;
                    }

                    componentContent.name = Components.filterFileName(custom.value);

                    if (existsSync(join(this.componentsPath, `${componentContent.name}.${this.config.format === 'tsx' ? 'tsx' : 'jsx'}`)) && !this.forceOverride) {
                        warnTask({
                            text: `Provided name ${componentContent.name} already exists. Skipping component... (Use --force to override)`,
                        });

                        return;
                    } else if (existsSync(join(this.componentsPath, `${componentContent.name}.${this.config.format === 'tsx' ? 'tsx' : 'jsx'}`)) && this.forceOverride) {
                        warnTask({
                            text: `Overwriting component ${id}...`,
                        });
                    }
                } else {
                    componentContent.name = Components.filterFileName(choice.value)
                        .replace('{{abbr}}', remoteAbbreviation)
                        .replace('{{id}}', id)
                        .replace('{{format}}', this.config.format === 'tsx' ? 'tsx' : 'jsx');

                    if (existsSync(join(this.componentsPath, `${componentContent.name}.${this.config.format === 'tsx' ? 'tsx' : 'jsx'}`)) && !this.forceOverride) {
                        warnTask({
                            text: `Provided name ${componentContent.name} already exists. Skipping component... (Use --force to override)`,
                        });

                        return;
                    } else if (existsSync(join(this.componentsPath, `${componentContent.name}.${this.config.format === 'tsx' ? 'tsx' : 'jsx'}`)) && this.forceOverride) {
                        warnTask({
                            text: `Overwriting component ${id}...`,
                        });
                    }
                }
            }
        } else if ((installStatus === InstallStatus.NotInstalled || installStatus === InstallStatus.FileExistsNotInstalled || installStatus === InstallStatus.NotInstalledAndConflicting) && (mode === ProcessMode.Update || mode === ProcessMode.Uninstall)) {
            warnTask({
                text: `Component ${id} is not installed.`,
            });

            return;
        }

        if (mode === ProcessMode.Update || mode === ProcessMode.Uninstall) {
            componentContent.name = Object.entries(this.config?.components ?? {}).find(([, c]) => c.id === id && c.remote === component.remote)?.[0] ?? id;

            if (mode === ProcessMode.Update && this.fileNameOverride) {
                const name = Components.filterFileName(this.fileNameOverride)
                    .replace('{{abbr}}', remoteAbbreviation)
                    .replace('{{id}}', id)
                    .replace('{{format}}', this.config.format === 'tsx' ? 'tsx' : 'jsx');

                if (existsSync(join(this.componentsPath, `${componentContent.name}.${this.config.format === 'tsx' ? 'tsx' : 'jsx'}`)) && !this.forceOverride) {
                    warnTask({
                        text: `Provided name ${componentContent.name} already exists. Defaulting back to the original file name... (Use --force to override)`,
                    });
                } else if (existsSync(join(this.componentsPath, `${componentContent.name}.${this.config.format === 'tsx' ? 'tsx' : 'jsx'}`)) && this.forceOverride) {
                    warnTask({
                        text: `Overwriting component ${id}...`,
                    });

                    componentContent.name = name;
                }
            }

            const integrity = this.project.verifyComponentIntegrity(componentContent.name);

            if (!integrity && this.noInput && !this.forceOverride) {
                warnTask({
                    text: `Skipping component ${id}...`,
                });

                return;
            } else if (!integrity && !this.noInput && !this.forceOverride) {
                warnTask({
                    text: `Component ${id} has been modified.`,
                });

                const choice = await prompts({
                    type: 'confirm',
                    name: 'value',
                    message: 'Do you want to override the files?',
                }, {
                    onCancel: () => {
                        process.exit(1);
                    },
                });

                this.spinner.start();

                if (!choice.value) {
                    warnTask({
                        text: `Skipping component ${id}...`,
                    });

                    return;
                }
            }
        }

        updateTask({
            text: `Processing component ${id}...`,
        });

        const content = mode !== ProcessMode.Uninstall ? await this.remote.getRemoteComponent(id, component.remote) : this.project.getComponent(id, component.remote);

        if (!content) {
            warnTask({
                text: `Failed to fetch component ${id}. Skipping component...`,
            });

            return;
        }

        const [processed, error] = await trycatch(async () => await this.processCode(content));

        if (error) {
            failTask({
                text: `An error occurred while processing component ${id}. Skipping component...`,
            });

            return;
        }

        componentContent.content = processed.content;
        componentContent.dependencies = processed.dependencies;
        componentContent.utils = processed.utils;
        componentContent.packages = processed.packages;
        if (mode === ProcessMode.Uninstall) componentContent.version = this.config.components?.[componentContent.name]?.version ?? '0.0.0';

        this.contents.components[componentContent.name] = componentContent;

        finishTask({
            text: `Processed component ${id}.`,
        });

        for (const dependency of componentContent.dependencies) {
            const dependent = Object.entries(rc?.components).find(([name]) => name === this.project.getComponentId(dependency));

            if (!dependent) {
                warnTask({
                    text: `Dependency ${dependency} not found in remote ${component.remote}.`,
                });

                continue;
            }

            if (this.project.getComponentId(dependency) === id) {
                warnTask({
                    text: `Component ${id} has a recursive dependency on itself. Skipping dependency...`,
                });

                continue;
            }

            await this.processComponents(this.project.getComponentId(dependency), {
                id: this.project.getComponentId(dependency),
                remote: component.remote,
                version: dependent?.[1]?.version ?? '0.0.0'
            }, mode);
        }
    }

    private async processUtils(id: string, remote: string, mode: ProcessMode): Promise<void> {
        const finishTask = this.spinner[this.debug ? 'success' : 'update'];
        const updateTask = this.spinner.update;
        // eslint-disable-next-line no-unused-vars
        const failTask = this.spinner.error;
        const warnTask = this.spinner.warn;
        // eslint-disable-next-line no-unused-vars
        const concludeTask = this.spinner.success;

        if (Object.values(this.contents.utils).find((u) => u.id === id && u.remote === remote)) return;

        if (this.spinner.isSpinning()) {
            this.spinner.stop();
            wipePreviousLine();
        }

        const rc = (await this.remote.getRemoteConfig(remote, false, !this.debug));

        if (!rc) {
            warnTask({
                text: `Remote ${remote} not found. Skipping util...`,
            });

            return;
        }

        const remoteAbbreviation = Components.filterFileName(
            rc?.name
                .split(' ')
                .map((word) => word[0])
                .join('')
                .substring(0, 4)
                .toUpperCase()
        );

        if (this.debug) updateTask({
            text: `Collecting util ${id}...`,
        });

        if (!rc?.utils[id]) {
            warnTask({
                text: `Util ${id} not found in remote ${remote}. Skipping util...`,
            });

            return;
        }

        if (!semver.valid(rc.utils[id])) {
            warnTask({
                text: `Util ${id} has an invalid version. Skipping util...`,
            });

            return;
        }

        const installStatus = this.project.getUtilInstallStatus(id, remote);

        const utilContent: Contents['utils'][string] = {
            id: id,
            name: id,
            content: '',
            dependencies: [],
            utils: [],
            packages: [],
            version: rc.utils[id],
            remote: remote,
            installed: false,
        };

        if (installStatus === InstallStatus.FullyInstalled && mode === ProcessMode.Install) {
            warnTask({
                text: `Util ${id} is already installed.`,
            });

            utilContent.installed = true;
        } else if (installStatus === InstallStatus.FileExistsNotInstalled && mode === ProcessMode.Install) {
            warnTask({
                text: `${id} util's file already exists but is not installed.`,
            });

            if (this.noInput && !this.forceOverride) {
                warnTask({
                    text: `Skipping util ${id}...`,
                });

                return;
            } else if (!this.noInput && !this.forceOverride) {
                if (this.spinner.isSpinning()) {
                    this.spinner.stop();
                    wipePreviousLine();
                }

                const choice = await prompts({
                    type: 'confirm',
                    name: 'value',
                    message: 'Do you want to overwrite it?',
                }, {
                    onCancel: () => {
                        process.exit(1);
                    },
                });

                this.spinner.start();

                if (!choice.value) {
                    warnTask({
                        text: `Skipping util ${id}...`,
                    });

                    return;
                }
            }
        } else if (installStatus === InstallStatus.NotInstalledAndConflicting && mode === ProcessMode.Install) {
            warnTask({
                text: `Util ${id} is not installed and has conflicting utils.`,
            });

            if (this.noInput && !this.fileNameOverride) {
                warnTask({
                    text: `Skipping util ${id}...`,
                });

                return;
            } else if (this.fileNameOverride) {
                utilContent.name = Components.filterFileName(this.fileNameOverride);

                if (existsSync(join(this.utilsPath, `${utilContent.name}.${this.config.format === 'tsx' ? 'ts' : 'js'}`)) && !this.forceOverride) {
                    warnTask({
                        text: `Provided name ${utilContent.name} already exists. Skipping util... (Use --force to override)`,
                    });

                    return;
                } else if (existsSync(join(this.utilsPath, `${utilContent.name}.${this.config.format === 'tsx' ? 'ts' : 'js'}`)) && this.forceOverride) {
                    warnTask({
                        text: `Overwriting util ${id}...`,
                    });
                }
            } else {
                if (this.spinner.isSpinning()) {
                    this.spinner.stop();
                    wipePreviousLine();
                }

                const choice = await prompts({
                    type: 'select',
                    name: 'value',
                    message: 'Please select a name option to resolve the conflict:',
                    choices: [
                        {
                            title: `${remoteAbbreviation}-${id}`,
                            value: '{{abbr}}-{{id}}',
                        },
                        {
                            title: this.forceOverride ? `${id}\x1b[0m \x1b[90m(Override) \x1b[33m⚠ Not recommended\x1b[0m` : `\x1b[0m\x1b[90m${id} (Override) \x1b[31mNot available, use --force to override.\x1b[0m`,
                            value: '{{id}}',
                            disabled: !this.forceOverride,
                        },
                        {
                            title: `Skip ${id}\x1b[0m \x1b[33m⚠ Not recommended\x1b[0m`,
                            value: 1,
                        },
                        {
                            title: 'Custom',
                            value: 2,
                        }
                    ],
                }, {
                    onCancel: () => {
                        process.exit(1);
                    },
                });

                this.spinner.start();

                if (choice.value === 1) {
                    warnTask({
                        text: `Skipping util ${id}...`,
                    });

                    return;
                } else if (choice.value === 2) {
                    if (this.spinner.isSpinning()) {
                        this.spinner.stop();
                        wipePreviousLine();
                    }

                    info('Available placeholders:');
                    item('{{abbr}}', 'Remote abbreviation');
                    item('{{id}}', 'Util\'s name');

                    console.log('');

                    const custom = await prompts({
                        type: 'text',
                        name: 'value',
                        message: 'Please enter a custom name:',
                        hint: '{{abbr}}-{{id}}',
                    }, {
                        onCancel: () => {
                            process.exit(1);
                        },
                    });

                    this.spinner.start();

                    if (custom.value === '') {
                        warnTask({
                            text: `Skipping util ${id}...`,
                        });

                        return;
                    }

                    utilContent.name = Components.filterFileName(custom.value);

                    if (existsSync(join(this.utilsPath, `${utilContent.name}.${this.config.format === 'tsx' ? 'ts' : 'js'}`)) && !this.forceOverride) {
                        warnTask({
                            text: `Provided name ${utilContent.name} already exists. Skipping util... (Use --force to override)`,
                        });

                        return;
                    } else if (existsSync(join(this.utilsPath, `${utilContent.name}.${this.config.format === 'tsx' ? 'ts' : 'js'}`)) && this.forceOverride) {
                        warnTask({
                            text: `Overwriting util ${id}...`,
                        });
                    }
                } else {
                    utilContent.name = Components.filterFileName(choice.value)
                        .replace('{{abbr}}', remoteAbbreviation)
                        .replace('{{id}}', id)
                        .replace('{{format}}', this.config.format === 'tsx' ? 'ts' : 'js');

                    if (existsSync(join(this.utilsPath, `${utilContent.name}.${this.config.format === 'tsx' ? 'ts' : 'js'}`)) && !this.forceOverride) {
                        warnTask({
                            text: `Provided name ${utilContent.name} already exists. Skipping util... (Use --force to override)`,
                        });

                        return;
                    } else if (existsSync(join(this.utilsPath, `${utilContent.name}.${this.config.format === 'tsx' ? 'ts' : 'js'}`)) && this.forceOverride) {
                        warnTask({
                            text: `Overwriting util ${id}...`,
                        });
                    }
                }
            }
        } else if ((installStatus === InstallStatus.NotInstalled || installStatus === InstallStatus.FileExistsNotInstalled || installStatus === InstallStatus.NotInstalledAndConflicting) && (mode === ProcessMode.Update || mode === ProcessMode.Uninstall)) {
            warnTask({
                text: `Util ${id} is not installed.`,
            });

            return;
        }

        if (mode === ProcessMode.Update || mode === ProcessMode.Uninstall) {
            utilContent.name = Object.entries(this.config?.utils ?? {}).find(([, u]) => u.id === id && u.remote === remote)?.[0] ?? id;

            if (mode === ProcessMode.Update && this.fileNameOverride) {
                const name = Components.filterFileName(this.fileNameOverride)
                    .replace('{{abbr}}', remoteAbbreviation)
                    .replace('{{id}}', id)
                    .replace('{{format}}', this.config.format === 'tsx' ? 'ts' : 'js');

                if (existsSync(join(this.utilsPath, `${utilContent.name}.${this.config.format === 'tsx' ? 'ts' : 'js'}`)) && !this.forceOverride) {
                    warnTask({
                        text: `Provided name ${utilContent.name} already exists. Defaulting back to the original file name... (Use --force to override)`,
                    });
                } else if (existsSync(join(this.utilsPath, `${utilContent.name}.${this.config.format === 'tsx' ? 'ts' : 'js'}`)) && this.forceOverride) {
                    warnTask({
                        text: `Overwriting util ${id}...`,
                    });

                    utilContent.name = name;
                }
            }

            const integrity = this.project.verifyUtilIntegrity(utilContent.name);

            if (!integrity && this.noInput && !this.forceOverride) {
                warnTask({
                    text: `Skipping util ${id}...`,
                });

                return;
            } else if (!integrity && !this.noInput && !this.forceOverride) {
                warnTask({
                    text: `Util ${id} has been modified.`,
                });

                const choice = await prompts({
                    type: 'confirm',
                    name: 'value',
                    message: 'Do you want to override the files?',
                }, {
                    onCancel: () => {
                        process.exit(1);
                    },
                });

                this.spinner.start();

                if (!choice.value) {
                    warnTask({
                        text: `Skipping util ${id}...`,
                    });

                    return;
                }
            }
        }

        updateTask({
            text: `Processing util ${id}...`,
        });

        const content = mode !== ProcessMode.Uninstall ? await this.remote.getRemoteUtil(id, remote) : this.project.getUtil(id, remote);

        if (!content) {
            warnTask({
                text: `Failed to fetch util ${id}. Skipping util...`,
            });

            return;
        }

        const [processed, error] = await trycatch(async () => await this.processCode(content));

        if (error) {
            failTask({
                text: `An error occurred while processing util ${id}. Skipping util...`,
            });

            return;
        }

        utilContent.content = processed.content;
        utilContent.dependencies = processed.dependencies;
        utilContent.utils = processed.utils;
        utilContent.packages = processed.packages;
        if (mode === ProcessMode.Uninstall) utilContent.version = this.config.utils?.[utilContent.name]?.version ?? '0.0.0';

        this.contents.utils[utilContent.name] = utilContent;

        finishTask({
            text: `Processed util ${id}.`,
        });

        for (const dependency of utilContent.utils) {
            const dependent = Object.entries(rc?.utils).find(([name]) => name === this.project.getUtilId(dependency));

            if (!dependent) {
                warnTask({
                    text: `Dependency ${dependency} not found in remote ${remote}.`,
                });

                continue;
            }

            if (this.project.getUtilId(dependency) === id) {
                warnTask({
                    text: `Util ${id} has a recursive dependency on itself. Skipping dependency...`,
                });

                continue;
            }

            await this.processUtils(this.project.getUtilId(dependency), remote, mode);
        }
    }

    private processImports(code: string, importAlias: string, replacements: {
        [key: string]: string;
    }): string {
        for (const [name, localName] of Object.entries(replacements)) {
            code = code.replace(new RegExp(`import\\s+(.*?)\\s+from\\s+(['"])${importAlias}\\/(.*)\\2`, 'g'), (match, imports, quote, p1) => {
                return `import ${imports} from ${quote}${importAlias}/${p1 === name ? localName : name}${quote}`;
            });
        }

        return code;
    }

    private async processCode(code: string): Promise<ProcessedFile> {
        let formatted: string | string[] = (await format(this.config.format === 'tsx' ? code : convertToJs(code, false), this.config.format === 'tsx')).split('\n');

        if (!this.config.server_components) {
            if (formatted[0] && formatted[0].trim() === '\'use client\';') formatted = formatted.slice(1);
            if (formatted[0] && formatted[0].trim() === '') formatted = formatted.slice(1);
        }

        formatted = formatted.join('\n');

        for (const path in this.config.paths) {
            formatted = formatted.replace(new RegExp(`import\\s+(.*?)\\s+from\\s+(['"])<{${path}}>\\/(.*)\\2`, 'g'), (match, imports, quote, p1) => {
                return `import ${imports} from ${quote}${this.config.paths[path]}/${p1}${quote}`;
            });
        }

        formatted = this.generateColorStyles(Object.keys(this.config.palette), formatted);
        formatted = await format(formatted, this.config.format === 'tsx');

        return {
            content: formatted,
            dependencies: getPlaceholderImports(formatted, this.config.paths?.components ?? '@/components', true),
            utils: getPlaceholderImports(formatted, this.config.paths?.utils ?? '@/utils', true),
            packages: getImports(formatted),
        };
    }

    private generateColorStyles(colors: string[], input: string): string {
        return input.replace(
            /(\s*)\/\*\s*<<\s*([\s\S]*?)\s*>>\s*\*\//g,
            (match, indent, template) => {
                let stringTemplate = template;

                for (const [name, paletteColor] of Object.entries(this.config.palette)) {
                    stringTemplate = stringTemplate.replace(new RegExp(`{{tag:${paletteColor.tag}}}`, 'g'), name);
                }

                return colors
                    .map(color => `${indent}${stringTemplate.replace(/{{color}}/g, color)}`)
                    .join('');
            }
        );
    }

    public static filterFileName(name: string): string {
        return name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            // eslint-disable-next-line no-control-regex
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
            .replace(/^\.+$/, '')
            .replace(/[. ]+$/, '');
    }
}
