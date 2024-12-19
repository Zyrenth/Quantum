'use client';

import { ArrowDownTrayIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { cva, VariantProps } from 'class-variance-authority';
import { Highlight, Prism, PrismTheme } from 'prism-react-renderer';
import React, { BaseHTMLAttributes, useEffect, useState } from 'react';

import { cn } from '<{utils}>/class';
import LabelId from '<{utils}>/labelId';

import Button from '<{components}>/Button';

(typeof global !== 'undefined' ? global : window).Prism = Prism;

declare global {
    interface Window {
        _prismimports: [string, unknown][];
    }
}

type Props = VariantProps<typeof codeblock>;
interface CodeblockProps extends BaseHTMLAttributes<HTMLDivElement>, Props {
    /**
     * @description The content of the codeblock.
     * @default ''
     */
    content?: string;
    /**
     * @description Whether to hide the header of the codeblock.
     * @default false
     */
    hideHeader?: boolean;
    /**
     * @description Whether to show line numbers in the codeblock.
     * @default true
     */
    showLineNumbers?: boolean;
    /**
     * @description The filename thats displayed in the header of the codeblock and used for downloading.
     */
    filename?: string;
    /**
     * @description The programming language of the content.
     */
    language?: string;
    /**
     * @description Whether to allow copying the content of the codeblock.
     * @default true
     */
    allowCopy?: boolean;
    /**
     * @description Whether to allow downloading the content of the codeblock.
     * @default false
     */
    allowDownload?: boolean;
    /**
     * @description Whether to fix the code indentation.
     * @description Experimental: Might return an unexpected output if the input code is not formatted correctly.
     * @default true
     */
    fixCodeIndentation?: boolean;
    /**
     * @description Whether to disable syntax highlighting.
     * @default false
     */
    disableHighlighting?: boolean;
    /**
     * @description The line numbers to highlight in the codeblock.
     * @description Highlight color: blue
     */
    highlightedLines?: number[];
    /**
     * @description The line numbers to add in the codeblock.
     * @description Highlight color: green
     */
    addedLines?: number[];
    /**
     * @description The line numbers to remove in the codeblock.
     * @description Highlight color: red
     */
    removedLines?: number[];
}

type CodeTheme = PrismTheme & {
    plain: {
        color: string;
        fontFamily: string;
    };
};

/**
 * @description Experimental: Might return an unexpected output if the input code is not formatted correctly.
 * @param text The text to strip the indentation from.
 * @returns The text with the indentation stripped.
 */
const stripIndent = (text: string): string => {
    const lines: string[] = text.split('\n');
    let minIndent = Infinity;

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine === '' || trimmedLine.startsWith('//')) continue;

        const indent = line.match(/^\s*/)![0].length;
        minIndent = Math.min(minIndent, indent);
    }

    const strippedLines: string[] = lines.map((line: string): string => {
        const trimmedLine = line.trim();
        if (trimmedLine === '') {
            return line;
        } else {
            const regex = new RegExp('^ {1,' + (minIndent < 1 ? 4 : minIndent) + '}');
            return line.replace(regex, '');
        }
    });

    return strippedLines.join('\n');
};

/**
 * @description Copies the text to the clipboard.
 * @param text The text to copy to the clipboard.
 */
const copyToClipboard = (text: string) => {
    try {
        navigator.clipboard.writeText(text).catch((err) => console.error('Failed to copy text to clipboard:', err));
    } catch (err) {
        // Since the clipboard API is not supported, we'll use the old method.
        console.warn(
            'The clipboard API is not supported or failed. Using the old (now deprecated) method to copy text to clipboard. Error:',
            err,
        );

        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
};

/**
 * @description Downloads the text as a file.
 * @param text The text to download.
 */
const downloadTextFile = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    filename = filename.split('/').pop() ?? filename;
    filename = filename.replace(/[^a-z0-9.-]/gi, '_');
    filename = filename.split('.').length === 1 ? filename + '.txt' : filename;

    link.href = url;
    link.setAttribute('download', filename);
    link.click();

    URL.revokeObjectURL(url);
};

