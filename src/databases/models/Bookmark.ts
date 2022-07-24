export interface Bookmark {
  id: number
  name: string
  json: string // json value
  color?: string
  priority: number // default

  created_at: Date
  updated_at: Date
}
