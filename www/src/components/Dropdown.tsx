'use client';

import {
    ChevronRightIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { cva, VariantProps } from 'class-variance-authority';
import React, {
    BaseHTMLAttributes,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import { cn } from '@/utils/class';

import TextInput from '@/components/TextInput';

/**
 * @description The keys that can be used as shortcuts.
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

type ShortcutKey = keyof typeof ShortcutKeys;

type DropdownHeader = {
    /**
     * @description The type of the dropdown item.
     * @default 'item'
     */
    type: 'header';
    /**
     * @description The label to display in the dropdown header.
     */
    label: string;
};

type DropdownDivider = {
    /**
     * @description The type of the dropdown item.
     * @default 'item'
     */
    type: 'divider';
};

type DropdownItem = {
    /**
     * @description The type of the dropdown item.
     * @default 'item'
     */
    type: 'item';
    /**
     * @description The label to display in the dropdown item.
     */
    label?: string;
    /**
     * @description The icon to display in the dropdown item.
     */
    icon?: React.ReactNode;
    /**
     * @description The shortcut keys to tigger the dropdown item.
     */
    shortcut?: ShortcutKey[];
    /**
     * @description The action to perform when the dropdown item is clicked.
     */
    action?: () => void | Promise<void>;
    /**
     * @description The sub-items to display in a dropdown when clicking on the dropdown item
     */
    subItems?: DropdownItem[];
    /**
     * @description The variant of the dropdown item.
     * @default 'primary'
     */
    // prettier-ignore
    variant?:
        | 'primary'
        | 'success'
        | 'warning'
        | 'danger'
        | 'info'
        ;
    /**
     * @description Whether the dropdown item is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * @description Whether the dropdown item should be focused when the dropdown is opened.
     * @default false
     */
    focused?: boolean;
};

type DropdownContent = DropdownHeader | DropdownDivider | DropdownItem;

type Props = Omit<VariantProps<typeof dropdown>, 'isOpen'>;
interface DropdownProps
    extends Omit<Omit<BaseHTMLAttributes<HTMLDivElement>, 'size'>, 'content'>,
        Props {
    /**
     * @description The list of dropdown items to display in the dropdown.
     */
    content: DropdownContent[];
    /**
     * @description The delay in milliseconds before the dropdown opens when hovering over the parent element.
     */
    hoverDelay?: number;
    /**
     * @description Whether to disable the ability to open the dropdown by hovering over the parent element.
     * @default false
     */
    disableHover?: boolean;
    /**
     * @description Whether to disable the ability to toggle the dropdown.
     * @default false
     */
    disableToggle?: boolean;
    /**
     * @description The class name(s) to apply to the dropdown wrapper.
     */
    wrapperClassName?: string;
    /**
     * @description Whether to show the search input in the dropdown.
     * @default false
     */
    withSearch?: boolean;
    /**
     * @description The placeholder text to display in the search input.
     * @default 'Search...'
     */
    searchPlaceholder?: string;
    /**
     * @description Whether to keep the dropdown open when an item is clicked.
     * @default false
     */
    stayOpen?: boolean;
    /**
     * @description Fires when the dropdown open state changes.
     * @param isOpen Whether the dropdown is open.
     */
    onOpenStateChange?: (isOpen: boolean) => void;

    /**
     * @description Internal function used to close stacked dropdowns.
     * @private
     */
    closeStackedDropdown?: (closePrevious: boolean) => void;
}

const dropdown = cva(
    [
        'flex flex-col w-fit shadow-lg whitespace-nowrap rounded-md transform transition-all ease-out duration-[150ms]',
        'bg-white dark:bg-black border border-black/15 dark:border-white/15',
        "before:content-[''] before:absolute before:border-8 before:border-solid before:border-transparent",
        "after:content-[''] after:absolute after:border-[6.5px] after:border-solid after:border-transparent",
    ],
    {
        variants: {
            /**
             * @description The size of the dropdown.
             * @default 'md'
             */
            size: {
                sm: 'text-xs',
                md: 'text-sm',
                lg: 'text-base',
                xl: 'text-base',
            },
            /**
             * @description The rounding of the dropdown.
             * @default 'md'
             */
            rounding: {
                none: 'rounded-none',
                sm: 'rounded-md',
                md: 'rounded-lg',
                lg: 'rounded-xl',
                xl: 'rounded-2xl',
            },
            /**
             * @description The orientation of the dropdown relative to the parent element.
             * @default 'bottomLeft'
             */
            orientation: {
                topLeft:
                    'mb-[12px] before:top-full after:top-full before:left-6 after:left-6 before:-ml-2 after:ml-[-6.5px] before:border-t-[#d9d9d9] before:dark:border-t-[#262626] after:border-t-white after:dark:border-t-black',
                topCenter:
                    'mb-[12px] before:top-full after:top-full before:left-1/2 after:left-1/2 before:-ml-2 after:ml-[-6.5px] before:border-t-[#d9d9d9] before:dark:border-t-[#262626] after:border-t-white after:dark:border-t-black',
                topRight:
                    'mb-[12px] before:top-full after:top-full before:left-[calc(100%-1.5rem)] after:left-[calc(100%-1.5rem)] before:-ml-2 after:ml-[-6.5px] before:border-t-[#d9d9d9] before:dark:border-t-[#262626] after:border-t-white after:dark:border-t-black',
                bottomLeft:
                    'mt-[12px] before:bottom-full after:bottom-full before:left-6 after:left-6 before:-ml-2 after:ml-[-6.5px] before:border-b-[#d9d9d9] before:dark:border-b-[#262626] after:border-b-white after:dark:border-b-black',
                bottomCenter:
                    'mt-[12px] before:bottom-full after:bottom-full before:left-1/2 after:left-1/2 before:-ml-2 after:ml-[-6.5px] before:border-b-[#d9d9d9] before:dark:border-b-[#262626] after:border-b-white after:dark:border-b-black',
                bottomRight:
                    'mt-[12px] before:bottom-full after:bottom-full before:left-[calc(100%-1.5rem)] after:left-[calc(100%-1.5rem)] before:-ml-2 after:ml-[-6.5px] before:border-b-[#d9d9d9] before:dark:border-b-[#262626] after:border-b-white after:dark:border-b-black',
                leftTop:
                    'mr-[12px] before:left-full after:left-full before:top-6 after:top-6 before:-mt-2 after:mt-[-6.5px] before:border-l-[#d9d9d9] before:dark:border-l-[#262626] after:border-l-white after:dark:border-l-black',
                leftCenter:
                    'mr-[12px] before:left-full after:left-full before:top-1/2 after:top-1/2 before:-mt-2 after:mt-[-6.5px] before:border-l-[#d9d9d9] before:dark:border-l-[#262626] after:border-l-white after:dark:border-l-black',
                leftBottom:
                    'mr-[12px] before:left-full after:left-full before:top-[calc(100%-1.5rem)] after:top-[calc(100%-1.5rem)] before:-mt-2 after:mt-[-6.5px] before:border-l-[#d9d9d9] before:dark:border-l-[#262626] after:border-l-white after:dark:border-l-black',
                rightTop:
                    'ml-[12px] before:right-full after:right-full before:top-6 after:top-6 before:-mt-2 after:mt-[-6.5px] before:border-r-[#d9d9d9] before:dark:border-r-[#262626] after:border-r-white after:dark:border-r-black',
                rightCenter:
                    'ml-[12px] before:right-full after:right-full before:top-1/2 after:top-1/2 before:-mt-2 after:mt-[-6.5px] before:border-r-[#d9d9d9] before:dark:border-r-[#262626] after:border-r-white after:dark:border-r-black',
                rightBottom:
                    'ml-[12px] before:right-full after:right-full before:top-[calc(100%-1.5rem)] after:top-[calc(100%-1.5rem)] before:-mt-2 after:mt-[-6.5px] before:border-r-[#d9d9d9] before:dark:border-r-[#262626] after:border-r-white after:dark:border-r-black',
            },
            /**
             * @description Whether to show the arrow on the dropdown.
             * @default false
             */
            showArrow: {
                false: ['before:border-none after:border-none'],
            },
            /**
             * @description Whether to expand the dropdown to the full width of the parent element.
             * @default false
             */
            fullWidth: {
                true: 'w-full',
                false: '',
            },
            /**
             * @description Whether the dropdown is open.
             * @default false
             * @private
             */
            isOpen: {
                true: 'scale-100 opacity-100',
                false: 'scale-95 opacity-0',
            },
        },
        compoundVariants: [
            {
                orientation: 'topLeft',
                showArrow: false,
                className: 'mb-[6px]',
            },
            {
                orientation: 'topCenter',
                showArrow: false,
                className: 'mb-[6px]',
            },
            {
                orientation: 'topRight',
                showArrow: false,
                className: 'mb-[6px]',
            },
            {
                orientation: 'bottomLeft',
                showArrow: false,
                className: 'mt-[6px]',
            },
            {
                orientation: 'bottomCenter',
                showArrow: false,
                className: 'mt-[6px]',
            },
            {
                orientation: 'bottomRight',
                showArrow: false,
                className: 'mt-[6px]',
            },
            {
                orientation: 'leftTop',
                showArrow: false,
                className: 'mr-[6px]',
            },
            {
                orientation: 'leftCenter',
                showArrow: false,
                className: 'mr-[6px]',
            },
            {
                orientation: 'leftBottom',
                showArrow: false,
                className: 'mr-[6px]',
            },
            {
                orientation: 'rightTop',
                showArrow: false,
                className: 'ml-[6px]',
            },
            {
                orientation: 'rightCenter',
                showArrow: false,
                className: 'ml-[6px]',
            },
            {
                orientation: 'rightBottom',
                showArrow: false,
                className: 'ml-[6px]',
            },
        ],
        defaultVariants: {
            size: 'md',
            rounding: 'md',
            orientation: 'bottomLeft',
            showArrow: false,
            fullWidth: false,
            isOpen: false,
        },
    },
);

const dropdownWrapper = cva(['absolute shrink-0 w-fit z-[100]'], {
    variants: {
        /**
         * @description The orientation of the dropdown relative to the parent element.
         * @default 'bottomLeft'
         */
        orientation: {
            topLeft: 'left-0 top-0 translate-y-[-100%]',
            topCenter: 'left-1/2 -translate-x-1/2 top-0 translate-y-[-100%]',
            topRight: 'right-0 top-0 translate-y-[-100%]',
            bottomLeft: 'left-0 bottom-0 translate-y-[100%]',
            bottomCenter:
                'left-1/2 -translate-x-1/2 bottom-0 translate-y-[100%]',
            bottomRight: 'right-0 bottom-0 translate-y-[100%]',
            leftTop: 'top-0 left-0 translate-x-[-100%]',
            leftCenter: 'top-1/2 -translate-y-1/2 left-0 translate-x-[-100%]',
            leftBottom: 'bottom-0 left-0 translate-x-[-100%]',
            rightTop: 'top-0 right-0 translate-x-[100%]',
            rightCenter: 'top-1/2 -translate-y-1/2 right-0 translate-x-[100%]',
            rightBottom: 'bottom-0 right-0 translate-x-[100%]',
        },
        fullWidth: {
            true: 'w-full',
            false: '',
        },
    },
    defaultVariants: {
        orientation: 'bottomLeft',
        fullWidth: false,
    },
});

const dropdownItem = cva(
    [
        'flex flex-row items-center gap-2.5 w-[calc(100%-12px)] rounded-md p-2',
        'hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 outline-none',
        'transition-all ease-out duration-[150ms]',
    ],
    {
        variants: {
            /**
             * @description The variant of the dropdown item.
             * @default 'primary'
             */
            variant: {
                primary: 'text-black dark:text-white',
                success:
                    'text-success-soft-light-text dark:text-success-soft-dark-text',
                warning:
                    'text-warning-soft-light-text dark:text-warning-soft-dark-text',
                danger: 'text-danger-soft-light-text dark:text-danger-soft-dark-text',
                info: 'text-info-soft-light-text dark:text-info-soft-dark-text',
            },
            /**
             * @description The size of the dropdown item.
             * @default 'md'
             */
            size: {
                sm: 'p-1 mx-1 w-[calc(100%-8px)] text-xs',
                md: 'p-1.5 mx-1.5 w-[calc(100%-12px)] text-sm',
                lg: 'p-2 mx-2 w-[calc(100%-16px)] text-base',
                xl: 'p-2.5 mx-2.5 w-[calc(100%-20px)] text-base',
            },
            /**
             * @description The rounding of the dropdown item.
             * @default 'md'
             */
            rounding: {
                none: 'rounded-none',
                sm: 'rounded-sm',
                md: 'rounded-md',
                lg: 'rounded-lg',
                xl: 'rounded-xl',
            },
            /**
             * @description Whether the dropdown item is disabled.
             * @default false
             */
            disabled: {
                true: '!cursor-not-allowed !opacity-50 hover:!bg-transparent dark:hover:!bg-transparent focus:!bg-transparent dark:focus:!bg-transparent',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
            rounding: 'md',
            disabled: false,
        },
    },
);

const dropdownItemWrapper = cva(['flex flex-col gap-2.5'], {
    variants: {
        /**
         * @description The size of the dropdown item wrapper.
         * @default 'md'
         */
        size: {
            sm: 'py-1 gap-1',
            md: 'py-1.5 gap-1.5',
            lg: 'py-2 gap-2',
            xl: 'py-2.5 gap-2.5',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

const dropdownItemShortcut = cva(
    [
        'flex flex-row justify-center ml-auto bg-black/15 dark:bg-white/15 rounded-md py-1 px-1.5 text-xs text-black dark:text-white !leading-[100%]',
    ],
    {
        variants: {
            /**
             * @description The size of the dropdown item shortcut.
             * @default 'md'
             */
            size: {
                sm: 'px-1.5 h-5 max-h-5 text-xs',
                md: 'px-2 h-6 max-h-6 text-sm',
                lg: 'px-2 h-6 max-h-6 text-base',
                xl: 'px-2 h-6 max-h-6 text-base',
            },
            /**
             * @description The rounding of the dropdown item shortcut.
             * @default 'md'
             */
            rounding: {
                none: 'rounded-none',
                sm: 'rounded-sm',
                md: 'rounded-md',
                lg: 'rounded-lg',
                xl: 'rounded-xl',
            },
        },
        defaultVariants: {
            size: 'md',
            rounding: 'md',
        },
    },
);

const dropdownItemIcon = cva(['shrink-0'], {
    variants: {
        /**
         * @description The size of the dropdown item icon.
         * @default 'md'
         */
        size: {
            sm: 'w-[20px] h-[20px]',
            md: 'w-6 h-6',
            lg: 'w-6 h-6',
            xl: 'w-6 h-6',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

const dropdownDivider = cva(['border-t border-black/15 dark:border-white/15']);

const dropdownHeader = cva(
    [
        'flex flex-row items-center gap-2.5 w-full p-2 pt-0',
        'border-b border-black/15 dark:border-white/15',
        'font-bold',
        'transition-all ease-out duration-[150ms]',
    ],
    {
        variants: {
            /**
             * @description The size of the dropdown header.
             * @default 'md'
             */
            variant: {
                primary: 'text-black dark:text-white',
                success:
                    'text-success-soft-light-text dark:text-success-soft-dark-text',
                warning:
                    'text-warning-soft-light-text dark:text-warning-soft-dark-text',
                danger: 'text-danger-soft-light-text dark:text-danger-soft-dark-text',
                info: 'text-info-soft-light-text dark:text-info-soft-dark-text',
            },
            /**
             * @description The size of the dropdown header.
             * @default 'md'
             */
            size: {
                sm: 'p-1 pt-0 text-xs',
                md: 'p-1.5 pt-0 text-sm',
                lg: 'p-2 pt-0 text-sm',
                xl: 'p-2.5 pt-0 text-sm',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    },
);

/**
 * @description The Dropdown component is used to display a list of items in a dropdown.
 * @example
 * <Dropdown
 *     content={[
 *         {
 *             type: 'item',
 *             icon: <UserIcon className="w-full h-full" />,
 *             label: 'My Profile',
 *             shortcut: ['control', 'p'],
 *             action: () => alert('My Profile'),
 *         },
 *         {
 *             type: 'item',
 *             icon: <CogIcon className="w-full h-full" />,
 *             label: 'Settings',
 *             shortcut: ['control', ','],
 *             action: () => alert('Settings'),
 *         },
 *     ]}
 *     showArrow
 * >
 *     <Button>Dropdown</Button>
 * </Dropdown>
 * @requires TextInput
 * @requires `@heroicons/react` via NPM.
 */
const DropdownElement = React.forwardRef<HTMLDivElement, DropdownProps>(
    function Dropdown(
        {
            children,
            content,
            className,
            fullWidth,
            wrapperClassName,
            size,
            rounding,
            orientation,
            showArrow,
            hoverDelay,
            disableHover,
            disableToggle,
            withSearch,
            searchPlaceholder = 'Search...',
            stayOpen,
            onOpenStateChange,
            closeStackedDropdown,
            ...props
        },
        ref,
    ) {
        const ariaLabel = props['aria-label'] || 'Dropdown';
        delete props['aria-label'];

        // Refs
        const defaultRef = ref ?? React.useRef<HTMLDivElement>(null);
        const popupRef = React.useRef<HTMLDivElement>(null);
        const itemsRef = React.useRef<HTMLDivElement>(null);
        const searchRef = React.useRef<HTMLInputElement>(null);

        const itemRefs = useRef<
            {
                element: HTMLButtonElement | null;
                hasSubItems: boolean | undefined;
                focused: boolean | undefined;
            }[]
        >([]);

        // Animation states
        const [timeoutId, setTimeoutId] = useState<number | null>(null);
        const [isDebouncing, setIsDebouncing] = useState(false);

        // Visibility states
        const [isVisible, setVisible] = useState<boolean>(false);
        const [isToggled, setToggled] = useState<boolean>(false);
        const [isOpen, setOpen] = useState<boolean>(false);

        // Focus state
        const [focusedItem, setFocusedItem] = useState<number | null>(null);

        // Keyboard states
        const [, setPressedKeys] = useState(new Set<string>());
        const lastKeyList = useRef<DropdownContent[]>([]);

        // Search state
        const [searchTerm, setSearchTerm] = useState<string>('');

        const clearExistingTimeout = useCallback(() => {
            if (timeoutId) clearTimeout(timeoutId);
            setTimeoutId(null);
        }, [timeoutId]);

        /**
         * @description Handles the dropdown opening when hovering over or clicking the parent element.
         * @param isClick Whether the dropdown is being opened by a click event.
         */
        const openDropdown = useCallback(
            (isClick: boolean) => {
                setSearchTerm('');

                if (isDebouncing && isClick) return;

                clearExistingTimeout();

                setTimeoutId(
                    +setTimeout(
                        () => {
                            setVisible(true);
                            setIsDebouncing(true);

                            lastKeyList.current = [];
                            setPressedKeys(new Set());

                            if (isClick) {
                                setToggled(true);

                                const focusedItem = itemRefs.current.findIndex(
                                    (item) => item.focused,
                                );

                                setFocusedItem(
                                    focusedItem === -1 ? 0 : focusedItem,
                                );
                            }

                            setTimeoutId(
                                +setTimeout(() => {
                                    setOpen(true);
                                    setIsDebouncing(false);
                                }, 50),
                            );
                        },
                        !isClick ? hoverDelay : 0,
                    ),
                );
            },
            [clearExistingTimeout, hoverDelay, isDebouncing],
        );

        /**
         * @description Handles the dropdown closing when hovering or clicking outside the dropdown.
         * @param isClick Whether the dropdown is being closed by a click event.
         */
        const closeDropdown = useCallback(
            (isClick: boolean) => {
                if (isDebouncing && isClick) return;
                if (isToggled && !isClick) return;

                clearExistingTimeout();

                if ('current' in defaultRef && isToggled) {
                    const firstChild = defaultRef?.current
                        ?.firstElementChild as HTMLElement;
                    const focusable = firstChild?.querySelector(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                    ) as HTMLElement;
                    focusable ? focusable?.focus() : firstChild?.focus();
                }

                setIsDebouncing(true);
                if (isToggled && isClick) setToggled(false);

                setOpen(false);
                setFocusedItem(null);

                setTimeoutId(
                    +setTimeout(() => {
                        setVisible(false);
                        setIsDebouncing(false);
                    }, 100),
                );
            },
            [clearExistingTimeout, defaultRef, isDebouncing, isToggled],
        );

        /**
         * @description Generates a renderable element for the dropdown header.
         * @param item The dropdown header item to process.
         * @param index The index of the dropdown header item.
         * @returns The renderable element for the dropdown header.
         */
        const processHeader = useCallback(
            (item: { type: string; label: string }, index: number) => {
                const dropdownHeaderClass = dropdownHeader({
                    size,
                    variant: 'primary',
                });
                const label = <div>{item.label}</div>;

                // TODO: Figure out what would be the best aria level for this header.
                return (
                    <div
                        key={index}
                        role="heading"
                        aria-level={3}
                        className={cn(dropdownHeaderClass)}>
                        {label}
                    </div>
                );
            },
            [size],
        );

        /**
         * @description Generates a renderable element for the dropdown item.
         * @param item The dropdown item to process.
         * @param index The index of the dropdown item. - This index doesn't account for dividers or headers.
         * @param realIndex The real index of the dropdown item.
         * @returns The renderable element for the dropdown item.
         */
        const processItem = useCallback(
            (item: DropdownItem, index: number, realIndex: number) => {
                const handleItemClick = () => {
                    if (item.subItems) return;

                    item.action?.();
                    if (!stayOpen) closeStackedDropdown?.(true);
                    if (!stayOpen) closeDropdown(true);
                };

                const dropdownItemClass = dropdownItem({
                    size,
                    rounding,
                    variant: item?.variant,
                    disabled: item?.disabled,
                });
                const dropdownItemShortcutClass = dropdownItemShortcut({
                    size,
                    rounding,
                });
                const dropdownItemIconClass = dropdownItemIcon({ size });

                const icon = content.some(
                    (item) => item.type === 'item' && item.icon,
                ) && (
                    <div className={cn(dropdownItemIconClass)}>{item.icon}</div>
                );
                const label = (
                    <div
                        className={cn(
                            (item.shortcut || item.subItems) && 'mr-4',
                            'truncate',
                        )}>
                        {item.label ?? 'Dropdown item'}
                    </div>
                );

                const shortcut = (
                    <div className={cn(dropdownItemShortcutClass)}>
                        {item.shortcut
                            ?.map?.((key) => ShortcutKeys[key])
                            .filter((value) => !!value)
                            .join(' ')}
                    </div>
                );

                const chevron = (
                    <div className={cn(dropdownItemIconClass, 'ml-auto')}>
                        <ChevronRightIcon className="w-full h-full" />
                    </div>
                );

                const baseItem = (
                    <button
                        key={realIndex}
                        ref={(el) => {
                            itemRefs.current[index] = {
                                element: el,
                                hasSubItems:
                                    item.subItems && item.subItems?.length > 0,
                                focused: item.focused,
                            };
                        }}
                        role={'menuitem'}
                        aria-label={item.label ?? 'Dropdown item'}
                        aria-disabled={item.disabled}
                        aria-haspopup={item.subItems ? 'menu' : 'false'}
                        aria-keyshortcuts={item.shortcut?.join?.(' ')}
                        className={cn(dropdownItemClass)}
                        onClick={handleItemClick}
                        disabled={item.disabled}
                        type="button">
                        {icon}
                        {label}
                        {item.shortcut &&
                            item.shortcut?.some?.((key) => ShortcutKeys[key]) &&
                            !item.subItems &&
                            shortcut}
                        {item.subItems && chevron}
                    </button>
                );

                if (!item.subItems) return baseItem;

                return (
                    <DropdownElement
                        key={realIndex}
                        content={item.subItems}
                        orientation={'rightTop'}
                        closeStackedDropdown={(closePrevious: boolean) => {
                            if (focusedItem) {
                                itemRefs.current[
                                    focusedItem
                                ]?.element?.parentElement?.click();
                                itemRefs.current[focusedItem]?.element?.focus();
                            }

                            if (closePrevious) {
                                closeStackedDropdown?.(true);
                                closeDropdown(true);
                            }
                        }}
                        {...{
                            className,
                            size,
                            rounding,
                            showArrow,
                            hoverDelay,
                            disableHover,
                            disableToggle,
                            stayOpen,
                            ...props,
                        }}>
                        {baseItem}
                    </DropdownElement>
                );
            },
            [
                className,
                closeDropdown,
                closeStackedDropdown,
                content,
                disableHover,
                disableToggle,
                focusedItem,
                hoverDelay,
                props,
                rounding,
                showArrow,
                size,
                stayOpen,
            ],
        );

        /**
         * @description Processes the dropdown items to display in the dropdown.
         * @param content The list of dropdown items to process.
         * @param searchTerm The search term to filter the dropdown items.
         * @returns The renderable elements for the dropdown items.
         */
        const processItems = useCallback(
            (content: DropdownContent[], searchTerm: string) => {
                const contents = content
                    .map((item) => {
                        if (item.type === 'item') return item;

                        if (item.type === 'divider') return { type: 'divider' };

                        return {
                            label: item.label,
                            type: 'header',
                        };
                    })
                    .filter((item) => {
                        if (!searchTerm) return true;
                        if (item?.type !== 'item') return false;

                        if (
                            item?.label
                                ?.toLowerCase()
                                ?.includes(searchTerm.toLowerCase())
                        )
                            return true;
                    });

                return contents.map((item, index) => {
                    if (item.type === 'divider')
                        return (
                            <div
                                key={index}
                                role="separator"
                                className={cn(dropdownDivider())}
                            />
                        );
                    if (item.type === 'header')
                        return processHeader(
                            item as unknown as {
                                type: string;
                                label: string;
                                icon: React.ReactNode;
                            },
                            index,
                        );

                    return processItem(
                        item as unknown as DropdownItem,
                        contents
                            .filter((item) => item.type === 'item')
                            .findIndex((i) => i === item),
                        index,
                    );
                });
            },
            [processHeader, processItem],
        );

        useEffect(() => {
            onOpenStateChange?.(isOpen);
        }, [isOpen, onOpenStateChange]);

        const dropdownContent = useRef<ReturnType<typeof processItems>>([]);
        dropdownContent.current = processItems(content, searchTerm);

        useEffect(() => {
            itemRefs.current = [];
        }, [searchTerm]);

        useEffect(() => {
            dropdownContent.current = processItems(content, searchTerm);
        }, [content, processItems, searchTerm]);

        /**
         * @description Checks if the pressed keys match a keyboard shortcut for a dropdown item.
         * @param items The list of dropdown items to check for keyboard shortcuts.
         * @param keylist The list of keys pressed.
         * @returns Whether a keyboard shortcut was triggered.
         */
        const checkForKeyboardShortcut = useCallback(
            (items: DropdownContent[], keylist: Set<string>) => {
                if (closeStackedDropdown) return false;
                if (keylist.size === 0) return false;

                const pressedKeysArray = Array.from(keylist).map((key) =>
                    key.toLowerCase(),
                );

                const itemList = items.filter((item) => {
                    if (item.type !== 'item' || !item.shortcut) return false;

                    return item.shortcut
                        ?.map((key) => key.toLowerCase())
                        .every((shortcut) =>
                            pressedKeysArray.includes(shortcut),
                        );
                });

                if (
                    itemList.length === 0 ||
                    itemList.every(
                        (key, index) => lastKeyList.current[index] === key,
                    )
                )
                    return false;

                lastKeyList.current = itemList;

                for (const item of itemList)
                    item.type === 'item' && item.action?.();

                if (!stayOpen) closeDropdown(true);

                return true;
            },
            [closeDropdown, closeStackedDropdown, stayOpen],
        );

        /**
         * @description Handles the click event when clicking outside the dropdown.
         * @param event The click event.
         */
        const handleClickOutside = useCallback(
            (event: PointerEvent) =>
                isToggled &&
                popupRef.current &&
                !popupRef.current.contains(event.target as Node) &&
                closeDropdown(true),
            [closeDropdown, isToggled],
        );

        /**
         * @description Handles the key down event when a key is pressed.
         * @param event The key down event.
         */
        const handleKeyDown = useCallback(
            (event: KeyboardEvent) => {
                if (
                    defaultRef &&
                    'current' in defaultRef &&
                    defaultRef?.current &&
                    defaultRef.current.contains(document.activeElement) &&
                    !isToggled
                ) {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openDropdown(true);
                    }

                    return;
                }

                if (!isToggled) return;

                const target = event.target as Node;
                const parent = target?.parentElement?.parentElement as Node;
                const grandparent = parent?.parentElement as Node;
                const popupContainsTarget = itemsRef?.current?.contains(target);
                const popupContainsParent = itemsRef?.current?.contains(parent);
                const popupContainsGrandparent =
                    itemsRef?.current?.contains(grandparent);

                if (searchRef.current?.contains(target))
                    if (
                        event.key === 'Escape' ||
                        event.key === 'Enter' ||
                        event.key === 'Tab' ||
                        event.key === 'ArrowDown'
                    ) {
                        event.preventDefault();
                        setFocusedItem(0);
                        return;
                    } else if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        setFocusedItem(itemRefs.current.length - 1);
                        return;
                    }

                if (!popupContainsTarget) return;
                if (popupContainsParent && popupContainsGrandparent) return;

                const { key } = event;

                setPressedKeys((pressedKeys) => {
                    const newKeysPressed = new Set(pressedKeys);
                    newKeysPressed.add(event.key);

                    if (checkForKeyboardShortcut(content, newKeysPressed)) {
                        event.preventDefault();
                        return new Set();
                    } else if (
                        searchRef.current &&
                        !key.startsWith('Arrow') &&
                        key !== 'Escape' &&
                        key.length === 1
                    ) {
                        searchRef.current.focus();
                    }

                    return newKeysPressed;
                });

                if (key === 'Escape') {
                    event.preventDefault();

                    closeStackedDropdown?.(false);
                    closeDropdown(true);
                } else if (event.key === 'ArrowUp') {
                    event.preventDefault();

                    setFocusedItem((prev) =>
                        prev === null || prev === 0
                            ? itemRefs.current.length - 1
                            : (prev - 1) % itemRefs.current.length,
                    );
                } else if (event.key === 'ArrowDown') {
                    event.preventDefault();

                    setFocusedItem((prev) =>
                        prev === null
                            ? 0
                            : (prev + 1) % itemRefs.current.length,
                    );
                } else if (
                    event.key === 'ArrowRight' &&
                    focusedItem &&
                    itemRefs.current[focusedItem]?.hasSubItems
                ) {
                    event.preventDefault();

                    itemRefs.current[
                        focusedItem
                    ].element?.parentElement?.click();
                } else if (event.key === 'ArrowLeft' && closeStackedDropdown) {
                    event.preventDefault();

                    closeStackedDropdown(false);
                    closeDropdown(true);
                } else if (event.key === 'Home') {
                    event.preventDefault();

                    setFocusedItem(0);
                } else if (event.key === 'End') {
                    event.preventDefault();

                    setFocusedItem(itemRefs.current.length - 1);
                }
            },
            [
                defaultRef,
                isToggled,
                focusedItem,
                closeStackedDropdown,
                openDropdown,
                checkForKeyboardShortcut,
                content,
                closeDropdown,
            ],
        );

        /**
         * @description Handles the key up event when a key is released.
         * @param event The key up event.
         */
        const handleKeyUp = useCallback(
            (event: KeyboardEvent) =>
                setPressedKeys((pressedKeys) => {
                    const newKeysPressed = new Set(pressedKeys);
                    newKeysPressed.delete(event.key);
                    return newKeysPressed;
                }),
            [],
        );

        useEffect(() => {
            const handleBlur = () => setPressedKeys(new Set());

            document.addEventListener('blur', handleBlur);
            document.addEventListener('pointerdown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);

            return () => {
                document.removeEventListener('blur', handleBlur);
                document.removeEventListener('pointerdown', handleClickOutside);
                document.removeEventListener('keydown', handleKeyDown);
                document.removeEventListener('keyup', handleKeyUp);
            };
        }, [handleClickOutside, handleKeyDown, handleKeyUp]);

        useEffect(() => {
            if (focusedItem === null || !itemRefs.current[focusedItem]) return;

            itemRefs.current[focusedItem]?.element?.focus();
        }, [focusedItem]);

        /**
         * @description Handles the hover or click event when the parent element is interacted with.
         * @param event The mouse enter event.
         */
        const handleClick = (event: React.PointerEvent<HTMLDivElement>) =>
            !disableToggle &&
            !isToggled &&
            !isDebouncing &&
            !popupRef?.current?.contains(event.target as Node) &&
            openDropdown(true);

        /**
         * @description Handles the mouse enter event when hovering over the parent element.
         */
        const handleMouseEnter = () => !disableHover && openDropdown(false);
        /**
         * @description Handles the mouse leave event when hovering out of the parent element.
         */
        const handleMouseLeave = () => !disableHover && closeDropdown(false);
        /**
         * @description Handles the change event when the search input value changes.
         * @param event The change event.
         */
        const searchInputChange = (
            event: React.ChangeEvent<HTMLInputElement>,
        ) => setSearchTerm(event.target.value);

        const dropdownClass = dropdown({
            size,
            rounding,
            orientation,
            isOpen,
            showArrow,
            fullWidth,
        });
        const dropdownItemWrapperClass = dropdownItemWrapper({ size });
        const dropdownWrapperClass = dropdownWrapper({
            orientation,
            fullWidth,
        });

        const dropdownComponent = (
            <div className={cn(dropdownWrapperClass)}>
                <div
                    ref={popupRef}
                    role={'menu'}
                    aria-label={ariaLabel}
                    className={cn(dropdownClass, className)}
                    {...props}>
                    {withSearch && (
                        <TextInput
                            ref={searchRef}
                            role="search"
                            aria-label={searchPlaceholder}
                            placeholder={searchPlaceholder}
                            className="border-0 border-b !ring-0"
                            leadingElement={
                                <MagnifyingGlassIcon className="w-5 h-5" />
                            }
                            onChange={searchInputChange}
                        />
                    )}
                    <div
                        ref={itemsRef}
                        role="group"
                        className={cn(dropdownItemWrapperClass)}>
                        {dropdownContent.current}
                    </div>
                </div>
            </div>
        );

        return (
            <div
                ref={(node) => {
                    /*
                     * This method is required because of some weird recursive React behavior that I can't figure out.
                     * If you just pass in the ref normally, React throws the following error:
                     * ->  TypeError: can't define property "current": Object is not extensible
                     */

                    if (!defaultRef) return;
                    if (!('current' in defaultRef)) return;

                    (
                        defaultRef as React.MutableRefObject<HTMLDivElement | null>
                    ).current = node;
                }}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleClick as any}
                aria-haspopup="menu"
                className={cn('relative', wrapperClassName)}>
                {children}
                {isVisible && dropdownComponent}
            </div>
        );
    },
);

const Dropdown = DropdownElement as React.ForwardRefExoticComponent<
    Omit<DropdownProps, 'closeStackedDropdown'> &
        React.RefAttributes<HTMLDivElement>
>;

Dropdown.displayName = 'Dropdown';
export default Dropdown;
