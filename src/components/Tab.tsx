'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { BaseHTMLAttributes, useEffect, useMemo, useState } from 'react';
import { useMeasure } from 'react-use';

import { cn } from '<{utils}>/class';
import LabelId from '<{utils}>/labelId';

type Props = VariantProps<typeof tab> & VariantProps<typeof tabOverlay>;
interface TabProps extends BaseHTMLAttributes<HTMLDivElement>, Props {
    /**
     * @description The tabs to display.
     */
    tabs: {
        id: string;
        label: string | React.ReactNode | React.ReactNode[];
        disabled?: boolean;
    }[];
    /**
     * @description The id of the active tab.
     */
    activeTab: string;
    /**
     * @description Fires when the active tab changes.
     */
    onTabChange: (tabId: string) => void;
}

const tab = cva(
    [
        'relative flex flex-row items-center overflow-x-auto transition-all ease-out duration-[150ms]',
        'text-center font-medium leading-[normal]',
        'outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20',
    ],
    {
        variants: {
            /**
             * @description The layout of the tab.
             * @default 'flat'
             */
            layout: {
                flat: 'text-black/75 dark:text-white border-b border-black/20 dark:border-white/20 p-0 !rounded-none',
                blocky: 'text-black/75 dark:text-white/75 border border-black/15 dark:border-white/15',
            },
            /* Size is at tabOverlay */
            /**
             * @description The rounding of the tab.
             * @default 'full'
             */
            rounding: {
                none: 'rounded-none',
                full: 'rounded-full',
                sm: 'rounded-md',
                md: 'rounded-lg',
                lg: 'rounded-xl',
                xl: 'rounded-2xl',
            },
        },
        defaultVariants: {
            layout: 'flat',
            /* Size is at tabOverlay */
            rounding: 'full',
        },
    },
);

