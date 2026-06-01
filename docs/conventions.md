# 代码规范

## 面向对象原则

- 遵循 `SOLID` 原则
- 遵循组合优于继承原则
- 优先使用 `Class` 而非 `Function` 组织业务逻辑

### 命名规范

- Classes: `pascal case` (e.g. `UserRepository`)
- Methods: `camel case` (e.g. `findAvailableDiscount`)
- Private members: use `private` descriptor only, avoid special prefix (.e.g `#` or `_`)

### 组织规范

- 通过声明接口来定义契约
- 倾向于编写功能单一的小类，公有方法数量少于 5 个，属性数量少于 10 个
- 文件命名使用 `pascal case` (e.g. `UserRepository.ts`)
