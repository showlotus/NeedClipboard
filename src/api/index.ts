export interface QueryParams {
  keyword: string
  type: string
  currentPage: number
  pageSize: number
}

export function fetchQuery(params: QueryParams) {
  const { currentPage, pageSize } = params
}
