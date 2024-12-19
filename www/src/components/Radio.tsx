'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { InputHTMLAttributes, useEffect, useRef } from 'react';

import { cn } from '@/utils/class';

type Props = VariantProps<typeof radioWrapper> &
    VariantProps<typeof radioDot> &
    VariantProps<typeof radioRounding>;
interface RadioProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
        Props {
    /**
     * @description Whether the radio is checked.
     * @default false
     */
    checked?: boolean;
    /**
     * @description Whether the radio is disabled.
     * @default false
     */
    disabled?: boolean;
}

const radio = cva([
    'absolute top-0 left-0 bottom-0 right-0 w-full h-full transition-all ease-out duration-[150ms]',
    'appearance-none outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20',
]);

const radioWrapper = cva(
    [
        'relative transition-all ease-out duration-[150ms]',
        'border border-black/0 dark:border-white/0',
    ],
    {
        variants: {
            /**
             * @description The appearance of the radio.
             * @default 'normal'
             */
            appearance: {
                normal: '',
                glossy: '',
            },
            /**
             * @description The size of the radio.
             * @default 'md'
             */
            size: {
                sm: 'w-4 h-4',
                md: 'w-5 h-5',
                lg: 'w-6 h-6',
                xl: 'w-7 h-7',
            },
            /**
             * @description Whether the radio is disabled.
             * @default false
             */
            disabled: {
                true: '',
            },
            /**
             * @description Whether the radio is checked.
             * @default false
             */
            checked: {
                true: '',
                false: '',
            },
            /**
             * @description Whether the radio is indeterminate.
             * @default false
             */
            indeterminate: {
                true: '',
                false: '',
            },
        },
        compoundVariants: [
            {
                checked: true,
                className: [
                    'bg-black dark:bg-white',
                    'hover:opacity-75 active:opacity-100',
                ],
            },
            {
                checked: false,
                className: [
                    'border border-black/15 dark:border-white/15',
                    'hover:bg-black/10 dark:hover:bg-white/10',
                ],
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
                className: [
                    'bg-black/10 dark:bg-white/10',
                    'cursor-not-allowed',
                ],
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
            indeterminate: false,
        },
    },
);

const radioDot = cva(
    [
        'absolute bg-white dark:bg-black top-0 left-0 right-0 bottom-0 m-auto scale-0 pointer-events-none rounded-full transition-all ease-out duration-[150ms]',
    ],
    {
        variants: {
            /**
             * @description The size of the radio dot.
             * @default 'md'
             */
            size: {
                sm: 'w-2 h-2',
                md: 'w-2.5 h-2.5',
                lg: 'w-3 h-3',
                xl: 'w-3.5 h-3.5',
            },
            /**
             * @description Whether the radio is checked.
             * @default false
             */
            checked: {
                true: 'scale-100',
                false: 'bg-black dark:bg-white',
            },
            /**
             * @description Whether the radio is disabled.
             * @default false
             */
            disabled: {
                true: 'opacity-50',
            },
        },
        defaultVariants: {
            size: 'md',
            disabled: false,
            checked: false,
        },
    },
);

const radioRounding = cva(['rounded-full'], {
    variants: {
        /**
         * @description The rounding of the radio.
         * @default 'full'
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
        rounding: 'full',
    },
});

/**
 * @description A radio input.
 * @example <Radio onChange={(event) => alert("You have checked the radio.")} />
 */
const Radio = React.forwardRef<HTMLInputElement, RadioProps>(function Radio(
    {
        className,
        appearance,
        size,
        rounding,
        disabled,
        onChange,
        checked,
        ...props
    },
    ref,
) {
    const ariaLabel = props['aria-label'] || 'Radio';
    delete props['aria-label'];
    delete props.type;

    const customRef = useRef<HTMLInputElement>(null);
    const defaultRef = ref ?? customRef;
    const [isChecked, setIsChecked] = React.useState<boolean | undefined>(
        false,
    );

    useEffect(() => {
        setIsChecked(checked);
    }, [checked]);

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);
    };

    const radioClass = radio();
    const radioWrapperClass = radioWrapper({
        appearance,
        size,
        disabled,
        checked: isChecked ?? checked,
    });
    const radioDotClass = radioDot({
        size,
        checked: isChecked ?? checked,
        disabled,
    });
    const roundingClass = radioRounding({ rounding });

    return (
        <div
            role="radio"
            aria-label={ariaLabel}
            aria-checked={isChecked ?? checked ?? false}
            aria-disabled={disabled}
            className={cn(radioWrapperClass, roundingClass, className)}>
            <input
                type="radio"
                ref={defaultRef}
                className={cn(radioClass, roundingClass)}
                checked={checked}
                disabled={disabled}
                onChange={(event) => {
                    handleRadioChange(event);
                    onChange?.(event);
                }}
                {...props}
            />
            <div
                aria-hidden="true"
                className={cn(radioDotClass, roundingClass)}></div>
        </div>
    );
});

Radio.displayName = 'Radio';
export default Radio;
