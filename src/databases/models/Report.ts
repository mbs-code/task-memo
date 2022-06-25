import { Tag } from '~~/src/databases/models/Tag'

export interface Report {
  id: number
  text: string

  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

export type ReportWithTag = Report & {
  tags: Tag[]
}
