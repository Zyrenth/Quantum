'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { BaseHTMLAttributes, useCallback, useEffect, useState } from 'react';

import { cn } from '<{utils}>/class';

type Props = Omit<Omit<VariantProps<typeof popout>, 'isTooltip'>, 'isOpen'>;
interface PopoutProps extends Omit<Omit<BaseHTMLAttributes<HTMLDivElement>, 'size'>, 'content'>, Props {
    /**
     * @description The content to display in the popout.
     */
    content: string | React.ReactNode;
    /**
     * @description The delay in milliseconds before the popout is shown when hovering over the parent element. Only applicable when `isToggleable` is `false` and `isPopoutHoverable` is `true`.
     */
    hoverDelay?: number;
    /**
     * @description The class name(s) to apply to the popout wrapper.
     */
    wrapperClassName?: string;
    /**
     * @description Whether the popout is toggleable. AKA. a popover.
     */
    isToggleable?: boolean;
    /**
     * @description Whether the popout is hoverable. AKA. a tooltip.
     */
    isHoverable?: boolean;
}

const popout = cva(
    [
        'flex gap-2.5 w-fit shadow-lg whitespace-nowrap rounded-md transform transition-all ease-out duration-[150ms]',
        'bg-white dark:bg-black border border-black/15 dark:border-white/15',
        "before:content-[''] before:absolute before:border-8 before:border-solid before:border-transparent",
        "after:content-[''] after:absolute after:border-[6.5px] after:border-solid after:border-transparent",
    ],
    {
        variants: {
            /**
             * @description The size of the popout.
             * @default 'md'
             */
            size: {
                sm: 'p-3.5 text-xs',
                md: 'p-4 text-sm',
                lg: 'p-[18px] text-base',
                xl: 'p-5 text-base',
            },
            /**
             * @description The rounding of the popout.
             * @default 'md'
             */
            rounding: {
                none: 'rounded-none',
                full: 'rounded-full',
                sm: 'rounded-md',
                md: 'rounded-lg',
                lg: 'rounded-xl',
                xl: 'rounded-2xl',
            },
            /**
             * @description The orientation of the popout.
             * @default 'leftTop'
             */
            orientation: {
                topLeft:
                    'mb-[12px] before:top-full after:top-full before:left-6 after:left-6 before:-ml-2 after:ml-[-6.5px] before:border-t-[#d9d9d9] before:dark:border-t-[#262626] after:border-t-white after:dark:border-t-black',
                topCenter:
                    'mb-[12px] before:top-full after:top-full before:left-1/2 after:left-1/2 before:-ml-2 after:ml-[-6.5px] before:border-t-[#d9d9d9] before:dark:border-t-[#262626] after:border-t-white after:dark:border-t-black',
                topRight:
                    'mb-[12px] before:top-full after:top-full before:left-[calc(100%-1.5rem)] after:left-[calc(100%-1.5rem)] before:-ml-2 after:ml-[-6.5px] before:border-t-[#d9d9d9] before:dark:border-t-[#262626] after:border-t-white after:dark:border-t-black',
                bottomLeft:
                    'mt-[12px] before:bottom-full after:bottom-full before:left-6 after:left-6 before:-ml-2 after:ml-[-6.5px] before:border-b-[#d9d9d9] before:dark:border-b-[#262626] after:border-b-white after:dark:border-b-black',
                bottomCenter:
                    'mt-[12px] before:bottom-full after:bottom-full before:left-1/2 after:left-1/2 before:-ml-2 after:ml-[-6.5px] before:border-b-[#d9d9d9] before:dark:border-b-[#262626] after:border-b-white after:dark:border-b-black',
                bottomRight:
                    'mt-[12px] before:bottom-full after:bottom-full before:left-[calc(100%-1.5rem)] after:left-[calc(100%-1.5rem)] before:-ml-2 after:ml-[-6.5px] before:border-b-[#d9d9d9] before:dark:border-b-[#262626] after:border-b-white after:dark:border-b-black',
                leftTop:
                    'mr-[12px] before:left-full after:left-full before:top-6 after:top-6 before:-mt-2 after:mt-[-6.5px] before:border-l-[#d9d9d9] before:dark:border-l-[#262626] after:border-l-white after:dark:border-l-black',
                leftCenter:
                    'mr-[12px] before:left-full after:left-full before:top-1/2 after:top-1/2 before:-mt-2 after:mt-[-6.5px] before:border-l-[#d9d9d9] before:dark:border-l-[#262626] after:border-l-white after:dark:border-l-black',
                leftBottom:
                    'mr-[12px] before:left-full after:left-full before:top-[calc(100%-1.5rem)] after:top-[calc(100%-1.5rem)] before:-mt-2 after:mt-[-6.5px] before:border-l-[#d9d9d9] before:dark:border-l-[#262626] after:border-l-white after:dark:border-l-black',
                rightTop:
                    'ml-[12px] before:right-full after:right-full before:top-6 after:top-6 before:-mt-2 after:mt-[-6.5px] before:border-r-[#d9d9d9] before:dark:border-r-[#262626] after:border-r-white after:dark:border-r-black',
                rightCenter:
                    'ml-[12px] before:right-full after:right-full before:top-1/2 after:top-1/2 before:-mt-2 after:mt-[-6.5px] before:border-r-[#d9d9d9] before:dark:border-r-[#262626] after:border-r-white after:dark:border-r-black',
                rightBottom:
                    'ml-[12px] before:right-full after:right-full before:top-[calc(100%-1.5rem)] after:top-[calc(100%-1.5rem)] before:-mt-2 after:mt-[-6.5px] before:border-r-[#d9d9d9] before:dark:border-r-[#262626] after:border-r-white after:dark:border-r-black',
            },
            /**
             * @description Whether to show the arrow on the popout.
             * @default false
             */
            showArrow: {
                false: ['before:border-none after:border-none'],
            },
            /**
             * @description Whether the popout is open.
             * @default false
             * @private
             */
            isOpen: {
                true: 'scale-100 opacity-100',
                false: 'scale-95 opacity-0',
            },
            /**
             * @description Whether the popout is a tooltip.
             * @default false
             * @private
             */
            isTooltip: {
                true: 'flex-row',
                false: 'flex-col',
            },
        },
        compoundVariants: [
            {
                orientation: 'topLeft',
                showArrow: false,
                className: 'mb-[6px]',
            },
            {
                orientation: 'topCenter',
                showArrow: false,
                className: 'mb-[6px]',
            },
            {
                orientation: 'topRight',
                showArrow: false,
                className: 'mb-[6px]',
            },
            {
                orientation: 'bottomLeft',
                showArrow: false,
                className: 'mt-[6px]',
            },
            {
                orientation: 'bottomCenter',
                showArrow: false,
                className: 'mt-[6px]',
            },
            {
                orientation: 'bottomRight',
                showArrow: false,
                className: 'mt-[6px]',
            },
            {
                orientation: 'leftTop',
                showArrow: false,
                className: 'mr-[6px]',
            },
            {
                orientation: 'leftCenter',
                showArrow: false,
                className: 'mr-[6px]',
            },
            {
                orientation: 'leftBottom',
                showArrow: false,
                className: 'mr-[6px]',
            },
            {
                orientation: 'rightTop',
                showArrow: false,
                className: 'ml-[6px]',
            },
            {
                orientation: 'rightCenter',
                showArrow: false,
                className: 'ml-[6px]',
            },
            {
                orientation: 'rightBottom',
                showArrow: false,
                className: 'ml-[6px]',
            },
        ],
        defaultVariants: {
            size: 'md',
            rounding: 'md',
            orientation: 'leftTop',
            showArrow: false,
            isOpen: false,
            isTooltip: false,
        },
    },
);

