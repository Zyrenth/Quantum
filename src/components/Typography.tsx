'use client';

import { cva } from 'class-variance-authority';
import React, { BaseHTMLAttributes } from 'react';

import { cn } from '<{utils}>/class';

interface HProps extends BaseHTMLAttributes<HTMLHeadingElement> {}
interface PProps extends BaseHTMLAttributes<HTMLParagraphElement> {}
interface BlockquoteProps extends BaseHTMLAttributes<HTMLQuoteElement> {}
interface SubtextProps extends BaseHTMLAttributes<HTMLSpanElement> {}

const heading1 = cva(['flex flex-row items-center gap-2.5', 'font-bold text-4xl']);
const heading2 = cva([
    'flex flex-row items-center gap-2.5',
    'border-b border-b-black/20 dark:border-b-white/20',
    'font-bold text-3xl',
]);
const heading3 = cva([
    'flex flex-row items-center gap-2.5',
    'border-b border-b-black/20 dark:border-b-white/20',
    'font-bold text-2xl',
]);
const heading4 = cva([
    'flex flex-row items-center gap-2.5',
    'border-b border-b-black/20 dark:border-b-white/20',
    'font-bold text-xl',
]);
const heading5 = cva([
    'flex flex-row items-center gap-2.5',
    'border-b border-b-black/20 dark:border-b-white/20',
    'font-bold text-lg',
]);
const heading6 = cva([
    'flex flex-row items-center gap-2.5',
    'border-b border-b-black/20 dark:border-b-white/20',
    'font-bold text-md',
]);

const paragraph = cva(['flex flex-row items-center gap-2.5', 'font-normal text-base']);
const blockquote = cva([
    'flex flex-row flex-wrap items-center gap-2.5 pl-4',
    'border-l-4 border-l-black/20 dark:border-l-white/20',
    'font-normal text-base italic',
]);
const subtext = cva(['flex flex-row items-center gap-2.5', 'font-normal text-sm text-black/50 dark:text-white/50']);

const H = (classes: typeof heading1) =>
    React.forwardRef<HTMLHeadingElement, HProps>(function H({ children, className, ...props }, ref) {
        const headingClass = classes();

        return (
            <h1 ref={ref} role="separator" className={cn(headingClass, className)} {...props}>
                {children}
            </h1>
        );
    });

/**
 * @description Heading level 1 element.
 * @example <H1>Heading 1</H1>
 */
const H1 = H(heading1);

/**
 * @description Heading level 2 element.
 * @example <H2>Heading 2</H2>
 */
const H2 = H(heading2);

/**
 * @description Heading level 3 element.
 * @example <H3>Heading 3</H3>
 */
const H3 = H(heading3);

/**
 * @description Heading level 4 element.
 * @example <H4>Heading 4</H4>
 */
const H4 = H(heading4);

/**
 * @description Heading level 5 element.
 * @example <H5>Heading 5</H5>
 */
const H5 = H(heading5);

/**
 * @description Heading level 6 element.
 * @example <H6>Heading 6</H6>
 */
const H6 = H(heading6);

/**
 * @description Paragraph element.
 * @example <P>Paragraph</P>
 */
const P = React.forwardRef<HTMLParagraphElement, PProps>(function P({ children, className, ...props }, ref) {
    const paragraphClass = paragraph();

    return (
        <p ref={ref} role="separator" className={cn(paragraphClass, className)} {...props}>
            {children}
        </p>
    );
});

/**
 * @description Blockquote element.
 * @example <Blockquote>I really liked the XYZ product.</Blockquote>
 */
const Blockquote = React.forwardRef<HTMLQuoteElement, BlockquoteProps>(function Blockquote(
    { children, className, ...props },
    ref,
) {
    const blockquoteClass = blockquote();

    return (
        <blockquote ref={ref} role="separator" className={cn(blockquoteClass, className)} {...props}>
            {children}
        </blockquote>
    );
});

/**
 * @description Subtext element.
 * @example <Subtext>Additional information: ...</Subtext>
 */
const Subtext = React.forwardRef<HTMLSpanElement, SubtextProps>(function Subtext(
    { children, className, ...props },
    ref,
) {
    const subtextClass = subtext();

    return (
        <span ref={ref} role="separator" className={cn(subtextClass, className)} {...props}>
            {children}
        </span>
    );
});

H1.displayName = 'Heading 1';
H2.displayName = 'Heading 2';
H3.displayName = 'Heading 3';
H4.displayName = 'Heading 4';
H5.displayName = 'Heading 5';
H6.displayName = 'Heading 6';
P.displayName = 'Paragraph';
Blockquote.displayName = 'Blockquote';
Subtext.displayName = 'Subtext';

export { Blockquote, H1, H2, H3, H4, H5, H6, P, Subtext };
