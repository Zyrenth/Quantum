# Radio

Radio components are used to allow users to select one option from a set. They can be used in forms, settings, and other user interfaces where a single selection is needed.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Radio from '@/components/Radio';

const Example = () => {
    return <Radio onChange={(event) => alert('You have checked the radio.')} />;
};
```

### Props

| Name       | Type                                               | Default  | Description                                   |
| ---------- | -------------------------------------------------- | -------- | --------------------------------------------- |
| checked    | `boolean`                                          | `false`  | Whether the radio is checked.                 |
| disabled   | `boolean`                                          | `false`  | Whether the radio is disabled.                |
| appearance | `'normal' \| 'glossy'`                             | `normal` | The appearance of the radio.                  |
| size       | `'sm' \| 'md' \| 'lg' \| 'xl'`                     | `md`     | The size of the radio.                        |
| rounding   | `'none' \| 'full' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `full`   | The rounding of the radio.                    |
| className  | `string`                                           |          | Additional class names to apply to the radio. |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
