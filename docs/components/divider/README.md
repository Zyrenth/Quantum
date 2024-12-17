# Divider

Divider components are used to separate content. They can be used to create a visual break between sections of content.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Divider from '@/components/Divider';

const Example = () => {
    return <Divider orientation="horizontal" label="OR" />;
};
```

```tsx
import Divider from '@/components/Divider';

const Example = () => {
    return (
        <div>
            <p>Content above the divider</p>
            <Divider orientation="horizontal" />
            <p>Content below the divider</p>
        </div>
    );
};
```

### Props

| Name        | Type                         | Default      | Description                                     |
| ----------- | ---------------------------- | ------------ | ----------------------------------------------- |
| label       | `string`                     |              | The label to display between the divider lines. |
| orientation | `'horizontal' \| 'vertical'` | `horizontal` | The orientation of the divider.                 |
| className   | `string`                     |              | Additional class names to apply to the divider. |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
