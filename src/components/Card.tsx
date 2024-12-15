'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { BaseHTMLAttributes } from 'react';

import { cn } from '<{utils}>/class';

type Props = VariantProps<typeof card>;
interface CardProps extends BaseHTMLAttributes<HTMLDivElement>, Props {}

const card = cva(
    [
        'flex flex-col gap-2.5 shadow-lg rounded-md transform transition-all ease-out duration-[150ms]',
        'border border-black/15 dark:border-white/15',
    ],
    {
        variants: {
            /**
             * @description The size of the card.
             * @default 'md'
             */
            size: {
                sm: 'p-3.5 text-xs',
                md: 'p-4 text-sm',
                lg: 'p-[18px] text-base',
                xl: 'p-5 text-base',
            },
            /**
             * @description The rounding of the card.
             * @default 'md'
             */
            rounding: {
                none: 'rounded-none',
                sm: 'rounded-lg',
                md: 'rounded-xl',
                lg: 'rounded-2xl',
                xl: 'rounded-3xl',
            },
        },
        defaultVariants: {
            size: 'md',
            rounding: 'md',
        },
    },
);

/**
 * @description A card component.
 * @example
 * <Card size="lg" rounding="lg">
 *    <h1>Card</h1>
 *    <p>This is a card component.</p>
 *    <Button>Click me</Button>
 * </Card>
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
    { children, className, size, rounding, ...props },
    ref,
) {
    const ariaLabel = props['aria-label'] || 'Card';
    delete props['aria-label'];

    const cardClass = card({ size, rounding });

    return (
        <div ref={ref} aria-label={ariaLabel} className={cn(cardClass, className)} {...props}>
            {children}
        </div>
    );
});

Card.displayName = 'Card';
export default Card;
