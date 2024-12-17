# Button-group

ButtonGroup components are used to group multiple buttons together. They can be used to organize buttons in a horizontal or vertical layout.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import ButtonGroup from '@/components/ButtonGroup';
import Button from '@/components/Button';

const Example = () => {
    return (
        <ButtonGroup orientation="horizontal">
            <Button>Button 1</Button>
            <Button>Button 2</Button>
            <Button>Button 3</Button>
        </ButtonGroup>
    );
};
```

```tsx
import ButtonGroup from '@/components/ButtonGroup';
import Button from '@/components/Button';

const Example = () => {
    return (
        <ButtonGroup orientation="vertical">
            <Button>Button 1</Button>
            <Button>Button 2</Button>
            <Button>Button 3</Button>
        </ButtonGroup>
    );
};
```

### Props

| Name        | Type                         | Default      | Description                                          |
| ----------- | ---------------------------- | ------------ | ---------------------------------------------------- |
| orientation | `'horizontal' \| 'vertical'` | `horizontal` | The orientation of the button group.                 |
| className   | `string`                     |              | Additional class names to apply to the button group. |
| children    | `React.ReactNode`            |              | The buttons to be displayed within the group.        |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
