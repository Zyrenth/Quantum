# Toggle

Toggle components are used to toggle between two states. They can be used to enable or disable a setting.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Toggle from '@/components/Toggle';

const Example = () => {
    return (
        <Toggle
            onChange={(event) =>
                alert(event.target.checked ? 'You have checked the toggle.' : 'You have unchecked the toggle.')
            }
        />
    );
};
```

```tsx
import Toggle from '@/components/Toggle';

const Example = () => {
    return (
        <Toggle
            checked
            disabled={false}
            size="lg"
            rounding="full"
            onChange={(event) => console.log(event.target.checked)}
        />
    );
};
```

### Props

| Name      | Type                                               | Default | Description                                    |
| --------- | -------------------------------------------------- | ------- | ---------------------------------------------- |
| checked   | `boolean`                                          | `false` | Whether the toggle is checked.                 |
| disabled  | `boolean`                                          | `false` | Whether the toggle is disabled.                |
| size      | `'sm' \| 'md' \| 'lg' \| 'xl'`                     | `md`    | The size of the toggle.                        |
| rounding  | `'none' \| 'full' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `md`    | The rounding of the toggle.                    |
| className | `string`                                           |         | Additional class names to apply to the toggle. |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
