'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { ButtonHTMLAttributes } from 'react';

import { cn } from '@/utils/class';

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
        'outline-none focus:ring-4 focus:ring-black/40 dark:focus:ring-white/30',
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
                success:
                    'bg-success-soft-light-bg/30 text-success-soft-light-text dark:bg-success-soft-dark-bg/20 dark:text-success-soft-dark-text hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-success-soft-dark-bg/40 dark:focus:ring-success-soft-light-bg/25',
                warning:
                    'bg-warning-soft-light-bg/30 text-warning-soft-light-text dark:bg-warning-soft-dark-bg/20 dark:text-warning-soft-dark-text hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-warning-soft-dark-bg/40 dark:focus:ring-warning-soft-light-bg/25',
                danger: 'bg-danger-soft-light-bg/30 text-danger-soft-light-text dark:bg-danger-soft-dark-bg/20 dark:text-danger-soft-dark-text hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-danger-soft-dark-bg/40 dark:focus:ring-danger-soft-light-bg/25',
                info: 'bg-info-soft-light-bg/30 text-info-soft-light-text dark:bg-info-soft-dark-bg/20 dark:text-info-soft-dark-text hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-info-soft-dark-bg/40 dark:focus:ring-info-soft-light-bg/25',
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
                    'bg-black text-white dark:bg-white dark:text-black hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-black/40 dark:focus:ring-white/25',
            },
            {
                variant: 'primary',
                appearance: 'glossy',
                tone: 'solid',
                className:
                    'bg-gradient-to-b from-black/75 to-black/100 dark:from-white/100 dark:to-white/75 !bg-transparent focus:ring-black/40 dark:focus:ring-white/25',
            },
            {
                variant: 'primary',
                appearance: 'normal',
                tone: 'soft',
                className:
                    'bg-black/30 text-black dark:bg-white/20 dark:text-white hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-black/40 dark:focus:ring-white/30',
            },
            {
                variant: 'primary',
                appearance: 'glossy',
                tone: 'soft',
                className:
                    'bg-gradient-to-b from-black/20 to-black/50 dark:from-white/20 dark:to-white/10 !bg-transparent text-black dark:text-white focus:ring-black/40 dark:focus:ring-white/30',
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
            {
                variant: 'success',
                appearance: 'normal',
                tone: 'soft',
                className:
                    'bg-success-soft-light-bg/30 text-success-soft-light-text dark:bg-success-soft-dark-bg/20 dark:text-success-soft-dark-text hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-success-soft-dark-bg/40 dark:focus:ring-success-soft-light-bg/30',
            },
            {
                variant: 'warning',
                appearance: 'normal',
                tone: 'soft',
                className:
                    'bg-warning-soft-light-bg/30 text-warning-soft-light-text dark:bg-warning-soft-dark-bg/20 dark:text-warning-soft-dark-text hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-warning-soft-dark-bg/40 dark:focus:ring-warning-soft-light-bg/30',
            },
            {
                variant: 'danger',
                appearance: 'normal',
                tone: 'soft',
                className:
                    'bg-danger-soft-light-bg/30 text-danger-soft-light-text dark:bg-danger-soft-dark-bg/20 dark:text-danger-soft-dark-text hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-danger-soft-dark-bg/40 dark:focus:ring-danger-soft-light-bg/30',
            },
            {
                variant: 'info',
                appearance: 'normal',
                tone: 'soft',
                className:
                    'bg-info-soft-light-bg/30 text-info-soft-light-text dark:bg-info-soft-dark-bg/20 dark:text-info-soft-dark-text hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-info-soft-dark-bg/40 dark:focus:ring-info-soft-light-bg/30',
            },
            {
                variant: 'success',
                appearance: 'glossy',
                tone: 'soft',
                className:
                    'bg-gradient-to-b from-success-soft-light-bg/20 to-success-soft-light-bg/50 dark:from-success-soft-dark-bg/20 dark:to-success-soft-dark-bg/10 !bg-transparent focus:ring-success-soft-dark-bg/40 dark:focus:ring-success-soft-light-bg/30',
            },
            {
                variant: 'warning',
                appearance: 'glossy',
                tone: 'soft',
                className:
                    'bg-gradient-to-b from-warning-soft-light-bg/20 to-warning-soft-light-bg/50 dark:from-warning-soft-dark-bg/20 dark:to-warning-soft-dark-bg/10 !bg-transparent focus:ring-warning-soft-dark-bg/40 dark:focus:ring-warning-soft-light-bg/30',
            },
            {
                variant: 'danger',
                appearance: 'glossy',
                tone: 'soft',
                className:
                    'bg-gradient-to-b from-danger-soft-light-bg/20 to-danger-soft-light-bg/50 dark:from-danger-soft-dark-bg/20 dark:to-danger-soft-dark-bg/10 !bg-transparent focus:ring-danger-soft-dark-bg/40 dark:focus:ring-danger-soft-light-bg/30',
            },
            {
                variant: 'info',
                appearance: 'glossy',
                tone: 'soft',
                className:
                    'bg-gradient-to-b from-info-soft-light-bg/20 to-info-soft-light-bg/50 dark:from-info-soft-dark-bg/20 dark:to-info-soft-dark-bg/10 !bg-transparent focus:ring-info-soft-dark-bg/40 dark:focus:ring-info-soft-light-bg/30',
            },
            {
                variant: 'success',
                appearance: 'normal',
                tone: 'solid',
                className:
                    'bg-success-solid-light-bg text-success-solid-light-text dark:bg-success-solid-dark-bg dark:text-success-solid-dark-text hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-success-soft-dark-bg/40 dark:focus:ring-success-soft-light-bg/25',
            },
            {
                variant: 'warning',
                appearance: 'normal',
                tone: 'solid',
                className:
                    'bg-warning-solid-light-bg text-warning-solid-light-text dark:bg-warning-solid-dark-bg dark:text-warning-solid-dark-text hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-warning-soft-dark-bg/40 dark:focus:ring-warning-soft-light-bg/25',
            },
            {
                variant: 'danger',
                appearance: 'normal',
                tone: 'solid',
                className:
                    'bg-danger-solid-light-bg text-danger-solid-light-text dark:bg-danger-solid-dark-bg dark:text-danger-solid-dark-text hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-danger-soft-dark-bg/40 dark:focus:ring-danger-soft-light-bg/25',
            },
            {
                variant: 'info',
                appearance: 'normal',
                tone: 'solid',
                className:
                    'bg-info-solid-light-bg text-info-solid-light-text dark:bg-info-solid-dark-bg dark:text-info-solid-dark-text hover:enabled:opacity-75 active:enabled:opacity-100 focus:ring-info-soft-dark-bg/40 dark:focus:ring-info-soft-light-bg/25',
            },
            {
                variant: 'success',
                appearance: 'glossy',
                tone: 'solid',
                className:
                    'bg-gradient-to-b from-success-solid-light-bg/75 to-success-solid-light-bg/100 text-success-solid-light-text dark:from-success-solid-dark-bg/100 dark:to-success-solid-dark-bg/75 dark:text-success-solid-dark-text !bg-transparent focus:ring-success-soft-dark-bg/40 dark:focus:ring-success-soft-light-bg/25',
            },
            {
                variant: 'warning',
                appearance: 'glossy',
                tone: 'solid',
                className:
                    'bg-gradient-to-b from-warning-solid-light-bg/75 to-warning-solid-light-bg/100 text-warning-solid-light-text dark:from-warning-solid-dark-bg/100 dark:to-warning-solid-dark-bg/75 dark:text-warning-solid-dark-text !bg-transparent focus:ring-warning-soft-dark-bg/40 dark:focus:ring-warning-soft-light-bg/25',
            },
            {
                variant: 'danger',
                appearance: 'glossy',
                tone: 'solid',
                className:
                    'bg-gradient-to-b from-danger-solid-light-bg/75 to-danger-solid-light-bg/100 text-danger-solid-light-text dark:from-danger-solid-dark-bg/100 dark:to-danger-solid-dark-bg/75 dark:text-danger-solid-dark-text !bg-transparent focus:ring-danger-soft-dark-bg/40 dark:focus:ring-danger-soft-light-bg/25',
            },
            {
                variant: 'info',
                appearance: 'glossy',
                tone: 'solid',
                className:
                    'bg-gradient-to-b from-info-solid-light-bg/75 to-info-solid-light-bg/100 text-info-solid-light-text dark:from-info-solid-dark-bg/100 dark:to-info-solid-dark-bg/75 dark:text-info-solid-dark-text !bg-transparent focus:ring-info-soft-dark-bg/40 dark:focus:ring-info-soft-light-bg/25',
            },
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
    {
        children,
        className,
        variant,
        appearance,
        tone,
        size,
        rounding,
        disabled,
        type,
        ...props
    },
    ref,
) {
    const role = props.role || 'button';
    delete props.role;

    const buttonClass = btn({
        variant,
        appearance,
        tone,
        size,
        rounding,
        disabled,
    });

    return (
        <button
            ref={ref}
            role={role}
            aria-disabled={disabled}
            className={cn(buttonClass, className)}
            disabled={disabled}
            type={type ?? 'button'}
            {...props}>
            {children}
        </button>
    );
});

Button.displayName = 'Button';
export default Button;