const codeblock = cva(
    [
        'flex flex-col overflow-hidden rounded-md transition-all ease-out duration-[150ms]',
        'border border-black/20 dark:border-white/20',
    ],
    {
        variants: {
            /**
             * @description The appearance of the codeblock.
             * @default 'normal'
             */
            appearance: {
                normal: '',
                glossy: '',
            },
            /**
             * @description The size of the codeblock.
             * @default 'md'
             */
            size: {
                sm: '',
                md: '',
                lg: '',
                xl: '',
            },
            /**
             * @description The rounding of the codeblock.
             * @default 'md'
             */
            rounding: {
                none: 'rounded-none',
                sm: 'rounded-md',
                md: 'rounded-lg',
                lg: 'rounded-xl',
                xl: 'rounded-2xl',
            },
        },
        defaultVariants: {
            appearance: 'normal',
            size: 'md',
            rounding: 'md',
        },
    },
);

const codeblockHeader = cva(
    [
        'flex w-full justify-between items-center self-stretch font-mono transition-all ease-out duration-[150ms]',
        'text-black/75 dark:text-white/75 border-b border-black/20 dark:border-white/20',
    ],
    {
        variants: {
            /**
             * @description The appearance of the codeblock header.
             * @default 'normal'
             */
            appearance: {
                normal: 'bg-black/5 dark:bg-white/5',
                glossy: 'bg-gradient-to-b from-black/5 to-black/10 dark:from-white/10 dark:to-white/5',
            },
            /**
             * @description The size of the codeblock header.
             * @default 'md'
             */
            size: {
                sm: 'px-2.5 py-1 text-sm',
                md: 'px-3.5 py-2 text-sm',
                lg: 'px-4 py-3 text-base',
                xl: 'px-4 py-3.5 text-base',
            },
        },
        defaultVariants: {
            appearance: 'normal',
            size: 'md',
        },
    },
);

