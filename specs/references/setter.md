# 规则配置中心

## 业务概念

- **原子规则**：最小粒度的规则语义模型，包含：匹配目标、匹配方式、匹配阈值
- **规则组**：使用逻辑 **AND** 连接多个 **原子规则** 形成规则组
- **聚合规则**：使用逻辑 **OR** 连接多个 **规则组** 形成规则制品，作为 **规则引擎** 的数据协议

```ts
// 原则规则
interface AtomicRule<T> {
  // 无业务语义，仅作为存储唯一标识
  id: string;
  // 目标数据，基于业务语义命名，例如：DEVICE_ID, NETWORK_SECURITY_LEVEL，必须与“规则因子定义**中的名称一致
  name: string;
  // 匹配方式，定义比较的逻辑行为，例如：BETWEEN, IN
  operator: string;
  // 匹配阈值
  threshold: T;
}

// 规则组
interface AtomicRuleGroup {
  and: AtomicRule<any>[];
}

interface AggregateRule {
  or: AtomicRuleGroup;
}
```

### 规则示例

网络访问规则：访问设备必须位于 **设备白名单** 之内：

```json
{
  "or": [
    {
      "and": [
        {
          "id": "rule-001",
          "name": "DEVICE_ID",
          "operator": "IN",
          "threshold": ["49ccacd5897adb8b3c89a0c78e1765be", "2db3614cbf0b8901be5aaf0507a69d9a"]
        }
      ]
    }
  ]
}
```
