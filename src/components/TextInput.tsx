'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { InputHTMLAttributes } from 'react';

import { cn } from '<{utils}>/class';

type Props = VariantProps<typeof textInput> & VariantProps<typeof textInputWrapper>;
interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, Props {
    /**
     * @description The type of the input.
     * @default 'text'
     */
    type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
    /**
     * @description Whether the input is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * @description Element to display at the start of the input.
     */
    leadingElement?: React.ReactNode;
    /**
     * @description Element to display at the end of the input.
     */
    trailingElement?: React.ReactNode;
}

const textInput = cva([
    'appearance-none bg-transparent w-full transition-all ease-out duration-[150ms]',
    'outline-none',
]);

const textInputWrapper = cva(
    [
        'flex flex-row gap-2.5 overflow-hidden cursor-text rounded-md transition-all ease-out duration-[150ms]',
        'border border-black/15 dark:border-white/15',
        'focus-within:ring-4 focus-within:ring-black/20 dark:focus-within:ring-white/20',
    ],
    {
        variants: {
            /**
             * @description The size of the input.
             * @default 'md'
             */
            size: {
                sm: 'px-3.5 py-2 text-sm',
                md: 'px-4 py-3 text-sm',
                lg: 'px-[18px] py-3 text-base',
                xl: 'px-[18px] py-3.5 text-base',
            },
            /**
             * @description The rounding of the input.
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
            /**
             * @description Whether the input is disabled.
             * @default false
             */
            disabled: {
                true: '!opacity-50 bg-black/10 dark:bg-white/10 cursor-not-allowed',
            },
        },
        defaultVariants: {
            size: 'md',
            rounding: 'md',
            disabled: false,
        },
    },
);

/**
 * @description A text input component.
 * @example <TextInput placeholder="Type here..." />
 */
const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
    { className, size, rounding, type = 'text', leadingElement, trailingElement, disabled, ...props },
    ref,
) {
    const ariaLabel = props['aria-label'] || 'Text input';
    delete props['aria-label'];

    const customRef = React.useRef<HTMLInputElement>(null);
    const defaultRef = ref ?? customRef;
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    const textInputs = ['text', 'password', 'email', 'number', 'tel', 'url'];

    /**
     * @description Focuses the input when the wrapper is clicked.
     * @param event The click event.
     */
    const handleWrapperClick = (event: React.PointerEvent<HTMLDivElement>) => {
        if (wrapperRef.current === event.target && 'current' in defaultRef) {
            defaultRef?.current?.focus();
        }
    };

    const textTnputClass = textInput();
    const textInputWrapperClass = textInputWrapper({ size, rounding, disabled });

    return (
        <div
            ref={wrapperRef}
            role="textbox"
            aria-label={ariaLabel}
            onClick={handleWrapperClick}
            className={cn(textInputWrapperClass, className)}
        >
            {leadingElement}
            <input
                type={textInputs.includes(String(type)) ? type : 'text'}
                ref={defaultRef}
                className={cn(textTnputClass)}
                disabled={disabled}
                {...props}
            />
            {trailingElement}
        </div>
    );
});

TextInput.displayName = 'TextInput';
export default TextInput;
