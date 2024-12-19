'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { ProgressHTMLAttributes, useRef } from 'react';
import { useMeasure } from 'react-use';

import { cn } from '@/utils/class';

type Props = VariantProps<typeof progressWrapper>;
interface ProgressProps
    extends ProgressHTMLAttributes<HTMLProgressElement>,
        Props {
    /**
     * @description The appearance of the progress bar.
     * @default normal
     */
    appearance?: VariantProps<typeof progressBar>['appearance'];
    /**
     * @description Whether the progress bar is checked.
     * @default false
     */
    checked?: boolean;
    /**
     * @description Whether the progress bar is disabled.
     * @default false
     */
    disabled?: boolean;
}

const progress = cva([
    'appearance-none bg-transparent w-full h-full',
    '[&::-webkit-progress-bar]:opacity-0',
    '[&::-webkit-progress-value]:opacity-0',
    '[&::-moz-progress-bar]:opacity-0',
]);

const progressWrapper = cva(
    [
        'relative flex flex-row items-center rounded-full transition-all ease-out duration-[150ms]',
        'border border-black/0 dark:border-white/0',
    ],
    {
        variants: {
            /**
             * @description The size of the progress bar.
             * @default 'md'
             */
            size: {
                sm: 'w-20 h-4',
                md: 'w-[5.5rem] h-5',
                lg: 'w-24 h-6',
                xl: 'w-[6.5rem] h-7',
            },
            /**
             * @description The rounding of the progress bar.
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
            /**
             * @description Whether the progress bar is disabled.
             * @default false
             */
            disabled: {
                true: '',
            },
            /**
             * @description Whether the progress bar is checked.
             * @default false
             */
            checked: {
                true: '',
                false: '',
            },
        },
        defaultVariants: {
            size: 'md',
            rounding: 'full',
            disabled: false,
            checked: false,
        },
    },
);

const progressBarWrapper = cva(
    [
        'absolute pointer-events-none flex flex-row items-center left-0 right-0 overflow-hidden rounded-full border border-black/20 dark:border-white/20',
    ],
    {
        variants: {
            /**
             * @description The rounding of the progress bar.
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
        defaultVariants: {
            rounding: 'full',
        },
    },
);

const progressBar = cva(
    ['rounded-full transition-all ease-out duration-[150ms]'],
    {
        variants: {
            /**
             * @description The appearance of the progress bar.
             * @default 'normal'
             */
            appearance: {
                normal: '',
                glossy: '',
            },
            /**
             * @description The size of the progress bar.
             * @default 'md'
             */
            size: {
                sm: 'h-2',
                md: 'h-3',
                lg: 'h-4',
                xl: 'h-5',
            },
            /**
             * @description The rounding of the progress bar.
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
            /**
             * @description Whether the progress bar is disabled.
             * @default false
             */
            disabled: {
                true: 'opacity-50',
            },
            /**
             * @description Whether the progress bar is filled.
             * @default true
             */
            filled: {
                true: 'rounded-r-none',
                false: 'rounded-l-none',
            },
        },
        compoundVariants: [
            {
                appearance: 'normal',
                filled: false,
                className: 'bg-black/10 dark:bg-white/10',
            },
            {
                appearance: 'glossy',
                filled: false,
                className:
                    'bg-gradient-to-b from-white/5 to-black/10 dark:from-white/10 dark:to-black/5',
            },
            {
                appearance: 'normal',
                filled: true,
                className: 'bg-black dark:bg-white',
            },
            {
                appearance: 'glossy',
                filled: true,
                className:
                    'bg-black/90 dark:bg-white bg-gradient-to-b from-white/10 to-black dark:from-white dark:to-black/10',
            },
        ],
        defaultVariants: {
            appearance: 'normal',
            size: 'md',
            rounding: 'full',
            disabled: false,
            filled: true,
        },
    },
);

/**
 * @description A progress bar component.
 * @example <Progress value={50} max={100} />
 * @requires `react-use` via NPM.
 */
const Progress = React.forwardRef<HTMLProgressElement, ProgressProps>(
    function Progress(
        {
            className,
            appearance,
            size,
            rounding,
            disabled,
            value,
            max,
            ...props
        },
        ref,
    ) {
        const ariaLabel = props['aria-label'] || 'Progress bar';
        delete props['aria-label'];

        const customRef = useRef<HTMLProgressElement>(null);
        const defaultRef = ref ?? customRef;
        const [bmRef, { width: bWidth }] = useMeasure();
        const percentage = (+(value ?? 0) / +(max ?? 100)) * 100;

        const progressClass = progress();
        const progressWrapperClass = progressWrapper({
            size,
            rounding,
            disabled,
        });
        const progressBarWrapperClass = progressBarWrapper({
            rounding,
        });
        const progressBarClass = progressBar({
            appearance,
            size,
            rounding,
            disabled,
            filled: false,
        });
        const progressBarFilledClass = progressBar({
            appearance,
            size,
            rounding,
            disabled,
            filled: true,
        });

        return (
            <div
                ref={(node) => bmRef(node as Element)}
                role="progressbar"
                aria-label={ariaLabel}
                aria-valuemax={+(max ?? 0) as number}
                aria-valuemin={0}
                aria-valuenow={+(value ?? 0) as number}
                className={cn(progressWrapperClass, className)}>
                <progress
                    ref={defaultRef}
                    role="progressbar"
                    className={cn(progressClass)}
                    defaultValue={value ?? 0}
                    max={max ?? 100}
                    {...props}
                />
                <div aria-hidden="true" className={cn(progressBarWrapperClass)}>
                    <div
                        className={cn(progressBarFilledClass)}
                        style={{
                            width: bWidth
                                ? (bWidth * percentage) / 100 + 'px'
                                : '0%',
                        }}></div>
                    <div
                        className={cn(progressBarClass)}
                        style={{
                            width: bWidth
                                ? bWidth - (bWidth * percentage) / 100 + 'px'
                                : '100%',
                        }}></div>
                </div>
            </div>
        );
    },
);

Progress.displayName = 'Progress';
export default Progress;
