# @thesis/react

`@thesis/react` is the thin React binding for `@thesis/core`.

## Goal

- Provide a minimal React context and hook to access the core scheduler.
- Stay free of any component-library or rendering assumptions, leave the rendering responsibilities to the concrete adapter.

## Tech Stack

- [React 19](https://github.com/facebook/react)
- [@unsignal/react](https://www.npmjs.com/package/@unsignal/react) reactive binding

## Tech Conventions

- Prefer `HOC Pattern` to consume `Signal` within reactive components

```tsx
import { Signal } from '@preact/signals-core';
import { observer } from '@unsignal/react';

interface ExampleViewProps {
  locked: Signal<boolean>;
}

const ExampleView = observer(function ExampleView(props: ExampleViewProps): ReactElement {
  return <button disabled={props.locked.value}>Add</button>;
});
```

## API References

The intended public surface:

- `SisyphusProvider`
- `SisyphusProviderProps`
- `useSisyphusScheduler`

### `SisyphusProvider`

Provides the `RuleWorkspaceScheduler` to descendant components through React context.

```ts
interface SisyphusProviderProps {
  readonly scheduler: RuleWorkspaceScheduler;
  readonly children: React.ReactNode;
}

function SisyphusProvider(props: SisyphusProviderProps): ReactElement;
```

### `useSisyphusScheduler`

Returns the current `RuleWorkspaceScheduler` from React context.

```ts
function useSisyphusScheduler(): RuleWorkspaceScheduler;
```

If the hook is used outside `SisyphusProvider`, it throws a framework error.

## Example

```tsx
import { createRuleWorkspaceScheduler } from '@thesis/core';
import { SisyphusProvider } from '@thesis/react';
import { RuleWorkspaceEditor } from '@thesis/antd';

function App() {
  const scheduler = createRuleWorkspaceScheduler(/* ... */);

  return (
    <SisyphusProvider scheduler={scheduler}>
      <RuleWorkspaceEditor />
    </SisyphusProvider>
  );
}
```

Internal components use the scheduler from context:

```tsx
import { useSisyphusScheduler } from '@thesis/react';
import { observer } from '@unsignal/react';

const RuleWorkspaceEditor = observer(function RuleWorkspaceEditor(): ReactElement {
  const scheduler = useSisyphusScheduler();
  // render the workspace UI using the scheduler
});
```
