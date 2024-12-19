'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { InputHTMLAttributes, useEffect, useRef, useState } from 'react';
import { useMeasure } from 'react-use';

import { cn } from '@/utils/class';

type Props = VariantProps<typeof sliderWrapper> &
    VariantProps<typeof sliderDot> &
    VariantProps<typeof sliderRounding>;
interface SliderProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
        Props {
    /**
     * @description Whether the slider is checked.
     * @default false
     */
    checked?: boolean;
    /**
     * @description Whether the slider is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * @description Time in milliseconds to wait before updating the slider value after input.
     */
    updateTimeout?: number;
    /**
     * @description Fires when the slider value changes after timeout.
     */
    onUpdate?: (event: React.FormEvent<HTMLInputElement>) => void;
}

const slider = cva([
    'absolute top-0 left-0 bottom-0 right-0 w-full h-full transition-all ease-out duration-[150ms]',
    'bg-transparent [&::-webkit-slider-thumb]:opacity-0 [&::-moz-range-thumb]:opacity-0',
    'appearance-none outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20',
]);

const sliderWrapper = cva(
    [
        'relative flex flex-row items-center transition-all ease-out duration-[150ms]',
        'border border-black/0 dark:border-white/0',
    ],
    {
        variants: {
            /**
             * @description The size of the slider.
             * @default 'md'
             */
            size: {
                sm: 'w-20 h-4',
                md: 'w-[5.5rem] h-5',
                lg: 'w-24 h-6',
                xl: 'w-[6.5rem] h-7',
            },
            /**
             * @description Whether the slider is disabled.
             * @default false
             */
            disabled: {
                true: '',
            },
            /**
             * @description Whether the slider is checked.
             * @default false
             */
            checked: {
                true: '',
                false: '',
            },
        },
        defaultVariants: {
            size: 'md',
            disabled: false,
            checked: false,
        },
    },
);

const sliderDot = cva(
    [
        'absolute top-0 left-0 bottom-0 m-auto pointer-events-none transition-colors ease-out duration-[150ms]',
    ],
    {
        variants: {
            /**
             * @description The appearance of the slider.
             * @default 'normal'
             */
            appearance: {
                normal: 'bg-white dark:bg-black border border-black/50 dark:border-white/50',
                glossy: 'bg-white dark:bg-black bg-gradient-to-b from-white to-black/10 dark:from-white/10 dark:to-black border border-black/50 dark:border-white/50',
            },
            /**
             * @description The size of the slider dot.
             * @default 'md'
             */
            size: {
                sm: 'w-4 h-4',
                md: 'w-5 h-5',
                lg: 'w-6 h-6',
                xl: 'w-7 h-7',
            },
            /**
             * @description Whether the slider dot is disabled.
             * @default false
             */
            disabled: {
                true: '',
            },
        },
        defaultVariants: {
            appearance: 'normal',
            size: 'md',
            disabled: false,
        },
    },
);

const sliderBarWrapper = cva([
    'absolute pointer-events-none flex flex-row items-center left-0 right-0 overflow-hidden border border-black/20 dark:border-white/20',
]);

