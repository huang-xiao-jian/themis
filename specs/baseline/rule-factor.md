# RuleFactor

## Goal

Design a JSON-based DSL to describe **Rule Factor** in semantic way rather than concrete way.

## Integration

- **Rule Interpreter** interpret the **Rule Factor** into view model in **Framework Agnostic** way
- **Rule Setter** config the **Rule Factor** into concrete **AtomicRule**
- **Rule Engine** execute the concrete **Rule**

## Principles

- **Declarative**: describe `What`, not `How`. The design output must not include any implementation details.
- **Semantic Driven**: describe semantics, not the `UI`. The design must not assume a specific **framework** or **component library**.

## Specification Design

### Identification

Describes the metadata of a rule factor:

- `name`: the unique name of the rule factor
- `title`: the display title of the rule factor
- `description`: the description of the rule factor

```json
{
  "name": "deliver_city",
  "title": "Target City",
  "description": "The city that can receive deliveries"
}
```

### Resource Association

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
- `options`: the options list, following the data structure constraints

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

**Dynamic resources** are classified into subtypes by capability:

- whether they support pagination
- whether they support keyword filtering

Dynamic `RuleFactorResource` description:

- `name`: the unique resource name, agreed by the provider
- `features`: the capabilities supported by the resource provider, such as pagination and keyword filtering

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
{
  "resource": {
    "name": "City"
  }
}
```

```json
{
  "resource": {
    "name": "Employees",
    "features": ["pagination", "filter"]
  }
}
```

### Metadata

**RuleFactorMetadata** provides necessary hints for **Rule Interpreter**

- `dataType`: the primitive data type
- `mode`: declares point or range values
- `quantity`: declares single or multiple values
- `semantic`: declares semantic scenario to refine the primitive data type

```ts
enum RuleFactorDataType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
}

enum RuleFactorMode {
  POINT = 'point',
  RANGE = 'range',
}

enum RuleFactorQuantity {
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

| mode    | quantity   | Semantic meaning         | Matching logic                     |
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

### Constraints

`RuleFactorConstraint` defines boundary values in specific **Rule**.

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

For **multi-value scenarios**, the constraints use the closed interval `[minItems, maxItems]`:

| Constraint field | quantity   | Description   |
| :--------------- | :--------- | :------------ |
| `minItems`       | `multiple` | Minimum count |
| `maxItems`       | `multiple` | Maximum count |

### Rule Factor

```ts
interface RuleFactorResource {
  name: string;
  features?: DynamicRuleFactorResourceFeature[];
}

interface RuleFactor {
  name: string;
  title: string;
  description: string;
  dataType: DataType;
  semantic?: Semantic;
  mode?: Mode;
  quantity?: Quantity;
  resource?: RuleFactorResource;
  constraints?: FieldConstraints;
}
```