const popoutWrapper = cva(['absolute shrink-0 w-fit z-[100]'], {
    variants: {
        /**
         * @description The orientation of the popout wrapper.
         * @default 'leftTop'
         */
        orientation: {
            topLeft: 'left-0 top-0 translate-y-[-100%]',
            topCenter: 'left-1/2 -translate-x-1/2 top-0 translate-y-[-100%]',
            topRight: 'right-0 top-0 translate-y-[-100%]',
            bottomLeft: 'left-0 bottom-0 translate-y-[100%]',
            bottomCenter: 'left-1/2 -translate-x-1/2 bottom-0 translate-y-[100%]',
            bottomRight: 'right-0 bottom-0 translate-y-[100%]',
            leftTop: 'left-0 translate-x-[-100%]',
            leftCenter: 'top-1/2 -translate-y-1/2 left-0 translate-x-[-100%]',
            leftBottom: 'bottom-0 left-0 translate-x-[-100%]',
            rightTop: 'right-0 translate-x-[100%]',
            rightCenter: 'top-1/2 -translate-y-1/2 right-0 translate-x-[100%]',
            rightBottom: 'bottom-0 right-0 translate-x-[100%]',
        },
        /**
         * @description Whether the popout is hoverable.
         * @default false
         */
        hoverable: {
            false: 'pointer-events-none',
        },
    },
    defaultVariants: {
        orientation: 'leftTop',
        hoverable: false,
    },
});

