# Breadcrumb

Breadcrumb components are used to display a navigation trail for users. They can be used to show the current page's location.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import { Breadcrumb, BreadcrumbItem } from '@/components/Breadcrumb';

const Example = () => {
    return (
        <Breadcrumb>
            <BreadcrumbItem href="https://example.com">Home</BreadcrumbItem>
            <BreadcrumbItem href="https://example.com/about">About</BreadcrumbItem>
            <BreadcrumbItem
                collapsedLinks={[
                    { href: 'https://example.com/about/team', label: 'Team' },
                    { href: 'https://example.com/about/team/management', label: 'Management' },
                ]}
            >
                ...
            </BreadcrumbItem>
            <BreadcrumbItem href="https://example.com/about/team/management/contact" active>
                Contact
            </BreadcrumbItem>
        </Breadcrumb>
    );
};
```

### Props

#### Breadcrumb

| Name      | Type                           | Default | Description                                                 |
| --------- | ------------------------------ | ------- | ----------------------------------------------------------- |
| separator | `React.ReactNode`              | `'/'`   | The separator to display between each breadcrumb item.      |
| size      | `'sm' \| 'md' \| 'lg' \| 'xl'` | `md`    | The size of the breadcrumb.                                 |
| className | `string`                       |         | Additional class names to apply to the breadcrumb.          |
| children  | `React.ReactNode`              |         | The breadcrumb items to be displayed within the breadcrumb. |

#### BreadcrumbItem

| Name             | Type                                               | Default | Description                                                              |
| ---------------- | -------------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| collapsedLinks   | `{ label: string; href: string; }[]`               |         | The links to display in a dropdown when clicking on the breadcrumb item. |
| disabled         | `boolean`                                          | `false` | Whether the breadcrumb item is disabled.                                 |
| active           | `boolean`                                          | `false` | Whether the breadcrumb item is active.                                   |
| dropdownSize     | `'sm' \| 'md' \| 'lg' \| 'xl'`                     | `md`    | Sets the dropdown size for the collapsed links.                          |
| dropdownRounding | `'none' \| 'full' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `md`    | Sets the dropdown rounding for the collapsed links.                      |
| className        | `string`                                           |         | Additional class names to apply to the breadcrumb item.                  |
| children         | `React.ReactNode`                                  |         | The content of the breadcrumb item.                                      |
| href             | `string`                                           |         | The URL that the breadcrumb item links to.                               |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
