

import { Command } from 'commander';
import { log } from 'console';
import { existsSync, readFileSync, statSync, writeFileSync } from 'fs';
import { colorize } from 'json-colorizer';
import { createSpinner } from 'nanospinner';
import { join } from 'path';

import { Config, RemoteConfig } from '../interfaces/configs.js';
import { getImports, getPlaceholderImports, resolvePath } from '../utils/imports.js';
import { fail, info, item, warning } from '../utils/log.js';
import Project, { ValidationResult } from '../utils/project.js';
import { Remote } from '../utils/remote.js';

interface DebugData {
    version: number;
    remotes: {
        remote: string;
        config: RemoteConfig | null;
    }[];
    format: string;
    rsc: boolean;
    tailwindConfig: {
        exists: boolean;
        file: boolean;
    };
    palette: {
        [key: string]: string;
    };
    backgrounds: {
        [key: string]: string;
    };
    paths: {
        [key: string]: {
            alias: string | undefined;
            exists: boolean;
            directory: boolean;
        };
    };
    components: {
        [key: string]: {
            id: string;
            remote: string;
            uptodate: boolean;
            versions: {
                remote: string;
                local: string;
            };
            dependencies: string[];
            utils: string[];
            packages: string[];
        };
    };
    utils: {
        [key: string]: {
            id: string;
            remote: string;
            uptodate: boolean;
            versions: {
                remote: string;
                local: string;
            };
            dependencies: string[];
            utils: string[];
            packages: string[];
        };
    };
}

class Debug {
    private project: Project;
    private config?: Config;
    private remote: Remote;

    private debug: boolean = false;
    private output: 'text' | 'json' | 'file' = 'text';

    private spinner = createSpinner('');

    constructor() {
        this.project = new Project();

        this.remote = new Remote(Project.getDefaultConfig());
    }

    build() {
        return new Command()
            .name('debug')
            .description('Display useful debugging information for bug reports and issues.')
            .option('-o, --output <value>', 'Change the output type. (text, json, file)')
            .option('-d, --debug', 'Print out all the steps.')
            .action((...args: any[]) => {
                // @ts-ignore
                this.run(...args);
            });
    }

    async run(options: {
        output: 'text' | 'json' | 'file';
        debug: boolean;
    }) {
        this.validate();
        this.config = this.project.getConfig();
        this.remote = new Remote(this.config);

        this.debug = options.debug;
        this.output = options.output;

        if (!this.output) {
            this.output = 'text';
        }

        if (this.output === 'text') {
            this.outputText();
        } else if (this.output === 'json') {
            this.outputJson();
        } else if (this.output === 'file') {
            this.outputFile();
        } else {
            warning('Invalid output type. Valid options are: text, json, file. Defaulting to text output.');

            this.outputText();
        }
    }

