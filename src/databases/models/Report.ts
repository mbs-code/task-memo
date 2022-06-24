export interface Report {
  id: number
  text: string

  created_at: Date
  updated_at: Date
  deleted_at?: Date
}
