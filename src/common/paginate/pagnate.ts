export interface PaginateResult<T> {
  total: number;
  page: number;
  limit: number;
  data: T[];
}
