import { default as CUtil } from 'color';
import { score } from 'wcag-color';

import { fail } from './log.js';

interface Palette {
    light: {
        background: string;
        text: string;
    };
    dark: {
        background: string;
        text: string;
    };
}

type ColorPresets = keyof typeof Color.presets;

class Color {
    private static colorCache: { [color: string]: Palette } = {};

    public static presets = {
        success: '#00FF00',
        error: '#FF0000',
        warning: '#FFA500',
        info: '#00FFFF',
    };

    public static backgrounds = {
        light: '#FFFFFF',
        dark: '#000000',
    };

    constructor(presets: { [preset: string]: string }, backgrounds: { light: string, dark: string }) {
        Color.presets = {
            ...Color.presets,
            ...presets,
        };

        Color.backgrounds = {
            ...Color.backgrounds,
            ...backgrounds
        };
    }

    /**
     * @description Get a color palette based on a given preset.
     * @param preset The preset to generate the palette for.
     * @param isSolid Whether to generate a solid or soft palette.
     * @returns The generated palette.
     */
    public static getPreset(preset: ColorPresets, isSolid: boolean): Palette {
        if (!Color.presets[preset]) {
            fail('The given preset does not exist:', preset);
            return Color.generatePalette('#FFFFFF', isSolid);
        }

        // @ts-ignore
        return Color.generatePalette(Color.presets[preset], isSolid);
    }

    /**
     * @description Generate a color palette based on a given color.
     * @description Since the WCAG-Color library and Firefox's Devtools calculate the contrast ratio differently, some output colors may not be AA or AAA compliant in Firefox's Devtools. If this is the case, try tuning the input colors manually (make it darker or lighter).
     * @param color - The color to generate the palette for.
     * @param isSolid - Whether to generate a solid or soft palette.
     * @returns The generated palette.
     */
    public static generatePalette(color: string, isSolid: boolean, force?: boolean): Palette {
        const fixedColor = (color.startsWith('#') ? color : `#${color}`).padEnd(7, 'F');
        let util;

        try {
            util = CUtil(fixedColor);
        } catch (err) {
            fail('Failed parsing the color:', fixedColor, 'Defaulting to #FFFFFF.');
            util = CUtil('#FFFFFF');
        }

        if (isSolid) {
            if (Color.colorCache[`solid:${fixedColor}`] && !force) return Color.colorCache[`solid:${fixedColor}`] as Palette;

            try {
                let bg = util;

                const text = bg.isLight() ? CUtil('#000000') : CUtil('#FFFFFF');

                let _score = score(text.hex(), bg.hex());

                for (let i = 0; (i < 10) && (!['AAA'].includes(_score)); i++) {
                    bg = bg.darken(0.1);
                    _score = score(text.hex(), bg.hex());
                }

                const palette = {
                    light: {
                        background: bg.hex(),
                        text: text.hex(),
                    },
                    dark: {
                        background: bg.hex(),
                        text: text.hex(),
                    },
                };

                Color.colorCache[`solid:${fixedColor}`] = palette;

                return palette;
            } catch (err) {
                fail('An error occurred while generating the palette.');

                Color.colorCache[`solid:${fixedColor}`] = {
                    light: {
                        background: '#FFFFFF',
                        text: '#000000'
                    },
                    dark: {
                        background: '#FFFFFF',
                        text: '#000000'
                    }
                };

                return {
                    light: {
                        background: '#FFFFFF',
                        text: '#000000'
                    },
                    dark: {
                        background: '#FFFFFF',
                        text: '#000000'
                    }
                };
            }
        } else {
            if (Color.colorCache[`soft:${fixedColor}`] && !force) return Color.colorCache[`soft:${fixedColor}`] as Palette;

            try {
                const lightBg = util.fade(0.75);
                const darkBg = util.fade(0.75);

                let lightText = util;
                let darkText = util;

                let darkScore = score(darkText.hex(), darkBg.mix(CUtil(this.backgrounds.dark)).hex());
                let lightScore = score(lightText.hex(), lightBg.mix(CUtil(this.backgrounds.light)).hex());

                for (let i = 0; (i < 10) && (!['AAA'].includes(darkScore)); i++) {
                    darkText = darkText.lighten(0.1);
                    darkScore = score(darkText.hex(), darkBg.mix(CUtil(this.backgrounds.dark)).hex());
                }

                for (let i = 0; (i < 10) && (!['AAA'].includes(lightScore)); i++) {
                    lightText = lightText.darken(0.1);
                    lightScore = score(lightText.hex(), lightBg.mix(CUtil(this.backgrounds.light)).hex());
                }

                const palette = {
                    light: {
                        background: lightBg.hexa(),
                        text: lightText.hex(),
                    },
                    dark: {
                        background: darkBg.hexa(),
                        text: darkText.hex(),
                    },
                };

                Color.colorCache[`soft:${fixedColor}`] = palette;

                return palette;
            } catch (err) {
                fail('An error occurred while generating the palette.');

                Color.colorCache[`soft:${fixedColor}`] = {
                    light: {
                        background: '#FFFFFF40',
                        text: '#595959'
                    },
                    dark: {
                        background: '#FFFFFF40',
                        text: '#FFFFFF'
                    }
                };

                return {
                    light: {
                        background: '#FFFFFF40',
                        text: '#595959'
                    },
                    dark: {
                        background: '#FFFFFF40',
                        text: '#FFFFFF'
                    }
                };
            }
        }
    }
}

export type { ColorPresets, Palette };
export default Color;
