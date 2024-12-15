'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { TextareaHTMLAttributes } from 'react';

import { cn } from '<{utils}>/class';

type Props = VariantProps<typeof textField> & VariantProps<typeof textFieldWrapper>;
interface TextFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>, Props {
    /**
     * @description Whether the text area is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * @description Maximum length of the text area.
     */
    maxLength?: number;
    /**
     * @description The warning percentage of the text area.
     * @default 10
     */
    warningPercentage?: number;
    /**
     * @description Element to display at the top of the text area.
     */
    topElement?: React.ReactNode;
    /**
     * @description Element to display at the bottom of the text area.
     */
    bottomElement?: React.ReactNode;
}

const textField = cva(
    ['appearance-none bg-transparent w-full transition-colors ease-out duration-[150ms]', 'outline-none'],
    {
        variants: {
            /**
             * @description Whether the text area is unresizable.
             * @default false
             */
            unresizable: {
                true: 'resize-none',
            },
        },
        defaultVariants: {
            unresizable: false,
        },
    },
);

const textFieldWrapper = cva(
    [
        'flex flex-col gap-2.5 overflow-hidden cursor-text rounded-md transition-all ease-out duration-[150ms]',
        'border border-black/15 dark:border-white/15',
        'focus-within:ring-4 focus-within:ring-black/20 dark:focus-within:ring-white/20',
    ],
    {
        variants: {
            /**
             * @description The size of the text area.
             * @default 'md'
             */
            size: {
                sm: 'px-3.5 py-2 text-sm',
                md: 'px-4 py-3 text-sm',
                lg: 'px-[18px] py-3 text-base',
                xl: 'px-[18px] py-3.5 text-base',
            },
            /**
             * @description The rounding of the text area.
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
             * @description Whether the text area is disabled.
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
 * @description A text area component.
 * @example <TextField placeholder="Type here..." />
 * @example <TextField placeholder="Type here..." rows={5} />
 * @example <TextField placeholder="Type here..." maxLength={100} />
 */
const TextField = React.forwardRef<HTMLTextAreaElement, TextFieldProps>(function TextField(
    {
        className,
        rows,
        size,
        rounding,
        maxLength,
        warningPercentage = 10,
        topElement,
        bottomElement,
        unresizable,
        disabled,
        onChange,
        ...props
    },
    ref,
) {
    const ariaLabel = props['aria-label'] || 'Textarea';
    delete props['aria-label'];

    const defaultRef = ref ?? React.useRef<HTMLTextAreaElement>(null);
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const [length, setLength] = React.useState(0);

    /**
     * @description Handles the change event of the text area.
     * @param event The change event.
     */
    const handleOnChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLength(event.target.value.length);

        event.target.style.height = 'auto';
        event.target.style.height = event.target.scrollHeight + 'px';
    };

    /**
     * @description Handles the click event of the wrapper.
     * @param event The click event.
     */
    const handleWrapperClick = (event: React.PointerEvent<HTMLDivElement>) => {
        if (wrapperRef.current === event.target) {
            'current' in defaultRef && defaultRef?.current?.focus();
        }
    };

    const textTnputClass = textField({ unresizable });
    const textFieldWrapperClass = textFieldWrapper({ size, rounding, disabled });

    return (
        <div
            ref={wrapperRef}
            role="textbox"
            aria-label={ariaLabel}
            onClick={handleWrapperClick}
            className={cn(textFieldWrapperClass, className)}
        >
            {topElement}
            <textarea
                ref={defaultRef}
                className={cn(textTnputClass)}
                maxLength={maxLength}
                disabled={disabled}
                onChange={(event) => {
                    !rows && handleOnChange(event);
                    onChange?.(event);
                }}
                rows={rows}
                {...props}
            />
            {bottomElement}
            {maxLength && (
                <div
                    className={cn(
                        'flex flex-row justify-end items-center gap-2.5 text-xs text-black/75 dark:text-white/75',
                        (+maxLength / 100) * warningPercentage > maxLength - length && 'text-red-500 dark:text-red-400',
                    )}
                >
                    {maxLength - length} character(s) remaining.
                </div>
            )}
        </div>
    );
});

TextField.displayName = 'TextField';
export default TextField;
