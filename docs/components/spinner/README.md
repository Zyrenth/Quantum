# Spinner

Spinner components are used to indicate loading or processing states. They can be used to show that an action is in progress.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Spinner from '@/components/Spinner';

const Example = () => {
    return <Spinner />;
};
```

```tsx
import Spinner from '@/components/Spinner';

const Example = () => {
    return <Spinner size={32} />;
};
```

```tsx
import Spinner from '@/components/Spinner';

const Example = () => {
    return <Spinner size={64} secondsPerTurn={2} />;
};
```

```tsx
import Spinner from '@/components/Spinner';

const Example = () => {
    return <Spinner size={128} strokeWidth={1.5} />;
};
```

### Props

| Name           | Type     | Default | Description                                     |
| -------------- | -------- | ------- | ----------------------------------------------- |
| secondsPerTurn | `number` | `1`     | The seconds per turn of the spinner.            |
| size           | `number` | `64`    | The size of the spinner.                        |
| strokeWidth    | `number` |         | The stroke width of the spinner.                |
| className      | `string` |         | Additional class names to apply to the spinner. |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
