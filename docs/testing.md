# Automation Testing Specification

## Technology Stack

- Test Tool: `vitest`
  Test Docs: `https://vitest.dev/llms.txt`

## Test Specifications

### File Organization Guidelines

- The test case files are named with `*.test.ts`.
- For unit test cases, the principle of proximity is adopted, and they are placed in the same location as the source files.
- For unit tests, `Test fixtures` follow the principle of proximity and are also placed in the same location as the source files.

```shell
├── inference
│   └── __fixtures__
│   └── OperatorInferrer.ts
│   ├── OperatorInferrer.test.ts
```

### Testing Code Standards

- The `vitest` API must be explicitly imported and should not rely on global variables.
- The test case descriptions in `vitest` must be written entirely in English.

```ts
import { describe, expect, it, test } from 'vitest';

it('should return single point', () => {
  // Arrange, Act, Assert pattern
});
```

### Formily Form Testing Specification

#### Component Props Assertion Method

The `componentProps` of Formily cannot be reliably read through `form.fields[x].componentProps`; instead, it must be accessed through `getFieldState` and then take `component[1]` (the second item in the array is the actual component property object):

```ts
// ✅ Correct assertion method const $threshold = form.getFieldState('threshold');
assert(Array.isArray($threshold.component));
expect($threshold.component[1]).toMatchObject({
  properties: { type: 'Switch' },
});

// ✖️ Error: Directly accessing form.fields[x].componentProps is unreliable
```

### Test Run

`vitest` supports filtering of test case ranges:

```bash
# Run specific test cases
pnpm vitest run -t "should return single point"

# Test cases where the running file name contains "Inferer"
pnpm vitest run "Inferer"

# Run the test case files of a specific package
pnpm vitest run --project @sisyphus/core
```
