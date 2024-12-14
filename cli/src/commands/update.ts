import { Command } from 'commander';
import { createSpinner } from 'nanospinner';
import prompts from 'prompts';

import { Config, RemoteConfig } from '../interfaces/configs.js';
import { Components, InputComponents } from '../utils/components.js';
import Project, { ValidationResult } from '../utils/project.js';
import { Remote } from '../utils/remote.js';

class Update {
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
            .name('update')
            .description('Update a component to a newer version.')
            .option('-d, --debug', 'Print out all the steps.')
            .option('-y, --yes', 'Skip all prompts and use default values.')
            .option('-sp, --skip-package', 'Skip updating the packages.')
            .option('-f, --force', 'Force override the component if it already exists.')
            .option('-fn, --file-name-override <name>', 'Override the file name of the component if conflicts occur.')
            .argument('[components...]', 'The local names of the components to update.')
            .action((...args: any[]) => {
                // @ts-ignore
                this.run(...args);
            });
    }

    async run(inputComponents: string[], options: {
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
            [key: string]: RemoteConfig;
        } = {};

        if (options.yes && inputComponents.length === 0) {
            failTask({
                text: 'No components provided with the `--yes` flag.',
            });

            process.exit(1);
        }

        if (inputComponents && inputComponents.length > 0 && [...inputComponents].every((component) => this.config?.components && !Object.keys(this.config.components).includes(component))) {
            const badComponents = [...inputComponents].filter((component) => this.config?.components && !Object.keys(this.config.components).includes(component));

            inputComponents = inputComponents.filter((component) => !badComponents.includes(component));

            warnTask({
                text: badComponents.join(', ') + ' components are not installed. Excluding them from the update...',
            });
        }

        const neededRemotes = [...Object.keys(this.config?.components ?? {})].map((component) => this.config?.components?.[component]?.remote ?? '')
            .filter((remote) => remote !== '')
            .filter((remote, index, self) => self.indexOf(remote) === index);

        for (const r of neededRemotes) {
            const remoteConfig = await this.remote.getRemoteConfig(r, false, true);

            if (!remoteConfig) {
                failTask({
                    text: `Failed to get remote configuration for ${r}.`,
                });

                process.exit(1);
            }

            remotes[r] = remoteConfig;
        }

        if (Object.entries(this.config?.components ?? {}).length === 0) {
            failTask({
                text: 'No components are installed.',
            });

            process.exit(1);
        }

        const components = inputComponents && inputComponents.length > 0 ? { value: inputComponents } : await prompts({
            type: 'multiselect',
            name: 'value',
            message: 'Select components to update:',
            choices: Object.entries(this.config?.components ?? {}).map(([name, component]) => {
                const id = this.project.getComponentId(name);
                const remoteVersion = remotes?.[component?.remote]?.components?.[id]?.version ?? '0.0.0';
                const isUpToDate = this.project.isComponentUpToDate(name, remoteVersion);
                const isEnabled = remotes[component?.remote]?.enabled;

                return {
                    title: `${name}\x1b[0m \x1b[90m(L${component.version} - R${remoteVersion})${isUpToDate ? ' \x1b[32m✔ Up to date' : ''}${remotes[component.remote] && !isEnabled ? ' \x1b[31m✖ Remote is disabled' : ''}${!remotes[component.remote] ? ' \x1b[31m✖ Invalid remote' : ''}\x1b[0m`,
                    value: name,
                    disabled: !remotes[component.remote] || isUpToDate || !isEnabled,
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

        const selectedComponents: InputComponents = components.value.map((component: string) => {
            const id = this.project.getComponentId(component);
            const remote = this.config?.components?.[component]?.remote ?? '';
            const version = remotes[remote]?.components[id]?.version ?? '0.0.0';

            return {
                id,
                version,
                remote,
            };
        });

        await new Components(this.config, this.debug, this.noInput, this.fileNameOverride, this.forceOverride, this.skipPackage, []).update(selectedComponents);
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

export default new Update().build();
