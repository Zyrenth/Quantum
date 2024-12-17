# KBD

KBD components are used to display keyboard keys. They can be used to present keyboard shortcuts.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import KBD from '@/components/KBD';

const Example = () => {
    return <KBD keys={['control', 'shift', 'a']} />;
};
```

```tsx
import KBD from '@/components/KBD';

const Example = () => {
    return (
        <div className="flex flex-row flex-wrap gap-2.5 items-center">
            <KBD variant="filled" keys={['control']} />
            +
            <KBD variant="filled" keys={['shift']} />
            +
            <KBD variant="filled" keys={['Win']} />
            +
            <KBD variant="filled" keys={['alt']} />
            +
            <KBD variant="filled" keys={['L']} />
        </div>
    );
};
```

### Props

| Name       | Type                                               | Default   | Description                                         |
| ---------- | -------------------------------------------------- | --------- | --------------------------------------------------- |
| keys       | `(keyof typeof ShortcutKeys \| string)[]`          |           | The keys to display in the KBD element.             |
| disabled   | `boolean`                                          | `false`   | Whether the KBD element is disabled.                |
| variant    | `'outline' \| 'filled'`                            | `outline` | The variant of the KBD element.                     |
| appearance | `'normal' \| 'glossy'`                             | `normal`  | The appearance of the KBD element.                  |
| size       | `'sm' \| 'md' \| 'lg' \| 'xl'`                     | `md`      | The size of the KBD element.                        |
| rounding   | `'none' \| 'full' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `md`      | The rounding of the KBD element.                    |
| className  | `string`                                           |           | Additional class names to apply to the KBD element. |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
