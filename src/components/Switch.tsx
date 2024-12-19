'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { InputHTMLAttributes, useEffect, useRef, useState } from 'react';
import { useMeasure } from 'react-use';

import { cn } from '<{utils}>/class';

type Props = VariantProps<typeof switchWrapper> & VariantProps<typeof switchRounding>;
interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, Props {
    /**
     * @description Whether the switch is checked.
     * @default false
     */
    checked?: boolean;
    /**
     * @description Whether the switch is disabled.
     * @default false
     */
    disabled?: boolean;
}

/**
 * @description We use `$switch` as a name because `switch` is a reserved keyword in JavaScript.
 */
const $switch = cva([
    'absolute top-0 left-0 bottom-0 right-0 w-full h-full transition-all ease-out duration-[150ms]',
    'appearance-none outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20',
]);

const switchWrapper = cva(
    ['relative transition-all ease-out duration-[150ms]', 'border border-black/0 dark:border-white/0'],
    {
        variants: {
            /**
             * @description The appearance of the switch.
             * @default 'normal'
             */
            appearance: {
                normal: '',
                glossy: '',
            },
            /**
             * @description The size of the switch.
             * @default 'md'
             */
            size: {
                sm: 'w-8 h-4',
                md: 'w-10 h-5',
                lg: 'w-12 h-6',
                xl: 'w-14 h-7',
            },
            /**
             * @description Whether the switch is disabled.
             * @default false
             */
            disabled: {
                true: '',
            },
            /**
             * @description Whether the switch is checked.
             * @default false
             */
            checked: {
                true: '',
                false: '',
            },
        },
        compoundVariants: [
            {
                checked: true,
                className: ['bg-black dark:bg-white', 'hover:opacity-75 active:opacity-100'],
            },
            {
                checked: false,
                className: ['border border-black/15 dark:border-white/15', 'hover:bg-black/10 dark:hover:bg-white/10'],
            },
            {
                appearance: 'glossy',
                checked: true,
                className: [
                    'bg-gradient-to-b from-black/75 to-black/100 dark:from-white/100 dark:to-white/75',
                    '!bg-transparent',
                ],
            },
            {
                appearance: 'glossy',
                checked: false,
                className: [
                    'bg-gradient-to-b from-black/0 to-black/0',
                    'hover:from-black/10 hover:to-black/20 hover:dark:from-white/20 hover:dark:to-white/10',
                ],
            },
            {
                disabled: true,
                checked: true,
                className: '!opacity-50',
            },
            {
                disabled: true,
                checked: false,
                className: ['bg-black/10 dark:bg-white/10', 'cursor-not-allowed'],
            },
            {
                appearance: 'glossy',
                disabled: true,
                checked: false,
                className: [
                    'bg-gradient-to-b from-black/5 to-black/10 dark:from-white/10 dark:to-white/5',
                    'hover:from-black/5 hover:to-black/10 hover:dark:from-white/10 hover:dark:to-white/5',
                    'cursor-not-allowed',
                ],
            },
        ],
        defaultVariants: {
            appearance: 'normal',
            size: 'md',
            disabled: false,
            checked: false,
        },
    },
);

const switchDot = cva(
    [
        'absolute bg-white dark:bg-black top-0 bottom-0 m-auto pointer-events-none transition-all ease-out duration-[150ms]',
    ],
    {
        variants: {
            /**
             * @description The size of the switch dot.
             * @default 'md'
             */
            size: {
                sm: 'w-2 h-2',
                md: 'w-3 h-3',
                lg: 'w-4 h-4',
                xl: 'w-5 h-5',
            },
            /**
             * @description Whether the switch dot is disabled.
             * @default false
             */
            disabled: {
                true: 'opacity-50',
            },
            /**
             * @description Whether the switch is checked.
             * @default false
             */
            checked: {
                true: '',
                false: 'bg-black dark:bg-white',
            },
            /**
             * @description Whether the switch is mounted.
             * @default false
             */
            mounted: {
                true: 'left-0',
                false: '',
            },
        },
        compoundVariants: [
            {
                mounted: false,
                checked: true,
                className: 'right-0',
            },
            {
                mounted: false,
                checked: false,
                className: 'left-0',
            },
        ],
        defaultVariants: {
            size: 'md',
            disabled: false,
            checked: false,
            mounted: false,
        },
    },
);

const switchRounding = cva(['rounded-md'], {
    variants: {
        /**
         * @description The rounding of the switch.
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
        rounding: 'md',
    },
});

/**
 * @description The Switch component is a component that allows users to toggle between two states.
 * @example <Switch onChange={(event) => console.log(event.target.checked)} />
 * @requires `react-use` via NPM.
 */
const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
    { className, appearance, size, rounding, disabled, onChange, checked, ...props },
    ref,
) {
    const ariaLabel = props['aria-label'] || 'Switch';
    delete props['aria-label'];
    delete props.type;

    const customRef = useRef<HTMLInputElement>(null);
    const defaultRef = ref ?? customRef;
    const dotRef = useRef<HTMLDivElement>(null);
    const [isChecked, setIsChecked] = useState<boolean | undefined>(false);
    const [isMounted, setIsMounted] = useState(false);

    const [bmRef, { width: bWidth }] = useMeasure();
    const [dmRef, { width: dWidth }] = useMeasure();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setIsChecked(checked);
    }, [checked]);

    /**
     * @description Handles the toggle event.
     * @param event The toggle event.
     */
    const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);
    };

    const switchClass = $switch();
    const switchWrapperClass = switchWrapper({
        appearance,
        size,
        disabled,
        checked: isChecked ?? checked,
    });
    const switchDotClass = switchDot({
        size,
        disabled,
        checked: isChecked ?? checked,
        mounted: isMounted,
    });
    const switchRoundingClass = switchRounding({ rounding });

    return (
        <div
            ref={(node) => bmRef(node as Element)}
            role="switch"
            aria-checked={isChecked ?? checked ?? false}
            aria-disabled={disabled}
            aria-label={ariaLabel}
            className={cn(switchWrapperClass, switchRoundingClass, className)}
        >
            <input
                type="checkbox"
                ref={defaultRef}
                className={cn(switchClass, switchRoundingClass)}
                checked={isChecked ?? checked}
                disabled={disabled}
                onChange={(event) => {
                    handleToggle(event);
                    onChange?.(event);
                }}
                {...props}
            />
            <div
                ref={(node) => {
                    dmRef(node as Element);
                    dotRef.current = node;
                }}
                aria-hidden="true"
                className={cn(switchDotClass, switchRoundingClass)}
                style={{
                    transform: `translateX(${(() => {
                        if (!isMounted && checked) return -3;
                        if (isChecked ?? checked) return bWidth - 3 - dWidth;

                        return 3;
                    })()}px)`,
                }}
            ></div>
        </div>
    );
});

Switch.displayName = 'Switch';
export default Switch;
