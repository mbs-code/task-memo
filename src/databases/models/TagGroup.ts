export interface TagGroup {
  id: number
  name: string
  color?: string
  priority: number // default
  tag_group_id?: number

  created_at: Date
  updated_at: Date
}
