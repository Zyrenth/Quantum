import { Command } from 'commander';
import { log } from 'console';
import { createSpinner } from 'nanospinner';
import prompts from 'prompts';

import { Config as IConfig, RemoteConfig } from '../interfaces/configs.js';
import { CLI } from '../utils/cli.js';
import { info, item } from '../utils/log.js';
import Project, { ValidationResult } from '../utils/project.js';
import { Remote } from '../utils/remote.js';

class Config {
    private project: Project;
    private config?: IConfig;
    private remote?: Remote;

    private debug: boolean = false;
    private noInput: boolean = false;

    private spinner = createSpinner('');

    constructor() {
        this.project = new Project();
    }

    build() {
        return new Command()
            .name('config')
            .description('Manage global CLI configuration.')
            .addCommand(
                new Command()
                    .name('add-header')
                    .description('Add a remote URL header to the global configuration.')
                    .option('-d, --debug', 'Print out all the steps.')
                    .option('-y, --yes', 'Skip all prompts and use default values.')
                    .argument('[remote]', 'The remote to add the header to.')
                    .argument('[header]', 'The header to add.')
                    .argument('[value...]', 'The value of the header.')
                    .action((...args: any[]) => {
                        // @ts-ignore
                        this.addHeader(...args);
                    }),
                {}
            )
            .addCommand(
                new Command()
                    .name('remove-header')
                    .description('Remove a remote URL header from the global configuration.')
                    .option('-d, --debug', 'Print out all the steps.')
                    .option('-y, --yes', 'Skip all prompts and use default values.')
                    .argument('[remote]', 'The remote to remove the header from.')
                    .argument('[header]', 'The header to remove.')
                    .action((...args: any[]) => {
                        // @ts-ignore
                        this.removeHeader(...args);
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
            );
    }

    async addHeader(remote: string, header: string, value: string[], options: {
        debug: boolean;
        yes: boolean;
    }) {
        const failTask = this.spinner.error;
        const concludeTask = this.spinner.success;

        this.debug = options.debug;
        this.noInput = options.yes;

        if (this.noInput && !remote) {
            failTask({
                text: 'No remote provided.',
            });

            process.exit(1);
        }

        if (remote) {
            const remoteUrl = Remote.formatRemoteUrl(remote, 'quantum.remote.json');

            if (remoteUrl.remote === null || remoteUrl.type === 'local') {
                failTask({
                    text: 'Invalid remote URL, only valid and non-local remote URLs are allowed.',
                });

                process.exit(1);
            }
        }

        if (remote && (!header || !value || value.length === 0)) {
            failTask({
                text: 'No header or value provided.',
            });

            process.exit(1);
        }

        if (remote) {
            if (CLI.hasHeader(remote, header)) {
                failTask({
                    text: 'Header for this remote already exists in the global configuration.',
                });

                process.exit(1);
            }

            CLI.addHeader(remote, {
                [header]: value.join(' '),
            });
        } else {
            await this.selectHeaderPrompt(this.addHeaderPrompt);
        }

        concludeTask({
            text: 'Header added successfully.',
        });
    }

    async removeHeader(remote: string, header: string, options: {
        debug: boolean;
        yes: boolean;
    }) {
        const failTask = this.spinner.error;
        const concludeTask = this.spinner.success;

        this.debug = options.debug;
        this.noInput = options.yes;

        if (this.noInput && !remote) {
            failTask({
                text: 'No remote provided.',
            });

            process.exit(1);
        }

        if (remote) {
            const remoteUrl = Remote.formatRemoteUrl(remote, 'quantum.remote.json');

            if (remoteUrl.remote === null || remoteUrl.type === 'local') {
                failTask({
                    text: 'Invalid remote URL, only valid and non-local remote URLs are allowed.',
                });

                process.exit(1);
            }
        }

        if (remote && (!header)) {
            failTask({
                text: 'No header provided.',
            });

            process.exit(1);
        }

        if (remote) {
            if (!CLI.hasHeader(remote, header)) {
                failTask({
                    text: 'Header for this remote is not set in the global configuration.',
                });

                process.exit(1);
            }

            CLI.removeHeader(remote, [header]);
        } else {
            await this.selectHeaderPrompt(this.removeHeaderPrompt);
        }

        concludeTask({
            text: 'Header removed successfully.',
        });
    }

    async info() {
        info('Global Quantum CLI configuration:');

        log('');

        const config = CLI.getConfig();

        if (!config) {
            log('\x1b[31mNo configuration found.\x1b[0m');
            return;
        }

        item('Ignore non-production remote warnings:', (config.ignore_dev_warning ? '\x1b[32m✔ Yes' : '\x1b[31m✖ No') + '\x1b[0m');

        log('');
        log('Headers:');

        for (const remote in config.headers) {
            item(`\x1b[96m${remote}\x1b[0m:`);

            for (const header in config.headers[remote]) {
                log(`    ${header}`);
            }

            log('');
        }

        if (Object.keys(config.headers).length === 0) {
            item('\x1b[31mNo headers are set.\x1b[0m');
        }
    }

    async selectHeaderPrompt(func: (remote: string) => Promise<void>): Promise<void> {
        const failTask = this.spinner.error;

        const validate = this.validate();

        if (validate) {
            this.config = this.project.getConfig();
            this.remote = new Remote(this.config);

            const remotes: {
                [key: string]: RemoteConfig | null;
            } = {};

            for (const r of this.config?.remotes ?? []) {
                const remoteConfig = await this.remote?.getRemoteConfig(r, false, true);

                if (!remoteConfig) {
                    failTask({
                        text: `Failed to get remote configuration for ${r}.`,
                    });

                    remotes[r] = null;
                    continue;
                }

                remotes[r] = remoteConfig;
            }

            const chosenRemote = await prompts({
                type: 'select',
                name: 'value',
                message: 'Choose a remote to manage headers for:',
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

            await func?.bind?.(this)(chosenRemote.value);
        } else {
            const remote = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the remote URL:',
                validate: (value: string) => {
                    const remoteUrl = Remote.formatRemoteUrl(value, 'quantum.remote.json');

                    if (remoteUrl.remote === null || remoteUrl.type === 'local') {
                        return 'Invalid remote URL, only valid and non-local remote URLs are allowed.';
                    }

                    return true;
                }
            }, {
                onCancel: () => {
                    process.exit(1);
                }
            });

            await func?.bind?.(this)(remote.value);
        }
    }

    async addHeaderPrompt(remote: string): Promise<void> {
        const menu = await prompts({
            type: 'select',
            name: 'value',
            message: 'Select an option:',
            choices: [
                ...Object.keys(CLI.getHeaders(remote)).map((header) => ({
                    title: `\x1b[0m\x1b[90m${header}\x1b[0m`,
                    value: header,
                    disabled: true,
                })),
                {
                    title: '\x1b[32m\x1b[1mAdd header\x1b[0m',
                    value: 1,
                },
                {
                    title: '\x1b[93m\x1b[1mFinish\x1b[0m',
                    value: 2,
                }
            ],
        }, {
            onCancel: () => {
                process.exit(1);
            }
        });

        if (menu.value === 1) {
            const header = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the header name:',
            }, {
                onCancel: () => {
                    process.exit(0);
                }
            });

            const value = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the header value:',
            }, {
                onCancel: () => {
                    process.exit(0);
                }
            });

