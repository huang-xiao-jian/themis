# Code Conventions

## Object-Oriented Principles

- Follow the `SOLID` principles
- Prefer composition over inheritance
- Prefer using `Class` rather than `Function` to organize business logic

### Naming Conventions

- Classes: `PascalCase` (e.g. `UserRepository`)
- Class members: `Camel Case` (e.g. `findAvailableDiscount`)
- Private members: use the `private` modifier only; avoid special prefixes such as `#` or `_`
- Constant variables: `SCREAMING_SNAKE_CASE` (`MAX_RETRY_COUNT`)
- Function names: `Camel Case` (e.g. `findDiscountRule`)
- Interface names: `PascalCase` without the `I` prefix
- Enum names: `PascalCase`
- Enum keys: `SCREAMING_SNAKE_CASE` (`MAX_RETRY_COUNT`)
- Class methods: methods with an `on` prefix used for event callback binding must be declared as **arrow functions**

```tsx
// ❌ Default method declaration; passing the method reference directly will cause `this` to be `undefined` on click
const TriggerView = observer(() => {
  return <button onClick={counterStore.onIncrement}>Click to increment</button>;
});
```

String-style `Enum` declaration:

```ts
enum Colors {
  RED = 'red',
  GREEN = 'green',
}
```

### Organization Conventions

- Define contracts through interface declarations
- Prefer writing small classes with a single responsibility, fewer than 5 public methods, and fewer than 10 properties
- `Class` file names should use `pascal case` (e.g. `UserRepository.ts`)
- `Function` file names should use `Camel Case` (e.g. `findDiscountRule.ts`)

### Import Conventions

- Do not use namespace imports (for example `import React from 'react'` or `import type React from 'react'`)
- Must use named imports and import only the types or functions you need

```ts
// ✅ Correct
import type { ReactElement, ReactNode, ComponentType } from 'react';
import { createElement, createContext, useContext } from 'react';

// ❌ Incorrect
import React from 'react';
import type React from 'react';
```

### Code Formatting

- Refer to the [prettier](../.prettierrc) configuration for code formatting conventions
