# Checkbox

Checkbox components are used to allow users to select one or more options from a set. They can be used in forms, settings, and other user interfaces where multiple selections are needed.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Checkbox from '@/components/Checkbox';

const Example = () => {
    return (
        <Checkbox
            onChange={(event) =>
                alert(event.target.checked ? 'You have checked the checkbox.' : 'You have unchecked the checkbox.')
            }
        />
    );
};
```

### Props

| Name          | Type                                               | Default  | Description                                        |
| ------------- | -------------------------------------------------- | -------- | -------------------------------------------------- |
| disabled      | `boolean`                                          | `false`  | Whether the checkbox is disabled.                  |
| checked       | `boolean`                                          | `false`  | Whether the checkbox is checked.                   |
| appearance    | `'normal' \| 'glossy'`                             | `normal` | The appearance of the checkbox.                    |
| size          | `'sm' \| 'md' \| 'lg' \| 'xl'`                     | `md`     | The size of the checkbox.                          |
| rounding      | `'none' \| 'full' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `md`     | The rounding of the checkbox.                      |
| indeterminate | `boolean`                                          | `false`  | Whether the checkbox is in an indeterminate state. |
| className     | `string`                                           |          | Additional class names to apply to the checkbox.   |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
