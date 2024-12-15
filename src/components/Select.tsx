'use client';

import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { cva, VariantProps } from 'class-variance-authority';
import React, { SelectHTMLAttributes, useCallback, useMemo, useRef, useState } from 'react';

import { cn } from '<{utils}>/class';
import LabelId from '<{utils}>/labelId';

import Badge from '<{components}>/Badge';
import Button from '<{components}>/Button';
import Dropdown from '<{components}>/Dropdown';

type ItemOption = {
    /**
     * @description The type of the option.
     * @default 'item'
     */
    type: 'item';
    /**
     * @description The unique identifier for the option.
     */
    id: string;
    /**
     * @description The label for the option.
     */
    label: string;
    /**
     * @description The icon for the item.
     */
    icon?: React.ReactNode;
    /**
     * @description Whether the option is disabled.
     * @default false
     */
    disabled?: boolean;
};

type HeaderOption = {
    /**
     * @description The type of the option.
     * @default 'item'
     */
    type: 'header';
    /**
     * @description The label for the header.
     */
    label: string;
};

type DividerOption = {
    /**
     * @description The type of the option.
     * @default 'item'
     */
    type: 'divider';
};

type Props = VariantProps<typeof select> & VariantProps<typeof selectWrapper> & VariantProps<typeof icon>;
interface SelectProps extends Omit<Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>, 'value'>, Props {
    /**
     * @description The options to display in the select.
     */
    options: (ItemOption | HeaderOption | DividerOption)[];
    /**
     * @description Whether to show a search bar in the dropdown.
     * @default false
     */
    showSearch?: boolean;
    /**
     * @description The id of the selected option.
     */
    value?: string;
    /**
     * @description Whether the select is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * @description The placeholder to display when no option is selected.
     * @default 'No option is selected.'
     */
    placeholder?: string;
    /**
     * @description Whether to allow multiple selections.
     * @default false
     */
    allowMultiple?: boolean;
    /**
     * @description Fires when an option is selected.
     */
    onSelection?: (value: string[]) => void;
}

