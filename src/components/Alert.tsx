'use client';

import { ArrowTopRightOnSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cva, VariantProps } from 'class-variance-authority';
import React, { BaseHTMLAttributes } from 'react';

import { cn } from '<{utils}>/class';
import LabelId from '<{utils}>/labelId';

import Button from '<{components}>/Button';

type Props = Omit<VariantProps<typeof alert>, 'border'> & VariantProps<typeof alertOverlay>;
interface AlertProps extends Omit<BaseHTMLAttributes<HTMLDivElement>, 'title'>, Props {
    /**
     * @description The title of the alert.
     */
    title?: string | React.ReactNode;
    /**
     * @description The content of the alert.
     */
    description?: string | React.ReactNode;
    /**
     * @description The icon to be displayed on the left side of the alert.
     */
    icon?: React.ReactNode;
    /**
     * @description Whether to show a border on the left side of the alert.
     * @default false
     */
    showBorder?: boolean;
    /**
     * @description Whether to show a close button on the right side of the alert.
     * @default false
     */
    showClose?: boolean;
    /**
     * @description Fires when the close button is clicked.
     */
    onClose?: () => void;
    /**
     * @description The text of the button.
     */
    button?: string;
    /**
     * @description Fires when the button is clicked.
     */
    onButtonClick?: () => void;
}

const alert = cva(
    [
        'relative flex flex-row w-[512px] gap-2.5 rounded-md transition-all ease-out duration-[150ms]',
        'font-medium leading-[normal]',
    ],
    {
        variants: {
            /**
             * @description The variant of the alert.
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
             * @description The appearance of the alert.
             * @default 'normal'
             */
            appearance: {
                normal: '',
                glossy: '',
            },
            /**
             * @description The tone of the alert.
             * @default 'solid'
             */
            tone: {
                solid: '',
                soft: '',
            },

            /* Size is at alertOverlay */

            /**
             * @description The rounding of the alert.
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
             * @description The border color of the alert.
             * @default 'primary'
             * - This is omitted from the types because the code automatically handles it.
             */
            border: {
                primary: 'border-l-4 border-l-white dark:border-l-black',
                secondary: 'border-l-4 border-l-black dark:border-l-white',
                outline: 'border-l-4 border-l-black dark:border-l-white',
                /* <<
                {{color}}: 'border-l-4 border-l-{{color}}-solid-light-bg dark:border-l-{{color}}-solid-dark-bg',
                >> */
            },
        },
        compoundVariants: [
            {
                border: 'primary',
                className: 'border-l-4 border-l-white dark:border-l-black',
            },
            {
                border: 'secondary',
                className: 'border-l-4 border-l-black dark:border-l-white',
            },
            {
                border: 'outline',
                className: 'border-l-4 border-l-black dark:border-l-white',
            },
            /* <<
            {
                border: '{{color}}',
                tone: 'solid',
                className:
                    'border-l-4 border-l-{{color}}-solid-light-text dark:border-l-{{color}}-solid-dark-text',
            },
            >> */
            /* <<
            {
                border: '{{color}}',
                tone: 'soft',
                className:
                    'border-l-4 border-l-{{color}}-solid-light-bg dark:border-l-{{color}}-solid-dark-bg',
            },
            >> */

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
            /* Size is at alertOverlay */
            rounding: 'md',
            border: 'primary',
        },
    },
);

