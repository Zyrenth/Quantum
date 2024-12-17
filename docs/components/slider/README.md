# Slider

Slider components are used to display a range input. They can be used to allow users to select a value from a range.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Slider from '@/components/Slider';

const Example = () => {
    return <Slider max={100} />;
};
```

```tsx
import Slider from '@/components/Slider';

const Example = () => {
    return <Slider value={50} max={100} />;
};
```

```tsx
import Slider from '@/components/Slider';

const Example = () => {
    return <Slider max={100} onUpdate={(event) => console.log('Slider value:', event.target.value)} />;
};
```

### Props

| Name          | Type                                                   | Default  | Description                                                                |
| ------------- | ------------------------------------------------------ | -------- | -------------------------------------------------------------------------- |
| checked       | `boolean`                                              | `false`  | Whether the slider is checked.                                             |
| disabled      | `boolean`                                              | `false`  | Whether the slider is disabled.                                            |
| updateTimeout | `number`                                               |          | Time in milliseconds to wait before updating the slider value after input. |
| onUpdate      | `(event: React.ChangeEvent<HTMLInputElement>) => void` |          | Fires when the slider value changes after timeout.                         |
| appearance    | `'normal' \| 'glossy'`                                 | `normal` | The appearance of the slider.                                              |
| size          | `'sm' \| 'md' \| 'lg' \| 'xl'`                         | `md`     | The size of the slider.                                                    |
| rounding      | `'none' \| 'full' \| 'sm' \| 'md' \| 'lg' \| 'xl'`     | `full`   | The rounding of the slider.                                                |
| className     | `string`                                               |          | Additional class names to apply to the slider.                             |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
