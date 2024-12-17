# Alert

Alert components are used to display important messages to the user. They can be used to inform the user of a successful action, an error, or a warning.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Alert from '@/components/Alert';

const Example = () => {
    return <Alert variant="primary" title="Hello, world!" description="This is an alert." />;
};
```

```tsx
import Alert from '@/components/Alert';

const Example = () => {
    return (
        <Alert
            variant="primary"
            tone="soft"
            size="lg"
            rounding="none"
            icon={<CheckIcon fill="currentColor" className="w-full h-full" />}
            title="Hello, world!"
            description="This is an alert."
        />
    );
};
```

### Props

| Name          | Type                                               | Default   | Description                                                    |
| ------------- | -------------------------------------------------- | --------- | -------------------------------------------------------------- |
| title         | `string \| React.ReactNode`                        |           | The title of the alert.                                        |
| description   | `string \| React.ReactNode`                        |           | The content of the alert.                                      |
| icon          | `React.ReactNode`                                  |           | The icon to be displayed on the left side of the alert.        |
| showBorder    | `boolean`                                          | `false`   | Whether to show a border on the left side of the alert.        |
| showClose     | `boolean`                                          | `false`   | Whether to show a close button on the right side of the alert. |
| onClose       | `() => void`                                       |           | Fires when the close button is clicked.                        |
| button        | `string`                                           |           | The text of the button.                                        |
| onButtonClick | `() => void`                                       |           | Fires when the button is clicked.                              |
| variant       | `'primary' \| 'secondary' \| 'outline' \| ...`     | `primary` | The variant of the alert.                                      |
| appearance    | `'normal' \| 'glossy'`                             | `normal`  | The appearance of the alert.                                   |
| tone          | `'solid' \| 'soft'`                                | `solid`   | The tone of the alert.                                         |
| size          | `'sm' \| 'md' \| 'lg' \| 'xl'`                     | `md`      | The size of the alert.                                         |
| rounding      | `'none' \| 'full' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `md`      | The rounding of the alert.                                     |
| className     | `string`                                           |           | Additional class names to apply to the alert.                  |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
