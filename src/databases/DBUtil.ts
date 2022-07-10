export type Nullable<T, D extends keyof T> = Pick<T, Exclude<keyof T, D>> & Partial<Pick<T, D>>
export type SystemColumns = 'id' | 'created_at' | 'updated_at' | 'deleted_at'

export type SearchSort<T> = [keyof T, 'asc' | 'desc']

export type SearchModel<T> = {
  page?: number
  perPage?: number
  sort?: SearchSort<T>
  sorts?: SearchSort<T>[]
}