const select = cva(
    [
        'w-full text-left truncate transition-all ease-out duration-[150ms]',
        'outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20',
    ],
    {
        variants: {
            /**
             * @description The size of the select.
             * @default 'md'
             */
            size: {
                sm: 'pl-1 pr-9 py-1 text-sm',
                md: 'pl-2 pr-10 py-2 text-sm',
                lg: 'pl-2 pr-10 py-2 text-base',
                xl: 'pl-2.5 pr-10 py-2.5 text-base',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    },
);

const selectInput = cva([
    'appearance-none absolute top-0 left-0 bottom-0 right-0 w-full truncate transition-all ease-out duration-[150ms] pointer-events-none',
    'opacity-0',
]);

const selectWrapper = cva(
    [
        'relative flex flex-row items-center justify-between gap-2.5 min-w-48 rounded-md transition-all ease-out duration-[150ms]',
        'border border-black/15 dark:border-white/15 bg-transparent',
        'font-medium leading-[normal]',
    ],
    {
        variants: {
            /**
             * @description The rounding of the select.
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
            /**
             * @description Whether the select is disabled.
             * @default false
             */
            disabled: {
                true: '!opacity-50 bg-black/10 dark:bg-white/10 cursor-not-allowed',
            },
        },
        defaultVariants: {
            rounding: 'md',
            disabled: false,
        },
    },
);

const icon = cva(['absolute h-5 opacity-75 flex-shrink-0'], {
    variants: {
        /**
         * @description The size of the icon.
         * @default 'md'
         */
        size: {
            sm: 'right-2',
            md: 'right-3',
            lg: 'right-3',
            xl: 'right-3.5',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

/**
 * @description A select component.
 * @example
 * <Select options={[
 *     { type: 'header', label: 'Header' },
 *     { type: 'item', id: 'option-1', label: 'Option 1' },
 *     { type: 'divider' },
 *     { type: 'item', id: 'option-2', label: 'Option 2' },
 * ]} onSelection={(id) => alert("You selected: " + id)} />
 * @requires Badge
 * @requires Button
 * @requires Dropdown
 * @requires `@heroicons/react` via NPM.
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
    {
        options,
        showSearch,
        allowMultiple,
        className,
        size,
        rounding,
        placeholder = 'No option is selected.',
        disabled,
        value,
        onSelection,
        ...props
    },
    ref,
) {
    const ids = new LabelId();
    const ariaLabel = props['aria-label'] || 'Select';
    delete props['aria-label'];

    const defaultRef = ref ?? useRef<HTMLSelectElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const checkmarkStrokeRefs = useRef<
        Record<
            string,
            {
                length: number;
                offset: number;
            } | null
        >
    >({});

    const [selected, setSelected] = useState<string[] | undefined>(value ? [value] : []);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    /**
     * @description Selects an item.
     * @param id The id of the item to select.
     */
    const selectItem = useCallback(
        (id: string) => {
            checkmarkStrokeRefs.current[id]!.offset = 0;

            if (allowMultiple) {
                setSelected((prev) => {
                    let newSelection = prev;

                    if (prev?.includes(id)) newSelection = prev?.filter((item) => item !== id);
                    else newSelection = [...(prev || []), id];

                    if (newSelection) onSelection?.(newSelection);

                    return newSelection;
                });
            } else {
                setSelected([id]);
                onSelection?.([id]);
            }
        },
        [allowMultiple, onSelection],
    );

    /**
     * @description Deselects an item.
     * @param id The id of the item to deselect.
     */
    const deselectItem = useCallback(
        (id: string) => {
            checkmarkStrokeRefs.current[id]!.offset = checkmarkStrokeRefs.current[id]!.length;

            if (!allowMultiple) return;

            setSelected((prev) => {
                const newSelection = prev?.filter((item) => item !== id);
                if (newSelection) onSelection?.(newSelection);

                return newSelection;
            });
        },
        [allowMultiple, onSelection],
    );

    const content = useMemo(
        () =>
            options.map((option) => {
                if (option.type === 'item') {
                    if (!checkmarkStrokeRefs.current[option.id])
                        checkmarkStrokeRefs.current[option.id] = {
                            length: 0,
                            offset: 0,
                        };

                    const icon = (
                        <CheckIcon
                            ref={(node) => {
                                if (!node) return;

                                const strokeLength = node?.getElementsByTagName('path')?.[0]?.getTotalLength();

                                checkmarkStrokeRefs.current[option.id]!.length = strokeLength;
                                checkmarkStrokeRefs.current[option.id]!.offset = selected?.includes(option.id)
                                    ? 0
                                    : strokeLength;
                            }}
                            strokeDasharray={checkmarkStrokeRefs.current[option.id]?.length}
                            strokeDashoffset={checkmarkStrokeRefs.current[option.id]?.offset}
                            className="w-full h-full transition-all ease-out duration-[150ms]"
                        />
                    );

                    return {
                        type: 'item',
                        icon: (
                            <div className="relative w-full h-full">
                                <div
                                    className={cn(
                                        'absolute top-0 left-0 bottom-0 right-0 transition-all ease-out duration-[150ms] opacity-0',
                                        selected?.includes(option.id) && 'opacity-100',
                                    )}
                                >
                                    {icon}
                                </div>
                                <div
                                    className={cn(
                                        'absolute top-0 left-0 bottom-0 right-0 transition-all ease-out duration-[150ms] opacity-100',
                                        selected?.includes(option.id) && 'opacity-0',
                                    )}
                                >
                                    {option.icon}
                                </div>
                            </div>
                        ),
                        label: option.label,
                        variant: 'primary',
                        disabled: option.disabled,
                        focused: selected?.includes(option.id),
                        action: () => {
                            if (selected?.includes(option.id)) deselectItem(option.id);
                            else selectItem(option.id);

                            setTimeout(() => {
                                if (defaultRef && 'current' in defaultRef && defaultRef.current) {
                                    defaultRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                                }
                            }, 0);
                        },
                    };
                } else if (option.type === 'header') {
                    return {
                        type: 'header',
                        label: option.label,
                    };
                } else if (option.type === 'divider') {
                    return {
                        type: 'divider',
                    };
                }
            }),
        [defaultRef, deselectItem, options, selectItem, selected],
    );

    const selectedItems = options
        .filter((option) => option.type === 'item' && option.id && selected?.includes(option.id))
        .map((option) => 'label' in option && option.label);

    const selectClass = select({ size });
    const selectInputClass = selectInput();
    const selectWrapperClass = selectWrapper({ disabled, rounding });
    const iconClass = icon({ size });

    let selectedAmount: any;
    if (selectedItems.length === 0)
        selectedAmount = (
            <Badge
                variant={'primary'}
                size={size}
                rounding={rounding}
                className="!bg-transparent text-black dark:text-white opacity-50"
            >
                {placeholder}
            </Badge>
        );
    else if (selectedItems.length <= 3 && allowMultiple)
        selectedAmount = selectedItems.map((label, index) => (
            <Badge key={index} variant={'primary'} size={size} rounding={rounding}>
                {label}
            </Badge>
        ));
    else if (allowMultiple)
        selectedAmount = (
            <Badge variant={'primary'} size={size} rounding={rounding}>
                {selectedItems.length} selected
            </Badge>
        );
    else
        selectedAmount = (
            <Badge
                variant={'primary'}
                size={size}
                rounding={rounding}
                className="!bg-transparent text-black dark:text-white"
            >
                {selectedItems[0]}
            </Badge>
        );

    const base = (
        <div className={cn(selectWrapperClass, className)}>
            <select
                ref={defaultRef}
                tabIndex={-1}
                value={value}
                className={cn(selectInputClass)}
                onFocus={() => buttonRef?.current?.focus()}
                multiple={allowMultiple}
                {...props}
            >
                <option disabled selected hidden>
                    {placeholder}
                </option>
                {options.map((item) => {
                    if (item.type !== 'item') return null;

                    return (
                        <option
                            key={item.id}
                            value={item.id}
                            disabled={disabled ?? item.disabled}
                            selected={selected?.includes(item.id)}
                            hidden
                        >
                            {item.label}
                        </option>
                    );
                })}
            </select>
            <ChevronDownIcon aria-hidden="true" className={cn(iconClass)} />
            <Button
                ref={buttonRef}
                variant={'blank'}
                size={size}
                rounding={rounding}
                role="combobox"
                aria-label={ariaLabel}
                aria-controls={ids.create('dropdown')}
                aria-expanded={isDropdownOpen}
                aria-haspopup="menu"
                className={cn(selectClass)}
                disabled={disabled}
            >
                <span className="flex flex-row gap-2.5 w-full truncate">{selectedAmount}</span>
            </Button>
        </div>
    );

    if (disabled) return base;
    else
        return (
            <Dropdown
                id={ids.get('dropdown')}
                content={content as any}
                disableHover
                fullWidth
                stayOpen={allowMultiple}
                withSearch={showSearch}
                orientation={'bottomCenter'}
                size={size as 'sm' | 'md' | 'lg' | 'xl'}
                rounding={rounding as 'sm' | 'md' | 'lg' | 'xl'}
                onOpenStateChange={setIsDropdownOpen}
            >
                {base}
            </Dropdown>
        );
});

Select.displayName = 'Select';
export default Select;
