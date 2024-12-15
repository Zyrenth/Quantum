'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { BaseHTMLAttributes } from 'react';

import { cn } from '<{utils}>/class';

type Props = VariantProps<typeof progressLoader>;
interface ProgressLoaderProps extends BaseHTMLAttributes<HTMLDivElement>, Props {
    /**
     * @description The seconds per turn of the progress loader.
     * @default 1
     */
    secondsPerTurn?: number;
    /**
     * @description The class name(s) to apply to the progress lodaer wrapper.
     */
    wrapperClassName?: string;
}

const progressLoaderWrapper = cva(
    [
        'flex flex-col items-center justify-center gap-2.5 overflow-x-hidden rounded-md transform transition-all ease-out duration-[150ms]',
        'bg-black/10 dark:bg-white/10',
    ],
    {
        variants: {
            /**
             * @description The rounding of the progress loader wrapper.
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
    },
);

const progressLoader = cva(
    [
        'relative w-32 h-1 self-stretch animate-progress-loader rounded-md',
        'bg-gradient-to-r from-20% from-black/0 to-black dark:from-white/0 dark:to-white',
    ],
    {
        variants: {
            /**
             * @description The rounding of the progress loader.
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
    },
);

/**
 * @description The progress loader component.
 * @example <ProgressLoader />
 * @example <ProgressLoader secondsPerTurn={2} />
 */
const ProgressLoader = React.forwardRef<HTMLDivElement, ProgressLoaderProps>(function ProgressLoader(
    { className, wrapperClassName, secondsPerTurn, rounding, ...props },
    ref,
) {
    const ariaLabel = props['aria-label'] || 'Loading...';
    delete props['aria-label'];

    const progressLoaderWrapperClass = progressLoaderWrapper({ rounding });
    const progressLoaderClass = progressLoader({ rounding });

    return (
        <>
            <div
                ref={ref}
                role="status"
                aria-label={ariaLabel}
                className={cn(progressLoaderWrapperClass, wrapperClassName)}
                {...props}
            >
                <span className="sr-only">Loading...</span>
                <div
                    aria-hidden="true"
                    className={cn(progressLoaderClass, className)}
                    style={{
                        animationDuration: `${secondsPerTurn ?? 1}s`,
                    }}
                />
            </div>
        </>
    );
});

ProgressLoader.displayName = 'ProgressLoader';
export default ProgressLoader;
