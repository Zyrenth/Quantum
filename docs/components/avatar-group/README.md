# Avatar-group

AvatarGroup components are used to group multiple avatars together. They can be used to display a collection of user profile pictures or image representations.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import AvatarGroup from '@/components/AvatarGroup';
import Avatar from '@/components/Avatar';

const Example = () => {
    return (
        <AvatarGroup orientation="horizontal" maxDisplayed={3}>
            <Avatar src="https://example.com/avatar1.jpg" />
            <Avatar src="https://example.com/avatar2.jpg" />
            <Avatar src="https://example.com/avatar3.jpg" />
            <Avatar src="https://example.com/avatar4.jpg" />
            <Avatar src="https://example.com/avatar5.jpg" />
        </AvatarGroup>
    );
};
```

### Props

| Name         | Type                         | Default      | Description                                                 |
| ------------ | ---------------------------- | ------------ | ----------------------------------------------------------- |
| maxDisplayed | `number`                     | `Infinity`   | The maximum number of avatars to display before truncating. |
| orientation  | `'horizontal' \| 'vertical'` | `horizontal` | The orientation of the avatar group.                        |
| className    | `string`                     |              | Additional class names to apply to the avatar group.        |
| children     | `React.ReactNode`            |              | The avatars to be displayed within the group.               |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
