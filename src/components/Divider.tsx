'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { BaseHTMLAttributes } from 'react';

import { cn } from '<{utils}>/class';
import LabelId from '<{utils}>/labelId';

type Props = VariantProps<typeof divider>;
interface DividerProps extends BaseHTMLAttributes<HTMLDivElement>, Props {
    /**
     * @description The label to display between the divider lines.
     */
    label?: string;
}

const divider = cva(['flex shrink-0 self-stretch'], {
    variants: {
        /**
         * @description The orientation of the divider.
         * @default 'horizontal'
         */
        orientation: {
            horizontal: 'flex-row items-center flex-grow',
            vertical: 'flex-col items-center flex-grow',
        },
    },
    defaultVariants: {
        orientation: 'horizontal',
    },
});

const dividerLine = cva(['border-solid border-black/20 dark:border-white/20'], {
    variants: {
        /**
         * @description The orientation of the divider line.
         * @default 'horizontal'
         */
        orientation: {
            horizontal: 'border-t w-full h-fit',
            vertical: 'border-l h-full w-fit',
        },
    },
    defaultVariants: {
        orientation: 'horizontal',
    },
});

/**
 * @description A divider element to separate content.
 * @example <Divider orientation={'horizontal'} label="OR" />
 */
const Divider = React.forwardRef<HTMLDivElement, DividerProps>(function Divider(
    { className, orientation, label, ...props },
    ref,
) {
    const ids = new LabelId();
    const ariaLabel = props['aria-label'] || (label ? ids.create('label') : '');
    delete props['aria-label'];

    const dividerClass = divider({ orientation });
    const dividerLineClass = dividerLine({ orientation });

    return (
        <div
            ref={ref}
            role="separator"
            aria-labelledby={ariaLabel}
            aria-orientation={orientation as 'horizontal' | 'vertical' | undefined}
            className={cn(dividerClass, className)}
            {...props}
        >
            <div className={cn(dividerLineClass)} />
            {label && (
                <div
                    id={ids.get('label')}
                    className={cn(
                        'text-sm text-black/50 dark:text-white/50',
                        orientation === 'horizontal' ? 'mx-2.5' : 'my-2.5',
                    )}
                >
                    {label}
                </div>
            )}
            <div className={cn(dividerLineClass)} />
        </div>
    );
});

Divider.displayName = 'Divider';
export default Divider;
