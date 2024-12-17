# Codeblock

Codeblock components are used to display code with syntax highlighting. They can be used to present code snippets.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Codeblock from '@/components/Codeblock';

const Example = () => {
    return <Codeblock content={`const hello = "world";`} language="javascript" />;
};
```

```tsx
import Codeblock from '@/components/Codeblock';

const Example = () => {
    return (
        <Codeblock
            content={`const hello = "world";`}
            language="javascript"
            showLineNumbers={true}
            allowCopy={true}
            allowDownload={true}
            filename="example.js"
        />
    );
};
```

### Props

| Name                | Type                                     | Default  | Description                                                                                                                        |
| ------------------- | ---------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| content             | `string`                                 | `''`     | The content of the codeblock.                                                                                                      |
| hideHeader          | `boolean`                                | `false`  | Whether to hide the header of the codeblock.                                                                                       |
| showLineNumbers     | `boolean`                                | `true`   | Whether to show line numbers in the codeblock.                                                                                     |
| filename            | `string`                                 |          | The filename that's displayed in the header of the codeblock and used for downloading.                                             |
| language            | `string`                                 |          | The programming language of the content.                                                                                           |
| allowCopy           | `boolean`                                | `true`   | Whether to allow copying the content of the codeblock.                                                                             |
| allowDownload       | `boolean`                                | `false`  | Whether to allow downloading the content of the codeblock.                                                                         |
| fixCodeIndentation  | `boolean`                                | `true`   | Whether to fix the code indentation. Experimental: Might return an unexpected output if the input code is not formatted correctly. |
| disableHighlighting | `boolean`                                | `false`  | Whether to disable syntax highlighting.                                                                                            |
| highlightedLines    | `number[]`                               |          | The line numbers to highlight in the codeblock. Highlight color: blue                                                              |
| addedLines          | `number[]`                               |          | The line numbers to add in the codeblock. Highlight color: green                                                                   |
| removedLines        | `number[]`                               |          | The line numbers to remove in the codeblock. Highlight color: red                                                                  |
| appearance          | `'normal' \| 'glossy'`                   | `normal` | The appearance of the codeblock.                                                                                                   |
| size                | `'sm' \| 'md' \| 'lg' \| 'xl'`           | `md`     | The size of the codeblock.                                                                                                         |
| rounding            | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `md`     | The rounding of the codeblock.                                                                                                     |
| className           | `string`                                 |          | Additional class names to apply to the codeblock.                                                                                  |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
