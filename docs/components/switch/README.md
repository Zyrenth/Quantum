# Switch

Switch components are used to toggle between two states. They can be used to enable or disable a setting.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Switch from '@/components/Switch';

const Example = () => {
    return <Switch onChange={(event) => console.log(event.target.checked)} />;
};
```

```tsx
import Switch from '@/components/Switch';

const Example = () => {
    return (
        <Switch
            checked
            disabled={false}
            appearance="glossy"
            size="lg"
            rounding="full"
            onChange={(event) => console.log(event.target.checked)}
        />
    );
};
```

### Props

| Name       | Type                                               | Default  | Description                                    |
| ---------- | -------------------------------------------------- | -------- | ---------------------------------------------- |
| checked    | `boolean`                                          | `false`  | Whether the switch is checked.                 |
| disabled   | `boolean`                                          | `false`  | Whether the switch is disabled.                |
| appearance | `'normal' \| 'glossy'`                             | `normal` | The appearance of the switch.                  |
| size       | `'sm' \| 'md' \| 'lg' \| 'xl'`                     | `md`     | The size of the switch.                        |
| rounding   | `'none' \| 'full' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `md`     | The rounding of the switch.                    |
| className  | `string`                                           |          | Additional class names to apply to the switch. |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
