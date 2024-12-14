import { existsSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { Command } from 'commander';
import { createSpinner } from 'nanospinner';
import prompts from 'prompts';

import { Config } from '../interfaces/configs.js';
import Color from '../utils/color.js';
import { resolvePath } from '../utils/imports.js';
import { fail, hexToColor } from '../utils/log.js';
import { installPackages } from '../utils/packages.js';
import Project from '../utils/project.js';
import { Remote } from '../utils/remote.js';
import { Tailwind } from '../utils/tailwind.js';
import { trycatch } from '../utils/trycatch.js';

type SetupJson = Omit<Config, '$schema' | '$version' | 'components' | 'utils'>;

class Init {
    private project: Project;
    private config?: Config;
    private remote: Remote;

    // @ts-ignore
    private setup: SetupJson = {};

    private debug: boolean = false;
    private noInput: boolean = false;
    private skipPackage: boolean = false;

    private remotes: string[] = [];
    private palette: {
        [key: string]: {
            value: `#${string}`;
            tag?: string;
        }
    } = {
            success: {
                value: '#00FF00',
                tag: 'success',
            },
            error: {
                value: '#FF0000',
                tag: 'error',
            },
            warning: {
                value: '#FFA500',
                tag: 'warning',
            },
            info: {
                value: '#00FFFF',
                tag: 'info',
            }
        };

    private spinner = createSpinner('');

    constructor() {
        this.project = new Project();

        this.remote = new Remote(Project.getDefaultConfig());
    }

    build() {
        return new Command()
            .name('init')
            .description('Initialize a new Quantum project.')
            .option('-d, --debug', 'Print out all the steps.')
            .option('-y, --yes', 'Skip all prompts and use default values.')
            .option('-sp, --skip-package', 'Skip installing the packages.')
            .argument('[json]', 'The setup configuration in JSON format. View the documentation for more information.')
            .action((...args: any[]) => {
                // @ts-ignore
                this.run(...args);
            });
    }

    async run(json: string, options: {
        debug: boolean;
        yes: boolean;
        skipPackage: boolean;
    }) {
        const finishTask = this.spinner[this.debug ? 'success' : 'update'];
        const updateTask = this.spinner.update;
        const failTask = this.spinner.error;
        const warnTask = this.spinner.warn;
        const concludeTask = this.spinner.success;

        if (existsSync('quantum.config.json') && !statSync('quantum.config.json').isDirectory()) {
            failTask({
                text: 'This project is already initialized.'
            });

            process.exit(1);
        } else if (existsSync('quantum.config.json') && statSync('quantum.config.json').isDirectory()) {
            failTask({
                text: 'A directory named quantum.config.json already exists in this directory.'
            });

            process.exit(1);
        }

        this.debug = options.debug;
        this.noInput = options.yes;
        this.skipPackage = options.skipPackage;

        if (this.noInput && !json) {
            failTask({
                text: 'No configuration provided with the `--yes` flag.'
            });

            process.exit(1);
        } else if (json) {
            try {
                this.setup = JSON.parse(json);
            } catch (error) {
                failTask({
                    text: 'Failed to parse the provided JSON configuration.'
                });

                process.exit(1);
            }

            if (
                !this.setup.format ||
                !this.setup.server_components ||
                !this.setup.tailwind_config ||
                !this.setup.palette ||
                !this.setup.backgrounds ||
                !this.setup.paths
            ) {
                failTask({
                    text: 'The provided setup configuration is missing required fields.'
                });

                process.exit(1);
            }

            if (!Array.isArray(this.setup.remotes)) {
                failTask({
                    text: 'The provided remote list is invalid. Please provide an array of remotes.'
                });

                process.exit(1);
            }

            if (this.setup.remotes.some((remote) => typeof remote !== 'string')) {
                failTask({
                    text: 'The provided remote list contains invalid values. Please provide an array of strings.'
                });

                process.exit(1);
            }

            const remotes = await Promise.all(['Zyrenth/Quantum@main', 'Zyrenth/Quantum@dev']
                .map(async url => {
                    const remoteConfig = await this.remote.getRemoteConfig(url, false, !this.debug);

                    if (!remoteConfig) return {
                        success: false,
                        url: url,
                    };

                    return {
                        success: true,
                        url: url,
                    };
                }));

            if (!remotes.every((remote) => remote.success)) {
                failTask({
                    text: `Failed to get remote configuration for one or more remotes.\n  ${remotes.map((remote) => remote.url).join('\n  ')}`
                });

                process.exit(1);
            }

            if (this.setup.format !== 'tsx' && this.setup.format !== 'jsx') {
                failTask({
                    text: 'The provided format is invalid. Please use either `tsx` or `jsx`.'
                });

                process.exit(1);
            }

            if (typeof this.setup.server_components !== 'boolean') {
                failTask({
                    text: 'The provided server components is invalid. Please use a boolean value.'
                });

                process.exit(1);
            }

            if (typeof this.setup.tailwind_config !== 'string') {
                failTask({
                    text: 'The provided tailwind config is invalid. Please use a string value.'
                });

                process.exit(1);
            }

            if (!existsSync(this.setup.tailwind_config) || statSync(this.setup.tailwind_config).isDirectory()) {
                failTask({
                    text: 'The provided tailwind config does not exist or is a directory.'
                });

                process.exit(1);
            }

            if (typeof this.setup.palette !== 'object') {
                failTask({
                    text: 'The provided palette is invalid. Please use an object value.'
                });

                process.exit(1);
            }

            if (Object.values(this.setup.palette).some((color) => !color.value.match(/^#[0-9A-F]{6}$/i))) {
                failTask({
                    text: 'The provided palette contains invalid hex colors.'
                });

                process.exit(1);
            }

            if (Object.values(this.setup.palette).some((color, index, array) => color.tag && array.slice(index + 1).some((_color) => _color.tag === color.tag))) {
                failTask({
                    text: 'The provided palette contains duplicate tags.'
                });

                process.exit(1);
            }

            if (typeof this.setup.backgrounds !== 'object') {
                failTask({
                    text: 'The provided backgrounds is invalid. Please use an object value.'
                });

                process.exit(1);
            }

            if (!this.setup?.backgrounds?.light?.match(/^#[0-9A-F]{6}$/i) || !this.setup?.backgrounds?.dark?.match(/^#[0-9A-F]{6}$/i)) {
                failTask({
                    text: 'The provided backgrounds contain invalid hex colors.'
                });

                process.exit(1);
            }

            if (typeof this.setup.paths !== 'object') {
                failTask({
                    text: 'The provided paths is invalid. Please use an object value.'
                });

                process.exit(1);
            }

            if (!this.setup.paths.components || !this.setup.paths.utils) {
                failTask({
                    text: 'The provided paths are missing required fields. Please provide `components` and `utils` path aliases.'
                });

                process.exit(1);
            }

            if (!resolvePath(this.setup.paths.components) || !resolvePath(this.setup.paths.utils)) {
                failTask({
                    text: 'The provided paths contain unresolvable path aliases.'
                });

                process.exit(1);
            }
        } else {
            await this.remotePrompt();

            this.setup.format = await this.formatPrompt();
            this.setup.server_components = await this.serverComponentsPrompt();
            this.setup.tailwind_config = await this.tailwindConfigPrompt();

            await this.palettePrompt();

            this.setup.backgrounds = await this.backgroundsPrompt();
            this.setup.paths = await this.pathsPrompt();
        }

        this.config = {
            $schema: '...',
            $version: 1,
            remotes: this.remotes,
            format: this.setup.format,
            server_components: this.setup.server_components,
            tailwind_config: this.setup.tailwind_config,
            palette: this.palette as {
                [key: string]: {
                    value: `#${string}`,
                    tag?: string;
                }
            },
            backgrounds: this.setup.backgrounds,
            paths: this.setup.paths,
        };

        if (this.config.paths.components && resolvePath(this.config.paths.components)) {
            if (!existsSync(resolvePath(this.config.paths.components) as string)) {
                mkdirSync(resolvePath(this.config.paths.components) as string, { recursive: true });
            } else if (statSync(resolvePath(this.config.paths.components) as string).isFile()) {
                failTask({
                    text: 'The components path is a file. Please make sure the path is a directory.'
                });

                process.exit(1);
            }
        }

        if (this.config.paths.utils && resolvePath(this.config.paths.utils)) {
            if (!existsSync(resolvePath(this.config.paths.utils) as string)) {
                mkdirSync(resolvePath(this.config.paths.utils) as string, { recursive: true });
            } else if (statSync(resolvePath(this.config.paths.utils) as string).isFile()) {
                failTask({
                    text: 'The utils path is a file. Please make sure the path is a directory.'
                });

                process.exit(1);
            }
        }

        updateTask({
            text: 'Generating configuration...',
        });

        this.project.generateConfig(this.config);

        const twColors: {
            [key: string]: string;
        } = {};
        const simplePalette = Object.fromEntries(Object.entries(this.config.palette).map(([key, value]) => [key, value.value]));
        new Color(simplePalette, this.config.backgrounds as any);

        for (const palette in simplePalette) {
            // Useless check that we need otherwise TS will complain
            if (!simplePalette[palette]) continue;

            let colors = Color.generatePalette(simplePalette[palette], true);

            twColors[`${palette}-solid-light-bg`] = colors.light.background;
            twColors[`${palette}-solid-light-text`] = colors.light.text;
            twColors[`${palette}-solid-dark-bg`] = colors.dark.background;
            twColors[`${palette}-solid-dark-text`] = colors.dark.text;

            colors = Color.generatePalette(simplePalette[palette], false);

            twColors[`${palette}-soft-light-bg`] = colors.light.background;
            twColors[`${palette}-soft-light-text`] = colors.light.text;
            twColors[`${palette}-soft-dark-bg`] = colors.dark.background;
            twColors[`${palette}-soft-dark-text`] = colors.dark.text;
        }

        const tailwind = new Tailwind(this.config.tailwind_config.endsWith('.ts'), this.config.tailwind_config, this.config.format === 'tsx' ? 'tsconfig.json' : 'jsconfig.json');

        const tailwindTheme = tailwind.get('theme');

        tailwind.set('theme', {
            ...tailwindTheme,
            extend: {
                ...tailwindTheme.extend,
                colors: {
                    ...tailwindTheme.extend.colors,
                    ...twColors,
                },
            },
        });

        await tailwind.save();

        finishTask({
            text: 'Configuration generated.',
        });

        updateTask({
            text: 'Installing packages...',
        });

        const packages = ['class-variance-authority', 'clsx', 'tailwind-merge'];

        if (!this.skipPackage) await installPackages(packages, false, () => process.exit(1));
        else warnTask({
            text: `Skipping package installation. Install the following packages manually: ${packages.join(', ')}`,
        });

        concludeTask({
            text: 'Project initialized successfully.',
        });
    }

    async remotePrompt(): Promise<string[]> {
        const remoteMenu = await prompts({
            type: 'select',
            name: 'value',
            message: 'Configure the remotes to install components from:\n\x1b[0m  \x1b[37m(Select a remote to remove it.)\x1b[0m\n ',
            choices: [
                ...this.remotes.map((key) => ({
                    title: key,
                    value: key,
                })),
                {
                    title: '\x1b[32m\x1b[1mAdd remote\x1b[0m',
                    value: 1,
                },
                {
                    title: '\x1b[93m\x1b[1mFinish\x1b[0m',
                    value: 2,
                }
            ],
        }, {
            onCancel: () => {
                process.exit(0);
            }
        });

        if (remoteMenu.value === 1) {
            await this.addRemotePrompt();

            return await this.remotePrompt();
        } else if (remoteMenu.value === 2) {
            return this.remotes;
        } else {
            if (this.remotes.find((remote) => remote === remoteMenu.value)) {
                this.remotes = this.remotes.filter((remote) => remote !== remoteMenu.value);
            }

            return await this.remotePrompt();
        }
    }

    async addRemotePrompt(): Promise<void> {
        const official = await Promise.all(['Zyrenth/Quantum@main', 'Zyrenth/Quantum@dev']
            .map(async url => {
                const remoteConfig = await this.remote.getRemoteConfig(url, false, !this.debug);

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

        const [suggestionsArray, error] = await trycatch(async () => await (await fetch('https://raw.githubusercontent.com/Zyrenth/Quantum/refs/heads/main/remote-suggestions.json')).json());

        const suggestions = await Promise.all((suggestionsArray as string[] ?? [])
            .map(async url => {
                const remoteConfig = await this.remote.getRemoteConfig(url, false, !this.debug);

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
                ...(error ? [{
                    title: '\x1b[31m\x1b[1mSuggestions are unavailable at this moment.\x1b[0m',
                    value: -1,
                    disabled: true,
                }] : []),
                {
                    title: '\x1b[32m\x1b[1mAdd custom remote\x1b[0m',
                    value: 1,
                },
                {
                    title: '\x1b[31m\x1b[1mBack\x1b[0m',
                    value: 2,
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
                validate: async (value: string) => {
                    if (!value) {
                        return 'Please enter a valid remote url.';
                    }

                    if (this.remotes.includes(value)) {
                        return 'Remote already exists in the configuration.';
                    }

                    // Must turn off non-prod remote confirmation here otherwise it will append a "y" to the end of the url (because the user has confirmed another prompt while this was still active).
                    const remoteConfig = await this.remote.getRemoteConfig(value, false, !this.debug);

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

            const remoteConfig = await this.remote.getRemoteConfig(remoteInput.value, true, !this.debug);

            if (!remoteConfig) {
                fail('Failed to get remote configuration. Please make sure the remote is valid.');

                return await this.addRemotePrompt();
            }

            if (!remoteConfig.enabled) {
                fail('Remote is disabled. For further information, please contact the remote maintainer.');

                return await this.addRemotePrompt();
            }

            this.remotes.push(remoteInput.value);

            return;
        } else if (remoteMenu.value === 2) {
            return;
        } else {
            if (this.remotes.includes(remoteMenu.value)) {
                fail('Remote already exists in the configuration.');

                return await this.addRemotePrompt();
            }

            const remoteConfig = await this.remote.getRemoteConfig(remoteMenu.value, true, !this.debug);

            if (!remoteConfig) {
                fail('Failed to get remote configuration. Please make sure the remote is valid.');

                return await this.addRemotePrompt();
            }

            if (!remoteConfig.enabled) {
                fail('Remote is disabled. For further information, please contact the remote maintainer.');

                return await this.addRemotePrompt();
            }

            this.remotes.push(remoteMenu.value);

            return;
        }
    }

    async formatPrompt(): Promise<'tsx' | 'jsx'> {
        const format = await prompts({
            type: 'confirm',
            name: 'value',
            message: 'Do you use TypeScript for this project?',
            initial: existsSync('tsconfig.json') && !statSync('tsconfig.json').isDirectory(),
        }, {
            onCancel: () => {
                process.exit(0);
            }
        });

        const tsConfig = format.value ? join('tsconfig.json') : join('jsconfig.json');

        if (!existsSync(tsConfig) || statSync(tsConfig).isDirectory()) {
            fail('TypeScript or JavaScript configuration does not exist or is a directory. Is this the right directory?');

            return await this.formatPrompt();
        }

        return format.value ? 'tsx' : 'jsx';
    }

    async serverComponentsPrompt() {
        const serverComponents = await prompts({
            type: 'confirm',
            name: 'value',
            message: 'Do you use server-side components?',
            initial: false,
        }, {
            onCancel: () => {
                process.exit(0);
            }
        });

        return serverComponents.value;
    }

    async tailwindConfigPrompt() {
        const tailwindConfig = await prompts({
            type: 'text',
            name: 'value',
            message: 'Enter the path to the Tailwind CSS configuration file:',
            initial: existsSync('tsconfig.json') && !statSync('tsconfig.json').isDirectory() ? 'tailwind.config.ts' : 'tailwind.config.js',
            validate: (value: string) => {
                if (!existsSync(value) || statSync(value).isDirectory()) {
                    return 'Tailwind CSS configuration does not exist or is a directory.';
                }

                return true;
            }
        }, {
            onCancel: () => {
                process.exit(0);
            }
        });

        return tailwindConfig.value;
    }

    async backgroundsPrompt() {
        const backgrounds = await prompts([
            {
                type: 'text',
                name: 'light',
                message: 'Enter the light theme background color of your app:',
                initial: '#FFFFFF',
                validate: (value: string) => {
                    if (!value.match(/^#[0-9A-F]{6}$/i)) {
                        return 'Please enter a valid hex color.';
                    }

                    return true;
                }
            },
            {
                type: 'text',
                name: 'dark',
                message: 'Enter the dark theme background color of your app:',
                initial: '#000000',
                validate: (value: string) => {
                    if (!value.match(/^#[0-9A-F]{6}$/i)) {
                        return 'Please enter a valid hex color.';
                    }

                    return true;
                }
            }
        ], {
            onCancel: () => {
                process.exit(0);
            }
        });

        return backgrounds;
    }

    async palettePrompt(): Promise<{
        [key: string]: {
            value: `#${string}`;
            tag?: string;
        }
    }> {
        const palette = await prompts({
            type: 'select',
            name: 'value',
            message: 'Configure your palette:\n\x1b[0m  \x1b[37m(Select a color to remove it.)\x1b[0m\n ',
            choices: [
                ...Object.keys(this.palette).map((key) => ({
                    title: `${key}\x1b[0m ${this.palette[key] ? hexToColor(this.palette[key].value.substring(1), '\x1b[96m') : ''}${this.palette[key] ? this.palette[key].value : ''}${this.palette[key] ? (this.palette[key].tag ? ` \x1b[90m[${this.palette[key].tag}]` : '') : ''}\x1b[0m`,
                    value: key,
                })),
                {
                    title: '\x1b[32m\x1b[1mAdd color\x1b[0m',
                    value: 1,
                },
                {
                    title: '\x1b[93m\x1b[1mFinish\x1b[0m',
                    value: 2,
                }
            ],
        }, {
            onCancel: () => {
                process.exit(0);
            }
        });

        if (palette.value === 1) {
            const name = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the name of the color:',
            }, {
                onCancel: () => {
                    process.exit(0);
                }
            });

            const tag = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the a tag for the color:\n\x1b[0m  \x1b[37m(Leave empty for no tag.)\x1b[0m\n ',
                validate: (value: string) => {
                    if (Object.values(this.palette).some((color) => color.tag === value)) {
                        return 'This tag is already in use.';
                    }

                    return true;
                }
            }, {
                onCancel: () => {
                    process.exit(0);
                }
            });

            const color = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the hex color you want to add:',
                validate: (value: string) => {
                    if (!value.match(/^#[0-9A-F]{6}$/i)) {
                        return 'Please enter a valid hex color.';
                    }

                    return true;
                }
            }, {
                onCancel: () => {
                    process.exit(0);
                }
            });

            this.palette[name.value] = {
                value: color.value,
                ...(tag.value ? { tag: tag.value } : {}),
            };

            return await this.palettePrompt();
        } else if (palette.value === 2) {
            return this.palette;
        } else {
            if (this.palette[palette.value]) delete this.palette[palette.value];

            return await this.palettePrompt();
        }
    }

    async pathsPrompt() {
        const paths = await prompts([
            {
                type: 'text',
                name: 'components',
                message: 'Enter the path alias for components:\n\x1b[0m  \x1b[37m(Configured in your tsconfig.json or jsconfig.json.)\x1b[0m\n ',
                initial: '@/components',
                validate: (value: string) => {
                    if (!resolvePath(value)) {
                        return 'This path alias is unresolvable. Please configure it first.';
                    } else if (existsSync(resolvePath(value) as string) && !statSync(resolvePath(value) as string).isDirectory()) {
                        return 'This path alias is a file. Please make sure the path is a directory.';
                    }

                    return true;
                }
            },
            {
                type: 'text',
                name: 'utils',
                message: 'Enter the path alias for utils:\n\x1b[0m  \x1b[37m(Configured in your tsconfig.json or jsconfig.json.)\x1b[0m\n ',
                initial: '@/utils',
                validate: (value: string) => {
                    if (!resolvePath(value)) {
                        return 'This path alias is unresolvable. Please configure it first.';
                    } else if (existsSync(resolvePath(value) as string) && !statSync(resolvePath(value) as string).isDirectory()) {
                        return 'This path alias is a file. Please make sure the path is a directory.';
                    }

                    return true;
                }
            }
        ], {
            onCancel: () => {
                process.exit(0);
            }
        });

        return paths;
    }
}

export default new Init().build();
