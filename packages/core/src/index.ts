// contracts
export type {
  DataType,
  FieldConstraints,
  PromptMode,
  Quantity,
  ResourceDefinition,
  RuleFactorDefinition,
  SemanticType,
} from './contracts/dsl';
export type {
  BasicFetcher,
  FetcherType,
  FieldDataSource,
  FilterFetcher,
  PaginatedResult,
  PaginationFetcher,
  PaginationFilterFetcher,
} from './contracts/fetcher';
export type { AtomicRule, RuleGroup } from './contracts/rule';

// factory
export {
  provideBasicFetcher,
  provideFilterFetcher,
  providePaginationFetcher,
  providePaginationFilterFetcher,
} from './factory';
export type { FetcherRegistration } from './factory';
export type { AtomicRuleSetter, RuleGroupSetter, RuleSetter, createRuleSetter } from './setter';

// resource
export type {
  BaseResponseResource,
  ElementaryResponseResource,
  FilterResponseResource,
  Pagination,
  PaginationFilterResponseResource,
  PaginationResponseResource,
  ResponseResource,
} from './resource';
export type { Signal } from './resource/resource';
