'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { BaseHTMLAttributes } from 'react';

import { cn } from '@/utils/class';

import Avatar from '@/components/Avatar';

type Props = VariantProps<typeof avatarGroup>;
interface AvatarGroupProps extends BaseHTMLAttributes<HTMLDivElement>, Props {
    /**
     * @description The maximum number of avatars to display before truncating.
     * @default Infinity
     */
    maxDisplayed?: number;
}

const avatarGroup = cva(
    [
        'flex flex-col',
        '[&>*]:outline [&>*]:outline-4 [&>*]:outline-white dark:[&>*]:outline-black [&:hover>:not(:hover)]:opacity-50 [&:hover>:hover]:z-[999]',
        '[&>*]:[background:linear-gradient(rgba(0,0,0,0.1),rgba(0,0,0,0.1)),linear-gradient(rgba(255,255,255,1),rgba(255,255,255,1))]',
        'dark:[&>*]:[background:linear-gradient(rgba(255,255,255,0.1),rgba(255,255,255,0.1)),linear-gradient(rgba(0,0,0,1),rgba(0,0,0,1))]',
    ],
    {
        variants: {
            /**
             * @description The orientation of the avatar group.
             * @default 'horizontal'
             */
            orientation: {
                horizontal: 'flex-row [&>:not(:first-child)]:ml-[-0.5rem]',
                vertical: 'flex-col [&>:not(:first-child)]:mt-[-0.5rem]',
            },
        },
        defaultVariants: {
            orientation: 'horizontal',
        },
    },
);

/**
 * @description Allows you to group multiple avatars together.
 * @example
 * <AvatarGroup orientation={'horizontal'} maxDisplayed={3}>
 *    <Avatar src="https://example.com/avatar1.jpg" />
 *    <Avatar src="https://example.com/avatar2.jpg" />
 *    <Avatar src="https://example.com/avatar3.jpg" />
 *    <Avatar src="https://example.com/avatar4.jpg" />
 *    <Avatar src="https://example.com/avatar5.jpg" />
 * </AvatarGroup>
 * @requires Avatar
 */
const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
    function AvatarGroup(
        { children, className, orientation, maxDisplayed = Infinity, ...props },
        ref,
    ) {
        const ariaLabel = props['aria-label'] || 'Avatar group';
        delete props['aria-label'];

        const reachedMax =
            maxDisplayed > 0 && React.Children.count(children) > maxDisplayed;
        const content = React.Children.toArray(children);
        const displayedChildren = reachedMax
            ? content.slice(0, maxDisplayed)
            : content;
        const firstProps = (
            React.isValidElement(content[0]) ? content[0].props : {}
        ) as any;

        const avatarGroupClass = avatarGroup({ orientation });

        return (
            <div
                ref={ref}
                aria-label={ariaLabel}
                className={cn(avatarGroupClass, className)}
                {...props}>
                {displayedChildren}
                {!!reachedMax && (
                    <Avatar
                        fallback={
                            reachedMax
                                ? `+${React.Children.count(children) - maxDisplayed}`
                                : undefined
                        }
                        appearance={firstProps?.appearance}
                        size={firstProps?.size}
                        rounding={firstProps?.rounding}
                    />
                )}
            </div>
        );
    },
);

AvatarGroup.displayName = 'AvatarGroup';
export default AvatarGroup;
