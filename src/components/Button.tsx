'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { ButtonHTMLAttributes } from 'react';

import { cn } from '<{utils}>/class';

type Props = VariantProps<typeof btn>;
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Props {
    /**
     * @description Whether the button is disabled.
     * @default false
     */
    disabled?: boolean;
}

const btn = cva(
    [
        'inline-flex items-center justify-center gap-2.5 rounded-md transition-all ease-out duration-[150ms]',
        'text-center font-medium leading-[normal] overflow-hidden whitespace-nowrap text-ellipsis',
        'outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20',
    ],
    {
        variants: {
            /**
             * @description The variant of the button.
             * @default 'primary'
             */
            variant: {
                primary:
                    'bg-black text-white dark:bg-white dark:text-black hover:enabled:opacity-75 active:enabled:opacity-100',
                secondary:
                    'bg-black/10 text-black dark:bg-white/10 dark:text-white border border-black/10 dark:border-white/10 hover:enabled:opacity-75 active:enabled:opacity-100',
                outline:
                    'border border-black/15 dark:border-white/15 text-black dark:text-white hover:enabled:bg-black/10 dark:hover:enabled:bg-white/10 hover:enabled:border-black/0 hover:enabled:dark:border-white/0 active:enabled:bg-transparent dark:active:enabled:bg-transparent active:enabled:border-black/15 dark:active:enabled:border-white/15',
                link: 'text-black dark:text-white underline hover:enabled:opacity-75 active:enabled:opacity-100',
                blank: 'text-black dark:text-white hover:enabled:bg-black/10 dark:hover:enabled:bg-white/10 active:enabled:bg-transparent dark:active:enabled:bg-transparent',
                /* <<
                '{{color}}': 'bg-{{color}}-soft-light-bg/30 text-{{color}}-soft-light-text dark:bg-{{color}}-soft-dark-bg/20 dark:text-{{color}}-soft-dark-text hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-4 focus:ring-{{color}}-soft-dark-bg/20 dark:focus:ring-{{color}}-soft-light-bg/10',
                >> */
            },
            /**
             * @description The appearance of the button.
             * @default 'normal'
             */
            appearance: {
                normal: '',
                glossy: '',
            },
            /**
             * @description The tone of the button.
             * @default 'solid'
             */
            tone: {
                solid: '',
                soft: '',
            },
            /**
             * @description The size of the button.
             * @default 'md'
             */
            size: {
                sm: 'px-3.5 py-2 text-sm',
                md: 'px-4 py-3 text-sm',
                lg: 'px-[18px] py-3 text-base',
                xl: 'px-[18px] py-3.5 text-base',
            },
            /**
             * @description The rounding of the button.
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
             * @description Whether the button is disabled.
             * @default false
             */
            disabled: {
                true: '!opacity-50 cursor-not-allowed',
            },
        },
        compoundVariants: [
            {
                variant: 'primary',
                appearance: 'normal',
                tone: 'solid',
                className:
                    'bg-black text-white dark:bg-white dark:text-black hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-black/20 dark:focus:ring-white/20',
            },
            {
                variant: 'primary',
                appearance: 'glossy',
                tone: 'solid',
                className:
                    'bg-gradient-to-b from-black/75 to-black/100 dark:from-white/100 dark:to-white/75 !bg-transparent',
            },
            {
                variant: 'primary',
                appearance: 'normal',
                tone: 'soft',
                className:
                    'bg-black/30 text-black dark:bg-white/20 dark:text-white hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-black/20 dark:focus:ring-white/20',
            },
            {
                variant: 'primary',
                appearance: 'glossy',
                tone: 'soft',
                className:
                    'bg-gradient-to-b from-black/20 to-black/50 dark:from-white/20 dark:to-white/10 !bg-transparent text-black dark:text-white',
            },
            {
                variant: 'secondary',
                appearance: 'glossy',
                className:
                    'bg-gradient-to-b from-black/10 to-black/20 dark:from-white/20 dark:to-white/10 !bg-transparent',
            },
            {
                variant: 'outline',
                appearance: 'glossy',
                className:
                    'bg-gradient-to-b from-black/0 to-black/0 hover:enabled:from-black/10 hover:enabled:to-black/20 hover:enabled:dark:from-white/20 hover:enabled:dark:to-white/10 !bg-transparent',
            },
            {
                variant: 'blank',
                appearance: 'glossy',
                className:
                    'bg-gradient-to-b from-black/0 to-black/0 hover:enabled:from-black/10 hover:enabled:to-black/20 hover:enabled:dark:from-white/20 hover:enabled:dark:to-white/10 !bg-transparent',
            },
            /* <<
            {
                variant: '{{color}}',
                appearance: 'normal',
                tone: 'soft',
                className:
                    'bg-{{color}}-soft-light-bg/30 text-{{color}}-soft-light-text dark:bg-{{color}}-soft-dark-bg/20 dark:text-{{color}}-soft-dark-text hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-{{color}}-soft-dark-bg/20 dark:focus:ring-{{color}}-soft-light-bg/10',
            },
            >> */
            /* <<
            {
                variant: '{{color}}',
                appearance: 'glossy',
                tone: 'soft',
                className:
                    'bg-gradient-to-b from-{{color}}-soft-light-bg/20 to-{{color}}-soft-light-bg/50 dark:from-{{color}}-soft-dark-bg/20 dark:to-{{color}}-soft-dark-bg/10 !bg-transparent',
            },
            >> */
            /* <<
            {
                variant: '{{color}}',
                appearance: 'normal',
                tone: 'solid',
                className:
                    'bg-{{color}}-solid-light-bg text-{{color}}-solid-light-text dark:bg-{{color}}-solid-dark-bg dark:text-{{color}}-solid-dark-text hover:enabled:opacity-75 active:enabled:opacity-100',
            },
            >> */
            /* <<
            {
                variant: '{{color}}',
                appearance: 'glossy',
                tone: 'solid',
                className:
                    'bg-gradient-to-b from-{{color}}-solid-light-bg/75 to-{{color}}-solid-light-bg/100 text-{{color}}-solid-light-text dark:from-{{color}}-solid-dark-bg/100 dark:to-{{color}}-solid-dark-bg/75 dark:text-{{color}}-solid-dark-text !bg-transparent',
            },
            >> */
        ],
        defaultVariants: {
            variant: 'primary',
            appearance: 'normal',
            tone: 'solid',
            size: 'md',
            rounding: 'md',
            disabled: false,
        },
    },
);

/**
 * @description A button component.
 * @example <Button variant="primary">Click me</Button>
 * @example <Button variant="secondary" disabled>Click me</Button>
 * @example <Button appearance="glossy">Click me</Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { children, className, variant, appearance, tone, size, rounding, disabled, type, ...props },
    ref,
) {
    const role = props.role || 'button';
    delete props.role;

    const buttonClass = btn({ variant, appearance, tone, size, rounding, disabled });

    return (
        <button
            ref={ref}
            role={role}
            aria-disabled={disabled}
            className={cn(buttonClass, className)}
            disabled={disabled}
            type={type ?? 'button'}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = 'Button';
export default Button;
