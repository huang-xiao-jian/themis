// ============================================================
// 类型导出
// ============================================================

// Fetcher 相关类型
export type {
  FieldDataSource,
  PaginatedResult,
  StaticFetcher,
  ElementaryFetcher,
  PaginatedFetcher,
  FilterableFetcher,
  PaginatedFilterableFetcher,
  FetcherType,
  FetcherProvider,
  StaticFetcherProvider,
  ElementaryFetcherProvider,
  PaginatedFetcherProvider,
  FilterableFetcherProvider,
  PaginatedFilterableFetcherProvider,
} from './types/Fetcher';

// DSL 相关类型
export type {
  DataType,
  Semantic,
  Mode,
  Quantity,
  DynamicResourceFeature,
  FieldConstraints,
  ResourceDefinition,
  RuleFactorDefinition,
} from './types/DSL';

// Scheduler 相关类型
export type {
  FieldName,
  FieldChangeAction,
  AtomicRule,
  AtomicRuleData,
  AtomicRuleGroup,
  AtomicRuleGroupData,
  IAtomicRuleScheduler,
  IAtomicRuleGroupScheduler,
  IRuleWorkspaceScheduler,
} from './types/Scheduler';

// Resource 相关类型
export type {
  Pagination,
  IStaticResource,
  IElementaryDynamicResource,
  IPaginatedDynamicResource,
  IFilterableDynamicResource,
  IPaginatedFilterableDynamicResource,
  Resource,
} from './types/Resource';

// Inference 相关类型
export type {
  BaseProperties,
  InputProperties,
  TextAreaProperties,
  RangeInputProperties,
  SwitchProperties,
  SelectProperties,
  MultipleSelectProperties,
  PickerProperties,
  RangePickerProperties,
  ListBuilderItemProperties,
  ListBuilderBaseProperties,
  ListBuilderProperties,
  ListRangeBuilderItemProperties,
  ListRangeBuilderProperties,
  ThresholdComponentProperties,
} from './types/Inference';

// ============================================================
// 推断引擎导出
// ============================================================

export { inferOperators } from './inference/OperatorInferrer';
export { inferComponent } from './inference/ComponentInferrer';

// ============================================================
// Fetcher 工厂函数导出
// ============================================================

export {
  provideStaticFetcher,
  provideElementaryFetcher,
  providePaginatedFetcher,
  provideFilterableFetcher,
  providePaginatedFilterableFetcher,
} from './fetcher/FetcherProviders';

// ============================================================
// Scheduler 实现导出
// ============================================================

export { AtomicRuleScheduler } from './scheduler/AtomicRuleScheduler';
export { AtomicRuleGroupScheduler } from './scheduler/AtomicRuleGroupScheduler';
export { RuleWorkspaceBuilder, RuleWorkspaceScheduler } from './scheduler/RuleWorkspace';

// ============================================================
// 工具函数导出
// ============================================================

export { validateThreshold } from './utils/Validation';