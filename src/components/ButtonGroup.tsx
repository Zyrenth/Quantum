'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { BaseHTMLAttributes } from 'react';

import { cn } from '<{utils}>/class';

type Props = VariantProps<typeof buttonGroup>;
interface ButtonGroupProps extends BaseHTMLAttributes<HTMLDivElement>, Props {}

const buttonGroup = cva(['flex flex-col', '[&>:not(:first-child):not(:last-child)]:rounded-none'], {
    variants: {
        /**
         * @description The orientation of the button group.
         * @default 'horizontal'
         */
        orientation: {
            horizontal: [
                'flex-row',
                '[&>:last-child]:rounded-l-none [&>:first-child]:rounded-r-none',
                '[&>:not(:first-child):not(:last-child)]:border-l-0 [&>:last-child]:border-l-0',
            ],
            vertical: [
                'flex-col',
                '[&>:last-child]:rounded-t-none [&>:first-child]:rounded-b-none',
                '[&>:not(:first-child):not(:last-child)]:border-t-0 [&>:last-child]:border-t-0',
            ],
        },
    },
    defaultVariants: {
        orientation: 'horizontal',
    },
});

/**
 * @description Allows you to group multiple buttons together.
 * @example
 * <ButtonGroup orientation={'horizontal'}>
 *    <Button>Button 1</Button>
 *    <Button>Button 2</Button>
 *    <Button>Button 3</Button>
 * </ButtonGroup>
 */
const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
    { children, className, orientation, ...props },
    ref,
) {
    const ariaLabel = props['aria-label'] || 'Button group';
    delete props['aria-label'];

    const buttonGroupClass = buttonGroup({ orientation });

    return (
        <div ref={ref} aria-label={ariaLabel} className={cn(buttonGroupClass, className)} {...props}>
            {children}
        </div>
    );
});

ButtonGroup.displayName = 'ButtonGroup';
export default ButtonGroup;