const codeblockHeaderIcon = cva(['h-5 w-5 text-black/75 dark:text-white/75 transition-all ease-out duration-[150ms]'], {
    variants: {
        /**
         * @description The size of the codeblock header icon.
         * @default 'md'
         */
        size: {
            sm: 'h-5 w-5',
            md: 'h-5 w-5',
            lg: 'h-[22px] w-[22px]',
            xl: 'h-[22px] w-[22px]',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

const codeblockTextarea = cva(['w-full items-center gap-2.5 bg-black/10 dark:bg-white/10 overflow-x-auto'], {
    variants: {
        /**
         * @description The size of the codeblock textarea.
         * @default 'md'
         */
        size: {
            sm: 'text-sm',
            md: 'text-sm',
            lg: 'text-base',
            xl: 'text-base',
        },
        /**
         * @description Whether the codeblock is dark or light.
         * @default true
         */
        isDark: {
            true: 'hidden dark:flex',
            false: 'flex dark:hidden',
        },
    },
    defaultVariants: {
        size: 'md',
        isDark: true,
    },
});

/**
 * @description A codeblock component.
 * @requires Button
 * @requires `prism-react-renderer` via NPM.
 * @requires `prismjs` via NPM.
 * @requires `@heroicons/react` via NPM.
 */
const Codeblock = React.forwardRef<HTMLDivElement, CodeblockProps>(function Codeblock(
    {
        content = '',
        className,
        appearance,
        size,
        rounding,
        hideHeader,
        showLineNumbers = true,
        filename,
        language,
        allowCopy = true,
        allowDownload = false,
        fixCodeIndentation = true,
        disableHighlighting = false,
        addedLines = [],
        highlightedLines = [],
        removedLines = [],
        ...props
    },
    ref,
) {
    const ids = new LabelId();
    const ariaLabel = props['aria-label'] || (!hideHeader ? ids.create('filename') : 'Codeblock');
    delete props['aria-label'];

    const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                if (!language) return;

                if (!window._prismimports) window._prismimports = [];

                if (window._prismimports.find((x) => x[0] === language)) {
                    setIsLanguageLoaded(true);
                    return;
                }

                import('prismjs/components/prism-' + language).then((module) => {
                    setIsLanguageLoaded(true);
                    window._prismimports.push([language, module]);
                });
            } catch (err) {
                console.error('Failed to load Prism language:', err);
            }
        })();
    }, [language]);

    let code = Array.isArray(content) ? content.join('\n') : content;
    code = fixCodeIndentation ? stripIndent(code) : code;

    const highlightedDark: CodeTheme = {
        plain: {
            color: '#ffffff',
            fontFamily: 'monospace',
        },
        styles: [
            {
                types: ['comment', 'prolog', 'doctype', 'cdata'],
                style: {
                    color: '#6f6f6f',
                },
            },
            {
                types: ['punctuation'],
                style: {
                    color: '#9f9f9f',
                },
            },
            {
                types: ['property', 'tag', 'boolean', 'number', 'constant', 'symbol', 'deleted'],
                style: {
                    color: '#62a5fe',
                },
            },
            {
                types: ['selector', 'attr-name', 'string', 'char', 'builtin', 'inserted'],
                style: {
                    color: '#b2bdea',
                },
            },
            {
                types: ['operator', 'entity', 'url'],
                style: {
                    color: '#8f8f8f',
                },
            },
            {
                types: ['atrule', 'attr-value', 'keyword'],
                style: {
                    color: '#8a8ad0',
                },
            },
            {
                types: ['function'],
                style: {
                    color: '#77b1fe',
                },
            },
            {
                types: ['regex', 'important', 'variable'],
                style: {
                    color: '#66c5ca',
                },
            },
            {
                types: ['important', 'bold'],
                style: {
                    fontWeight: 'bold',
                },
            },
            {
                types: ['italic'],
                style: {
                    fontStyle: 'italic',
                },
            },
        ],
    };

    const highlightedLight: CodeTheme = {
        plain: {
            color: '#000000',
            fontFamily: 'monospace',
        },
        styles: [
            {
                types: ['comment', 'prolog', 'doctype', 'cdata'],
                style: {
                    color: '#373737',
                },
            },
            {
                types: ['punctuation'],
                style: {
                    color: '#4f4f4f',
                },
            },
            {
                types: ['property', 'tag', 'boolean', 'number', 'constant', 'symbol', 'deleted'],
                style: {
                    color: '#014caf',
                },
            },
            {
                types: ['selector', 'attr-name', 'string', 'char', 'builtin', 'inserted'],
                style: {
                    color: '#2c43a2',
                },
            },
            {
                types: ['operator', 'entity', 'url'],
                style: {
                    color: '#474747',
                },
            },
            {
                types: ['atrule', 'attr-value', 'keyword'],
                style: {
                    color: '#32327b',
                },
            },
            {
                types: ['function'],
                style: {
                    color: '#0150b9',
                },
            },
            {
                types: ['regex', 'important', 'variable'],
                style: {
                    color: '#276d71',
                },
            },
            {
                types: ['important', 'bold'],
                style: {
                    fontWeight: 'bold',
                },
            },
            {
                types: ['italic'],
                style: {
                    fontStyle: 'italic',
                },
            },
        ],
    };

    const themes: {
        highlighted: { dark: CodeTheme; light: CodeTheme };
        unhighlighted: { dark: CodeTheme; light: CodeTheme };
    } = {
        highlighted: {
            dark: highlightedDark,
            light: highlightedLight,
        },
        unhighlighted: {
            dark: {
                plain: {
                    color: '#ffffff',
                    fontFamily: 'monospace',
                },
                styles: [],
            },
            light: {
                plain: {
                    color: '#000000',
                    fontFamily: 'monospace',
                },
                styles: [],
            },
        },
    };

    const highlightColors = {
        added: '#07b72e',
        removed: '#b70707',
        highlighted: '#0782b7',
    };

    /**
     * @description Generates the styles for a line diff.
     * @param lineNumber The line number to generate the styles for.
     * @returns The styles for the line diff.
     */
    const lineDiff = (lineNumber: number) => {
        const style: React.CSSProperties = { display: 'block' };

        let highlighter: string | null = null;

        if (highlightedLines.includes(lineNumber)) highlighter = highlightColors.highlighted;
        else if (addedLines.includes(lineNumber)) highlighter = highlightColors.added;
        else if (removedLines.includes(lineNumber)) highlighter = highlightColors.removed;

        if (highlighter) {
            style.backgroundColor = highlighter + '33';
            style.borderLeft = '0.25rem solid ' + highlighter;
        } else style.borderLeft = '0.25rem solid transparent';

        style.paddingLeft = '0.75rem';
        style.paddingRight = '0.75rem';

        return { style };
    };

    const codeblockClass = codeblock({ appearance, size, rounding });
    const codeblockHeaderClass = codeblockHeader({ appearance, size });
    const codeblockHeaderIconClass = codeblockHeaderIcon({ size });

    const buttons = (
        <>
            {allowCopy && (
                <Button
                    variant={'blank'}
                    size={size}
                    rounding={rounding}
                    aria-label="Copy code to clipboard"
                    className="p-1"
                    onClick={() => copyToClipboard(code)}
                >
                    <ClipboardIcon className={cn(codeblockHeaderIconClass)} />
                </Button>
            )}
            {allowDownload && (
                <Button
                    variant={'blank'}
                    size={size}
                    rounding={rounding}
                    aria-label="Download code"
                    className="p-1"
                    onClick={() => downloadTextFile(code, filename ?? 'download.txt')}
                >
                    <ArrowDownTrayIcon className={cn(codeblockHeaderIconClass)} />
                </Button>
            )}
        </>
    );

    const header = (
        <div className={cn(codeblockHeaderClass)}>
            <div id={ids.get('filename')} className={cn('overflow-hidden whitespace-nowrap text-ellipsis')}>
                {filename ?? 'Codeblock'}
            </div>
            <div className="flex flex-row gap-2.5 items-center">{buttons}</div>
        </div>
    );

    return (
        <div
            ref={ref}
            aria-label={ariaLabel}
            aria-description="A block of code displayed with syntax highlighting."
            className={cn(codeblockClass, 'relative', className)}
            {...props}
        >
            {!hideHeader ? (
                header
            ) : (
                <div className="absolute flex flex-row gap-2.5 items-center right-0 p-2">{buttons}</div>
            )}
            {(disableHighlighting || !isLanguageLoaded
                ? [themes.unhighlighted.dark, themes.unhighlighted.light]
                : [themes.highlighted.dark, themes.highlighted.light]
            ).map((theme: PrismTheme | undefined, index: number) => (
                <div key={index} className={cn(codeblockTextarea({ size, isDark: index === 0 }))}>
                    <Highlight theme={theme} code={code} language={language ?? 'text'}>
                        {({ style, tokens, getLineProps, getTokenProps }) => (
                            <pre style={{ ...style, paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
                                {tokens.map((line, i) => {
                                    const { style, ...otherProps } = getLineProps({ line });

                                    return (
                                        <div key={i} {...otherProps} style={{ ...style, ...lineDiff(i + 1).style }}>
                                            {showLineNumbers && (
                                                <span
                                                    style={{
                                                        minWidth: '2rem',
                                                        display: 'inline-block',
                                                        textAlign: 'right',
                                                        paddingRight: '1rem',
                                                        color: theme?.plain.color,
                                                        opacity: 0.75,
                                                        userSelect: 'none',
                                                    }}
                                                >
                                                    {i + 1}
                                                </span>
                                            )}
                                            {line.map((token, key) => (
                                                <span key={key} {...getTokenProps({ token })} />
                                            ))}
                                        </div>
                                    );
                                })}
                            </pre>
                        )}
                    </Highlight>
                </div>
            ))}
        </div>
    );
});

Codeblock.displayName = 'Codeblock';
export default Codeblock;
