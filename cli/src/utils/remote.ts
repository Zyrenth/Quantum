import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { createSpinner } from 'nanospinner';
import prompts from 'prompts';

import { Config, RemoteConfig } from '../interfaces/configs.js';
import Cache from './cache.js';
import { CLI } from './cli.js';
import { Components } from './components.js';
import { trycatch } from './trycatch.js';

interface Remotes {
    [key: string]: Cache;
}

export class Remote {
    private static readonly defaultConfig: RemoteConfig = {
        $version: 1,
        enabled: true,
        name: 'Default Remote',
        environment: 'development',
        paths: {
            components: 'src/components',
            utils: 'src/utils',
        },
        components: {},
        utils: {},
    };

    private config: Config;
    private remotes: Remotes = {};

    constructor(config: Config) {
        this.config = config;

        for (const remote in this.config.remotes) {
            if (this.remotes[remote]) continue;
            this.remotes[remote] = new Cache(remote);
        }
    }

    public static getDefaultConfig() {
        return Remote.defaultConfig;
    }

    private async getConfig(remote?: string, silent: boolean = false): Promise<RemoteConfig | null> {
        if (!remote) {
            remote = Object.keys(this.remotes)[0] || '';
        }

        if (!this.remotes[remote]) {
            this.remotes[remote] = new Cache(remote);
        }

        const config = this.remotes[remote]?.getFile(['quantum.remote.json']) ?? '{}';

        if (!config) {
            const remoteConfig = await this.fetchConfig(remote, silent) as RemoteConfig;

            if (!remoteConfig) {
                return null;
            }

            remoteConfig.name = Components.filterFileName(remoteConfig.name).slice(0, 24);

            this.remotes[remote]?.addFile(['quantum.remote.json'], JSON.stringify(remoteConfig, null, 4));

            return remoteConfig;
        } else {
            const [configData, jsonError] = await trycatch(() => JSON.parse(config));

            if (jsonError) {
                return {} as RemoteConfig;
            }

            return configData as RemoteConfig;
        }
    }

    private async fetchConfig(remote: string, silent: boolean = false) {
        const spinner = createSpinner('');

        const { remote: remoteUrl, type } = Remote.formatRemoteUrl(remote, 'quantum.remote.json');

        let remoteConfig: RemoteConfig;

        if (type === 'local') {
            const remotePath = remoteUrl;

            try {
                const remoteConfigData = JSON.parse(readFileSync(remotePath, 'utf-8')) as RemoteConfig;

                remoteConfig = remoteConfigData;
            } catch (error) {
                return;
            }
        } else if (type === 'url') {
            const [_remoteConfig, fetchError] = await trycatch(() => fetch(remoteUrl, {
                headers: {
                    'User-Agent': `quantum-cli/v${process.packageVersion}/${process.platform}`,
                    ...(CLI.getHeaders(remote)),
                },
            }));

            if (fetchError) {
                if (!silent) spinner.error({
                    text: 'Failed to fetch remote. Please make sure you are connected to the internet and can reach the remote. (Error: Fetch failed)',
                });

                return;
            }

            if (!_remoteConfig.ok) {
                if (_remoteConfig.status === 404) {
                    if (!silent) spinner.error({
                        text: `Failed to validate remote. The remote does not exist. (Error: ${_remoteConfig.status})`,
                    });
                } else if (_remoteConfig.status === 401) {
                    if (!silent) spinner.error({
                        text: `Failed to authenticate with the remote. Do you have the correct headers set up? (Error: ${_remoteConfig.status})`,
                    });
                } else {
                    if (!silent) spinner.error({
                        text: `Failed to validate remote. Please make sure the remote is a valid Quantum repository. (Error: ${_remoteConfig.status})`,
                    });
                }

                return;
            }

            const [remoteConfigData, jsonError] = await trycatch(() => _remoteConfig.json());

            if (jsonError) {
                if (!silent) spinner.error({
                    text: 'Failed to validate remote. Please make sure the remote is a valid Quantum repository. (Error: Bad JSON)',
                });

                return;
            }

            if (!remoteConfigData) {
                if (!silent) spinner.error({
                    text: 'Failed to validate remote. Please make sure the remote is a valid Quantum repository. (Error: Bad config)',
                });

                return;
            }

            remoteConfig = remoteConfigData as RemoteConfig;
        } else return;

        if (!remoteConfig.$version) {
            if (!silent) spinner.error({
                text: 'Failed to validate remote. The remote does not have a version.',
            });

            return;
        }

        if (remoteConfig.environment !== 'production') {
            if (!silent) spinner.warn({
                text: 'Remote is not a production remote it may not be stable.',
            });
        }

        if (!remoteConfig.paths.components) {
            if (!silent) spinner.error({
                text: 'Failed to validate remote. The remote does not have a components path.',
            });

            return;
        }

        if (!remoteConfig.paths.utils) {
            if (!silent) spinner.error({
                text: 'Failed to validate remote. The remote does not have a utils path.',
            });

            return;
        }

        if (!silent) spinner.success({
            text: 'Remote validated successfully.',
        });

        return remoteConfig;
    }

