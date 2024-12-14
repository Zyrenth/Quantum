import { Command } from 'commander';
import { log } from 'console';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'fs';
import { createSpinner } from 'nanospinner';
import prompts from 'prompts';

import { Config } from '../interfaces/configs.js';
import { fail, info, item } from '../utils/log.js';
import Project, { ValidationResult } from '../utils/project.js';
import { Remote as URemote } from '../utils/remote.js';

class Remote {
    private project: Project;
    private config?: Config;
    private remote?: URemote;

    private debug: boolean = false;
    private noInput: boolean = false;

    private spinner = createSpinner('');

    constructor() {
        this.project = new Project();
    }

    build() {
        return new Command()
            .name('remote')
            .description('Manage remotes in the project.')
            .addCommand(
                new Command()
                    .name('add')
                    .description('Add a new remote to the project.')
                    .option('-d, --debug', 'Print out all the steps.')
                    .option('-y, --yes', 'Skip all prompts and use default values.')
                    .argument('[remote]', 'The remote to add.')
                    .action((...args: any[]) => {
                        // @ts-ignore
                        this.add(...args);
                    }),
                {}
            )
            .addCommand(
                new Command()
                    .name('remove')
                    .description('Remove a remote from the project.')
                    .option('-d, --debug', 'Print out all the steps.')
                    .option('-y, --yes', 'Skip all prompts and use default values.')
                    .argument('[remote]', 'The remote to remove.')
                    .action((...args: any[]) => {
                        // @ts-ignore
                        this.remove(...args);
                    }),
                {}
            )
            .addCommand(
                new Command()
                    .name('info')
                    .description('Get information about the remotes in the project.')
                    .option('-d, --debug', 'Print out all the steps.')
                    .action((...args: any[]) => {
                        // @ts-ignore
                        this.info(...args);
                    }),
                {
                    isDefault: true,
                }
            )
            .addCommand(
                new Command()
                    .name('generate')
                    .description('Generate a new remote configuration file.')
                    .option('-d, --debug', 'Print out all the steps.')
                    .option('-y, --yes', 'Skip all prompts and use default values.')
                    .action((...args: any[]) => {
                        // @ts-ignore
                        this.generate(...args);
                    }),
                {}
            );
    }

    async add(remote: string, options: {
        debug: boolean;
        yes: boolean;
    }) {
        const failTask = this.spinner.error;
        const concludeTask = this.spinner.success;

        this.validate();
        this.config = this.project.getConfig();
        this.remote = new URemote(this.config);

        this.debug = options.debug;
        this.noInput = options.yes;

        if (this.noInput && !remote) {
            failTask({
                text: 'No remote provided with the `--yes` flag.',
            });

            process.exit(1);
        }

        if (remote) {
            if (this.config.remotes.includes(remote)) {
                failTask({
                    text: 'Remote already exists in the configuration.',
                });

                process.exit(1);
            }

            const remoteConfig = await this.remote.getRemoteConfig(remote, !this.noInput, !this.debug);

            if (!remoteConfig) {
                failTask({
                    text: 'Failed to get remote configuration. Please make sure the remote is valid.',
                });

                process.exit(1);
            }

            this.config.remotes.push(remote);
        } else {
            await this.addRemotePrompt();
        }

        this.project.setRemotes(this.config.remotes);

        concludeTask({
            text: 'Remote added successfully.',
        });
    }

    async remove(remote: string, options: {
        debug: boolean;
        yes: boolean;
    }) {
        const failTask = this.spinner.error;
        const concludeTask = this.spinner.success;

        this.validate();
        this.config = this.project.getConfig();
        this.remote = new URemote(this.config);

        this.debug = options.debug;
        this.noInput = options.yes;

        if (this.config.remotes.length === 0) {
            failTask({
                text: 'No remotes are configured in the project.',
            });

            process.exit(1);
        }

        if (this.noInput && !remote) {
            failTask({
                text: 'No remote provided with the `--yes` flag.',
            });

            process.exit(1);
        }

        if (remote) {
            if (!this.config.remotes.includes(remote)) {
                failTask({
                    text: 'Remote does not exist in the configuration.',
                });

                process.exit(1);
            }

            if (this.config.components && Object.values(this.config.components).some((component) => component.remote === remote)) {
                failTask({
                    text: 'Cannot remove remote because it has components installed in the project.',
                });

                process.exit(1);
            }

            if (this.config.utils && Object.values(this.config.utils).some((util) => util.remote === remote)) {
                failTask({
                    text: 'Cannot remove remote because it has utils installed in the project.',
                });

                process.exit(1);
            }

            this.config.remotes = this.config.remotes.filter((remote) => remote !== remote);
        } else {
            await this.removeRemotePrompt();
        }

        this.project.setRemotes(this.config.remotes);

        concludeTask({
            text: 'Remote removed successfully.',
        });
    }