    private async outputText() {
        info(`Quantum CLI Debug Print \x1b[90m(${new Date().toISOString()})\x1b[0m`);

        const data = await this.collectData();

        log('\x1b[93mProject Configuration\x1b[0m:');
        item('\x1b[93mVersion\x1b[0m:', data.version);
        item(`\x1b[93mRemotes \x1b[90m(${data.remotes.length})\x1b[0m:`);

        for (const remote of data.remotes) {
            if (!remote.config) continue;

            log('    ' + remote.config.name + ' \x1b[90m(' + remote.remote + ')\x1b[0m:');
            log('      Enabled:', (remote.config.enabled ? '\x1b[32m✔ Yes' : '\x1b[31m✖ No') + '\x1b[0m');
            log('      Environment:', (remote.config.environment === 'development' ? '\x1b[33mDevelopment' : '\x1b[32mProduction') + '\x1b[0m');
            log('      Components:', Object.keys(remote.config.components).length);
            log('      Utilities:', Object.keys(remote.config.utils).length);
        }

        item('\x1b[93mFormat\x1b[0m:', data.format === 'tsx' ? 'TypeScript' : 'JavaScript');
        item('\x1b[93mRSC\x1b[0m:', (data.rsc ? '\x1b[32m✔ Enabled' : '\x1b[31m✖ Disabled') + '\x1b[0m');
        item('\x1b[93mTailwind Config\x1b[0m:', (data.tailwindConfig.file ? '\x1b[32m✔ Exists' : '\x1b[31m✖ Misconfigured or missing') + '\x1b[0m');
        item('\x1b[93mPalette\x1b[0m:');

        Object.keys(data.palette).forEach((key) => log('    ' + key + ': ' + data.palette[key]));

        item('\x1b[93mBackgrounds\x1b[0m:');

        Object.keys(data.backgrounds).forEach((key) => log('    ' + key + ': ' + data.backgrounds[key]));

        item('\x1b[93mPaths\x1b[0m:');

        Object.keys(data.paths).forEach((key) => {
            if (!data.paths[key]) return;

            log('    ' + key + ': ' + data.paths[key].alias + ' ' + (data.paths[key].directory ? '\x1b[32m✔ Exists' : '\x1b[31m✖ Misconfigured or missing') + '\x1b[0m');
        });

        item(`\x1b[93mComponents \x1b[90m(${Object.keys(data.components).length})\x1b[0m:`);

        for (const component of Object.keys(data.components)) {
            if (!data.components[component]) continue;
            if (!data.components[component].versions.remote) continue;

            log('    ' + component + ' \x1b[90m(' + data.components[component].id + ' from ' + data.components[component].remote + ')\x1b[0m:');
            log('      Up-to-date: ' + (data.components[component].uptodate ? '\x1b[32m✔ Yes' : '\x1b[31m✖ No') + '\x1b[0m');
            log('      Remote Version:', '\x1b[32m' + data.components[component].versions.remote + '\x1b[0m');
            log('      Local Version:', (data.components[component].uptodate ? '\x1b[32m' : '\x1b[31m') + data.components[component].versions.local + '\x1b[0m');
            log('      Dependencies:', '\x1b[96m' + (data.components[component].dependencies.length > 0 ? data.components[component].dependencies.join('\x1b[0m, \x1b[96m') : '\x1b[90mNone') + '\x1b[0m');
            log('      Utils:', '\x1b[96m' + (data.components[component].utils.length > 0 ? data.components[component].utils.join('\x1b[0m, \x1b[96m') : '\x1b[90mNone') + '\x1b[0m');
            log('      Packages:', '\x1b[96m' + (data.components[component].packages.length > 0 ? data.components[component].packages.join('\x1b[0m, \x1b[96m') : '\x1b[90mNone') + '\x1b[0m');
        }

        item(`\x1b[93mUtilities \x1b[90m(${Object.keys(data.utils).length})\x1b[0m:`);

        for (const util of Object.keys(data.utils)) {
            if (!data.utils[util]) continue;
            if (!data.utils[util].versions.remote) continue;

            log('    ' + util + ' \x1b[90m(' + data.utils[util].id + ' from ' + data.utils[util].remote + ')\x1b[0m:');
            log('      Up-to-date: ' + (data.utils[util].uptodate ? '\x1b[32m✔ Yes' : '\x1b[31m✖ No') + '\x1b[0m');
            log('      Remote Version:', '\x1b[32m' + data.utils[util].versions.remote + '\x1b[0m');
            log('      Local Version:', (data.utils[util].uptodate ? '\x1b[32m' : '\x1b[31m') + data.utils[util].versions.local + '\x1b[0m');
            log('      Dependencies:', '\x1b[96m' + (data.utils[util].dependencies.length > 0 ? data.utils[util].dependencies.join('\x1b[0m, \x1b[96m') : '\x1b[90mNone') + '\x1b[0m');
            log('      Utils:', '\x1b[96m' + (data.utils[util].utils.length > 0 ? data.utils[util].utils.join('\x1b[0m, \x1b[96m') : '\x1b[90mNone') + '\x1b[0m');
            log('      Packages:', '\x1b[96m' + (data.utils[util].packages.length > 0 ? data.utils[util].packages.join('\x1b[0m, \x1b[96m') : '\x1b[90mNone') + '\x1b[0m');
        }
    }

