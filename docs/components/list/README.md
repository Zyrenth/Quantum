# List

List components are used to display a list of items. They can be used to group related information together.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import List, { ListItem } from '@/components/List';

const Example = () => {
    return (
        <List>
            <ListItem variant="header">Header 1</ListItem>
            <ListItem>Item 1</ListItem>
            <ListItem>Item 2</ListItem>
            <ListItem variant="header">Header 2</ListItem>
            <ListItem>Item 3</ListItem>
            <ListItem>Item 4</ListItem>
        </List>
    );
};
```

### Props

#### List

| Name      | Type                                     | Default | Description                                  |
| --------- | ---------------------------------------- | ------- | -------------------------------------------- |
| rounding  | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `md`    | The rounding of the list.                    |
| className | `string`                                 |         | Additional class names to apply to the list. |
| children  | `React.ReactNode`                        |         | The content of the list.                     |

#### ListItem

| Name      | Type                           | Default | Description                                       |
| --------- | ------------------------------ | ------- | ------------------------------------------------- |
| variant   | `'item' \| 'header'`           | `item`  | The variant of the list item.                     |
| size      | `'sm' \| 'md' \| 'lg' \| 'xl'` | `md`    | The size of the list item.                        |
| className | `string`                       |         | Additional class names to apply to the list item. |
| children  | `React.ReactNode`              |         | The content of the list item.                     |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
