'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { BaseHTMLAttributes, LinkHTMLAttributes, useState } from 'react';

import { cn } from '<{utils}>/class';
import LabelId from '<{utils}>/labelId';

import Dropdown from '<{components}>/Dropdown';

type Props = VariantProps<typeof breadcrumb>;
interface BreadcrumbProps extends BaseHTMLAttributes<HTMLDivElement>, Props {
    /**
     * @description The separator to display between each breadcrumb item.
     */
    separator?: React.ReactNode;
}

type ItemProps = VariantProps<typeof breadcrumbItem>;
interface BreadcrumbItemProps extends LinkHTMLAttributes<HTMLAnchorElement>, ItemProps {
    /**
     * @description The links to display in a dropdown when clicking on the breadcrumb item.
     */
    collapsedLinks?: {
        label: string;
        href: string;
    }[];
    /**
     * @description Whether the breadcrumb item is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * @description Sets the dropdown size for the collapsed links.
     * @default 'md'
     */
    // @ts-ignore
    dropdownSize?: typeof Dropdown.defaultProps.size;
    /**
     * @description Sets the dropdown rounding for the collapsed links.
     * @default 'md'
     */
    // @ts-ignore
    dropdownRounding?: typeof Dropdown.defaultProps.rounding;
}

const breadcrumb = cva(['flex flex-row items-center gap-2.5 transition-all ease-out duration-[150ms]'], {
    variants: {
        /**
         * @description The size of the breadcrumb.
         * @default 'md'
         */
        size: {
            sm: 'text-xs',
            md: 'text-sm',
            lg: 'text-base',
            xl: 'text-base',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

const breadcrumbSeparator = cva(
    ['flex flex-row items-center justify-center text-center text-black/25 dark:text-white/25'],
    {
        variants: {
            /**
             * @description The size of the breadcrumb separator.
             * @default 'md'
             */
            size: {
                sm: 'w-3 h-3',
                md: 'w-4 h-4',
                lg: 'w-5 h-5',
                xl: 'w-6 h-6',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    },
);

const breadcrumbItem = cva(
    ['hover:underline hover:cursor-pointer hover:opacity-100 truncate transition-all ease-out duration-[150ms]'],
    {
        variants: {
            /**
             * @description Whether the breadcrumb item is disabled.
             */
            disabled: {
                true: '!cursor-not-allowed !opacity-50 hover:no-underline',
            },
            /**
             * @description Whether the breadcrumb item is active.
             */
            active: {
                true: '',
                false: 'opacity-75',
            },
        },
        defaultVariants: {
            disabled: false,
            active: false,
        },
    },
);

/**
 * @description A breadcrumb navigation element.
 * @example
 * <Breadcrumb>
 *    <BreadcrumbItem href="https://example.com">Home</BreadcrumbItem>
 *    <BreadcrumbItem href="https://example.com/about">About</BreadcrumbItem>
 *    <BreadcrumbItem
 *        collapsedLinks={[
 *            { href: 'https://example.com/about/team', label: 'Team' },
 *            { href: 'https://example.com/about/team/management', label: 'Management' },
 *        ]}
 *    >
 *        ...
 *    </BreadcrumbItem>
 *    <BreadcrumbItem href="https://example.com/about/team/management/contact" active>Contact</BreadcrumbItem>
 * </Breadcrumb>
 * @requires BreadcrumbItem
 */
const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(function Breadcrumb(
    { children, className, size, separator, ...props },
    ref,
) {
    const ariaLabel = props['aria-label'] || 'Breadcrumbs';
    delete props['aria-label'];

    const breadcrumbClass = breadcrumb({ size });
    const breadcrumbSeparatorClass = breadcrumbSeparator({ size });

    const sep = React.isValidElement(separator) ? (
        React.cloneElement(separator as React.ReactElement, {
            className: cn(separator?.props?.className, breadcrumbSeparatorClass),
        })
    ) : (
        <span className={cn(breadcrumbSeparatorClass)}>{separator ?? '/'}</span>
    );

    return (
        <div ref={ref} aria-label={ariaLabel} className={cn(breadcrumbClass, className)} {...props}>
            {React.Children.map(children, (child, index) => (
                <React.Fragment key={index}>
                    {child}
                    {index !== React.Children.count(children) - 1 && sep}
                </React.Fragment>
            ))}
        </div>
    );
});

Breadcrumb.displayName = 'Breadcrumb';
export default Breadcrumb;
export { Breadcrumb };

/**
 * @description A breadcrumb item that can be used within a `Breadcrumb` component.
 * @example <BreadcrumbItem href="https://example.com/about" active>About</BreadcrumbItem>
 * @requires Dropdown
 */
const BreadcrumbItem = React.forwardRef<HTMLAnchorElement, BreadcrumbItemProps>(function BreadcrumbItem(
    { children, className, collapsedLinks, disabled, active, dropdownSize, dropdownRounding, onClick, ...props },
    ref,
) {
    const ids = new LabelId();
    const ariaLabel = props['aria-label'] || 'Breadcrumb item';
    delete props['aria-label'];

    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    const breadcrumbItemClass = breadcrumbItem({ disabled, active });

    const base = (
        <a
            ref={ref}
            aria-label={ariaLabel}
            {...(collapsedLinks && {
                'aria-controls': ids.create('dropdown'),
                'aria-expanded': isDropdownOpen,
                'aria-haspopup': 'menu',
            })}
            className={cn(breadcrumbItemClass, className)}
            onClick={(event) => {
                if (disabled) {
                    event.preventDefault();
                    onClick?.(event);
                }
            }}
            {...props}
        >
            {children}
        </a>
    );

    if (!collapsedLinks || disabled) return base;

    const links = collapsedLinks.map((entry) => ({
        type: 'item',
        label: entry.label,
        action: () => {
            window.location.href = entry.href;
        },
    })) as any;

    if (links.length === 0) links.push({ type: 'item', label: 'Empty', disabled: true, action: () => {} });

    return (
        <Dropdown
            id={ids.get('dropdown')}
            content={links}
            disableHover
            size={dropdownSize}
            rounding={dropdownRounding}
            onOpenStateChange={setIsDropdownOpen}
        >
            {base}
        </Dropdown>
    );
});

BreadcrumbItem.displayName = 'BreadcrumbItem';
export { BreadcrumbItem };