    async info(options: {
        debug: boolean;
    }) {
        this.validate();
        this.config = this.project.getConfig();
        this.remote = new URemote(this.config);

        this.debug = options.debug;

        const remotes = await Promise.all(this.config.remotes
            .map(async url => {
                const remoteConfig = await this.remote?.getRemoteConfig(url, false, !this.debug);

                if (!remoteConfig) return {
                    config: null,
                    url: url,
                };

                return {
                    config: remoteConfig,
                    url: url,
                };
            }));

        info('Remotes:');

        log('');

        for (const remote of remotes) {
            log(`${remote.config === null ? remote.url : remote.config.name}${remote.config === null ? ' \x1b[31m✖ Invalid' : ''} \x1b[90m(${remote.url})\x1b[0m:`);

            if (remote.config !== null) {
                item('Remote enabled:', remote.config.enabled ? '\x1b[32m✔ Yes\x1b[0m' : '\x1b[31m✖ No\x1b[0m');
                item('Remote environment:', remote.config.environment === 'development' ? '\x1b[33mDevelopment\x1b[0m' : '\x1b[32mProduction\x1b[0m');
                item('Components:');

                for (const [name, component] of Object.entries(remote.config.components)) {
                    log(`    \x1b[96m${name} \x1b[90mv${component.version}\x1b[0m`);
                }

                item('Utils:');

                for (const [name, version] of Object.entries(remote.config.utils)) {
                    log(`    \x1b[96m${name} \x1b[90mv${version}\x1b[0m`);
                }
            }

            log('');
        }
    }

    async generate(options: {
        debug: boolean;
        yes: boolean;
    }) {
        const failTask = this.spinner.error;
        const concludeTask = this.spinner.success;

        this.debug = options.debug;
        this.noInput = options.yes;

        if (existsSync('quantum.config.json') && statSync('quantum.config.json').isFile()) {
            const confirm = this.noInput ? { value: true } : await prompts({
                type: 'confirm',
                name: 'value',
                message: 'Are you sure you want to initialize a new Quantum remote in a Quantum project?',
                initial: false,
            }, {
                onCancel: () => {
                    process.exit(1);
                }
            });

            if (!confirm.value) {
                failTask({
                    text: 'Cancelled remote configuration generation.',
                });

                return;
            }
        }

        const remoteConfig = JSON.parse(JSON.stringify(URemote.getDefaultConfig()));

        if (existsSync('quantum.remote.json') && statSync('quantum.remote.json').isDirectory()) {
            failTask({
                text: 'Remote configuration already exists or is a directory.',
            });

            process.exit(1);
        }

        if (!existsSync('src')) {
            mkdirSync('src', { recursive: true });
        }

        if (!existsSync('src/components')) {
            mkdirSync('src/components', { recursive: true });
        }

        if (!existsSync('src/utils')) {
            mkdirSync('src/utils', { recursive: true });
        }

        writeFileSync('quantum.remote.json', JSON.stringify(remoteConfig, null, 4));

        concludeTask({
            text: 'Remote configuration generated successfully.',
        });

        item('Edit the remote configuration in `quantum.remote.json`.');
        item('For more information, visit the Quantum documentation.');
    }

