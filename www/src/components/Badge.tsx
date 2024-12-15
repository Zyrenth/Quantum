'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { BaseHTMLAttributes } from 'react';

import { cn } from '@/utils/class';

type Props = VariantProps<typeof badge>;
interface BadgeProps extends BaseHTMLAttributes<HTMLDivElement>, Props {
    /**
     * @description Whether the badge is disabled.
     * @default false
     */
    disabled?: boolean;
}

const badge = cva(
    [
        'inline-flex items-center gap-2.5 rounded-full transition-all ease-out duration-[150ms]',
        'text-center font-medium leading-[normal] overflow-hidden whitespace-nowrap text-ellipsis',
    ],
    {
        variants: {
            /**
             * @description The variant of the badge.
             * @default 'primary'
             */
            variant: {
                primary: 'bg-black text-white dark:bg-white dark:text-black',
                secondary:
                    'bg-black/10 text-black dark:bg-white/10 dark:text-white border border-black/10 dark:border-white/10',
                outline:
                    'border border-black/15 dark:border-white/15 text-black dark:text-white',
                success:
                    'bg-success-soft-light-bg/30 text-success-soft-light-text dark:bg-success-soft-dark-bg/20 dark:text-success-soft-dark-text',
                warning:
                    'bg-warning-soft-light-bg/30 text-warning-soft-light-text dark:bg-warning-soft-dark-bg/20 dark:text-warning-soft-dark-text',
                danger: 'bg-danger-soft-light-bg/30 text-danger-soft-light-text dark:bg-danger-soft-dark-bg/20 dark:text-danger-soft-dark-text',
                info: 'bg-info-soft-light-bg/30 text-info-soft-light-text dark:bg-info-soft-dark-bg/20 dark:text-info-soft-dark-text',
            },
            /**
             * @description The appearance of the badge.
             * @default 'normal'
             */
            appearance: {
                normal: '',
                glossy: '',
            },
            /**
             * @description The tone of the badge.
             * @default 'solid'
             */
            tone: {
                solid: '',
                soft: '',
            },
            /**
             * @description The size of the badge.
             * @default 'md'
             */
            size: {
                sm: 'px-2 py-0.5 text-xs',
                md: 'px-2.5 py-0.5 text-sm',
                lg: 'px-2.5 py-1 text-sm',
                xl: 'px-3 py-1.5 text-base',
            },
            /**
             * @description The rounding of the badge.
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
        compoundVariants: [
            {
                variant: 'primary',
                appearance: 'normal',
                tone: 'solid',
                className: 'bg-black text-white dark:bg-white dark:text-black',
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
                    'bg-black/30 text-black dark:bg-white/20 dark:text-white',
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
                    'bg-gradient-to-b from-black/0 to-black/0 !bg-transparent',
            },
            {
                variant: 'success',
                appearance: 'normal',
                tone: 'soft',
                className:
                    'bg-success-soft-light-bg/30 text-success-soft-light-text dark:bg-success-soft-dark-bg/20 dark:text-success-soft-dark-text',
            },
            {
                variant: 'warning',
                appearance: 'normal',
                tone: 'soft',
                className:
                    'bg-warning-soft-light-bg/30 text-warning-soft-light-text dark:bg-warning-soft-dark-bg/20 dark:text-warning-soft-dark-text',
            },
            {
                variant: 'danger',
                appearance: 'normal',
                tone: 'soft',
                className:
                    'bg-danger-soft-light-bg/30 text-danger-soft-light-text dark:bg-danger-soft-dark-bg/20 dark:text-danger-soft-dark-text',
            },
            {
                variant: 'info',
                appearance: 'normal',
                tone: 'soft',
                className:
                    'bg-info-soft-light-bg/30 text-info-soft-light-text dark:bg-info-soft-dark-bg/20 dark:text-info-soft-dark-text',
            },
            {
                variant: 'success',
                appearance: 'glossy',
                tone: 'soft',
                className:
                    'bg-gradient-to-b from-success-soft-light-bg/20 to-success-soft-light-bg/50 dark:from-success-soft-dark-bg/20 dark:to-success-soft-dark-bg/10 !bg-transparent',
            },
            {
                variant: 'warning',
                appearance: 'glossy',
                tone: 'soft',
                className:
                    'bg-gradient-to-b from-warning-soft-light-bg/20 to-warning-soft-light-bg/50 dark:from-warning-soft-dark-bg/20 dark:to-warning-soft-dark-bg/10 !bg-transparent',
            },
            {
                variant: 'danger',
                appearance: 'glossy',
                tone: 'soft',
                className:
                    'bg-gradient-to-b from-danger-soft-light-bg/20 to-danger-soft-light-bg/50 dark:from-danger-soft-dark-bg/20 dark:to-danger-soft-dark-bg/10 !bg-transparent',
            },
            {
                variant: 'info',
                appearance: 'glossy',
                tone: 'soft',
                className:
                    'bg-gradient-to-b from-info-soft-light-bg/20 to-info-soft-light-bg/50 dark:from-info-soft-dark-bg/20 dark:to-info-soft-dark-bg/10 !bg-transparent',
            },
            {
                variant: 'success',
                appearance: 'normal',
                tone: 'solid',
                className:
                    'bg-success-solid-light-bg text-success-solid-light-text dark:bg-success-solid-dark-bg dark:text-success-solid-dark-text',
            },
            {
                variant: 'warning',
                appearance: 'normal',
                tone: 'solid',
                className:
                    'bg-warning-solid-light-bg text-warning-solid-light-text dark:bg-warning-solid-dark-bg dark:text-warning-solid-dark-text',
            },
            {
                variant: 'danger',
                appearance: 'normal',
                tone: 'solid',
                className:
                    'bg-danger-solid-light-bg text-danger-solid-light-text dark:bg-danger-solid-dark-bg dark:text-danger-solid-dark-text',
            },
            {
                variant: 'info',
                appearance: 'normal',
                tone: 'solid',
                className:
                    'bg-info-solid-light-bg text-info-solid-light-text dark:bg-info-solid-dark-bg dark:text-info-solid-dark-text',
            },
            {
                variant: 'success',
                appearance: 'glossy',
                tone: 'solid',
                className:
                    'bg-gradient-to-b from-success-solid-light-bg/75 to-success-solid-light-bg/100 text-success-solid-light-text dark:from-success-solid-dark-bg/100 dark:to-success-solid-dark-bg/75 dark:text-success-solid-dark-text !bg-transparent',
            },
            {
                variant: 'warning',
                appearance: 'glossy',
                tone: 'solid',
                className:
                    'bg-gradient-to-b from-warning-solid-light-bg/75 to-warning-solid-light-bg/100 text-warning-solid-light-text dark:from-warning-solid-dark-bg/100 dark:to-warning-solid-dark-bg/75 dark:text-warning-solid-dark-text !bg-transparent',
            },
            {
                variant: 'danger',
                appearance: 'glossy',
                tone: 'solid',
                className:
                    'bg-gradient-to-b from-danger-solid-light-bg/75 to-danger-solid-light-bg/100 text-danger-solid-light-text dark:from-danger-solid-dark-bg/100 dark:to-danger-solid-dark-bg/75 dark:text-danger-solid-dark-text !bg-transparent',
            },
            {
                variant: 'info',
                appearance: 'glossy',
                tone: 'solid',
                className:
                    'bg-gradient-to-b from-info-solid-light-bg/75 to-info-solid-light-bg/100 text-info-solid-light-text dark:from-info-solid-dark-bg/100 dark:to-info-solid-dark-bg/75 dark:text-info-solid-dark-text !bg-transparent',
            },
        ],
        defaultVariants: {
            variant: 'primary',
            appearance: 'normal',
            tone: 'solid',
            size: 'md',
            rounding: 'full',
        },
    },
);

/**
 * @description A badge component.
 * @example <Badge variant="primary">Badge</Badge>
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(function Badge(
    {
        children,
        className,
        variant,
        appearance,
        tone,
        size,
        rounding,
        ...props
    },
    ref,
) {
    const ariaLabel = props['aria-label'] || 'Badge';
    delete props['aria-label'];

    const badgeClass = badge({ variant, appearance, tone, size, rounding });

    return (
        <div
            ref={ref}
            aria-label={ariaLabel}
            className={cn(badgeClass, className)}
            {...props}>
            {children}
        </div>
    );
});

Badge.displayName = 'Badge';
export default Badge;
