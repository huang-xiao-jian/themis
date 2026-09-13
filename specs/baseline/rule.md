# Rule

## Goal

Define minimum unit for **Rule Factor** consume.

## Rule Concepts

- **Atomic rule**: the smallest semantic unit of a rule, including the target, operator, and threshold.
- **Atomic Rule group**: a set of atomic rules joined with logical **AND** and used as the minimum unit executed by the **RuleEngine**.

```ts
// Atomic rule
interface AtomicRule<T> {
  // no business semantics, only a unique storage identifier
  id: string;
  // rule factor namecomes from"RuleFactorDefinition", e.g. DEVICE_ID
  name: string;
  // matching operator, defining comparison behavior such as BETWEEN, IN, GT
  operator: string;
  // matching threshold
  threshold: T;
}
```

## Rule Constraints

- Within the **AtomicRuleGroup**, each rule factor can be configured at most once.
- When configuring an **atomic rule**, if the selected **rule factor** changes, the `Operator` and `Value` state must be reset.

## Rule Example

Network access rule: the device must be within the **device whitelist**, and the access time must fall within **working hours**.

```json
[
  {
    "id": "rule-001",
    "name": "DEVICE_ID",
    "operator": "IN",
    "threshold": ["49ccacd5897adb8b3c89a0c78e1765be", "2db3614cbf0b8901be5aaf0507a69d9a"]
  },
  {
    "id": "rule-002",
    "name": "ACCESS_TIME",
    "operator": "BETWEEN",
    "threshold": ["09:30:00", "18:30:00"]
  }
]
```
