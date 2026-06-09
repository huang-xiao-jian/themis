# React Code Style Guidelines

## Event Callback

The naming of callback functions uses "on" as the prefix.

```tsx
function AntdRuleWorkspaceView() {
  // ✅ 推荐
  const onAddition = () => {};
  // ❌ 不推荐
  const handleAddition = () => {};

  return (
    <Button type="dashed" block onClick={onAddition}>
      Add
    </Button>
  );
}
```

## Element Function

- Use `jsx` mode instead of `React.createElement` legacy API
