export interface Bookmark {
  id: number
  text: string
  color?: string
  priority: number // default

  created_at: Date
  updated_at: Date
}