const tabOverlay = cva(['rounded-md'], {
    variants: {
        /**
         * @description The size of the tab.
         * @default 'md'
         */
        size: {
            sm: 'p-1 text-xs',
            md: 'p-1.5 text-sm',
            lg: 'p-2 text-base',
            xl: 'p-2.5 text-base',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

const tabItem = cva(
    [
        'flex flex-row flex-shrink-0 gap-2.5 h-full items-center justify-center z-10 rounded-md ease-out duration-[150ms]',
        'text-center font-medium leading-[normal] focus:font-bold',
        'outline-none',
    ],
    {
        variants: {
            /**
             * @description The size of the tab item.
             * @default 'md'
             */
            size: {
                sm: 'px-3.5 py-2 text-sm',
                md: 'px-4 py-3 text-sm',
                lg: 'px-[18px] py-3 text-base',
                xl: 'px-[18px] py-3.5 text-base',
            },
            /**
             * @description The rounding of the tab item.
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
             * @description The layout of the tab item.
             * @default 'flat'
             */
            layout: {
                flat: '',
                blocky: '',
            },
            /**
             * @description Whether the tab item is disabled.
             * @default false
             */
            disabled: {
                true: '!opacity-50 cursor-not-allowed',
            },
            /**
             * @description Whether the tab item is selected.
             * @default false
             */
            selected: {
                true: '',
                false: '',
            },
            /**
             * @description Whether the tab item is mounted.
             * @default true
             */
            mounted: {
                true: '',
            },
        },
        compoundVariants: [
            {
                selected: true,
                layout: 'blocky',
                className: 'text-black dark:text-white hover:enabled:bg-white/10 dark:hover:enabled:bg-black/10',
            },
            {
                selected: true,
                mounted: false,
                layout: 'blocky',
                className: 'bg-black/15 dark:bg-white/15',
            },
            {
                selected: false,
                layout: 'blocky',
                className:
                    'text-black dark:text-white active:enabled:bg-transparent dark:active:enabled:bg-transparent',
            },
            {
                selected: true,
                layout: 'flat',
                className: 'text-black dark:text-white',
            },
            {
                selected: true,
                mounted: false,
                layout: 'flat',
                className: 'border-b-2 border-b-black dark:border-b-white',
            },
            {
                selected: false,
                layout: 'flat',
                className: 'text-black/75 dark:text-white/75 hover:enabled:text-black dark:hover:enabled:text-white',
            },
        ],
        defaultVariants: {
            size: 'md',
            rounding: 'md',
            layout: 'flat',
            disabled: false,
            selected: false,
            mounted: false,
        },
    },
);

const pill = cva(['h-full top-0 left-0 bottom-0 transition-all ease-out duration-[150ms]'], {
    variants: {
        /**
         * @description The layout of the pill.
         * @default 'flat'
         */
        layout: {
            flat: 'border-b-2 border-b-black dark:border-b-white !rounded-b-none',
            blocky: 'bg-black/10 dark:bg-white/10',
            overlay: 'bg-black dark:bg-white opacity-10',
        },
        /**
         * @description The rounding of the tab.
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
         * @description Whether the pill is disabled.
         * @default false
         */
        disabled: {
            true: 'opacity-50',
        },
        /**
         * @description Whether the pill is hidden.
         * @default false
         */
        hidden: {
            true: 'opacity-0',
        },
    },
    defaultVariants: {
        layout: 'flat',
        rounding: 'full',
        disabled: false,
        hidden: false,
    },
});

const pillWrapper = cva(['absolute w-full h-full top-0 left-0 bottom-0 right-0 pointer-events-none'], {
    variants: {
        /**
         * @description The layout of the pill wrapper.
         * @default 'flat'
         */
        layout: {
            flat: 'p-0 rounded-none',
            blocky: '',
            overlay_blocky: '',
            overlay_flat: 'p-0 py-1.5 rounded-none',
        },
    },
    defaultVariants: {
        layout: 'flat',
    },
});

/**
 * @description A tab component.
 * @example <Tab tabs={[{ id: 'tab-1', label: 'Tab 1' }, { id: 'tab-2', label: 'Tab 2' }]} activeTab="1" onTabChange={(tabId) => console.log("Selected tab:", tabId)} />
 * @requires `react-use` via NPM.
 */
const Tab = React.forwardRef<HTMLDivElement, TabProps>(function Tab(
    {
        tabs,
        activeTab,
        onTabChange,
        className,
        layout = 'flat',
        size,
        rounding,
        onPointerMove,
        onPointerLeave,
        ...props
    },
    ref,
) {
    const ids = new LabelId();
    const ariaLabel = props['aria-label'] || 'Tab';
    delete props['aria-label'];

    const customRef = React.useRef<HTMLDivElement>(null);
    const defaultRef = ref ?? customRef;

    const [isMounted, setIsMounted] = useState(false);
    const [currentItemWidth, setCurrentItemWidth] = useState(0);
    const [currentOverallWidth, setCurrentOverallWidth] = useState(0);
    const [hoveredTabIndex, setHoveredTabIndex] = useState<number | null>(null);
    const [isInitialHover, setIsInitialHover] = useState<boolean>(true);
    const [hoveredItemWidth, setHoveredItemWidth] = useState(0);
    const [hoveredOverallWidth, setHoveredOverallWidth] = useState(0);

    const [imRef, { width: iWidth }] = useMeasure();

    const selectedTab = tabs.find((tab) => tab.id === activeTab);
    const selectedTabIndex = tabs.findIndex((tab) => tab.id === activeTab);

    const itemRefs: {
        tabId: string;
        node: HTMLButtonElement | null;
    }[] = useMemo(
        () =>
            tabs.map((tab) => ({
                tabId: tab.id,
                node: null,
            })),
        [tabs],
    );

    /**
     * @description Changes the hovered tab.
     * @param index The index of the tab.
     */
    const changeHoveredTab = (index: number) => {
        if (hoveredTabIndex === null) setIsInitialHover(true);

        if (index === -1) {
            setHoveredTabIndex(null);
            setIsInitialHover(true);
            return;
        }

        if (hoveredTabIndex === index) return;
        if (hoveredTabIndex !== null) setIsInitialHover(false);

        setHoveredTabIndex(index);
    };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const itemRef = itemRefs.find((item) => item.tabId === activeTab);

        if (itemRef?.node) setCurrentItemWidth(itemRef.node.getBoundingClientRect().width);

        setCurrentOverallWidth(
            itemRefs
                .filter((_, index) => index < selectedTabIndex)
                .reduce((totalWidth, item) => totalWidth + (item.node?.getBoundingClientRect()?.width ?? 0), 0),
        );
    }, [activeTab, selectedTabIndex, iWidth, itemRefs, tabs]);

    useEffect(() => {
        if (hoveredTabIndex === null) return;

        const itemRef = itemRefs[hoveredTabIndex];

        if (!itemRef) return;

        if (itemRef?.node) setHoveredItemWidth(itemRef.node.getBoundingClientRect().width);

        setHoveredOverallWidth(
            itemRefs
                .filter((_, index) => index < hoveredTabIndex)
                .reduce((totalWidth, item) => totalWidth + (item.node?.getBoundingClientRect()?.width ?? 0), 0),
        );
    }, [hoveredTabIndex, iWidth, itemRefs, tabs]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (hoveredTabIndex === null) return;
                setHoveredTabIndex(null);
            }

            if (!('current' in defaultRef)) return;
            if (!defaultRef.current?.contains(document.activeElement)) return;

            if (
                event.key === 'ArrowLeft' ||
                event.key === 'ArrowRight' ||
                event.key === 'ArrowUp' ||
                event.key === 'ArrowDown'
            ) {
                const focusedIndex = itemRefs.findIndex((item) => item.node === document.activeElement);
                if (focusedIndex === -1) return;

                let nextIndex;
                if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                    event.preventDefault();

                    nextIndex = focusedIndex - 1;
                    if (nextIndex < 0) nextIndex = itemRefs.length - 1;
                } else {
                    event.preventDefault();

                    nextIndex = focusedIndex + 1;
                    if (nextIndex >= itemRefs.length) nextIndex = 0;
                }

                const nextItem = itemRefs[nextIndex];
                if (!nextItem) return;

                nextItem.node?.focus();
            }
        };

        function handleFocusOut(event: FocusEvent) {
            if (!('current' in defaultRef)) return;

            if (!defaultRef.current?.contains(event.relatedTarget as Node)) {
                setHoveredTabIndex(null);
            }
        }

        document.addEventListener('focusout', handleFocusOut);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('focusout', handleFocusOut);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [activeTab, defaultRef, hoveredTabIndex, itemRefs, onTabChange, tabs]);

    const tabClass = tab({ layout, rounding });
    const tabOverlayClass = tabOverlay({ size });

    return (
        <div
            ref={defaultRef}
            id={ids.create('tablist')}
            role="tablist"
            aria-label={ariaLabel}
            className={cn(tabOverlayClass, tabClass, className)}
            onPointerMove={(event) => {
                onPointerMove?.(event);

                const index = itemRefs.findIndex(
                    (item) => item.node === (event.target as Node) || item.node?.contains(event.target as Node),
                );

                changeHoveredTab(index);
            }}
            onPointerLeave={(event) => {
                onPointerLeave?.(event);

                setHoveredTabIndex(null);
            }}
            {...props}
        >
            {tabs.map((tab, index) => {
                const itemRef = itemRefs.find((item) => item.tabId === tab.id);

                const styles = layout === 'flat' && {
                    transitionProperty:
                        'color, background-color, border-color, text-decoration-color, fill, stroke, opacity',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                };

                return (
                    <button
                        key={index}
                        ref={(node) => {
                            if (itemRef) itemRef.node = node;

                            if (index !== 0) return;

                            imRef(node as Element);
                        }}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-disabled={tab.disabled}
                        aria-controls={ids.get('tablist')}
                        aria-label="Tab"
                        onClick={() => onTabChange(tab.id)}
                        onFocus={() => changeHoveredTab(index)}
                        disabled={tab.disabled}
                        className={cn(
                            tabItem({
                                selected: activeTab === tab.id,
                                mounted: isMounted,
                                layout,
                                size,
                                rounding,
                                disabled: tab.disabled,
                            }),
                        )}
                        style={styles || {}}
                        type="button"
                    >
                        {tab.label}
                    </button>
                );
            })}
            <div aria-hidden="true" className={cn(tabOverlayClass, pillWrapper({ layout }))}>
                {isMounted && (
                    <div
                        className={cn(
                            tabOverlay({ size: null }),
                            pill({
                                layout,
                                rounding,
                                disabled: selectedTab?.disabled,
                                hidden: !selectedTab,
                            }),
                        )}
                        style={{
                            width: currentItemWidth,
                            transform: `translateX(${currentOverallWidth}px)`,
                        }}
                    ></div>
                )}
            </div>
            <div
                aria-hidden="true"
                className={cn(
                    tabOverlayClass,
                    pillWrapper({ layout: `overlay_${layout}` as `overlay_${'blocky' | 'flat'}` }),
                )}
            >
                {isMounted && (
                    <div
                        className={cn(
                            tabOverlay({ size: null }),
                            pill({
                                layout: 'overlay',
                                rounding,
                                disabled: selectedTab?.disabled,
                                hidden:
                                    hoveredTabIndex === null ||
                                    tabs.find((tab) => tab.id === tabs[hoveredTabIndex].id)?.disabled,
                            }),
                            'duration-[150ms]',
                        )}
                        style={{
                            width: hoveredItemWidth,
                            transform: `translateX(${hoveredOverallWidth}px)`,
                            transitionProperty: isInitialHover ? 'opacity' : 'opacity, transform, width',
                        }}
                    ></div>
                )}
            </div>
        </div>
    );
});

Tab.displayName = 'Tab';
export default Tab;
