# Tab

Tab components are used to display a set of tabs. They can be used to organize content into different sections.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Tab from '@/components/Tab';

const Example = () => {
    return (
        <Tab
            tabs={[
                { id: 'tab-1', label: 'Tab 1' },
                { id: 'tab-2', label: 'Tab 2' },
            ]}
            activeTab="tab-1"
            onTabChange={(tabId) => console.log('Selected tab:', tabId)}
        />
    );
};
```

```tsx
import Tab from '@/components/Tab';

const Example = () => {
    return (
        <Tab
            tabs={[
                { id: 'tab-1', label: 'Tab 1' },
                { id: 'tab-2', label: 'Tab 2', disabled: true },
                { id: 'tab-3', label: 'Tab 3' },
            ]}
            activeTab="tab-1"
            layout="blocky"
            size="lg"
            rounding="full"
            onTabChange={(tabId) => console.log('Selected tab:', tabId)}
        />
    );
};
```

### Props

| Name        | Type                                                                                           | Default | Description                                 |
| ----------- | ---------------------------------------------------------------------------------------------- | ------- | ------------------------------------------- |
| tabs        | `{ id: string; label: string \| React.ReactNode \| React.ReactNode[]; disabled?: boolean; }[]` |         | The tabs to display.                        |
| activeTab   | `string`                                                                                       |         | The id of the active tab.                   |
| onTabChange | `(tabId: string) => void`                                                                      |         | Fires when the active tab changes.          |
| layout      | `'flat' \| 'blocky'`                                                                           | `flat`  | The layout of the tab.                      |
| size        | `'sm' \| 'md' \| 'lg' \| 'xl'`                                                                 | `md`    | The size of the tab.                        |
| rounding    | `'none' \| 'full' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                             | `full`  | The rounding of the tab.                    |
| className   | `string`                                                                                       |         | Additional class names to apply to the tab. |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
