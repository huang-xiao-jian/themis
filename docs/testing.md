# 自动化测试规范

## 技术栈

- Test Tool: `vitest`
  Test Docs: `https://vitest.dev/llms.txt`
  Context7 Library Id: `/vitest-dev/vitest`

## 测试规范

### 文件组织规范

- 测试用例文件使用 `*.test.ts` 命名
- 单元测试用例使用就近原则，与源文件放置于相同位置
- 单元测试 `Test fixtures`，使用就近原则，与源文件放置于相同位置

```shell
├── inference
│   └── __fixtures__
│   └── OperatorInferrer.ts
│   ├── OperatorInferrer.test.ts
```

### 测试代码规范

- `vitest` API 必须明确的导入，不依赖全局变量
- `vitest` 测试用例描述必须使用全英语

```ts
import { describe, expect, it, test } from 'vitest';

it('should return single point', () => {
  // Arrange, Act, Assert pattern
});
```

### Formily 表单测试规范

#### componentProps 断言方式

Formily 的 `componentProps` 无法通过 `form.fields[x].componentProps` 可靠读取，必须通过 `getFieldState` 访问，并取 `component[1]`（数组第二项为实际组件属性对象）：

```ts
// ✅ 正确的断言方式
const $threshold = form.getFieldState('threshold');
assert(Array.isArray($threshold.component));
expect($threshold.component[1]).toMatchObject({
  properties: { type: 'Switch' },
});

// ❌ 错误：直接访问 form.fields[x].componentProps 不可靠
```

### 测试运行

`vitest` 支持测试用例范围过滤：

```bash
# 运行特定测试用例
pnpm vitest run -t "should return single point"

# 运行文件名包含 Inferer 的测试用例
pnpm vitest run "Inferer"

# 运行特定 package 的测试用例文件
pnpm vitest run --project @sisyphus/core
```
