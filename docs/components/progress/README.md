# Progress

Progress components are used to display the progress of a task or action. They can be used to show the completion status of a process.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Progress from '@/components/Progress';

const Example = () => {
    return <Progress value={50} max={100} />;
};
```

```tsx
import Progress from '@/components/Progress';

const Example = () => {
    return <Progress value={75} max={100} appearance="glossy" size="lg" rounding="none" disabled={false} />;
};
```

### Props

| Name       | Type                                               | Default  | Description                                          |
| ---------- | -------------------------------------------------- | -------- | ---------------------------------------------------- |
| value      | `number`                                           |          | The current value of the progress bar.               |
| max        | `number`                                           | `100`    | The maximum value of the progress bar.               |
| appearance | `'normal' \| 'glossy'`                             | `normal` | The appearance of the progress bar.                  |
| size       | `'sm' \| 'md' \| 'lg' \| 'xl'`                     | `md`     | The size of the progress bar.                        |
| rounding   | `'none' \| 'full' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `full`   | The rounding of the progress bar.                    |
| disabled   | `boolean`                                          | `false`  | Whether the progress bar is disabled.                |
| className  | `string`                                           |          | Additional class names to apply to the progress bar. |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
