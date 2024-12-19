'use client';

import { CheckIcon, MinusIcon } from '@heroicons/react/24/outline';
import { cva, VariantProps } from 'class-variance-authority';
import React, { InputHTMLAttributes, useEffect, useRef, useState } from 'react';

import { cn } from '<{utils}>/class';

type Props = VariantProps<typeof checkboxWrapper> & VariantProps<typeof checkmarkRounding>;
interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, Props {
    /**
     * @description Whether the checkbox is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * @description Whether the checkbox is checked.
     * @default false
     */
    checked?: boolean;
}

const checkbox = cva([
    'absolute top-0 left-0 bottom-0 right-0 w-full h-full transition-all ease-out duration-[150ms]',
    'appearance-none outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20',
]);

const checkboxWrapper = cva(
    ['relative transition-all ease-out duration-[150ms]', 'border border-black/0 dark:border-white/0'],
    {
        variants: {
            /**
             * @description The appearance of the checkbox.
             * @default 'normal'
             */
            appearance: {
                normal: '',
                glossy: '',
            },
            /**
             * @description The size of the checkbox.
             * @default 'md'
             */
            size: {
                sm: 'w-4 h-4',
                md: 'w-5 h-5',
                lg: 'w-6 h-6',
                xl: 'w-7 h-7',
            },
            /**
             * @description Whether the checkbox is disabled.
             * @default false
             * - This type isn't used because of type errors. It's handled above in CheckboxProps.
             */
            disabled: {
                true: '',
            },
            /**
             * @description Whether the checkbox is checked.
             * @default false
             * - This type isn't used because of type errors. It's handled above in CheckboxProps.
             */
            checked: {
                true: '',
                false: '',
            },
            /**
             * @description Whether the checkbox is in an indeterminate state.
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
                className: ['bg-black dark:bg-white', 'hover:opacity-75 active:opacity-100'],
            },
            {
                indeterminate: true,
                className: ['bg-black dark:bg-white', 'hover:opacity-75 active:opacity-100'],
            },
            {
                checked: false,
                indeterminate: false,
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
                indeterminate: true,
                className: [
                    'bg-gradient-to-b from-black/75 to-black/100 dark:from-white/100 dark:to-white/75',
                    '!bg-transparent',
                ],
            },
            {
                appearance: 'glossy',
                checked: false,
                indeterminate: false,
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
                indeterminate: true,
                className: '!opacity-50',
            },
            {
                disabled: true,
                checked: false,
                indeterminate: false,
                className: ['bg-black/10 dark:bg-white/10', 'cursor-not-allowed'],
            },
            {
                appearance: 'glossy',
                disabled: true,
                checked: false,
                indeterminate: false,
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

const checkmarkRounding = cva(['rounded-md'], {
    variants: {
        /**
         * @description The rounding of the checkmark.
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

const icon = cva(
    [
        'absolute w-2/3 h-2/3 top-0 left-0 right-0 bottom-0 m-auto',
        'pointer-events-none transition-all ease-out duration-[150ms]',
    ],
    {
        variants: {
            /**
             * @description Whether the checkbox is disabled.
             * @default false
             */
            disabled: {
                true: 'opacity-50',
            },
            /**
             * @description Whether the checkbox is checked.
             * @default false
             */
            checked: {
                true: 'text-white dark:text-black',
                false: '',
            },
            /**
             * @description Whether the checkbox is in an indeterminate state.
             * @default false
             */
            indeterminate: {
                true: 'opacity-100',
                false: 'opacity-0',
            },
        },
        defaultVariants: {
            disabled: false,
            checked: false,
            indeterminate: false,
        },
    },
);

