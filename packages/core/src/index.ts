// ============================================================
// 类型导出
// ============================================================

// Fetcher 相关类型
export type {
  ElementaryFetcher,
  ElementaryFetcherProvider,
  FetcherProvider,
  FetcherType,
  FieldDataSource,
  FilterableFetcher,
  FilterableFetcherProvider,
  PaginatedFetcher,
  PaginatedFetcherProvider,
  PaginatedFilterableFetcher,
  PaginatedFilterableFetcherProvider,
  PaginatedResult,
  StaticFetcher,
  StaticFetcherProvider,
} from './types/Fetcher';

// DSL 相关类型
export type {
  DataType,
  DynamicFieldResource,
  DynamicFieldResourceFeature,
  FieldConstraints,
  Mode,
  Quantity,
  RuleFactorDefinition,
  Semantic,
  StaticFieldResource,
} from './types/DSL';

// Scheduler 相关类型
export type {
  AtomicRule,
  AtomicRuleData,
  AtomicRuleGroup,
  AtomicRuleGroupData,
  FieldChangeAction,
  FieldName,
  IAtomicRuleGroupScheduler,
  IAtomicRuleScheduler,
  IRuleWorkspaceScheduler,
} from './types/Scheduler';

// Resource 相关类型
export type {
  IElementaryDynamicResource,
  IFilterableDynamicResource,
  IPaginatedDynamicResource,
  IPaginatedFilterableDynamicResource,
  IStaticResource,
  Pagination,
  Resource,
} from './types/Resource';

// Inference 相关类型
export type {
  BaseProperties,
  InputProperties,
  ListBuilderBaseProperties,
  ListBuilderItemProperties,
  ListBuilderProperties,
  ListRangeBuilderItemProperties,
  ListRangeBuilderProperties,
  MultipleSelectProperties,
  PickerProperties,
  RangeInputProperties,
  RangePickerProperties,
  SelectProperties,
  SwitchProperties,
  TextAreaProperties,
  ThresholdComponentProperties,
} from './types/Inference';

// ============================================================
// 推断引擎导出
// ============================================================

export { inferComponent } from './inference/ComponentInferrer';
export { inferOperators } from './inference/OperatorInferrer';

// ============================================================
// Fetcher 工厂函数导出
// ============================================================

export {
  provideElementaryFetcher,
  provideFilterableFetcher,
  providePaginatedFetcher,
  providePaginatedFilterableFetcher,
  provideStaticFetcher,
} from './fetcher/FetcherProviders';

// ============================================================
// Scheduler 实现导出
// ============================================================

export { AtomicRuleGroupScheduler } from './scheduler/AtomicRuleGroupScheduler';
export { AtomicRuleScheduler } from './scheduler/AtomicRuleScheduler';
export { RuleWorkspaceBuilder, RuleWorkspaceScheduler } from './scheduler/RuleWorkspace';

// ============================================================
// 工具函数导出
// ============================================================

export { validateThreshold } from './utils/Validation';
