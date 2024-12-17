# Table

Table components are used to display tabular data. They can be used to organize information into rows and columns.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import { Table, TableRow, TableItem } from '@/components/Table';

const Example = () => {
    return (
        <Table size="sm" rounding="md">
            <TableRow variant="header">
                <TableItem>Name</TableItem>
                <TableItem>Age</TableItem>
            </TableRow>
            <TableRow>
                <TableItem>John Doe</TableItem>
                <TableItem>25</TableItem>
            </TableRow>
            <TableRow>
                <TableItem>Jane Doe</TableItem>
                <TableItem>23</TableItem>
            </TableRow>
        </Table>
    );
};
```

### Props

#### Table

| Name      | Type                                     | Default | Description                                   |
| --------- | ---------------------------------------- | ------- | --------------------------------------------- |
| size      | `'sm' \| 'md' \| 'lg' \| 'xl'`           | `md`    | The size of the table.                        |
| rounding  | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `md`    | The rounding of the table.                    |
| className | `string`                                 |         | Additional class names to apply to the table. |
| children  | `React.ReactNode`                        |         | The content of the table.                     |

#### TableRow

| Name      | Type                 | Default | Description                                       |
| --------- | -------------------- | ------- | ------------------------------------------------- |
| variant   | `'item' \| 'header'` | `item`  | The variant of the table row.                     |
| className | `string`             |         | Additional class names to apply to the table row. |
| children  | `React.ReactNode`    |         | The content of the table row.                     |

#### TableItem

| Name      | Type              | Default | Description                                        |
| --------- | ----------------- | ------- | -------------------------------------------------- |
| className | `string`          |         | Additional class names to apply to the table item. |
| children  | `React.ReactNode` |         | The content of the table item.                     |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