    async addRemotePrompt(): Promise<void> {
        const official = await Promise.all(['Zyrenth/Quantum@main', 'Zyrenth/Quantum@dev']
            .map(async url => {
                const remoteConfig = await this.remote?.getRemoteConfig(url, false, !this.debug);

                if (!remoteConfig) return {
                    name: null,
                    url: url,
                    enabled: false,
                };

                return {
                    name: remoteConfig.name,
                    url: url,
                    enabled: remoteConfig.enabled,
                };
            }));

        // TODO: Later fetch this list from the official Quantum github repository
        const suggestions = await Promise.all(['Zyrenth/qcli-test@main']
            .map(async url => {
                const remoteConfig = await this.remote?.getRemoteConfig(url, false, !this.debug);

                if (!remoteConfig) return {
                    name: null,
                    url: url,
                    enabled: false,
                };

                return {
                    name: remoteConfig.name,
                    url: url,
                    enabled: remoteConfig.enabled,
                };
            }));

        const remoteMenu = await prompts({
            type: 'select',
            name: 'value',
            message: 'Select a suggested remote or add your own:\n\x1b[0m  \x1b[37m(Suggested remotes are not official or maintained by Zyrenth!)\x1b[0m\n ',
            choices: [
                ...official.map((official) => {
                    const isInvalid = official.name === null;
                    const isAdded = this.config?.remotes?.includes(official.url);
                    const isEnabled = official.enabled;

                    const nameColor = (isInvalid || isAdded || !official.enabled) ? '\x1b[0m\x1b[90m' : '\x1b[97m';
                    const name = isInvalid ? official.url : official.name;

                    return {
                        title: `${nameColor}${name}\x1b[0m  \x1b[32m\x1b[1m✔ Official${isInvalid ? ' \x1b[31m✖ Invalid' : ''}${!isInvalid && !isEnabled ? ' \x1b[31m✖ Remote is disabled' : ''}${isAdded ? ' \x1b[32m ✔ Added' : ''}\x1b[0m`,
                        value: official.url,
                        disabled: isInvalid || isAdded || !isEnabled,
                    };
                }),
                ...suggestions.map((suggestion) => {
                    const isInvalid = suggestion.name === null;
                    const isAdded = this.config?.remotes?.includes(suggestion.url);
                    const isEnabled = suggestion.enabled;

                    const nameColor = (isInvalid || isAdded || !suggestion.enabled) ? '\x1b[0m\x1b[90m' : '\x1b[97m';
                    const name = isInvalid ? suggestion.url : suggestion.name;

                    return {
                        title: `${nameColor}${name}\x1b[0m  \x1b[96m\x1b[1mℹ Suggestion${isInvalid ? ' \x1b[31m✖ Invalid' : ''}${!isInvalid && !isEnabled ? ' \x1b[31m✖ Remote is disabled' : ''}${isAdded ? ' \x1b[32m ✔ Added' : ''}\x1b[0m`,
                        value: suggestion.url,
                        disabled: isInvalid || isAdded || !isEnabled,
                    };
                }),
                {
                    title: '\x1b[32m\x1b[1mAdd custom remote\x1b[0m',
                    value: 1,
                }
            ],
        }, {
            onCancel: () => {
                process.exit(0);
            }
        });

        if (remoteMenu.value === 1) {
            const examples = [
                'Zyrenth/Quantum@main - GitHub repository',
                'https://example.com/quantum-repo - Custom remote',
                'https://raw.githubusercontent.com/Zyrenth/Quantum/main/ - Raw link to the GitHub repository',
                '/path/to/local/repo - Local repository',
            ];

            const remoteInput = await prompts({
                type: 'text',
                name: 'value',
                message: `Enter the url of the remote:\n\x1b[0m  \x1b[37mExamples:\n  - ${examples.join('\n  - ')}\x1b[0m\n`,
                validate: async (value) => {
                    if (!value) {
                        return 'Please enter a valid remote url.';
                    }

                    if (this.config?.remotes?.includes(value)) {
                        return 'Remote already exists in the configuration.';
                    }

                    // Must turn off non-prod remote confirmation here otherwise it will append a "y" to the end of the url (because the user has confirmed another prompt while this was still active).
                    const remoteConfig = await this.remote?.getRemoteConfig(value, false, !this.debug);

                    if (!remoteConfig) {
                        return 'Failed to get remote configuration. Please make sure the remote is valid.';
                    }

                    if (!remoteConfig.enabled) {
                        return 'Remote is disabled. For further information, please contact the remote maintainer.';
                    }

                    return true;
                }
            }, {
                onCancel: () => {
                    process.exit(0);
                }
            });

            const remoteConfig = await this.remote?.getRemoteConfig(remoteInput.value, true, !this.debug);

            if (!remoteConfig) {
                fail('Failed to get remote configuration. Please make sure the remote is valid.');

                return await this.addRemotePrompt();
            }

            if (!remoteConfig.enabled) {
                fail('Remote is disabled. For further information, please contact the remote maintainer.');

                return await this.addRemotePrompt();
            }

            this.config?.remotes.push(remoteInput.value);

            return;
        } else {
            if (this.config?.remotes.includes(remoteMenu.value)) {
                fail('Remote already exists in the configuration.');

                return await this.addRemotePrompt();
            }

            const remoteConfig = await this.remote?.getRemoteConfig(remoteMenu.value, true, !this.debug);

            if (!remoteConfig) {
                fail('Failed to get remote configuration. Please make sure the remote is valid.');

                return await this.addRemotePrompt();
            }

            if (!remoteConfig.enabled) {
                fail('Remote is disabled. For further information, please contact the remote maintainer.');

                return await this.addRemotePrompt();
            }

            this.config?.remotes.push(remoteMenu.value);

            return;
        }
    }

    async removeRemotePrompt() {
        const remotes = await Promise.all((this.config?.remotes || [])
            .map(async url => {
                const remoteConfig = await this.remote?.getRemoteConfig(url, false, !this.debug);

                if (!remoteConfig) return {
                    name: null,
                    url: url,
                };

                return {
                    name: remoteConfig.name,
                    url: url,
                };
            }));

        const remoteMenu = await prompts({
            type: 'select',
            name: 'value',
            message: 'Select a remote to remove:',
            choices: remotes.map((remote) => ({
                title: `\x1b[97m${remote.name === null ? remote.url : remote.name}${remote.name === null ? ' \x1b[31m✖ Invalid' : ''}\x1b[0m`,
                value: remote.url,
            })),
        }, {
            onCancel: () => {
                process.exit(0);
            }
        });

        if (Object.values(this.config?.components ?? {}).some((component) => component.remote === remoteMenu.value)) {
            fail('Cannot remove remote because it has components installed in the project.');

            process.exit(1);
        }

        if (Object.values(this.config?.utils ?? {}).some((util) => util.remote === remoteMenu.value)) {
            fail('Cannot remove remote because it has utils installed in the project.');

            process.exit(1);
        }

        if (this.config?.remotes) this.config.remotes = this.config?.remotes.filter((remote) => remote !== remoteMenu.value);

        return;
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

export default new Remote().build();
