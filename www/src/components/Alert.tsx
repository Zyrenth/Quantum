'use client';

import {
    ArrowTopRightOnSquareIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { cva, VariantProps } from 'class-variance-authority';
import React, { BaseHTMLAttributes } from 'react';

import { cn } from '@/utils/class';
import LabelId from '@/utils/labelId';

import Button from '@/components/Button';

type Props = Omit<VariantProps<typeof alert>, 'border'> &
    VariantProps<typeof alertOverlay>;
interface AlertProps
    extends Omit<BaseHTMLAttributes<HTMLDivElement>, 'title'>,
        Props {
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
                outline:
                    'border border-black/15 dark:border-white/15 text-black dark:text-white',
                success:
                    'bg-success-soft-light-bg/30 text-success-soft-light-text dark:bg-success-soft-dark-bg/20 dark:text-success-soft-dark-text',
                warning:
                    'bg-warning-soft-light-bg/30 text-warning-soft-light-text dark:bg-warning-soft-dark-bg/20 dark:text-warning-soft-dark-text',
                danger: 'bg-danger-soft-light-bg/30 text-danger-soft-light-text dark:bg-danger-soft-dark-bg/20 dark:text-danger-soft-dark-text',
                info: 'bg-info-soft-light-bg/30 text-info-soft-light-text dark:bg-info-soft-dark-bg/20 dark:text-info-soft-dark-text',
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
                success:
                    'border-l-4 border-l-success-solid-light-bg dark:border-l-success-solid-dark-bg',
                warning:
                    'border-l-4 border-l-warning-solid-light-bg dark:border-l-warning-solid-dark-bg',
                danger: 'border-l-4 border-l-danger-solid-light-bg dark:border-l-danger-solid-dark-bg',
                info: 'border-l-4 border-l-info-solid-light-bg dark:border-l-info-solid-dark-bg',
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
            {
                border: 'success',
                tone: 'solid',
                className:
                    'border-l-4 border-l-success-solid-light-text dark:border-l-success-solid-dark-text',
            },
            {
                border: 'warning',
                tone: 'solid',
                className:
                    'border-l-4 border-l-warning-solid-light-text dark:border-l-warning-solid-dark-text',
            },
            {
                border: 'danger',
                tone: 'solid',
                className:
                    'border-l-4 border-l-danger-solid-light-text dark:border-l-danger-solid-dark-text',
            },
            {
                border: 'info',
                tone: 'solid',
                className:
                    'border-l-4 border-l-info-solid-light-text dark:border-l-info-solid-dark-text',
            },
            {
                border: 'success',
                tone: 'soft',
                className:
                    'border-l-4 border-l-success-solid-light-bg dark:border-l-success-solid-dark-bg',
            },
            {
                border: 'warning',
                tone: 'soft',
                className:
                    'border-l-4 border-l-warning-solid-light-bg dark:border-l-warning-solid-dark-bg',
            },
            {
                border: 'danger',
                tone: 'soft',
                className:
                    'border-l-4 border-l-danger-solid-light-bg dark:border-l-danger-solid-dark-bg',
            },
            {
                border: 'info',
                tone: 'soft',
                className:
                    'border-l-4 border-l-info-solid-light-bg dark:border-l-info-solid-dark-bg',
            },

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
                className:
                    'bg-black/30 text-black dark:bg-white/20 dark:text-white',
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
                className:
                    'bg-gradient-to-b from-black/0 to-black/0 !bg-transparent',
            },
            {
                variant: 'success',
                appearance: 'normal',
                tone: 'soft',
                className:
                    'bg-success-soft-light-bg/30 text-success-soft-light-text dark:bg-success-soft-dark-bg/20 dark:text-success-soft-dark-text',
            },
            {
                variant: 'warning',
                appearance: 'normal',
                tone: 'soft',
                className:
                    'bg-warning-soft-light-bg/30 text-warning-soft-light-text dark:bg-warning-soft-dark-bg/20 dark:text-warning-soft-dark-text',
            },
            {
                variant: 'danger',
                appearance: 'normal',
                tone: 'soft',
                className:
                    'bg-danger-soft-light-bg/30 text-danger-soft-light-text dark:bg-danger-soft-dark-bg/20 dark:text-danger-soft-dark-text',
            },
            {
                variant: 'info',
                appearance: 'normal',
                tone: 'soft',
                className:
                    'bg-info-soft-light-bg/30 text-info-soft-light-text dark:bg-info-soft-dark-bg/20 dark:text-info-soft-dark-text',
            },
            {
                variant: 'success',
                appearance: 'glossy',
                tone: 'soft',
                className:
                    'bg-gradient-to-b from-success-soft-light-bg/20 to-success-soft-light-bg/50 dark:from-success-soft-dark-bg/20 dark:to-success-soft-dark-bg/10 !bg-transparent',
            },
            {
                variant: 'warning',
                appearance: 'glossy',
                tone: 'soft',
                className:
                    'bg-gradient-to-b from-warning-soft-light-bg/20 to-warning-soft-light-bg/50 dark:from-warning-soft-dark-bg/20 dark:to-warning-soft-dark-bg/10 !bg-transparent',
            },
            {
                variant: 'danger',
                appearance: 'glossy',
                tone: 'soft',
                className:
                    'bg-gradient-to-b from-danger-soft-light-bg/20 to-danger-soft-light-bg/50 dark:from-danger-soft-dark-bg/20 dark:to-danger-soft-dark-bg/10 !bg-transparent',
            },
            {
                variant: 'info',
                appearance: 'glossy',
                tone: 'soft',
                className:
                    'bg-gradient-to-b from-info-soft-light-bg/20 to-info-soft-light-bg/50 dark:from-info-soft-dark-bg/20 dark:to-info-soft-dark-bg/10 !bg-transparent',
            },
            {
                variant: 'success',
                appearance: 'normal',
                tone: 'solid',
                className:
                    'bg-success-solid-light-bg text-success-solid-light-text dark:bg-success-solid-dark-bg dark:text-success-solid-dark-text',
            },
            {
                variant: 'warning',
                appearance: 'normal',
                tone: 'solid',
                className:
                    'bg-warning-solid-light-bg text-warning-solid-light-text dark:bg-warning-solid-dark-bg dark:text-warning-solid-dark-text',
            },
            {
                variant: 'danger',
                appearance: 'normal',
                tone: 'solid',
                className:
                    'bg-danger-solid-light-bg text-danger-solid-light-text dark:bg-danger-solid-dark-bg dark:text-danger-solid-dark-text',
            },
            {
                variant: 'info',
                appearance: 'normal',
                tone: 'solid',
                className:
                    'bg-info-solid-light-bg text-info-solid-light-text dark:bg-info-solid-dark-bg dark:text-info-solid-dark-text',
            },
            {
                variant: 'success',
                appearance: 'glossy',
                tone: 'solid',
                className:
                    'bg-gradient-to-b from-success-solid-light-bg/75 to-success-solid-light-bg/100 text-success-solid-light-text dark:from-success-solid-dark-bg/100 dark:to-success-solid-dark-bg/75 dark:text-success-solid-dark-text !bg-transparent',
            },
            {
                variant: 'warning',
                appearance: 'glossy',
                tone: 'solid',
                className:
                    'bg-gradient-to-b from-warning-solid-light-bg/75 to-warning-solid-light-bg/100 text-warning-solid-light-text dark:from-warning-solid-dark-bg/100 dark:to-warning-solid-dark-bg/75 dark:text-warning-solid-dark-text !bg-transparent',
            },
            {
                variant: 'danger',
                appearance: 'glossy',
                tone: 'solid',
                className:
                    'bg-gradient-to-b from-danger-solid-light-bg/75 to-danger-solid-light-bg/100 text-danger-solid-light-text dark:from-danger-solid-dark-bg/100 dark:to-danger-solid-dark-bg/75 dark:text-danger-solid-dark-text !bg-transparent',
            },
            {
                variant: 'info',
                appearance: 'glossy',
                tone: 'solid',
                className:
                    'bg-gradient-to-b from-info-solid-light-bg/75 to-info-solid-light-bg/100 text-info-solid-light-text dark:from-info-solid-dark-bg/100 dark:to-info-solid-dark-bg/75 dark:text-info-solid-dark-text !bg-transparent',
            },
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
            success:
                'text-success-soft-light-text dark:text-success-soft-dark-text',
            warning:
                'text-warning-soft-light-text dark:text-warning-soft-dark-text',
            danger: 'text-danger-soft-light-text dark:text-danger-soft-dark-text',
            info: 'text-info-soft-light-text dark:text-info-soft-dark-text',
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
        {
            variant: 'success',
            tone: 'solid',
            className:
                'text-success-solid-light-text dark:text-success-solid-dark-text',
        },
        {
            variant: 'warning',
            tone: 'solid',
            className:
                'text-warning-solid-light-text dark:text-warning-solid-dark-text',
        },
        {
            variant: 'danger',
            tone: 'solid',
            className:
                'text-danger-solid-light-text dark:text-danger-solid-dark-text',
        },
        {
            variant: 'info',
            tone: 'solid',
            className:
                'text-info-solid-light-text dark:text-info-solid-dark-text',
        },
        {
            variant: 'success',
            tone: 'soft',
            className:
                'text-success-soft-light-text dark:text-success-soft-dark-text',
        },
        {
            variant: 'warning',
            tone: 'soft',
            className:
                'text-warning-soft-light-text dark:text-warning-soft-dark-text',
        },
        {
            variant: 'danger',
            tone: 'soft',
            className:
                'text-danger-soft-light-text dark:text-danger-soft-dark-text',
        },
        {
            variant: 'info',
            tone: 'soft',
            className:
                'text-info-soft-light-text dark:text-info-soft-dark-text',
        },
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

    const alertClass = alert({
        variant,
        appearance,
        tone,
        rounding,
        border: showBorder ? variant : null,
    });
    const alertIconClass = alertIcon({ size });
    const alertLinkClass = alertLink({ variant, tone, size });
    const alertOverlayClass = alertOverlay({ size });

    const linkButton = (
        <div className="flex flex-row items-center gap-1">
            <Button
                variant={'link'}
                aria-label={button}
                className={cn(
                    alertLinkClass,
                    'pointer-events-auto p-0 whitespace-nowrap',
                )}
                onClick={onButtonClick}>
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
            onClick={onClose}>
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
            {...props}>
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
                )}>
                {button && linkButton}
                {showClose && closeButton}
            </div>
        </div>
    );
});

Alert.displayName = 'Alert';
export default Alert;