            CLI.addHeader(remote, {
                [header.value]: value.value,
            });

            return await this.addHeaderPrompt(remote);
        }

        if (menu.value === 2) {
            return;
        }
    }

    async removeHeaderPrompt(remote: string): Promise<void> {
        const menu = await prompts({
            type: 'select',
            name: 'value',
            message: 'Select a header to remove:',
            choices: [
                ...Object.keys(CLI.getHeaders(remote)).map((header) => ({
                    title: header,
                    value: header,
                })),
                {
                    title: '\x1b[93m\x1b[1mFinish\x1b[0m',
                    value: 1,
                }
            ],
        }, {
            onCancel: () => {
                process.exit(1);
            }
        });

        if (menu.value === 1) {
            return;
        } else {
            const confirm = await prompts({
                type: 'confirm',
                name: 'value',
                message: `Are you sure you want to remove the header ${menu.value}?`,
            }, {
                onCancel: () => {
                    process.exit(1);
                }
            });

            if (confirm.value) {
                CLI.removeHeader(remote, [menu.value]);
            }

            return await this.removeHeaderPrompt(remote);
        }
    }

    private validate() {
        const finishTask = this.spinner[this.debug ? 'success' : 'update'];

        const result = this.project.validate();

        if (result === ValidationResult.Passed) {
            finishTask({
                text: 'Project validated successfully.',
            });

            return true;
        }

        if (result === ValidationResult.ConfigurationMissing) {
            return false;
        }

        if (result === ValidationResult.PathsNotConfigured) {
            return false;
        }

        if (result === ValidationResult.FormatInvalid) {
            return false;
        }

        if (result === ValidationResult.TailwindConfigMissing) {
            return false;
        }

        if (result === ValidationResult.TailwindConfigInvalid) {
            return false;
        }

        if (result === ValidationResult.PaletteMissing) {
            return false;
        }

        if (result === ValidationResult.BackgroundsMissing) {
            return false;
        }

        if (result === ValidationResult.Failed) {
            return false;
        }

        return true;
    }
}

export default new Config().build();
