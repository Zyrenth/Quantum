'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { BaseHTMLAttributes, useEffect } from 'react';

import { cn } from '<{utils}>/class';

/**
 * @description The keys that can be used as keys.
 */
const ShortcutKeys = {
    control: '⌘',
    shift: '⇧',
    alt: '⌥',
    altgraph: '⎇',
    capslock: '⇪',
    tab: '⭾',
    enter: '⏎',
    escape: 'Esc',
    backspace: '⌫',
    delete: '⌦',
    insert: 'Insert',
    home: 'Home',
    end: 'End',
    pageup: '⤒',
    pagedown: '⤓',
    arrowup: '↑',
    arrowdown: '↓',
    arrowleft: '←',
    arrowright: '→',
    f1: 'F1',
    f2: 'F2',
    f3: 'F3',
    f4: 'F4',
    f5: 'F5',
    f6: 'F6',
    f7: 'F7',
    f8: 'F8',
    f9: 'F9',
    f10: 'F10',
    f11: 'F11',
    f12: 'F12',
    numlock: 'Num Lock',
    scrolllock: 'Scroll Lock',
    pause: 'Pause',
    ' ': '␣',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '0': '0',
    a: 'A',
    b: 'B',
    c: 'C',
    d: 'D',
    e: 'E',
    f: 'F',
    g: 'G',
    h: 'H',
    i: 'I',
    j: 'J',
    k: 'K',
    l: 'L',
    m: 'M',
    n: 'N',
    o: 'O',
    p: 'P',
    q: 'Q',
    r: 'R',
    s: 'S',
    t: 'T',
    u: 'U',
    v: 'V',
    w: 'W',
    x: 'X',
    y: 'Y',
    z: 'Z',
    '!': '!',
    '@': '@',
    '#': '#',
    $: '$',
    '%': '%',
    '^': '^',
    '&': '&',
    '*': '*',
    '(': '(',
    ')': ')',
    '-': '-',
    _: '_',
    '=': '=',
    '+': '+',
    '[': '[',
    ']': ']',
    '{': '{',
    '}': '}',
    ';': ';',
    ':': ':',
    "'": "'",
    '"': '"',
    ',': ',',
    '<': '<',
    '.': '.',
    '>': '>',
    '/': '/',
    '?': '?',
    '\\': '\\',
    '|': '|',
    '`': '`',
    '~': '~',
};

type Props = VariantProps<typeof kbd>;
interface KBDProps extends BaseHTMLAttributes<HTMLDivElement>, Props {
    /**
     * @description The keys to display in the KBD element.
     */
    keys: (keyof typeof ShortcutKeys | string)[];
    /**
     * @description Whether the KBD element is disabled.
     * @default false
     */
    disabled?: boolean;
}

const kbd = cva(
    [
        'flex items-center gap-2.5 rounded-md font-mono transition-all ease-out duration-[150ms]',
        'text-center font-medium leading-[normal]',
    ],
    {
        variants: {
            /**
             * @description The variant of the KBD element.
             * @default 'outline'
             */
            variant: {
                outline:
                    'bg-black/10 text-black/75 dark:bg-white/10 dark:text-white/75 border border-black/10 dark:border-white/10',
                filled: 'bg-black/15 dark:bg-white/15 text-black dark:text-white',
            },
            /**
             * @description The appearance of the KBD element.
             * @default 'normal'
             */
            appearance: {
                normal: '',
                glossy: 'bg-gradient-to-b from-black/10 to-black/20 dark:from-white/20 dark:to-white/10 !bg-transparent',
            },
            /**
             * @description The size of the KBD element.
             * @default 'md'
             */
            size: {
                sm: 'px-2 py-0.5 text-xs',
                md: 'px-2.5 py-0.5 text-sm',
                lg: 'px-2.5 py-1 text-sm',
                xl: 'px-3 py-1.5 text-base',
            },
            /**
             * @description The rounding of the KBD element.
             * @default 'md'
             */
            rounding: {
                none: 'rounded-none',
                full: 'rounded-full',
                sm: 'rounded-sm',
                md: 'rounded-md',
                lg: 'rounded-lg',
                xl: 'rounded-xl',
            },
        },
        defaultVariants: {
            variant: 'outline',
            appearance: 'normal',
            size: 'md',
            rounding: 'md',
        },
    },
);

/**
 * @description A KBD element to display keys.
 * @example <KBD keys={['control', 'shift', 'a']} />
 * @example
 * <div className="flex flex-row flex-wrap gap-2.5 items-center">
 *     <KBD variant="filled" keys={['control']} />
 *     +
 *     <KBD variant="filled" keys={['shift']} />
 *     +
 *     <KBD variant="filled" keys={['Win']} />
 *     +
 *     <KBD variant="filled" keys={['alt']} />
 *     +
 *     <KBD variant="filled" keys={['L']} />
 * </div>
 */
const KBD = React.forwardRef<HTMLDivElement, KBDProps>(function KBD(
    { keys, className, variant, appearance, size, rounding, ...props },
    ref,
) {
    const ariaLabel = props['aria-label'] || 'Keyboard keys';
    delete props['aria-label'];

    const [keyList, setKeyList] = React.useState<(keyof typeof ShortcutKeys)[]>([]);

    useEffect(() => {
        setKeyList(keys as (keyof typeof ShortcutKeys)[]);
    }, [keys]);

    const kbdClass = kbd({ variant, appearance, size, rounding });

    return (
        <div ref={ref} aria-label={ariaLabel} className={cn(kbdClass, className)} {...props}>
            {keyList?.map?.((key) => ShortcutKeys[key as keyof typeof ShortcutKeys] ?? key).join(' ')}
        </div>
    );
});

KBD.displayName = 'KBD';
export default KBD;
