'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React from 'react';

import { cn } from '@/utils/class';

type Props = VariantProps<typeof spinner>;
interface SpinnerProps extends React.SVGProps<SVGSVGElement>, Props {
    /**
     * @description The seconds per turn of the spinner.
     * @default 1
     */
    secondsPerTurn?: number;
    /**
     * @description The size of the spinner.
     * @default 64
     */
    size?: number;
}

type SVGSpinnerProps = Omit<Omit<SpinnerProps, 'width'>, 'height'>;

const spinner = cva([
    'dark:invert transition-all ease-out duration-[150ms] animate-spin',
]);

/**
 * @description A spinner component.
 * @example <Spinner />
 * @example <Spinner size={32} />
 * @example <Spinner size={64} secondsPerTurn={2} />
 * @example <Spinner size={128} strokeWidth={1.5} />
 */
const Spinner = React.forwardRef<SVGSVGElement, SVGSpinnerProps>(
    function Spinner(
        { className, secondsPerTurn, size = 64, strokeWidth, ...props },
        ref,
    ) {
        const ariaLabel = props['aria-label'] || 'Loading...';
        delete props['aria-label'];

        const spinnerClass = spinner();

        return (
            <svg
                ref={ref}
                role="status"
                aria-label={ariaLabel}
                className={cn(spinnerClass, className)}
                width={size ?? '64'}
                height={size ?? '64'}
                xmlns="http://www.w3.org/2000/svg"
                color="#000"
                strokeWidth={strokeWidth ?? -0.00866 * size + 5.437}
                viewBox="0 0 100 100"
                fill="none"
                style={{
                    animationDuration: `${secondsPerTurn ?? 1}s`,
                }}
                {...props}>
                <g>
                    <path
                        d="M50 6A44 44 0 1 1 49.999 6"
                        stroke="currentColor"
                        strokeOpacity="0.25"
                        strokeWidth={
                            +(strokeWidth ?? -0.00866 * size + 5.437) / 2
                        }
                    />
                    <path
                        d="M94 50A1 1 0 1 1 6 50"
                        stroke="url(#spinnerpaint0)"
                    />
                    <path
                        d="M94 50A1 1 0 1 0 6 50"
                        stroke="url(#spinnerpaint1)"
                    />
                </g>
                <defs>
                    <linearGradient id="spinnerpaint0">
                        <stop stopColor="currentColor" />
                        <stop
                            stopOpacity="0.5"
                            stopColor="currentColor"
                            offset="1"
                        />
                    </linearGradient>
                    <linearGradient id="spinnerpaint1">
                        <stop stopOpacity="0" stopColor="currentColor" />
                        <stop
                            stopOpacity="0.5"
                            stopColor="currentColor"
                            offset="1"
                        />
                    </linearGradient>
                </defs>
            </svg>
        );
    },
);

Spinner.displayName = 'Spinner';
export default Spinner;
