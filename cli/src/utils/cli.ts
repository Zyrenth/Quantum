import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

import { fail } from './log.js';

interface ConfigData {
    ignore_dev_warning: boolean;
    headers: {
        [key: string]: {
            [key: string]: string;
        }
    }
}

export class CLI {
    public static getConfigFolder() {
        if (process.platform === 'win32') {
            return process.env.APPDATA;
        } else if (process.platform === 'darwin') {
            return process.env.HOME + '/Library/Application Support';
        } else {
            return process.env.XDG_CONFIG_HOME || process.env.HOME + '/.config';
        }
    }

    private static configFolder = CLI.getConfigFolder() || join(process.cwd(), '.config');
    private static configFile = join(CLI.configFolder, 'quantum-cli', 'config.json');
    private static config: ConfigData = {
        ignore_dev_warning: false,
        headers: {},
        ...(() => {
            try {
                const parentFolder = dirname(CLI.configFile);

                if (!existsSync(parentFolder)) {
                    mkdirSync(parentFolder, { recursive: true });
                }

                if (!existsSync(CLI.configFile)) {
                    writeFileSync(CLI.configFile, '{}');
                }

                if (statSync(CLI.configFile).isDirectory()) {
                    fail('Config file is a directory. Cannot continue.', `\n> ${CLI.configFile}`);

                    process.exit(1);
                }

                return existsSync(CLI.configFile) ? JSON.parse(readFileSync(CLI.configFile, 'utf-8')) : {};
            } catch (error) {
                return {};
            }
        })()
    };

    constructor() { }

    private static validateFS() {
        const parentFolder = dirname(CLI.configFile);

        if (!existsSync(parentFolder)) {
            mkdirSync(parentFolder, { recursive: true });
        }

        if (!existsSync(CLI.configFile)) {
            writeFileSync(CLI.configFile, '{}');
        }

        if (statSync(CLI.configFile).isDirectory()) {
            return false;
        }

        return true;
    }

    public static getConfig() {
        return CLI.config;
    }

    public static getHeaders(remote: string) {
        return CLI?.config?.headers?.[remote] || {};
    }

    public static hasHeader(remote: string, header: string) {
        return !!CLI.config.headers[remote]?.[header];
    }

    public static addHeader(remote: string, headers: { [key: string]: string }) {
        if (!CLI.config.headers[remote]) {
            CLI.config.headers[remote] = {};
        }

        CLI.config.headers[remote] = {
            ...CLI.config.headers[remote],
            ...headers
        };

        if (CLI.validateFS()) {
            writeFileSync(CLI.configFile, JSON.stringify(CLI.config, null, 4));
        }
    }

    public static removeHeader(remote: string, headers: string[]) {
        if (CLI.config.headers[remote]) {
            CLI.config.headers[remote] = Object.fromEntries(Object.entries(CLI.config.headers[remote]).filter(([key]) => !headers.includes(key)));
        }

        if (CLI.validateFS()) {
            writeFileSync(CLI.configFile, JSON.stringify(CLI.config, null, 4));
        }
    }

    public static clearHeaders(remote: string) {
        delete CLI.config.headers[remote];

        if (CLI.validateFS()) {
            writeFileSync(CLI.configFile, JSON.stringify(CLI.config, null, 4));
        }
    }

    public static setIgnoreDevWarning(value: boolean) {
        CLI.config.ignore_dev_warning = value;

        if (CLI.validateFS()) {
            writeFileSync(CLI.configFile, JSON.stringify(CLI.config, null, 4));
        }
    }

    public static getIgnoreDevWarning() {
        return CLI.config.ignore_dev_warning;
    }
}
