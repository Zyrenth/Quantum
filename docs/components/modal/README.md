# Modal

Modal components are used to display content in a modal dialog. They can be used to present important information or actions.

## Table of Contents

-   [Layout setup](#layout-setup)
-   [Examples](#examples)
-   [Props](#props)

### Layout setup

Before being able to use the `Modal` component, you need to wrap your application with the `ModalProvider` component. This will provide the `ModalContext` to your application, which is used to manage the modals.

```tsx
import { ModalContext } from '@/components/Modal';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <ModalProvider>{children}</ModalProvider>
            </body>
        </html>
    );
}
```

### Examples

```tsx
import { Modal, ModalProvider, ModalContext } from '@/components/Modal';

const Example = () => {
    const { pushModal, popModal } = useContext(ModalContext);

    const CustomModal = ({ ...props }) => {
        // You can use react hooks here.

        return (
            <Modal className="min-w-[512px] max-w-[512px]" {...props}>
                Hello world! This is a custom modal.
            </Modal>
        );
    };

    const openModal = () => {
        const id = pushModal(<CustomModal dismissible size="md" rounding="md" />);

        setTimeout(() => popModal(id), 3000);
    };

    return <button onClick={openModal}>Open Modal</button>;
};
```

```tsx
import { AlertModal, ModalProvider, ModalContext } from '@/components/Modal';
import { CheckIcon } from '@heroicons/react/outline';

const Example = () => {
    const { pushModal } = useContext(ModalContext);

    const openAlertModal = () => {
        pushModal(
            <AlertModal
                title="Hello, world!"
                description="This is an alert."
                icon={<CheckIcon className="w-full h-full" />}
                actions={<button onClick={() => alert('Action clicked!')}>Action</button>}
            />,
        );
    };

    return <button onClick={openAlertModal}>Open Alert Modal</button>;
};
```

### Props

#### Modal

| Name        | Type                                     | Default | Description                                                                        |
| ----------- | ---------------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| isOpen      | `boolean`                                | `true`  | Whether the modal is open.                                                         |
| dismissible | `boolean`                                | `true`  | Whether the modal can be dismissed by clicking outside or pressing the Escape key. |
| close       | `() => void`                             |         | Closes the modal.                                                                  |
| size        | `'sm' \| 'md' \| 'lg' \| 'xl'`           | `md`    | The size of the modal.                                                             |
| rounding    | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `md`    | The rounding of the modal.                                                         |
| className   | `string`                                 |         | Additional class names to apply to the modal.                                      |
| children    | `React.ReactNode`                        |         | The content of the modal.                                                          |

#### AlertModal

| Name            | Type                                     | Default | Description                                          |
| --------------- | ---------------------------------------- | ------- | ---------------------------------------------------- |
| title           | `string`                                 |         | The title of the alert modal.                        |
| description     | `string`                                 |         | The description of the alert modal.                  |
| icon            | `React.ReactNode`                        |         | The icon to display in the alert modal.              |
| actions         | `React.ReactNode`                        |         | The actions to display in the alert modal.           |
| showCloseButton | `boolean`                                | `true`  | Whether to show the close button in the alert modal. |
| close           | `() => void`                             |         | Closes the modal.                                    |
| size            | `'sm' \| 'md' \| 'lg' \| 'xl'`           | `md`    | The size of the alert modal.                         |
| rounding        | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `md`    | The rounding of the alert modal.                     |
| className       | `string`                                 |         | Additional class names to apply to the alert modal.  |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