/**
 * @description A checkbox component.
 * @example <Checkbox onChange={(event) => alert(event.target.checked ? "You have checked the checkbox." : "You have unchecked the checkbox.")} />
 * @requires `@heroicons/react` via NPM.
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
    { className, appearance, size, rounding, disabled, onChange, checked, indeterminate, ...props },
    ref,
) {
    const ariaLabel = props['aria-label'] || 'Checkbox';
    delete props['aria-label'];
    delete props.type;

    const customRef = useRef<HTMLInputElement>(null);
    const defaultRef = ref ?? customRef;
    const [isChecked, setIsChecked] = useState<boolean | undefined>(false);
    const [isIndeterminate, setIsIndeterminate] = useState<boolean | null | undefined>(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setIsChecked(checked);
    }, [checked]);

    useEffect(() => {
        setIsIndeterminate(indeterminate);

        if (defaultRef && 'current' in defaultRef && defaultRef.current)
            defaultRef.current.indeterminate = isIndeterminate ?? false;
    }, [defaultRef, indeterminate, isIndeterminate]);

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);
        setIsIndeterminate(false);
    };

    const checkmarkRef = React.useRef<SVGSVGElement>(null);
    const checkmarkStrokeDashCount = checkmarkRef?.current
        ?.getElementsByTagName('path')?.[0]
        ?.getTotalLength()
        ?.toString();

    const indeterminateRef = React.useRef<SVGSVGElement>(null);
    const indeterminateStrokeDashCount = indeterminateRef?.current
        ?.getElementsByTagName('path')?.[0]
        ?.getTotalLength()
        ?.toString();

    const checkboxClass = checkbox();
    const checkboxWrapperClass = checkboxWrapper({
        appearance,
        size,
        disabled,
        checked: isChecked ?? checked,
        indeterminate: isIndeterminate ?? indeterminate,
    });
    const roundingClass = checkmarkRounding({ rounding });

    return (
        <div
            role="checkbox"
            aria-checked={(isIndeterminate ?? indeterminate) ? 'mixed' : (isChecked ?? checked ?? false)}
            aria-disabled={disabled}
            aria-label={ariaLabel}
            className={cn(checkboxWrapperClass, roundingClass, className)}
        >
            <input
                type="checkbox"
                ref={defaultRef}
                className={cn(checkboxClass, roundingClass)}
                checked={isChecked ?? checked}
                disabled={disabled}
                onChange={(event) => {
                    handleCheckboxChange(event);
                    onChange?.(event);
                }}
                {...props}
            />
            <CheckIcon
                ref={checkmarkRef}
                aria-hidden="true"
                strokeWidth={2}
                className={cn(
                    icon({
                        checked: isChecked ?? checked,
                        indeterminate: !(isIndeterminate ?? indeterminate),
                        disabled: !(isIndeterminate ?? indeterminate) && disabled,
                    }),
                )}
                style={{
                    strokeDasharray: (() => {
                        if (!isMounted && !(isChecked ?? checked)) return 9999;
                        if (!isMounted && (isChecked ?? checked)) return 0;

                        return checkmarkStrokeDashCount;
                    })(),
                    strokeDashoffset: (() => {
                        if (!isMounted && !(isChecked ?? checked)) return 9999;
                        if (!isMounted && (isChecked ?? checked)) return 0;

                        return (isChecked ?? checked) ? 0 : checkmarkStrokeDashCount;
                    })(),
                }}
            />
            <MinusIcon
                ref={indeterminateRef}
                aria-hidden="true"
                strokeWidth={2}
                className={cn(
                    icon({
                        checked: isIndeterminate ?? indeterminate,
                        indeterminate: isIndeterminate ?? indeterminate,
                        disabled,
                    }),
                )}
                style={{
                    strokeDasharray: (() => {
                        if (!isMounted && !(isIndeterminate ?? indeterminate)) return 9999;
                        if (!isMounted && (isIndeterminate ?? indeterminate)) return 0;

                        return indeterminateStrokeDashCount;
                    })(),
                    strokeDashoffset: (() => {
                        if (!isMounted && !(isIndeterminate ?? indeterminate)) return 9999;
                        if (!isMounted && (isIndeterminate ?? indeterminate)) return 0;

                        return (isIndeterminate ?? indeterminate) ? 0 : indeterminateStrokeDashCount;
                    })(),
                }}
            />
        </div>
    );
});

Checkbox.displayName = 'Checkbox';
export default Checkbox;
