# Text-field

TextField components are used to display a text area input. They can be used to allow users to input multi-line text.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import TextField from '@/components/TextField';

const Example = () => {
    return <TextField placeholder="Type here..." />;
};
```

```tsx
import TextField from '@/components/TextField';

const Example = () => {
    return <TextField placeholder="Type here..." rows={5} />;
};
```

```tsx
import TextField from '@/components/TextField';

const Example = () => {
    return <TextField placeholder="Type here..." maxLength={100} />;
};
```

### Props

| Name              | Type                                     | Default | Description                                        |
| ----------------- | ---------------------------------------- | ------- | -------------------------------------------------- |
| disabled          | `boolean`                                | `false` | Whether the text area is disabled.                 |
| maxLength         | `number`                                 |         | Maximum length of the text area.                   |
| warningPercentage | `number`                                 | `10`    | The warning percentage of the text area.           |
| topElement        | `React.ReactNode`                        |         | Element to display at the top of the text area.    |
| bottomElement     | `React.ReactNode`                        |         | Element to display at the bottom of the text area. |
| unresizable       | `boolean`                                | `false` | Whether the text area is unresizable.              |
| size              | `'sm' \| 'md' \| 'lg' \| 'xl'`           | `md`    | The size of the text area.                         |
| rounding          | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `md`    | The rounding of the text area.                     |
| className         | `string`                                 |         | Additional class names to apply to the text area.  |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