    private async outputJson() {
        log(colorize(await this.formatData()));
    }

    private async outputFile() {
        const file = `quantum-debug-${new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-')}.json`;

        if (existsSync(file)) {
            fail('File already exists:', file);

            return;
        }

        writeFileSync(file, JSON.stringify(await this.formatData(), null, 4));

        info('Debug information saved to:', file);
    }

    private async formatData(): Promise<Object> {
        const data = await this.collectData();

        return {
            version: data.version,
            remotes: data.remotes.map((remote) => ({
                name: remote?.config?.name,
                remote: remote.remote,
                enabled: remote?.config?.enabled,
                environment: remote?.config?.environment,
                components: Object.keys(remote?.config?.components ?? {}).length,
                utilities: Object.keys(remote?.config?.utils ?? {}).length,
            })),
            format: data.format,
            rsc: data.rsc,
            tailwind_config: data.tailwindConfig.file ? 'exists' : 'missing',
            palette: data.palette,
            backgrounds: data.backgrounds,
            paths: Object.entries(data.paths).map(([name, path]) => ({
                name,
                alias: path.alias,
                exists: path.directory
            })),
            components: Object.entries(data.components).map(([name, component]) => ({
                name,
                id: component.id,
                remote: component.remote,
                uptodate: component.uptodate,
                versions: component.versions,
                dependencies: component.dependencies,
                utils: component.utils,
                packages: component.packages,
            })),
            utils: Object.entries(data.utils).map(([name, util]) => ({
                name,
                id: util.id,
                remote: util.remote,
                uptodate: util.uptodate,
                versions: util.versions,
                dependencies: util.dependencies,
                utils: util.utils,
                packages: util.packages,
            })),
        };
    }

    private async collectData(): Promise<DebugData> {
        const config = this.config || this.project.getConfig();

        const data: DebugData = {
            version: config.$version,
            remotes: [],
            format: config.format,
            rsc: config.server_components,
            tailwindConfig: {
                exists: existsSync(config.tailwind_config),
                file: existsSync(config.tailwind_config) && statSync(config.tailwind_config).isFile(),
            },
            palette: Object.fromEntries(Object.entries(config.palette).map(([key, value]) => [key, value.value])),
            backgrounds: config.backgrounds,
            paths: {},
            components: {},
            utils: {},
        };

        await Promise.all(config.remotes.map(async (remote) => {
            data.remotes.push({
                remote,
                config: await this.remote.getRemoteConfig(remote, false, !this.debug),
            });
        }));

        for (const path of Object.keys(config.paths)) {
            if (!config.paths[path]) continue;

            data.paths[path] = {
                alias: config.paths[path],
                exists: !!resolvePath(config.paths[path]) && existsSync(resolvePath(config.paths[path]) as string),
                directory: !!resolvePath(config.paths[path]) && existsSync(resolvePath(config.paths[path]) as string) && statSync(resolvePath(config.paths[path]) as string).isDirectory(),
            };
        }

        if (config.components) for (const [name, component] of Object.entries(config.components)) {
            const remote = data.remotes.find((remote) => remote.remote === component.remote);

            if (!remote) continue;
            if (!remote.config) continue;
            if (!remote.config.components?.[component.id]) continue;
            if (!config.paths.components) continue;
            if (!config.paths.utils) continue;

            let dependencies = [];
            let utils = [];
            let packages = [];


            if (data.paths?.components?.directory) {
                const componentsPath = resolvePath(config.paths.components);
                if (componentsPath) {
                    const path = join(componentsPath, `${name}.${data.format === 'tsx' ? 'tsx' : 'jsx'}`);

                    dependencies.push(...getPlaceholderImports(readFileSync(path, 'utf-8'), config.paths.components, true));
                    utils.push(...getPlaceholderImports(readFileSync(path, 'utf-8'), config.paths.utils, true));
                    packages.push(...getImports(readFileSync(path, 'utf-8')));
                }
            } else {
                dependencies = [];
                utils = [];
                packages = [];
            }

            data.components[name] = {
                id: component.id,
                remote: component.remote,
                uptodate: this.project.isComponentUpToDate(name, remote?.config?.components?.[component?.id]?.version ?? '0.0.0'),
                versions: {
                    remote: remote?.config?.components?.[component?.id]?.version ?? '0.0.0',
                    local: component?.version ?? '0.0.0',
                },
                dependencies,
                utils,
                packages,
            };
        }

        if (config.utils) for (const [name, util] of Object.entries(config.utils)) {
            const remote = data.remotes.find((remote) => remote.remote === util.remote);

            if (!remote) continue;
            if (!remote.config) continue;
            if (!remote.config.utils?.[util.id]) continue;
            if (!config.paths.components) continue;
            if (!config.paths.utils) continue;

            let dependencies = [];
            let utils = [];
            let packages = [];

            if (data.paths?.utils?.directory) {
                const utilsPath = resolvePath(config.paths.utils);
                if (utilsPath) {
                    const path = join(utilsPath, `${name}.${data.format === 'tsx' ? 'ts' : 'js'}`);

                    dependencies.push(...getPlaceholderImports(readFileSync(path, 'utf-8'), config.paths.components, true));
                    utils.push(...getPlaceholderImports(readFileSync(path, 'utf-8'), config.paths.utils, true));
                    packages.push(...getImports(readFileSync(path, 'utf-8')));
                }
            } else {
                dependencies = [];
                utils = [];
                packages = [];
            }

            data.utils[name] = {
                id: util.id,
                remote: util.remote,
                uptodate: this.project.isUtilUpToDate(name, remote?.config?.utils?.[util?.id]?.version ?? '0.0.0'),
                versions: {
                    remote: remote?.config?.utils?.[util?.id]?.version ?? '0.0.0',
                    local: util.version,
                },
                dependencies,
                utils,
                packages,
            };
        }

        return data;
    }

