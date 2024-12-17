# Card

Card components are used to display content in a structured layout. They can be used to group related information together.

## Table of Contents

-   [Examples](#examples)
-   [Props](#props)

### Examples

```tsx
import Card from '@/components/Card';
import Button from '@/components/Button';
import { H1, P } from '@/components/Typography';

const Example = () => {
    return (
        <Card size="lg" rounding="lg">
            <H1>Card Title</H1>
            <P>This is a card component.</P>
            <Button>Click me</Button>
        </Card>
    );
};
```

### Props

| Name      | Type                                     | Default | Description                                  |
| --------- | ---------------------------------------- | ------- | -------------------------------------------- |
| size      | `'sm' \| 'md' \| 'lg' \| 'xl'`           | `md`    | The size of the card.                        |
| rounding  | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `md`    | The rounding of the card.                    |
| className | `string`                                 |         | Additional class names to apply to the card. |
| children  | `React.ReactNode`                        |         | The content of the card.                     |

### Back to [Components](../README.md).

### Back to [Documentation](../../README.md).