const sliderBar = cva(['transition-colors ease-out duration-[150ms]'], {
    variants: {
        /**
         * @description The appearance of the slider bar.
         * @default 'normal'
         */
        appearance: {
            normal: '',
            glossy: '',
        },
        /**
         * @description The size of the slider bar.
         * @default 'md'
         */
        size: {
            sm: 'h-2',
            md: 'h-3',
            lg: 'h-4',
            xl: 'h-5',
        },
        /**
         * @description Whether the slider bar is disabled.
         * @default false
         */
        disabled: {
            true: 'opacity-50',
        },
        /**
         * @description Whether the slider bar is filled.
         * @default false
         */
        filled: {
            true: 'rounded-r-none',
            false: 'rounded-l-none',
        },
    },
    compoundVariants: [
        {
            appearance: 'normal',
            className: 'bg-black/10 dark:bg-white/10',
        },
        {
            appearance: 'glossy',
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
        disabled: false,
        filled: false,
    },
});

const sliderRounding = cva(['rounded-full'], {
    variants: {
        /**
         * @description The rounding of the slider.
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
});

/**
 * @description A slider component.
 * @example <Slider max={100} />
 * @example <Slider value={50} max={100} />
 * @example <Slider max={100} onUpdate={(event) => console.log("Slider value:", event.target.value)} />
 * @requires `react-use` via NPM.
 */
const Slider = React.forwardRef<HTMLInputElement, SliderProps>(function Slider(
    {
        className,
        appearance,
        size,
        rounding,
        disabled,
        onInput,
        value,
        max,
        onUpdate,
        updateTimeout = 250,
        ...props
    },
    ref,
) {
    const ariaLabel = props['aria-label'] || 'Slider';
    delete props['aria-label'];
    delete props.type;

    const customRef = useRef<HTMLInputElement>(null);
    const defaultRef = ref ?? customRef;
    const dotRef = useRef<HTMLDivElement>(null);
    const [sliderValue, setValue] = useState<number | undefined>(undefined);
    const [sliderEvent, setEvent] = useState<
        React.FormEvent<HTMLInputElement> | undefined
    >(undefined);

    const [bmRef, { width: bWidth }] = useMeasure();
    const [dmRef, { width: dWidth }] = useMeasure();

    useEffect(() => {
        setValue(+(value ?? 0));
    }, [value, defaultRef]);

    /**
     * @description Handles the input change event.
     * @param event The input change event.
     */
    const handleInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        setValue(parseInt((event.target as HTMLInputElement).value));
        setEvent(event);
    };

    useEffect(() => {
        let timeout: number;

        if (onUpdate && sliderEvent)
            timeout = +setTimeout(() => onUpdate(sliderEvent), updateTimeout);

        return () => clearTimeout(timeout);
    }, [sliderValue, sliderEvent, onUpdate, updateTimeout]);

    const percentage = ((sliderValue ?? 0) / +(max ?? 100)) * 100;
    const sliderClass = slider();
    const sliderWrapperClass = sliderWrapper({
        size,
        disabled,
    });
    const sliderDotClass = sliderDot({
        appearance,
        size,
        disabled,
    });
    const sliderBarWrapperClass = sliderBarWrapper();
    const sliderBarClass = sliderBar({
        appearance,
        size,
        disabled,
        filled: false,
    });
    const sliderBarFilledClass = sliderBar({
        appearance,
        size,
        disabled,
        filled: true,
    });
    const roundingClass = sliderRounding({ rounding });

    return (
        <div
            ref={(node) => bmRef(node as Element)}
            role="slider"
            aria-valuemax={+(max ?? 0) as number}
            aria-valuemin={0}
            aria-valuenow={+(sliderValue ?? 0) as number}
            aria-label={ariaLabel}
            className={cn(sliderWrapperClass, roundingClass, className)}>
            <input
                type="range"
                ref={defaultRef}
                className={cn(sliderClass, roundingClass)}
                disabled={disabled}
                defaultValue={sliderValue ?? 0}
                max={max ?? 100}
                onInput={(event) => {
                    handleInputChange(event);
                    onInput?.(event);
                }}
                {...props}
            />
            <div
                aria-hidden="true"
                className={cn(sliderBarWrapperClass, roundingClass)}>
                <div
                    className={cn(sliderBarFilledClass, roundingClass)}
                    style={{
                        width: bWidth
                            ? (bWidth * percentage) / 100 + 'px'
                            : '0%',
                    }}></div>
                <div
                    className={cn(sliderBarClass, roundingClass)}
                    style={{
                        width: bWidth
                            ? bWidth - (bWidth * percentage) / 100 + 'px'
                            : '100%',
                    }}></div>
            </div>
            <div
                ref={(node) => {
                    dmRef(node as Element);
                    dotRef.current = node;
                }}
                aria-hidden="true"
                className={cn(sliderDotClass, roundingClass)}
                style={{
                    transform: `translateX(${bWidth && dWidth ? (bWidth * percentage) / 100 - dWidth / 2 + 'px' : '-46%'})`,
                }}></div>
        </div>
    );
});

Slider.displayName = 'Slider';
export default Slider;
