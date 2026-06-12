# React Code Style Guidelines

## Technical Stack

- Use `@unsignal/react` for `Signal` reactive integration

**TIPS**: The document for `@unsignal/react` is `https://www.npmjs.com/package/@unsignal/react`

## Element Function

- Use `jsx` mode instead of `React.createElement` legacy API

## Component Implement

- **Independent Type Declaration**: Component props must be declared using an independent `interface` or `type`. Inline type definitions directly within function parameters are strictly prohibited. The type declaration must be placed above the component function and exported to allow external reuse.
- **No Parameter Destructuring**: Component function parameters must be strictly named `props`. ES6 destructuring syntax (e.g., `({ title, onClick })`) in the parameter list is strictly prohibited.
- **Explicit Property Access**: When accessing props within the component, you must explicitly use the `props.xxx` dot notation to ensure code traceability and consistency.

```tsx
// ✅ CORRECT: Independent type declaration
export interface UserCardProps {
  name: string;
  age: number;
  onClick?: () => void;
}

// ✅ CORRECT: Explicit parameter named `props`, explicit access inside
export function UserCard(props: UserCardProps) {
  // ✅ CORRECT: Explicit props access inside
  return (
    <div onClick={props.onClick}>
      <h2>{props.name}</h2>
      <span>{props.age}</span>
    </div>
  );
}

// ❌ WRONG 1: Destructuring in the parameter list
export function UserCard({ name, age, onClick }: UserCardProps) { ... }

// ❌ WRONG 2: Inline type definition
export function UserCard(props: { name: string; age: number }) { ... }
```

### Event Callback

The naming of callback functions uses "on" as the prefix.

```tsx
function AntdRuleWorkspaceView() {
  // ✅ CORRECT:
  const onAddition = () => {};
  // ❌ WRONG
  const handleAddition = () => {};

  return (
    <Button type="dashed" block onClick={onAddition}>
      Add
    </Button>
  );
}
```

### Strict Component Declaration

- **Deprecate React.FC**: The use of `React.FC` or `React.FunctionComponent` is strictly prohibited
- **Plain Function Declarations**: All components must be declared as standard named functions using the `function` keyword (e.g., `export function UserCard(props: UserCardProps)`). Arrow functions are discouraged for top-level component declarations.
- **Explicit Children Typing**: If a component accepts children, the `children` property must be explicitly defined in the independent Props interface. Use `React.ReactNode` for general UI children, or a more specific type if strict structural typing is required.
- **Explicit Return Types**: For complex components, explicitly declaring the return type (e.g., `ReactElement`) for type safety

```tsx
//  CORRECT: Plain function, explicit children typing, no React.FC
export interface ModalProps {
  title: string;
  children: React.ReactNode; // Explicitly typed children
}

export function Modal(props: ModalProps) {
  return (
    <div className="modal-overlay">
      <h2>{props.title}</h2>
      <div>{props.children}</div>
      <button onClick={props.onClose}>Close</button>
    </div>
  );
}

//  WRONG 1: Using React.FC (Implicit children, outdated pattern)
export const Modal: React.FC<ModalProps> = (props) => { ... };

//  WRONG 2: Arrow function for top-level components
export const Modal = (props: ModalProps) => { ... };
```

### Explicit Reactive Wrapper

## 6. Reactive State Integration Rules

- **Explicit Reactive Wrapper**: All components must be wrapped with the `observer` function from `@unsignal/react` to enable automatic `Signal` support and `Consistency`. This ensures the component properly subscribes to signal changes and triggers re-renders when the underlying reactive state updates.
- **Limited Exceptions**: Specific tech stacks like `formily` have their own `Reactive System`, the component should follow their own practice

```tsx
import { signal } from '@preact/signals-core';
import { observer } from '@unsignal/react';

const count = signal(1);

// Correct: Automatic signal subscription
export const Counter = observer(function Counter() {
  return <div>{count.value}</div>;
});

// WRONG: Missing the observer wrapper which lost reactivity
export function Counter(props: CounterProps) {
  return <div>{count.value}</div>;
}
```

## Component Structure

```shell
components/
└── UserCard/                # component directory
    ├── index.tsx            # barrel exports
    ├── UserCard.tsx
    ├── UserCard.css
    ├── UserCard.test.tsx    # component testing
    └── components/          # component isolation
```

### Lite Component

```shell
components/
└── Navbar.tsx
└── Navbar.css
└── Navbar.test.tsx
```

### Complex Component

```shell
components/
└── Card/
    ├── index.tsx                # barrel exports
    ├── Card.tsx                 # main component
    ├── Card.css                 # optional, main component styles, depends on the css solution, not restricted to css file
    ├── Card.test.tsx            # required, main component testing cases
    └── components/              # component isolation
    └── ├── CardHead.tsx
    └── ├── CardHead.css         # optional, sub component styles, depends on the css solution, not restricted to css file
    └── ├── CardHead.test.tsx.   # optional, sub component testing cases
```

**IMPORTANT**: The max depth is 2!
