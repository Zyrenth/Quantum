# Popout

Popout components are used to display content in a popover or tooltip. They can be used to present additional information or actions.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Popout from '@/components/Popout';
import Button from '@/components/Button';

const Example = () => {
    return (
        <Popout content="This is a tooltip." isHoverable>
            <Button>Hover over me</Button>
        </Popout>
    );
};
```

```tsx
import Popout from '@/components/Popout';
import Button from '@/components/Button';

const Example = () => {
    return (
        <Popout content="This is a popover." isToggleable>
            <Button>Click me</Button>
        </Popout>
    );
};
```

### Props

| Name             | Type                                                                                                                                                                                     | Default   | Description                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| content          | `string \| React.ReactNode`                                                                                                                                                              |           | The content to display in the popout.                                                       |
| hoverDelay       | `number`                                                                                                                                                                                 |           | The delay in milliseconds before the popout is shown when hovering over the parent element. |
| wrapperClassName | `string`                                                                                                                                                                                 |           | The class name(s) to apply to the popout wrapper.                                           |
| isToggleable     | `boolean`                                                                                                                                                                                | `false`   | Whether the popout is toggleable. AKA. a popover.                                           |
| isHoverable      | `boolean`                                                                                                                                                                                | `false`   | Whether the popout is hoverable. AKA. a tooltip.                                            |
| size             | `'sm' \| 'md' \| 'lg' \| 'xl'`                                                                                                                                                           | `md`      | The size of the popout.                                                                     |
| rounding         | `'none' \| 'full' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                                                                                                       | `md`      | The rounding of the popout.                                                                 |
| orientation      | `'topLeft' \| 'topCenter' \| 'topRight' \| 'bottomLeft' \| 'bottomCenter' \| 'bottomRight' \| 'leftTop' \| 'leftCenter' \| 'leftBottom' \| 'rightTop' \| 'rightCenter' \| 'rightBottom'` | `leftTop` | The orientation of the popout.                                                              |
| showArrow        | `boolean`                                                                                                                                                                                | `false`   | Whether to show the arrow on the popout.                                                    |
| className        | `string`                                                                                                                                                                                 |           | Additional class names to apply to the popout.                                              |
| children         | `React.ReactNode`                                                                                                                                                                        |           | The content of the popout.                                                                  |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
