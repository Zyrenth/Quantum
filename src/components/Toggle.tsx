'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { InputHTMLAttributes, useEffect, useRef, useState } from 'react';

import { cn } from '<{utils}>/class';

type Props = VariantProps<typeof toggleWrapper> & VariantProps<typeof toggleRounding>;
interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, Props {
    /**
     * @description Whether the toggle is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * @description Whether the toggle is checked.
     * @default false
     */
    checked?: boolean;
}

const toggle = cva([
    'absolute top-0 left-0 bottom-0 right-0 w-full h-full transition-all ease-out duration-[150ms]',
    'appearance-none outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20',
]);

const toggleWrapper = cva(['relative select-none transition-all ease-out duration-[150ms]'], {
    variants: {
        /**
         * @description The size of the toggle.
         * @default 'md'
         */
        size: {
            sm: 'px-3.5 py-2 text-sm',
            md: 'px-4 py-3 text-sm',
            lg: 'px-[18px] py-3 text-base',
            xl: 'px-[18px] py-3.5 text-base',
        },
        /**
         * @description Whether the toggle is disabled.
         * @default false
         * - This type isn't used because of type errors. It's handled above in ToggleProps.
         */
        disabled: {
            true: ['!opacity-50', 'cursor-not-allowed'],
        },
        /**
         * @description Whether the toggle is checked.
         * @default false
         * - This type isn't used because of type errors. It's handled above in ToggleProps.
         */
        checked: {
            true: ['bg-black/10 dark:bg-white/10', 'hover:opacity-75'],
            false: '',
        },
    },
    compoundVariants: [
        {
            disabled: false,
            checked: false,
            className: ['hover:bg-black/10 dark:hover:bg-white/10'],
        },
    ],
    defaultVariants: {
        size: 'md',
        disabled: false,
        checked: false,
    },
});

const toggleRounding = cva(['rounded-md'], {
    variants: {
        /**
         * @description The rounding of the toggle.
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
 * @description A toggle component.
 * @example <Toggle onChange={(event) => alert(event.target.checked ? "You have checked the toggle." : "You have unchecked the toggle.")} />
 */
const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
    { children, className, size, rounding, disabled, onChange, checked, ...props },
    ref,
) {
    const ariaLabel = props['aria-label'] || 'Toggle';
    delete props['aria-label'];
    delete props.type;

    const customRef = useRef<HTMLInputElement>(null);
    const defaultRef = ref ?? customRef;
    const [isChecked, setIsChecked] = useState<boolean | undefined>(false);

    useEffect(() => {
        setIsChecked(checked);
    }, [checked]);

    const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(event.target.checked);
    };

    const toggleClass = toggle();
    const toggleWrapperClass = toggleWrapper({
        size,
        disabled,
        checked: isChecked ?? checked,
    });
    const roundingClass = toggleRounding({ rounding });

    return (
        <div
            role="checkbox"
            aria-checked={isChecked ?? checked ?? false}
            aria-disabled={disabled}
            aria-label={ariaLabel}
            className={cn(toggleWrapperClass, roundingClass, className)}
        >
            <input
                type="checkbox"
                ref={defaultRef}
                className={cn(toggleClass, roundingClass)}
                checked={isChecked ?? checked}
                disabled={disabled}
                onChange={(event) => {
                    handleToggleChange(event);
                    onChange?.(event);
                }}
                {...props}
            />
            {children}
        </div>
    );
});

Toggle.displayName = 'Toggle';
export default Toggle;
