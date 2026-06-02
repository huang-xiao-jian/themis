/**
 * 分页信息
 */
export interface Pagination {
  /** 当前页码（从 1 开始） */
  readonly page: number;
  /** 每页大小 */
  readonly pageSize: number;
  /** 总记录数 */
  readonly total: number;
}
