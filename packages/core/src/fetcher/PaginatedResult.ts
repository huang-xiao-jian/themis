/**
 * 分页响应结果
 */
export interface PaginatedResult<T> {
  /** 当前页数据 */
  readonly data: readonly T[]
  /** 当前页码 */
  readonly page: number
  /** 每页大小 */
  readonly pageSize: number
  /** 总记录数 */
  readonly total: number
}
