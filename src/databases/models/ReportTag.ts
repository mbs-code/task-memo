import * as Kysely from 'kysely'

export interface ReportTag {
  id: Kysely.Generated<number>
  report_id: number
  tag_id: number

  created_at: Date
  updated_at: Date
}