const alertIcon = cva([], {
    variants: {
        /**
         * @description The size of the alert icon.
         * @default 'md'
         */
        size: {
            sm: 'w-4 h-4',
            md: 'w-5 h-5',
            lg: 'w-6 h-6',
            xl: 'w-6 h-6',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

const alertOverlay = cva([], {
    variants: {
        /**
         * @description The size of the alert.
         * @default 'md'
         */
        size: {
            sm: 'p-3.5 text-xs',
            md: 'p-4 text-sm',
            lg: 'p-[18px] text-base',
            xl: 'p-5 text-base',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

const alertLink = cva([], {
    variants: {
        /**
         * @description The variant of the alert link.
         * @default 'primary'
         */
        variant: {
            primary: 'text-white dark:text-black',
            secondary: 'text-black dark:text-white',
            outline: 'text-black dark:text-white',
            /* <<
            {{color}}: 'text-{{color}}-soft-light-text dark:text-{{color}}-soft-dark-text',
            >> */
        },
        /**
         * @description The tone of the alert link.
         * @default 'solid'
         */
        tone: {
            solid: '',
            soft: '',
        },
        /**
         * @description The size of the alert link.
         * @default 'md'
         */
        size: {
            sm: 'text-xs',
            md: 'text-sm',
            lg: 'text-base',
            xl: 'text-base',
        },
    },
    compoundVariants: [
        {
            variant: 'primary',
            tone: 'solid',
            className: 'text-white dark:text-black',
        },
        {
            variant: 'primary',
            tone: 'soft',
            className: 'text-black dark:text-white',
        },
        {
            variant: 'secondary',
            className: 'text-black dark:text-white',
        },
        {
            variant: 'outline',
            className: 'text-black dark:text-white',
        },
        /* <<
        {
            variant: '{{color}}',
            tone: 'solid',
            className: 'text-{{color}}-solid-light-text dark:text-{{color}}-solid-dark-text',
        },
        >> */
        /* <<
        {
            variant: '{{color}}',
            tone: 'soft',
            className: 'text-{{color}}-soft-light-text dark:text-{{color}}-soft-dark-text',
        },
        >> */
    ],
    defaultVariants: {
        variant: 'primary',
        tone: 'solid',
        size: 'md',
    },
});

/**
 * @description An alert component.
 * @example <Alert variant="primary" title="Hello, world!" description="This is an alert." />
 * @requires Button
 */
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    {
        className,
        variant,
        appearance,
        tone,
        size,
        rounding,
        icon,
        title,
        description,
        showBorder,
        button,
        onButtonClick,
        showClose,
        onClose,
        ...props
    },
    ref,
) {
    const ids = new LabelId();

    const alertClass = alert({ variant, appearance, tone, rounding, border: showBorder ? variant : null });
    const alertIconClass = alertIcon({ size });
    const alertLinkClass = alertLink({ variant, tone, size });
    const alertOverlayClass = alertOverlay({ size });

    const linkButton = (
        <div className="flex flex-row items-center gap-1">
            <Button
                variant={'link'}
                aria-label={button}
                className={cn(alertLinkClass, 'pointer-events-auto p-0 whitespace-nowrap')}
                onClick={onButtonClick}
            >
                {button}
                <ArrowTopRightOnSquareIcon className={alertIconClass} />
            </Button>
        </div>
    );

    const closeButton = (
        <Button
            variant={'blank'}
            aria-label="Close"
            className={cn(alertLinkClass, 'pointer-events-auto p-1 ml-2.5')}
            onClick={onClose}
        >
            <XMarkIcon className={alertIconClass} />
        </Button>
    );

    return (
        <div
            ref={ref}
            role="alert"
            aria-labelledby={title ? ids.create('title') : ''}
            aria-describedby={ids.create('description')}
            className={cn(alertClass, alertOverlayClass, className)}
            {...props}
        >
            {icon && (
                <div aria-hidden="true" className={cn(alertIconClass)}>
                    {icon}
                </div>
            )}
            <div className="flex flex-col w-full text-wrap">
                {title && (
                    <div id={ids.get('title')} className="font-bold">
                        {title}
                    </div>
                )}
                <div id={ids.get('description')} className="opacity-80">
                    {description}
                </div>
            </div>
            <div
                className={cn(
                    alertOverlayClass,
                    'absolute flex items-center justify-end w-full h-full',
                    'top-0 left-0 bottom-0 right-0 pointer-events-none',
                )}
            >
                {button && linkButton}
                {showClose && closeButton}
            </div>
        </div>
    );
});

Alert.displayName = 'Alert';
export default Alert;
