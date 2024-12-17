# Dropdown

Dropdown components are used to display a list of items in a dropdown. They can be used to present a menu or a list of actions.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Dropdown from '@/components/Dropdown';
import Button from '@/components/Button';
import { UserIcon, CogIcon } from '@heroicons/react/outline';

const Example = () => {
    return (
        <Dropdown
            content={[
                {
                    type: 'item',
                    icon: <UserIcon className="w-full h-full" />,
                    label: 'My Profile',
                    shortcut: ['control', 'p'],
                    action: () => alert('My Profile'),
                },
                {
                    type: 'item',
                    icon: <CogIcon className="w-full h-full" />,
                    label: 'Settings',
                    shortcut: ['control', ','],
                    action: () => alert('Settings'),
                },
            ]}
            showArrow
        >
            <Button>Dropdown</Button>
        </Dropdown>
    );
};
```

### Props

| Name              | Type                                                                                                                                                                                     | Default      | Description                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------ |
| content           | `DropdownContent[]`                                                                                                                                                                      |              | The list of dropdown items to display in the dropdown.                                     |
| hoverDelay        | `number`                                                                                                                                                                                 |              | The delay in milliseconds before the dropdown opens when hovering over the parent element. |
| disableHover      | `boolean`                                                                                                                                                                                | `false`      | Whether to disable the ability to open the dropdown by hovering over the parent element.   |
| disableToggle     | `boolean`                                                                                                                                                                                | `false`      | Whether to disable the ability to toggle the dropdown.                                     |
| wrapperClassName  | `string`                                                                                                                                                                                 |              | The class name(s) to apply to the dropdown wrapper.                                        |
| withSearch        | `boolean`                                                                                                                                                                                | `false`      | Whether to show the search input in the dropdown.                                          |
| searchPlaceholder | `string`                                                                                                                                                                                 | `Search...`  | The placeholder text to display in the search input.                                       |
| stayOpen          | `boolean`                                                                                                                                                                                | `false`      | Whether to keep the dropdown open when an item is clicked.                                 |
| onOpenStateChange | `(isOpen: boolean) => void`                                                                                                                                                              |              | Fires when the dropdown open state changes.                                                |
| size              | `'sm' \| 'md' \| 'lg' \| 'xl'`                                                                                                                                                           | `md`         | The size of the dropdown.                                                                  |
| rounding          | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                                                                                                                 | `md`         | The rounding of the dropdown.                                                              |
| orientation       | `'topLeft' \| 'topCenter' \| 'topRight' \| 'bottomLeft' \| 'bottomCenter' \| 'bottomRight' \| 'leftTop' \| 'leftCenter' \| 'leftBottom' \| 'rightTop' \| 'rightCenter' \| 'rightBottom'` | `bottomLeft` | The orientation of the dropdown relative to the parent element.                            |
| showArrow         | `boolean`                                                                                                                                                                                | `false`      | Whether to show the arrow on the dropdown.                                                 |
| fullWidth         | `boolean`                                                                                                                                                                                | `false`      | Whether to expand the dropdown to the full width of the parent element.                    |
| className         | `string`                                                                                                                                                                                 |              | Additional class names to apply to the dropdown.                                           |
| children          | `React.ReactNode`                                                                                                                                                                        |              | The content of the dropdown.                                                               |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
