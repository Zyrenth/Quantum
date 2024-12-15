'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { BaseHTMLAttributes } from 'react';

import { cn } from '<{utils}>/class';

type Props = VariantProps<typeof table> & VariantProps<typeof tableRow> & VariantProps<typeof tableItem>;
interface TableProps extends BaseHTMLAttributes<HTMLDivElement>, Props {}

const table = cva(
    [
        'table-auto [border-collapse:separate] border-spacing-0 w-full shadow-lg overflow-hidden rounded-md',
        'transform transition-all ease-out duration-[150ms]',
        'border border-black/15 dark:border-white/15',
        '[&>tbody>:not(:last-child)>*]:border-b [&>tbody>:not(:last-child)>*]:border-b-black/15 dark:[&>tbody>:not(:last-child)>*]:border-b-white/15',
        '[&>tbody>*>:not(:last-child)]:border-r [&>tbody>*>:not(:last-child)]:border-r-black/15 dark:[&>tbody>*>:not(:last-child)]:border-r-white/15',
        '[&>tbody>:nth-child(odd)]:bg-black/5 dark:[&>tbody>:nth-child(odd)]:bg-white/5',
    ],
    {
        variants: {
            /**
             * @description The rounding of the table.
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

const tableRow = cva(
    [
        'items-center gap-2.5 transform transition-all ease-out duration-[150ms]',
        'border-y border-y-black/15 dark:border-y-white/15',
    ],
    {
        variants: {
            /**
             * @description The variant of the table row.
             * @default 'item'
             */
            variant: {
                item: '',
                header: '!bg-black/10 dark:!bg-white/10 font-bold',
            },
        },
        defaultVariants: {
            variant: 'item',
        },
    },
);

const tableItem = cva(['items-center gap-2.5 transform transition-all ease-out duration-[150ms]'], {
    variants: {
        /**
         * @description The size of the table.
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
        size: 'md',
    },
});

/**
 * @description A table component.
 * @example
 * <Table size="sm">
 *     <TableRow variant="header">
 *        <TableItem>Name</TableItem>
 *        <TableItem>Age</TableItem>
 *     </TableRow>
 *     <TableRow>
 *         <TableItem>John Doe</TableItem>
 *         <TableItem>25</TableItem>
 *     </TableRow>
 *     <TableRow>
 *         <TableItem>Jane Doe</TableItem>
 *         <TableItem>23</TableItem>
 *    </TableRow>
 * </Table>
 */
const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(
    { children, className, size, rounding, ...props },
    ref,
) {
    const ariaLabel = props['aria-label'] || 'Table';
    delete props['aria-label'];
    delete props.variant;

    const content = React.Children.toArray(children).map((child, index) => {
        if (React.isValidElement(child))
            return React.cloneElement(child, {
                ...child.props,
                key: index,
                size: child.props.size || size || 'md',
            });

        return child;
    });

    const tableClass = table({ rounding });

    return (
        <table ref={ref} role="table" aria-label={ariaLabel} className={cn(tableClass, className)} {...props}>
            <tbody>{content}</tbody>
        </table>
    );
});

/**
 * @description A table row component that can be used within a `Table` component.
 * @example
 * <TableRow>
 *     <TableItem>John Doe</TableItem>
 *     <TableItem>25</TableItem>
 * </TableRow>
 */
const TableRow = React.forwardRef<HTMLTableRowElement, TableProps>(function TableRow(
    { children, className, size, variant, ...props },
    ref,
) {
    const ariaLabel = props['aria-label'] || 'Table row';
    delete props['aria-label'];
    delete props.rounding;

    const content = React.Children.toArray(children).map((child, index) => {
        if (React.isValidElement(child))
            return React.cloneElement(child, {
                ...child.props,
                key: index,
                size: child.props.size || size || 'md',
            });

        return child;
    });

    const mapChildren = (children: React.ReactNode): React.ReactNode =>
        React.Children.toArray(children).map((child) => {
            if (React.isValidElement(child) && child.props.children)
                return React.cloneElement(child, {
                    // @ts-ignore
                    role: variant === 'header' ? 'columnheader' : 'cell',
                });
            else return child;
        });

    const rowClass = tableRow({ variant });

    return (
        <tr ref={ref} role={'row'} aria-label={ariaLabel} className={cn(rowClass, className)} {...props}>
            {mapChildren(content)}
        </tr>
    );
});

/**
 * @description A table item component that can be used within a `TableRow` component.
 * @example
 * <TableItem>John Doe</TableItem>
 */
const TableItem = React.forwardRef<HTMLTableCellElement, TableProps>(function TableItem(
    { children, className, size, ...props },
    ref,
) {
    const role = props.role || 'cell';
    delete props.role;
    const ariaLabel = props['aria-label'] || 'Table item';
    delete props['aria-label'];
    delete props.variant;
    delete props.rounding;

    const itemClass = tableItem({ size });

    return (
        <td ref={ref} role={role} aria-label={ariaLabel} className={cn(itemClass, className)} {...props}>
            {children}
        </td>
    );
});

Table.displayName = 'Table';
TableRow.displayName = 'TableRow';
TableItem.displayName = 'TableItem';
export default Table;
export { Table, TableItem, TableRow };
