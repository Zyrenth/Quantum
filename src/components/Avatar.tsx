'use client';

import { cva, VariantProps } from 'class-variance-authority';
import React, { ImgHTMLAttributes, useState } from 'react';

import { cn } from '<{utils}>/class';

type Props = VariantProps<typeof avatar>;
interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement>, Props {
    /**
     * @description A fallback element to display when the image fails to load.
     */
    fallback?: string | React.ReactNode;
}

const avatar = cva(
    [
        'relative flex items-center justify-center gap-2.5 rounded-full transition-all ease-out duration-[150ms] overflow-hidden',
        'text-center font-medium leading-[normal]',
        'bg-black/10 text-black dark:bg-white/10 dark:text-white border border-black/10 dark:border-white/10',
    ],
    {
        variants: {
            /**
             * @description The appearance of the avatar element.
             * @default 'normal'
             */
            appearance: {
                normal: '',
                glossy: 'bg-gradient-to-b from-black/10 to-black/20 dark:from-white/20 dark:to-white/10 !bg-transparent',
            },
            /**
             * @description The size of the avatar.
             * @default 'md'
             */
            size: {
                sm: 'w-[42px] h-[42px] text-sm',
                md: 'w-12 h-12 text-base',
                lg: 'w-[55px] h-[55px] text-lg',
                xl: 'w-[62px] h-[62px] text-xl',
            },
            /**
             * @description The rounding of the avatar.
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
            appearance: 'normal',
            size: 'md',
            rounding: 'full',
        },
    },
);

/**
 * @description An avatar component.
 * @example <Avatar src="https://example.com/image.jpg" alt="An avatar image." />
 * @example <Avatar src="https://example.com/image.jpg" alt="An avatar image." fallback="ZR" />
 * @example <Avatar alt="An avatar image." fallback="ZR" />
 */
const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(function Avatar(
    { className, appearance, size, rounding, fallback, src, alt, width, height, onLoad, onError, ...props },
    ref,
) {
    const ariaLabel = props['aria-label'] || (alt ?? 'An avatar image.');
    delete props['aria-label'];

    const [imageLoaded, setImageLoaded] = useState(false);

    /**
     * @description Hides the image if it fails to load.
     * @param event The event object.
     * @param value The value to set the image loaded state to.
     */
    const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>, value: boolean) => {
        if (value) event.currentTarget.style.display = 'unset';
        else event.currentTarget.style.display = 'none';

        setImageLoaded(value);
    };

    const avatarClass = avatar({ appearance, size, rounding });

    const image = (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt ?? 'An avatar image.'}
            aria-label={ariaLabel}
            width={+(width ?? 512)}
            height={+(height ?? 512)}
            className={cn('absolute w-full h-full object-cover top-0 left-0', className)}
            onError={(event) => {
                onError?.(event);
                handleImageLoad(event, false);
            }}
            onLoad={(event) => {
                onLoad?.(event);
                handleImageLoad(event, true);
            }}
            {...props}
        />
    );

    return (
        <div ref={ref} role="img" aria-label={ariaLabel} className={cn(avatarClass)}>
            {fallback && !imageLoaded && fallback}
            {src && image}
        </div>
    );
});

Avatar.displayName = 'Avatar';
export default Avatar;