    private validate() {
        const finishTask = this.spinner[this.debug ? 'success' : 'update'];
        const failTask = this.spinner.error;

        const result = this.project.validate();

        if (result === ValidationResult.Passed) {
            finishTask({
                text: 'Project validated successfully.',
            });

            return true;
        }

        if (result === ValidationResult.ConfigurationMissing) {
            failTask({
                text: 'Failed to validate project. Please make sure you have Quantum set up and configured. Run `init` to set up a new Quantum project.',
            });

            process.exit(1);
        }

        if (result === ValidationResult.PathsNotConfigured) {
            failTask({
                text: 'Failed to validate paths. Please configure the paths in your Quantum configuration. `components` and `utils` paths are required.',
            });

            process.exit(1);
        }

        if (result === ValidationResult.FormatInvalid) {
            failTask({
                text: 'Invalid format. Please check your Quantum configuration.',
            });

            process.exit(1);
        }

        if (result === ValidationResult.RemoteMissing) {
            failTask({
                text: 'You have no remotes configured. Please add a remote to your Quantum configuration.',
            });

            process.exit(1);
        }

        if (result === ValidationResult.TailwindConfigMissing) {
            failTask({
                text: 'Failed to validate Tailwind configuration. Please set the path to your Tailwind configuration in your Quantum configuration.',
            });

            process.exit(1);
        }

        if (result === ValidationResult.TailwindConfigInvalid) {
            failTask({
                text: 'Failed to validate Tailwind configuration. The Tailwind configuration is does not exist or is a directory.',
            });

            process.exit(1);
        }

        if (result === ValidationResult.PaletteMissing) {
            failTask({
                text: 'No palette found in your Quantum configuration. Please add a palette to your Quantum configuration.',
            });

            process.exit(1);
        }

        if (result === ValidationResult.BackgroundsMissing) {
            failTask({
                text: 'No backgrounds found in your Quantum configuration. Please add `dark` and `light` backgrounds to your Quantum configuration.',
            });

            process.exit(1);
        }

        if (result === ValidationResult.Failed) {
            failTask({
                text: 'Failed to validate project. Unknown error.',
            });

            process.exit(1);
        }
    }
}

export default new Debug().build();
