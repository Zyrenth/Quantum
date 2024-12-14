import { Command } from 'commander';
import { log } from 'console';
import { createSpinner } from 'nanospinner';
import prompts from 'prompts';

import { Config } from '../interfaces/configs.js';
import Color from '../utils/color.js';
import { hexToColor, info, item, warning } from '../utils/log.js';
import Project, { ValidationResult } from '../utils/project.js';
import { Tailwind } from '../utils/tailwind.js';

class Palette {
    private project: Project;
    private config?: Config;

    private debug: boolean = false;
    private noInput: boolean = false;

    private spinner = createSpinner('');

    constructor() {
        this.project = new Project();
    }

    build() {
        return new Command()
            .name('palette')
            .description('Manage the palette of the project.')
            .addCommand(
                new Command()
                    .name('add')
                    .description('Add a new color to the palette.')
                    .option('-d, --debug', 'Print out all the steps.')
                    .argument('[name]', 'The name of the color.')
                    .argument('[hex]', 'The hex code of the color.')
                    .argument('[tag]', 'The tag of the color.')
                    .action((...args: any[]) => {
                        // @ts-ignore
                        this.add(...args);
                    }),
                {}
            )
            .addCommand(
                new Command()
                    .name('remove')
                    .description('Remove a color from the palette.')
                    .option('-d, --debug', 'Print out all the steps.')
                    .option('-y, --yes', 'Skip all prompts and use default values.')
                    .argument('[name]', 'The name of the color to remove.')
                    .action((...args: any[]) => {
                        // @ts-ignore
                        this.remove(...args);
                    }),
                {}
            )
            .addCommand(
                new Command()
                    .name('regenerate')
                    .description('Regenerate the palette colors in the Tailwind configuration.')
                    .option('-d, --debug', 'Print out all the steps.')
                    .option('-y, --yes', 'Skip all prompts and use default values.')
                    .action((...args: any[]) => {
                        // @ts-ignore
                        this.regenerate(...args);
                    }),
                {}
            )
            .addCommand(
                new Command()
                    .name('info')
                    .description('Get the tailwind sync information of the palette.')
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

    async add(name: string, hex: string, tag: string, options: {
        debug: boolean;
        yes: boolean;
    }) {
        const failTask = this.spinner.error;
        const concludeTask = this.spinner.success;

        this.validate();
        this.config = this.project.getConfig();

        this.debug = options.debug;
        this.noInput = options.yes;

        if (this.noInput && (!name || !hex)) {
            failTask({
                text: 'No name or color provided with the `--yes` flag.',
            });

            process.exit(1);
        }

        if (name && hex) {
            if (Object.keys(this.config.palette).includes(name)) {
                failTask({
                    text: 'Color already exists in the palette.',
                });

                process.exit(1);
            }

            if (!hex.match(/^#[0-9A-F]{6}$/i)) {
                failTask({
                    text: 'Please enter a valid hex color.',
                });

                process.exit(1);
            }

            if (tag && Object.values(this.config.palette).some((value) => value.tag === tag)) {
                failTask({
                    text: 'Tag is already in use.',
                });

                process.exit(1);
            }

            this.config.palette[name] = {
                value: hex as `#${string}`,
                ...(tag ? { tag } : {}),
            };
        } else {
            const color = await this.addColorPrompt();

            this.config.palette[color.name] = {
                value: color.color,
                ...(color.tag ? { tag: color.tag } : {}),
            };
        }

        this.project.setPalette(this.config.palette);

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

        concludeTask({
            text: 'Color added successfully.',
        });
    }

    async remove(name: string, options: {
        debug: boolean;
        yes: boolean;
    }) {
        const failTask = this.spinner.error;
        const concludeTask = this.spinner.success;

        this.validate();
        this.config = this.project.getConfig();

        this.debug = options.debug;
        this.noInput = options.yes;

        if (this.config.remotes.length === 0) {
            failTask({
                text: 'No colors are configured in the palette.',
            });

            process.exit(1);
        }

        if (this.noInput && !name) {
            failTask({
                text: 'No color name provided with the `--yes` flag.',
            });

            process.exit(1);
        }

        let removedColor;

        if (name) {
            if (!Object.keys(this.config.palette).includes(name)) {
                failTask({
                    text: 'Color does not exist in the palette.',
                });

                process.exit(1);
            }

            removedColor = name;

            this.config.palette = Object.fromEntries(Object.entries(this.config.palette).filter(([key]) => key !== name));
        } else {
            const color = await this.removeColorPrompt();

            removedColor = color;

            this.config.palette = Object.fromEntries(Object.entries(this.config.palette).filter(([key]) => key !== color));
        }

        this.project.setPalette(this.config.palette);
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

        const previousColors = Object.fromEntries(Object.entries(tailwindTheme.extend.colors).filter(([key]) => {
            if (
                key === `${removedColor}-solid-light-bg` ||
                key === `${removedColor}-solid-light-text` ||
                key === `${removedColor}-solid-dark-bg` ||
                key === `${removedColor}-solid-dark-text` ||
                key === `${removedColor}-soft-light-bg` ||
                key === `${removedColor}-soft-light-text` ||
                key === `${removedColor}-soft-dark-bg` ||
                key === `${removedColor}-soft-dark-text`
            ) {
                return false;
            } else {
                return true;
            }
        }));

        tailwind.set('theme', {
            ...tailwindTheme,
            extend: {
                ...tailwindTheme.extend,
                colors: {
                    ...previousColors,
                    ...twColors,
                },
            },
        });

        await tailwind.save();

        concludeTask({
            text: 'Color removed successfully.',
        });
    }

    async regenerate(options: {
        debug: boolean;
        yes: boolean;
    }) {
        const concludeTask = this.spinner.success;

        this.validate();
        this.config = this.project.getConfig();

        this.debug = options.debug;
        this.noInput = options.yes;

        if (!this.noInput) {
            const confirm = await prompts({
                type: 'confirm',
                name: 'value',
                message: 'Are you sure you want to regenerate the palette colors in the Tailwind configuration?\n\x1b[0m  \x1b[37m(This will potentially overwrite already added colors in your Tailwind configuration.)\x1b[0m\n ',
            }, {
                onCancel: () => {
                    process.exit(1);
                }
            });

            if (!confirm.value) {
                concludeTask({
                    text: 'Regeneration cancelled.',
                });

                process.exit(1);
            }
        }

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

        concludeTask({
            text: 'Palette colors regenerated successfully.',
        });
    }

    async info(options: {
        debug: boolean;
    }) {
        const failTask = this.spinner.error;

        this.validate();
        this.config = this.project.getConfig();

        this.debug = options.debug;

        const tailwind = new Tailwind(this.config.tailwind_config.endsWith('.ts'), this.config.tailwind_config, this.config.format === 'tsx' ? 'tsconfig.json' : 'jsconfig.json');

        const tailwindTheme = tailwind.get('theme');

        if (!tailwindTheme.extend.colors) {
            failTask({
                text: 'No colors found in the Tailwind configuration.',
            });

            process.exit(1);
        }

        const { colors } = tailwindTheme.extend;

        const palette: {
            [color: string]: {
                solid: 'full' | 'partial' | 'none',
                soft: 'full' | 'partial' | 'none',
            };
        } = {};

        for (const color of Object.keys(this.config.palette)) {
            const solidColors = [
                `${color}-solid-light-bg`,
                `${color}-solid-light-text`,
                `${color}-solid-dark-bg`,
                `${color}-solid-dark-text`,
            ].map((key) => Object.keys(colors).includes(key));

            const softColors = [
                `${color}-soft-light-bg`,
                `${color}-soft-light-text`,
                `${color}-soft-dark-bg`,
                `${color}-soft-dark-text`,
            ].map((key) => Object.keys(colors).includes(key));

            palette[color] = {
                solid: solidColors.every((value) => value) ? 'full' : solidColors.some((value) => value) ? 'partial' : 'none',
                soft: softColors.every((value) => value) ? 'full' : softColors.some((value) => value) ? 'partial' : 'none',
            };
        }

        info('Palette sync information:');

        for (const [color, { solid, soft }] of Object.entries(palette)) {
            item(`${color} ${this.config.palette[color] ? hexToColor(this.config.palette[color].value.substring(1), '\x1b[96m') : ''}${this.config.palette[color] ? this.config.palette[color].value : ''}${this.config.palette[color] ? (this.config.palette[color].tag ? ` \x1b[90m[${this.config.palette[color].tag}]` : '') : ''}\x1b[0m`);
            log(`    Solid: ${solid === 'full' ? '\x1b[32m✔ Fully synced' : solid === 'partial' ? '\x1b[33m⚠ Partially synced' : '\x1b[31m✖ Not synced'}\x1b[0m`);
            log(`    Soft: ${soft === 'full' ? '\x1b[32m✔ Fully synced' : soft === 'partial' ? '\x1b[33m⚠ Partially synced' : '\x1b[31m✖ Not synced'}\x1b[0m`);
        }

        if (Object.values(palette).some(({ solid, soft }) => solid !== 'full' || soft !== 'full')) {
            log('');
            warning('Some colors are not fully synced. Run `quantum-cli palette regenerate` to regenerate and synchronize the colors in the Tailwind configuration.');
        }
    }

    private async addColorPrompt() {
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
            validate: (value) => {
                if (this.config && Object.values(this.config.palette).some((color) => color.tag === value)) {
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
            validate: (value) => {
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

        return {
            name: name.value,
            tag: tag.value,
            color: color.value,
        };
    }

    private async removeColorPrompt() {
        const palette = await prompts({
            type: 'select',
            name: 'value',
            message: 'Select a color to remove:',
            choices: [
                ...(this.config ? Object.keys(this.config.palette).map((key) => ({
                    title: key,
                    value: key,
                })) : []),
            ],
        }, {
            onCancel: () => {
                process.exit(0);
            }
        });

        return palette.value;
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

export default new Palette().build();