/**
 * @description A popout component. 2 in 1, you can create both tooltips and popovers with this.
 * @example
 * <Popout content="This is a tooltip." isHoverable>
 *     <Button>Hover over me</Button>
 * </Popout>
 * @example
 * <Popout content="This is a popover." isToggleable>
 *    <Button>Click me</Button>
 * </Popout>
 */
const Popout = React.forwardRef<HTMLDivElement, PopoutProps>(function Popout(
    {
        children,
        content,
        className,
        wrapperClassName,
        size,
        rounding,
        orientation,
        showArrow,
        hoverDelay,
        isHoverable,
        isToggleable,
        ...props
    },
    ref,
) {
    const ariaLabel = props['aria-label'] || (isToggleable ? 'Popover' : 'Tooltip');
    delete props['aria-label'];

    const defaultRef = ref ?? React.useRef<HTMLDivElement>(null);
    const popupRef = React.useRef<HTMLDivElement>(null);

    const [timeoutId, setTimeoutId] = useState<number | null>(null);
    const [isVisible, setVisible] = useState<boolean>(false);
    const [isOpen, setOpen] = useState<boolean>(false);

    /**
     * @description Clears the existing timeout.
     */
    const clearExistingTimeout = useCallback(() => {
        if (timeoutId) clearTimeout(timeoutId);
        setTimeoutId(null);
    }, [timeoutId]);

    /**
     * @description Handles opening the popout.
     */
    const openPopout = useCallback(() => {
        clearExistingTimeout();
        setTimeoutId(
            +setTimeout(
                () => {
                    setVisible(true);
                    setTimeoutId(+setTimeout(() => setOpen(true), 50));
                },
                !isToggleable ? hoverDelay : 0,
            ),
        );
    }, [clearExistingTimeout, hoverDelay, isToggleable]);

    /**
     * @description Handles closing the popout.
     */
    const closePopout = useCallback(() => {
        clearExistingTimeout();
        setOpen(false);

        if ('current' in defaultRef && isToggleable) {
            const lastChild = defaultRef?.current?.lastElementChild as HTMLElement;
            const focusable = lastChild?.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ) as HTMLElement;
            focusable ? focusable?.focus() : lastChild?.focus();
        }

        setTimeoutId(+setTimeout(() => setVisible(false), 100));
    }, [clearExistingTimeout, defaultRef, isToggleable]);

    /**
     * @description Handles clicking outside of the popout.
     * @param event The mouse event.
     */
    const handleClickOutside = useCallback(
        (event: PointerEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) return closePopout();
        },
        [closePopout, popupRef],
    );

    /**
     * @description Handles pressing the escape key.
     * @param event The keyboard event.
     */
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (
                defaultRef &&
                'current' in defaultRef &&
                defaultRef?.current &&
                defaultRef.current.contains(document.activeElement) &&
                !isOpen &&
                isToggleable
            ) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openPopout();
                }

                return;
            }

            if (event.key === 'Escape') return closePopout();
        },
        [closePopout, defaultRef, isOpen, isToggleable, openPopout],
    );

    useEffect(() => {
        if (!isToggleable) return;

        document.addEventListener('pointerdown', handleClickOutside);
        return () => document.removeEventListener('pointerdown', handleClickOutside);
    }, [handleClickOutside, isToggleable]);

    useEffect(() => {
        if (!isToggleable) return;

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown, isToggleable]);

    useEffect(() => {
        if (!('current' in popupRef)) return;
        if (!isOpen) return;

        const focusableElements = Array.from(
            popupRef?.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ) || [],
        ).filter((element) => !element.hasAttribute('disabled'));

        if (focusableElements.includes(document.activeElement as Element)) return;

        const firstFocusableElement = focusableElements?.[0] as HTMLElement;
        firstFocusableElement?.focus();
    }, [isOpen, popupRef]);

    useEffect(() => {
        if (!('current' in popupRef)) return;
        const wrapper = popupRef?.current;

        function handleTab(event: KeyboardEvent) {
            if (!isOpen) return;
            if (!wrapper?.contains(document.activeElement)) return;

            if (event.key === 'Tab' && wrapper) {
                if (!wrapper.contains(document.activeElement)) return;

                const focusableElements = Array.from(
                    wrapper.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                    ),
                ).filter((element) => !element.hasAttribute('disabled'));

                const firstFocusableElement = focusableElements?.[0] as HTMLElement;
                const lastFocusableElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

                if (!event.shiftKey && document.activeElement === lastFocusableElement) {
                    event.preventDefault();
                    firstFocusableElement.focus();
                } else if (event.shiftKey && document.activeElement === firstFocusableElement) {
                    event.preventDefault();
                    lastFocusableElement.focus();
                }
            }
        }

        document.addEventListener('keydown', handleTab);
        return () => document.removeEventListener('keydown', handleTab);
    }, [isOpen]);

    /**
     * @description Handles the click event.
     */
    const handleClick = () => {
        if (!isToggleable) return;

        if (!isVisible) openPopout();
    };

    /**
     * @description Handles the mouse enter event.
     */
    const handleMouseEnter = () => {
        if (isToggleable) return;

        openPopout();
    };

    /**
     * @description Handles the mouse leave event.
     */
    const handleMouseLeave = () => {
        if (isToggleable) return;

        closePopout();
    };

    const popoutClass = popout({ size, rounding, orientation, isOpen, showArrow, isTooltip: !isToggleable });
    const popoutWrapperClass = popoutWrapper({
        hoverable: !isToggleable ? isHoverable : true,
        orientation,
    });

    const popoutComponent = (
        <div className={cn(popoutWrapperClass)}>
            <div
                ref={popupRef}
                role={isToggleable ? 'menu' : 'tooltip'}
                aria-label={ariaLabel}
                className={cn(popoutClass, className)}
                {...props}
            >
                {content}
            </div>
        </div>
    );

    return (
        <div
            ref={defaultRef}
            onClick={handleClick}
            onPointerEnter={handleMouseEnter}
            onPointerLeave={handleMouseLeave}
            aria-haspopup={isToggleable ? 'menu' : 'false'}
            className={cn('relative', wrapperClassName)}
        >
            {isVisible && popoutComponent}
            {children}
        </div>
    );
});

Popout.displayName = 'Popout';
export default Popout;
