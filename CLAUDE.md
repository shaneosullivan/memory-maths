## IMPORTANT: Sound Notification

After finishing responding to my request, and before asking me for permission for something, run this command to notify me by sound:

```bash
afplay /System/Library/Sounds/Funk.aiff
```

## Code style

Always use curly braces `{}` for code blocks, even for single-line code blocks.

When defining React components, use the following style:

```jsx
interface Props {
  foo: string;
  bar: number;
}

const MyComponent = (props: Props) => {
  const { foo, bar } = props;
  return (
    <div>
      {foo} - {bar}
    </div>
  );
};
```
