# Avatar

Avatar components are used to display a user's profile picture or an image representation. They can be used to show a user's identity.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Avatar from '@/components/Avatar';

const Example = () => {
    return <Avatar src="https://example.com/image.jpg" alt="An avatar image." />;
};
```

```tsx
import Avatar from '@/components/Avatar';

const Example = () => {
    return <Avatar src="https://example.com/image.jpg" alt="An avatar image." fallback="ZR" />;
};
```

```tsx
import Avatar from '@/components/Avatar';

const Example = () => {
    return <Avatar alt="An avatar image." fallback="ZR" />;
};
```

### Props

| Name       | Type                                               | Default  | Description                                                 |
| ---------- | -------------------------------------------------- | -------- | ----------------------------------------------------------- |
| fallback   | `string \| React.ReactNode`                        |          | A fallback element to display when the image fails to load. |
| appearance | `'normal' \| 'glossy'`                             | `normal` | The appearance of the avatar element.                       |
| size       | `'sm' \| 'md' \| 'lg' \| 'xl'`                     | `md`     | The size of the avatar.                                     |
| rounding   | `'none' \| 'full' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `full`   | The rounding of the avatar.                                 |
| className  | `string`                                           |          | Additional class names to apply to the avatar.              |
| src        | `string`                                           |          | The source URL of the image.                                |
| alt        | `string`                                           |          | The alt text for the image.                                 |
| width      | `number`                                           | `512`    | The width of the image.                                     |
| height     | `number`                                           | `512`    | The height of the image.                                    |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
