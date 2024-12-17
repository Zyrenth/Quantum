# Text-input

TextInput components are used to display a text input field. They can be used to allow users to input single-line text.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import TextInput from '@/components/TextInput';

const Example = () => {
    return <TextInput placeholder="Type here..." />;
};
```

```tsx
import TextInput from '@/components/TextInput';

const Example = () => {
    return <TextInput type="email" placeholder="Enter your email" trailingElement={<button>Submit</button>} />;
};
```

### Props

| Name            | Type                                                            | Default  | Description                                   |
| --------------- | --------------------------------------------------------------- | -------- | --------------------------------------------- |
| type            | `'text' \| 'password' \| 'email' \| 'number' \| 'tel' \| 'url'` | `'text'` | The type of the input.                        |
| disabled        | `boolean`                                                       | `false`  | Whether the input is disabled.                |
| leadingElement  | `React.ReactNode`                                               |          | Element to display at the start of the input. |
| trailingElement | `React.ReactNode`                                               |          | Element to display at the end of the input.   |
| size            | `'sm' \| 'md' \| 'lg' \| 'xl'`                                  | `md`     | The size of the input.                        |
| rounding        | `'none' \| 'full' \| 'sm' \| 'md' \| 'lg' \| 'xl'`              | `md`     | The rounding of the input.                    |
| className       | `string`                                                        |          | Additional class names to apply to the input. |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
