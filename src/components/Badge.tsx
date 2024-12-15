'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { BaseHTMLAttributes } from 'react';

import { cn } from '<{utils}>/class';

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
                outline: 'border border-black/15 dark:border-white/15 text-black dark:text-white',
                /* <<
                {{color}}: 'bg-{{color}}-soft-light-bg/30 text-{{color}}-soft-light-text dark:bg-{{color}}-soft-dark-bg/20 dark:text-{{color}}-soft-dark-text',
                >> */
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
                className: 'bg-black/30 text-black dark:bg-white/20 dark:text-white',
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
                className: 'bg-gradient-to-b from-black/0 to-black/0 !bg-transparent',
            },
            /* <<
            {
                variant: '{{color}}',
                appearance: 'normal',
                tone: 'soft',
                className:
                    'bg-{{color}}-soft-light-bg/30 text-{{color}}-soft-light-text dark:bg-{{color}}-soft-dark-bg/20 dark:text-{{color}}-soft-dark-text',
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
                    'bg-{{color}}-solid-light-bg text-{{color}}-solid-light-text dark:bg-{{color}}-solid-dark-bg dark:text-{{color}}-solid-dark-text',
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
            rounding: 'full',
        },
    },
);

/**
 * @description A badge component.
 * @example <Badge variant="primary">Badge</Badge>
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(function Badge(
    { children, className, variant, appearance, tone, size, rounding, ...props },
    ref,
) {
    const ariaLabel = props['aria-label'] || 'Badge';
    delete props['aria-label'];

    const badgeClass = badge({ variant, appearance, tone, size, rounding });

    return (
        <div ref={ref} aria-label={ariaLabel} className={cn(badgeClass, className)} {...props}>
            {children}
        </div>
    );
});

Badge.displayName = 'Badge';
export default Badge;
