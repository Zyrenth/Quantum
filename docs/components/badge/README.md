# Badge

Badge components are used to display a small piece of information or status indicator. They can be used to highlight important information, such as notifications or counts.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Badge from '@/components/Badge';

const Example = () => {
    return <Badge variant="primary">Badge</Badge>;
};
```

```tsx
import Badge from '@/components/Badge';

const Example = () => {
    return (
        <Badge variant="secondary" size="lg" rounding="none">
            Large Badge
        </Badge>
    );
};
```

### Props

| Name       | Type                                               | Default   | Description                                   |
| ---------- | -------------------------------------------------- | --------- | --------------------------------------------- |
| disabled   | `boolean`                                          | `false`   | Whether the badge is disabled.                |
| variant    | `'primary' \| 'secondary' \| 'outline' \| ...`     | `primary` | The variant of the badge.                     |
| appearance | `'normal' \| 'glossy'`                             | `normal`  | The appearance of the badge.                  |
| tone       | `'solid' \| 'soft'`                                | `solid`   | The tone of the badge.                        |
| size       | `'sm' \| 'md' \| 'lg' \| 'xl'`                     | `md`      | The size of the badge.                        |
| rounding   | `'none' \| 'full' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `full`    | The rounding of the badge.                    |
| className  | `string`                                           |           | Additional class names to apply to the badge. |
| children   | `React.ReactNode`                                  |           | The content of the badge.                     |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