    public static formatRemoteUrl(remote: string, path: string) {
        const githubRegex = /^([^/]+)\/([^@]+)\s*@\s*(.+)$/;
        const urlRegex = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
        const domainPathRegex = /^[^\s/$.?#].[^\s]*$/i;
        const localPathRegex = /^(\/|[a-zA-Z]:[\\/])/;
        const githubMatch = remote.match(githubRegex);
        const urlTest = urlRegex.test(remote);
        const domainPathTest = domainPathRegex.test(remote);
        const localPathTest = localPathRegex.test(remote);

        let remoteUrl = '';
        let type: 'url' | 'local' = 'url';

        if (githubMatch) {
            const [, username, repo, branch] = githubMatch;
            remoteUrl = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${path}`;
            type = 'url';
        } else if (urlTest) {
            remoteUrl = remote.endsWith('/') ? `${remote}${path}` : `${remote}/${path}`;
            type = 'url';
        } else if (domainPathTest && !/^[a-zA-Z]+:\/\//.test(remote)) {
            remoteUrl = `https://${remote.endsWith('/') ? `${remote}${path}` : `${remote}/${path}`}`;
            type = 'url';
        } else if (localPathTest) {
            remoteUrl = join(remote, path);
            type = 'local';
        }

        if (!remoteUrl) {
            return {
                remote: '',
                type: 'url',
            };
        }

        return {
            remote: remoteUrl,
            type,
        };
    }

    private async getComponent(id: string, remote?: string, silent: boolean = false) {
        if (!remote) {
            remote = Object.keys(this.remotes)[0] || '';
        }

        const spinner = createSpinner('');

        const remoteConfig = await this.getConfig(remote, silent);

        if (!remoteConfig) {
            return null;
        }

        if (!remoteConfig.components[id]) {
            return null;
        }

        if (!this.remotes[remote]) {
            this.remotes[remote] = new Cache(remote);
        }

        const componentPath: string[] = [remoteConfig.paths.components, `${id}.tsx`];
        let componentData = this.remotes[remote]?.getFile(componentPath) ?? '';

        if (!componentData) {
            const { remote: remoteUrl, type } = Remote.formatRemoteUrl(remote, join(...componentPath));

            if (type === 'local') {
                if (!existsSync(remoteUrl)) {
                    if (!silent) spinner.error({
                        text: 'Failed to fetch remote. Please make sure the remote is a valid Quantum repository. (Error: File not found)',
                    });

                    return null;
                } else if (statSync(remoteUrl).isDirectory()) {
                    if (!silent) spinner.error({
                        text: 'Failed to fetch remote. Please make sure the remote is a valid Quantum repository. (Error: Not a file)',
                    });

                    return null;
                }

                componentData = readFileSync(remoteUrl, 'utf-8');
            } else if (type === 'url') {
                const [fetchedComponent, fetchError] = await trycatch(() => fetch(remoteUrl));

                if (fetchError) {
                    if (!silent) spinner.error({
                        text: 'Failed to fetch remote. Please make sure you are connected to the internet and can reach the remote. (Error: Fetch failed)',
                    });

                    return null;
                }

                if (!fetchedComponent.ok) {
                    if (!silent) spinner.error({
                        text: `Failed to validate remote. Please make sure the remote is a valid Quantum repository. (Error: ${fetchedComponent.status})`,
                    });

                    return null;
                }

                const [fetchedComponentData, jsonError] = await trycatch(() => fetchedComponent.text());

                if (jsonError) {
                    if (!silent) spinner.error({
                        text: 'Failed to validate remote. Please make sure the remote is a valid Quantum repository. (Error: Bad text)',
                    });

                    return null;
                }

                if (!fetchedComponentData) {
                    if (!silent) spinner.error({
                        text: 'Failed to validate remote. Please make sure the remote is a valid Quantum repository. (Error: Bad config)',
                    });

                    return null;
                }

                componentData = fetchedComponentData;
            }

            this.remotes[remote]?.addFile(componentPath, componentData);
        }

        return componentData;
    }

    private async getUtil(id: string, remote?: string, silent: boolean = false) {
        if (!remote) {
            remote = Object.keys(this.remotes)[0] || '';
        }

        const spinner = createSpinner('');

        const remoteConfig = await this.getConfig(remote, silent);

        if (!remoteConfig) {
            return null;
        }

        if (!remoteConfig.utils[id]) {
            return null;
        }

        if (!this.remotes[remote]) {
            this.remotes[remote] = new Cache(remote);
        }

        const utilPath: string[] = [remoteConfig.paths.utils, `${id}.ts`];
        let utilData = this.remotes[remote]?.getFile(utilPath) ?? '';

        if (!utilData) {
            const { remote: remoteUrl, type } = Remote.formatRemoteUrl(remote, join(...utilPath));

            if (type === 'local') {
                if (!existsSync(remoteUrl)) {
                    if (!silent) spinner.error({
                        text: 'Failed to fetch remote. Please make sure the remote is a valid Quantum repository. (Error: File not found)',
                    });

                    return null;
                } else if (statSync(remoteUrl).isDirectory()) {
                    if (!silent) spinner.error({
                        text: 'Failed to fetch remote. Please make sure the remote is a valid Quantum repository. (Error: Not a file)',
                    });

                    return null;
                }

                utilData = readFileSync(remoteUrl, 'utf-8');
            } else if (type === 'url') {
                const [fetchedUtil, fetchError] = await trycatch(() => fetch(remoteUrl));

                if (fetchError) {
                    if (!silent) spinner.error({
                        text: 'Failed to fetch remote. Please make sure you are connected to the internet and can reach the remote. (Error: Fetch failed)',
                    });

                    return null;
                }

                if (!fetchedUtil.ok) {
                    if (!silent) spinner.error({
                        text: `Failed to validate remote. Please make sure the remote is a valid Quantum repository. (Error: ${fetchedUtil.status})`,
                    });

                    return null;
                }

                const [fetchedUtilData, jsonError] = await trycatch(() => fetchedUtil.text());

                if (jsonError) {
                    if (!silent) spinner.error({
                        text: 'Failed to validate remote. Please make sure the remote is a valid Quantum repository. (Error: Bad text)',
                    });

                    return null;
                }

                if (!fetchedUtilData) {
                    if (!silent) spinner.error({
                        text: 'Failed to validate remote. Please make sure the remote is a valid Quantum repository. (Error: Bad config)',
                    });

                    return null;
                }

                utilData = fetchedUtilData;
            }

            this.remotes[remote]?.addFile(utilPath, utilData);
        }

        return utilData;
    }

    /* --- Public Methods --- */

    public async getRemoteConfig(remote?: string, confirmEnvironment: boolean = true, silent: boolean = false) {
        const spinner = createSpinner('Validating remote...');

        if (!silent) spinner.start();

        const config = await this.getConfig(remote, silent);

        if (!config || !Object.keys(config).length) {
            if (!silent) spinner.success({
                text: 'Remote validation finished.',
            });

            return null;
        }

        if (confirmEnvironment && config.environment !== 'production' && !CLI.getIgnoreDevWarning()) {
            if (!silent) spinner.success({
                text: 'Remote validation finished.',
            });

            const confirm = await prompts({
                type: 'confirm',
                name: 'value',
                message: 'The remote is not a production remote. Do you want to continue?',
            }, {
                onCancel: () => {
                    process.exit(1);
                },
            });

            if (!confirm.value) return null;

            CLI.setIgnoreDevWarning(true);
        } else if (confirmEnvironment && config.environment !== 'production' && CLI.getIgnoreDevWarning()) {
            if (!silent) spinner.warn({
                text: 'The remote is not a production remote it may not be stable.',
            });
        }

        if (!silent) spinner.success({
            text: 'Remote validation finished.',
        });

        return config;
    }

    public async getRemoteComponent(id: string, remote?: string, silent: boolean = false) {
        const spinner = createSpinner(`Downloading ${id} component...`).start();
        const component = await this.getComponent(id, remote, silent);

        if (!component) {
            if (!silent) spinner.error({
                text: `Failed to download ${id} component. Something went wrong.`,
            });

            return null;
        }

        spinner.success({
            text: `Component ${id} downloaded successfully.`,
        });

        return component;
    }

    public async getRemoteUtil(id: string, remote?: string, silent: boolean = false) {
        const spinner = createSpinner(`Downloading ${id} util...`).start();
        const util = await this.getUtil(id, remote, silent);

        if (!util) {
            if (!silent) spinner.error({
                text: `Failed to download ${id} util. Something went wrong.`,
            });

            return null;
        }

        spinner.success({
            text: `Util ${id} downloaded successfully.`,
        });

        return util;
    }
}
