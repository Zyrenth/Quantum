'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { BaseHTMLAttributes } from 'react';

import { cn } from '<{utils}>/class';

type Props = VariantProps<typeof list> & VariantProps<typeof listItem>;
interface ListProps extends BaseHTMLAttributes<HTMLDivElement>, Props {}

const list = cva(
    [
        'flex flex-col shadow-lg overflow-hidden rounded-md transform transition-all ease-out duration-[150ms]',
        'border border-black/15 dark:border-white/15',
        '[&>:last-child]:border-y-0 [&>:first-child]:border-t-0',
        '[&>:not(:first-child):not(:last-child)]:border-t-0 [&>:last-child]:border-t-0',
    ],
    {
        variants: {
            /**
             * @description The rounding of the list.
             * @default 'md'
             */
            rounding: {
                none: 'rounded-none',
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

const listItem = cva(
    [
        'flex items-center gap-2.5 transform transition-all ease-out duration-[150ms]',
        'border-y border-y-black/15 dark:border-y-white/15',
    ],
    {
        variants: {
            /**
             * @description The variant of the list item.
             * @default 'item'
             */
            variant: {
                item: '',
                header: 'bg-black/10 dark:bg-white/10 font-bold',
            },
            /**
             * @description The size of the list item.
             * @default 'md'
             */
            size: {
                sm: 'p-2.5 text-xs',
                md: 'p-3 text-sm',
                lg: 'p-3.5 text-base',
                xl: 'p-4 text-base',
            },
        },
        defaultVariants: {
            variant: 'item',
            size: 'md',
        },
    },
);

/**
 * @description A list component.
 * @example
 * <List>
 *     <ListItem variant="header">Header 1</ListItem>
 *     <ListItem>Item 1</ListItem>
 *     <ListItem>Item 2</ListItem>
 *     <ListItem variant="header">Header 2</ListItem>
 *     <ListItem>Item 3</ListItem>
 *     <ListItem>Item 4</ListItem>
 * </List>
 */
const List = React.forwardRef<HTMLDivElement, ListProps>(function List(
    { children, className, size, rounding, ...props },
    ref,
) {
    const ariaLabel = props['aria-label'] || 'List';
    delete props['aria-label'];

    delete props.variant;

    const listClass = list({ rounding });

    const content = React.Children.map(children, (child, index) => {
        if (React.isValidElement(child))
            return React.cloneElement(child, {
                ...child.props,
                key: index,
                size: child.props.size || size || 'md',
            });
        return child;
    });

    return (
        <div ref={ref} role={'list'} aria-label={ariaLabel} className={cn(listClass, className)} {...props}>
            {content}
        </div>
    );
});

List.displayName = 'List';
export default List;

/**
 * @description A list item component.
 * @example <ListItem>Item</ListItem>
 * @example <ListItem variant="header">Header</ListItem>
 */
const ListItem = React.forwardRef<HTMLDivElement, ListProps>(function ListItem(
    { children, className, variant, size, ...props },
    ref,
) {
    const ariaLabel = props['aria-label'] || (variant === 'header' ? 'List header' : 'List item');
    delete props['aria-label'];
    delete props.rounding;

    const listClass = listItem({ variant, size });

    return (
        <div ref={ref} role={'listitem'} aria-label={ariaLabel} className={cn(listClass, className)} {...props}>
            {children}
        </div>
    );
});

ListItem.displayName = 'ListItem';
export { ListItem };
