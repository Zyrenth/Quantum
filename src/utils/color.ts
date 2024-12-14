import { default as CUtil } from 'color';
import { score } from 'wcag-color';

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
    private static isDevEnv = process.env.NODE_ENV === 'development';
    private static colorCache: { [color: string]: Palette } = {};

    public static readonly presets = {
        primary: '#0070F3',
        secondary: '#FF0080',
        success: '#00FF00',
        error: '#FF0000',
        warning: '#FFA500',
        info: '#00FFFF',
    };

    constructor() { }

    /**
     * @description Get a color palette based on a given preset.
     * @param preset The preset to generate the palette for.
     * @param isSolid Whether to generate a solid or soft palette.
     * @returns The generated palette.
     */
    public static getPreset(preset: ColorPresets, isSolid: boolean): Palette {
        if (!Color.presets[preset]) {
            console.error('The given preset does not exist:', preset);
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
            console.error('Failed parsing the color, defaulting to #FFFFFF:', fixedColor, err);
            util = CUtil('#FFFFFF');
        }

        if (isSolid) {
            if (Color.colorCache[`solid:${fixedColor}`] && !force) return Color.colorCache[`solid:${fixedColor}`];

            try {
                let bg = util;

                const text = bg.isLight() ? CUtil('#000000') : CUtil('#FFFFFF');

                let _score = score(text.hex(), bg.hex());

                for (let i = 0; (i < 10) && (!['AAA'].includes(_score)); i++) {
                    if (Color.isDevEnv && window) console.log(`Text: %c${text.hex()}%c Bg: %c${bg.hexa()}%c Score: %c${_score}`, `color:${text.hex()}`, 'color:unset', `background-color:${bg.hexa()}`, 'background-color:unset', `color:${_score === 'Fail' ? 'red' : 'orange'}`);

                    bg = bg.darken(0.1);
                    _score = score(text.hex(), bg.hex());
                }

                if (Color.isDevEnv && window) console.log(`Final text: %c${text.hex()}%c Final bg: %c${bg.hexa()}%c Final score: %c${_score}%c Finish reason: %c${_score !== 'AAA' ? 'Reached 10 tries' : 'Reached AAA score'}`, `color:${text.hex()}`, 'color:unset', `background-color:${bg.hexa()}`, 'background-color:unset', `color:${_score === 'Fail' ? 'red' : (_score !== 'AAA' ? 'orange' : 'green')}`, 'color:unset', `color:${_score !== 'AAA' ? 'red' : 'green'}`);

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
                console.error('An error occurred while generating the palette:', err);

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
            if (Color.colorCache[`soft:${fixedColor}`] && !force) return Color.colorCache[`soft:${fixedColor}`];

            try {
                const lightBg = util.fade(0.75);
                const darkBg = util.fade(0.75);

                let lightText = util;
                let darkText = util;

                let darkScore = score(darkText.hex(), darkBg.mix(CUtil('#000000')).hex());
                let lightScore = score(lightText.hex(), lightBg.mix(CUtil('#ffffff')).hex());

                for (let i = 0; (i < 10) && (!['AAA'].includes(darkScore)); i++) {
                    if (Color.isDevEnv && window) console.log(`Dark text: %c${darkText.hex()}%c Dark bg: %c${darkBg.hexa()}%c Score: %c${darkScore}`, `color:${darkText.hex()}`, 'color:unset', `background-color:${darkBg.hexa()}`, 'background-color:unset', `color:${darkScore === 'Fail' ? 'red' : 'orange'}`);

                    darkText = darkText.lighten(0.1);
                    darkScore = score(darkText.hex(), darkBg.mix(CUtil('#000000')).hex());
                }

                if (Color.isDevEnv && window) console.log(`Final dark text: %c${darkText.hex()}%c Final dark bg: %c${darkBg.hexa()}%c Final score: %c${darkScore}%c Finish reason: %c${darkScore !== 'AAA' ? 'Reached 10 tries' : 'Reached AAA score'}`, `color:${darkText.hex()}`, 'color:unset', `background-color:${darkBg.hexa()}`, 'background-color:unset', `color:${darkScore === 'Fail' ? 'red' : (darkScore !== 'AAA' ? 'orange' : 'green')}`, 'color:unset', `color:${darkScore !== 'AAA' ? 'red' : 'green'}`);

                if (Color.isDevEnv && window) console.log('%c                                                     ', 'text-decoration: line-through');

                for (let i = 0; (i < 10) && (!['AAA'].includes(lightScore)); i++) {
                    if (Color.isDevEnv && window) console.log(`Light text: %c${lightText.hex()}%c Light bg: %c${lightBg.hexa()}%c Score: %c${lightScore}`, `color:${lightText.hex()}`, 'color:unset', `background-color:${lightBg.hexa()}`, 'background-color:unset', `color:${lightScore === 'Fail' ? 'red' : 'orange'}`);

                    lightText = lightText.darken(0.1);
                    lightScore = score(lightText.hex(), lightBg.mix(CUtil('#ffffff')).hex());
                }

                if (Color.isDevEnv && window) console.log(`Final light text: %c${lightText.hex()}%c Final light bg: %c${lightBg.hexa()}%c Final score: %c${lightScore}%c Finish reason: %c${lightScore !== 'AAA' ? 'Reached 10 tries' : 'Reached AAA score'}`, `color:${lightText.hex()}`, 'color:unset', `background-color:${lightBg.hexa()}`, 'background-color:unset', `color:${lightScore === 'Fail' ? 'red' : (lightScore !== 'AAA' ? 'orange' : 'green')}`, 'color:unset', `color:${lightScore !== 'AAA' ? 'red' : 'green'}`);

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
                console.error('An error occurred while generating the palette:', err);

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
