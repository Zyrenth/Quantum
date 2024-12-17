# Typography

Typography components are used to display text in various styles and formats. They can be used to present headings, paragraphs, blockquotes, and subtext.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import { H1, H2, H3, H4, H5, H6, P, Blockquote, Subtext } from '@/components/Typography';

const Example = () => {
    return (
        <div>
            <H1>Heading 1</H1>
            <H2>Heading 2</H2>
            <H3>Heading 3</H3>
            <H4>Heading 4</H4>
            <H5>Heading 5</H5>
            <H6>Heading 6</H6>
            <P>Paragraph</P>
            <Blockquote>I really liked the XYZ product.</Blockquote>
            <Subtext>Additional information: ...</Subtext>
        </div>
    );
};
```

### Props

#### H1, H2, H3, H4, H5, H6

| Name      | Type              | Default | Description                                     |
| --------- | ----------------- | ------- | ----------------------------------------------- |
| className | `string`          |         | Additional class names to apply to the heading. |
| children  | `React.ReactNode` |         | The content of the heading.                     |

#### P

| Name      | Type              | Default | Description                                       |
| --------- | ----------------- | ------- | ------------------------------------------------- |
| className | `string`          |         | Additional class names to apply to the paragraph. |
| children  | `React.ReactNode` |         | The content of the paragraph.                     |

#### Blockquote

| Name      | Type              | Default | Description                                        |
| --------- | ----------------- | ------- | -------------------------------------------------- |
| className | `string`          |         | Additional class names to apply to the blockquote. |
| children  | `React.ReactNode` |         | The content of the blockquote.                     |

#### Subtext

| Name      | Type              | Default | Description                                     |
| --------- | ----------------- | ------- | ----------------------------------------------- |
| className | `string`          |         | Additional class names to apply to the subtext. |
| children  | `React.ReactNode` |         | The content of the subtext.                     |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
