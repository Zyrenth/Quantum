# Select

Select components are used to allow users to select one or more options from a dropdown list. They can be used in forms, settings, and other user interfaces where multiple selections are needed.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Select from '@/components/Select';

const Example = () => {
    return (
        <Select
            options={[
                { type: 'header', label: 'Header' },
                { type: 'item', id: 'option-1', label: 'Option 1' },
                { type: 'divider' },
                { type: 'item', id: 'option-2', label: 'Option 2' },
            ]}
            onSelection={(ids) => alert('You selected: ' + ids.join(', '))}
        />
    );
};
```

```tsx
import Select from '@/components/Select';

const Example = () => {
    return (
        <Select
            options={[
                { type: 'item', id: 'option-1', label: 'Option 1' },
                { type: 'item', id: 'option-2', label: 'Option 2' },
                { type: 'item', id: 'option-3', label: 'Option 3' },
            ]}
            allowMultiple
            showSearch
            placeholder="Select options"
            onSelection={(ids) => alert('You selected: ' + ids.join(', '))}
        />
    );
};
```

### Props

| Name          | Type                                               | Default                  | Description                                            |
| ------------- | -------------------------------------------------- | ------------------------ | ------------------------------------------------------ |
| options       | `(ItemOption \| HeaderOption \| DividerOption)[]`  |                          | The options to display in the select.                  |
| showSearch    | `boolean`                                          | `false`                  | Whether to show a search bar in the dropdown.          |
| value         | `string`                                           |                          | The id of the selected option.                         |
| disabled      | `boolean`                                          | `false`                  | Whether the select is disabled.                        |
| placeholder   | `string`                                           | `No option is selected.` | The placeholder to display when no option is selected. |
| allowMultiple | `boolean`                                          | `false`                  | Whether to allow multiple selections.                  |
| onSelection   | `(value: string[]) => void`                        |                          | Fires when an option is selected.                      |
| size          | `'sm' \| 'md' \| 'lg' \| 'xl'`                     | `md`                     | The size of the select.                                |
| rounding      | `'none' \| 'full' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `md`                     | The rounding of the select.                            |
| className     | `string`                                           |                          | Additional class names to apply to the select.         |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
