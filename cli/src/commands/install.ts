import { Command } from 'commander';
import { createSpinner } from 'nanospinner';
import prompts from 'prompts';

import { Config, RemoteConfig } from '../interfaces/configs.js';
import { Components, InputComponents } from '../utils/components.js';
import Project, { InstallStatus, ValidationResult } from '../utils/project.js';
import { Remote } from '../utils/remote.js';

class Install {
    private project: Project;
    private config?: Config;
    private remote?: Remote;

    private debug: boolean = false;
    private noInput: boolean = false;
    private fileNameOverride: string = '';
    private forceOverride: boolean = false;
    private skipPackage: boolean = false;

    private spinner = createSpinner('');

    constructor() {
        this.project = new Project();
    }

    build() {
        return new Command()
            .name('install')
            .description('Install a component.')
            .option('-d, --debug', 'Print out all the steps.')
            .option('-y, --yes', 'Skip all prompts and use default values.')
            .option('-sp, --skip-package', 'Skip installing the packages.')
            .option('-f, --force', 'Force override the component if it already exists.')
            .option('-fn, --file-name-override <name>', 'Override the file name of the component if conflicts occur.')
            .argument('[remote]', 'The remote to install the component from.')
            .argument('[components...]', 'The components to install.')
            .action((...args: any[]) => {
                // @ts-ignore
                this.run(...args);
            });
    }

    async run(remote: string, inputComponents: string[], options: {
        debug: boolean;
        yes: boolean;
        skipPackage: boolean;
        force: boolean;
        fileNameOverride: string
    }) {
        const failTask = this.spinner.error;
        const warnTask = this.spinner.warn;

        this.validate();
        this.config = this.project.getConfig();
        this.remote = new Remote(this.config);

        this.debug = options.debug;
        this.noInput = options.yes;
        this.skipPackage = options.skipPackage;
        this.fileNameOverride = options.fileNameOverride;
        this.forceOverride = options.force;

        const remotes: {
            [key: string]: RemoteConfig | null;
        } = {};

        if (remote && !this.config.remotes.includes(remote)) {
            failTask({
                text: `Remote ${remote} is not configured in your Quantum configuration.`,
            });

            process.exit(1);
        }

        if (options.yes && inputComponents.length === 0) {
            failTask({
                text: 'No components provided with the `--yes` flag.',
            });

            process.exit(1);
        }

        for (const r of this.config.remotes) {
            if (remote && remote !== r) {
                continue;
            }

            const remoteConfig = await this.remote.getRemoteConfig(r, false, true);

            if (!remoteConfig) {
                failTask({
                    text: `Failed to get remote configuration for ${r}.`,
                });

                remotes[r] = null;
                continue;
            }

            remotes[r] = remoteConfig;
        }

        const chosenRemote = remote ? { value: remote } : await prompts({
            type: 'select',
            name: 'value',
            message: 'Choose a remote to install the component from:',
            choices: (this.config?.remotes ?? []).map((r) => ({
                title: `${remotes[r] ? remotes[r].name : r}\x1b[0m${remotes[r] ? (remotes[r] && remotes[r].environment === 'development' ? ' \x1b[33m⚠ (development)' : '') : ''}${remotes[r] ? (!remotes[r].enabled ? ' \x1b[31m✖ Remote is disabled' : '') : '\x1b[31m✖ Invalid'}${remotes[r] ? ` \x1b[90m(${r})` : ''}\x1b[0m`,
                value: r,
                disabled: remotes[r] ? !remotes[r].enabled : false
            })),
        }, {
            onCancel: () => {
                process.exit(1);
            },
        });

        const remoteConfigData = remotes[chosenRemote.value];

        if (!remoteConfigData) {
            failTask({
                text: `Failed to get remote configuration for ${chosenRemote.value}.`,
            });

            process.exit(1);
        }

        if (inputComponents && inputComponents.length > 0 && [...inputComponents].every((component) => !Object.keys(remoteConfigData.components).includes(component))) {
            const badComponents = [...inputComponents].filter((component) => !Object.keys(remoteConfigData.components).includes(component));

            inputComponents = inputComponents.filter((component) => !badComponents.includes(component));

            warnTask({
                text: inputComponents.join(', ') + ' components does not exist in the remote. Excluding them from the installation...',
            });
        }

        if (Object.entries(remoteConfigData.components).length === 0) {
            failTask({
                text: 'No components are available in the remote.',
            });

            process.exit(1);
        }

        const components = inputComponents && inputComponents.length > 0 ? { value: inputComponents } : await prompts({
            type: 'multiselect',
            name: 'value',
            message: 'Select components to install:',
            choices: Object.entries(remoteConfigData.components).map(([name, component]) => {
                const isInstalled = this.project.getComponentInstallStatus(name, chosenRemote.value) === InstallStatus.FullyInstalled || this.project.getComponentInstallStatus(name) === InstallStatus.FileDoesNotExistInstalled;

                return {
                    title: `${isInstalled ? '\x1b[0m\x1b[90m' : '\x1b[97m'}${name}\x1b[0m \x1b[90m${component.version}${isInstalled ? ' \x1b[32m ✔ Installed' : ''}\x1b[0m`,
                    value: name,
                    disabled: isInstalled,
                };
            }),
        }, {
            onCancel: () => {
                process.exit(1);
            },
        });

        if (components.value.length === 0) {
            failTask({
                text: 'No components selected.',
            });

            process.exit(1);
        }

        const selectedComponents: InputComponents = components.value.map((component: string) => ({
            id: component,
            version: remoteConfigData?.components?.[component]?.version ?? '0.0.0',
            remote: chosenRemote.value ?? '',
        }));

        await new Components(this.config, this.debug, this.noInput, this.fileNameOverride, this.forceOverride, this.skipPackage, []).install(selectedComponents);
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

export default new Install().build();
