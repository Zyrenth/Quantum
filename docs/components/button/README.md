# Button

Button components are used to trigger actions or events. They can be used to submit forms, open dialogs, or perform other actions.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Button from '@/components/Button';

const Example = () => {
    return <Button variant="primary">Click me</Button>;
};
```

```tsx
import Button from '@/components/Button';

const Example = () => {
    return (
        <Button variant="secondary" disabled>
            Click me
        </Button>
    );
};
```

```tsx
import Button from '@/components/Button';

const Example = () => {
    return <Button appearance="glossy">Click me</Button>;
};
```

### Props

| Name       | Type                                                                | Default   | Description                                    |
| ---------- | ------------------------------------------------------------------- | --------- | ---------------------------------------------- |
| disabled   | `boolean`                                                           | `false`   | Whether the button is disabled.                |
| variant    | `'primary' \| 'secondary' \| 'outline' \| 'link' \| 'blank' \| ...` | `primary` | The variant of the button.                     |
| appearance | `'normal' \| 'glossy'`                                              | `normal`  | The appearance of the button.                  |
| tone       | `'solid' \| 'soft'`                                                 | `solid`   | The tone of the button.                        |
| size       | `'sm' \| 'md' \| 'lg' \| 'xl'`                                      | `md`      | The size of the button.                        |
| rounding   | `'none' \| 'full' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                  | `md`      | The rounding of the button.                    |
| className  | `string`                                                            |           | Additional class names to apply to the button. |
| children   | `React.ReactNode`                                                   |           | The content of the button.                     |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
