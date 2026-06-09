# Rule Factor Specification

## Business Goal

Design a JSON-based DSL to describe the semantic structure of **rule factors**. The **rule configurator** interprets the **rule factor specification** and provides an interactive view for configuring business rules. The core purpose of the DSL is to let the **rule configurator** infer the correct **matching operators**, **form controls**, and **boundary constraints** from the **rule factor specification**.

## Business Integration

**Rule factors** and the **rule configurator** work together closely as parts of the **rule configuration center**. The rule configurator uses the **rule factor specification** to provide configuration capabilities, and users configure rule factors as needed to form **business rules**.

## Design Principles

The design focuses on describing the **metamodel** of rule factors rather than concrete rule instances. The following principles must be followed:

- **Declarative**: describe `What`, not `How`. The design output must not include implementation details.
- **Semantic-driven UI**: describe semantics, not the `UI` structure. The design phase must not assume a specific **framework** or **component library**.

## Rule Factor Specification Design

### Identification RuleFactorAnnotation

Describes the metadata of a rule factor:

- `name`: the unique name of the rule factor
- `title`: the display title of the rule factor
- `description`: the description of the rule factor

```json
{
  "name": "deliver_city",
  "title": "Target City",
  "description": "Select the city that can receive deliveries"
}
```

### Associated Resource RuleFactorResource

`RuleFactorResource` defines a constrained selectable range. It supports static options and dynamic options, with a unified data structure for all option sets.

```ts
interface FieldDataSource {
  label: string;
  value: string | number;
  disabled?: boolean;
}
```

Static resource description:

- `name`: the unique resource name
- `options`: the resource list, following the data structure constraints

Static resource interface:

```ts
interface StaticRuleFactorResource {
  // the agreed resource name
  name: string;
  // the preset option list
  options: FieldDataSource[];
}
```

Static resource example:

```json
{
  "resource": {
    "name": "City",
    "options": [
      { "label": "Beijing", "value": "bj" },
      { "label": "Shanghai", "value": "sh" }
    ]
  }
}
```

**Dynamic resources** are data sources provided by the server. They are classified into subtypes by capability:

- whether they support pagination
- whether they support keyword filtering

Dynamic `RuleFactorResource` description:

- `name`: the unique resource name, agreed by the provider
- `features`: the capabilities supported by the resource provider, such as pagination and keyword filtering

Dynamic resource interface:

```ts
type DynamicRuleFactorResourceFeature = 'pagination' | 'filter';

interface DynamicRuleFactorResource {
  // the agreed resource name
  name: string;
  // supported capabilities of the resource provider
  features: DynamicRuleFactorResourceFeature[];
}
```

Dynamic resource examples:

```json
{ "resource": { "name": "City" } }
```

```json
{
  "resource": {
    "name": "Employees",
    "features": ["pagination", "filter"]
  }
}
```

### Data Metadata RuleFactorMetadata

- `dataType`: the primitive data type, supporting `DataType` enum values: `STRING` / `NUMBER` / `BOOLEAN`
- `mode`: declares point or range values, supporting `Mode` enum values: `POINT` / `RANGE`
- `quantity`: declares single or multiple values, supporting `Quantity` enum values: `SINGLE` / `MULTIPLE`
- `semantic`: a semantic scenario used to refine the primitive data type, supporting `Semantic` enum values

Enum declarations use string values, with enum keys in `SCREAMING_SNAKE_CASE`. The values remain consistent with the original string literals to preserve runtime serialization compatibility:

```ts
/**
 * Primitive data type
 */
enum DataType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
}

/**
 * Mode: point / range
 */
enum Mode {
  POINT = 'point',
  RANGE = 'range',
}

/**
 * Quantity: single / multiple
 */
enum Quantity {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}

/**
 * Semantic scenario, used as a refinement of dataType
 */
enum Semantic {
  RATE = 'rate',
  DATE = 'date',
  TIME = 'time',
  DATETIME = 'datetime',
  DURATION = 'duration',
  PERCENTAGE = 'percentage',
}
```

Orthogonal logic for `mode` + `quantity`:

| mode    | quantity   | Business meaning         | Matching logic                     |
| :------ | :--------- | :----------------------- | :--------------------------------- |
| `point` | `single`   | Single value             | `target = value`                   |
| `point` | `multiple` | Multiple discrete values | `target in [v1, v2]`               |
| `range` | `single`   | Single continuous range  | `min <= target <= max`             |
| `range` | `multiple` | Multiple discrete ranges | `(t between r1) or (t between r2)` |

Supported `semantic` scenarios:

- `rate`
- `date`
- `time`
- `duration`
- `percentage`

### Validation Constraints RuleFactorConstraint

`constraints` defines validation rules for boundary values.

| Constraint field   | Applicable type | Description              |
| :----------------- | :-------------- | :----------------------- |
| `min`              | number / string | Minimum value / length   |
| `max`              | number / string | Maximum value / length   |
| `exclusiveMinimum` | number / string | Exclusive minimum        |
| `exclusiveMaximum` | number / string | Exclusive maximum        |
| `step`             | number          | Step size                |
| `precision`        | number          | Decimal precision        |
| `format`           | string          | String format            |
| `pattern`          | string          | Regular expression check |

Special note: minimum and maximum values use open intervals for `exclusiveMinimum` / `exclusiveMaximum` and closed intervals for `min` / `max`.

For **multi-value scenarios**, the constraints use the closed interval `[minItems, maxItems]`:

| Constraint field | quantity   | Description   |
| :--------------- | :--------- | :------------ |
| `minItems`       | `multiple` | Minimum count |
| `maxItems`       | `multiple` | Maximum count |

### Rule Factor Definition

```ts
interface RuleFactorDefinition {
  name: string;
  title: string;
  description?: string;
  dataType: DataType;
  semantic?: Semantic;
  mode?: Mode;
  quantity?: Quantity;
  resource?: {
    name: string;
    features?: ('pagination' | 'filter')[];
  };
  constraints?: FieldConstraints;
}
```

## Rule Configuration

### Rule Configuration Concepts

- **Atomic rule**: the smallest semantic unit of a rule, including the target, operator, and threshold.
- **Rule group**: a set of atomic rules joined with logical **AND** and used as the rule unit executed by the **rule engine**.

```ts
// Atomic rule
interface AtomicRule<T> {
  // no business semantics, only a unique storage identifier
  id: string;
  // target data; named by business semantics, e.g. DEVICE_ID, NETWORK_SECURITY_LEVEL, and must match the names in the "rule factor definition"
  name: string;
  // matching operator, defining comparison behavior such as BETWEEN, IN, GT
  operator: string;
  // matching threshold
  threshold: T;
}
```

### Rule Configuration Constraints

- When configuring a **rule group**, a specific **rule factor** may only be configured once.
  - The inferred maximum number of **atomic rules** equals the number of **rule factors**.
- When configuring an **atomic rule**, if the selected **rule factor** changes, the `Operator` and `Value` state must be reset.

### Rule Configuration Example

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
