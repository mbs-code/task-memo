import { Kysely } from 'kysely'
import { useTagAPI } from '~~/src/apis/useTagAPI'
import { Tables } from '~~/src/databases/Database'
import { SearchModel, SystemColumns } from '~~/src/databases/DBUtil'
import { Report, ReportWithTag } from '~~/src/databases/models/Report'

export type SearchReport = SearchModel<Report>
export type FormReport = Omit<Report, SystemColumns> & { tagNames: string[] }

export const useReportAPI = (db: Kysely<Tables>) => {
  const tagAPI = useTagAPI(db)

  const getAll = async (params?: SearchReport): Promise<ReportWithTag[]> => {
    // レポートを取得する
    const reports = await db.selectFrom('reports')
      .selectAll()
      .if(Boolean(params?.perPage), qb => qb.limit(params.perPage))
      .if(Boolean(params?.page), qb => qb.offset(params.page))
      .if(Boolean(params?.sort), qb => qb.orderBy(params.sort, params?.order ?? 'asc'))
      .execute()

    // レポートに紐づく中間テーブルを取得
    const reportIds = Array.from(new Set(reports.map(r => r.id)))
    const reportTags = await db.selectFrom('report_tags')
      .selectAll()
      .where('report_id', 'in', reportIds)
      .execute()

    // 中間テーブルに紐づくタグを取得
    const tagIds = Array.from(new Set(reportTags.map(rt => rt.tag_id)))
    const tags = await db.selectFrom('tags')
      .selectAll()
      .where('id', 'in', tagIds)
      .execute()

    // レポートにタグを紐づける
    const reportWithTags = reports.map((report) => {
      return {
        ...report,
        tags: reportTags
          .filter(rt => rt.report_id === report.id)
          .map((rt) => {
            const tag = tags.find(t => t.id === rt.tag_id)
            return tag ? { ...tag } : null
          })
      }
    })

    return reportWithTags
  }

  const get = async (reportId: number): Promise<ReportWithTag> => {
    // レポートを取得する
    const report = await db.selectFrom('reports')
      .selectAll()
      .where('id', '=', reportId)
      .executeTakeFirstOrThrow()

    // レポートに紐づく中間テーブルを取得
    const reportTags = await db.selectFrom('report_tags')
      .selectAll()
      .where('report_id', '=', report.id)
      .execute()

    // 中間テーブルに紐づくタグを取得
    const tagIds = Array.from(new Set(reportTags.map(rt => rt.tag_id)))
    const tags = await db.selectFrom('tags')
      .selectAll()
      .where('id', 'in', tagIds)
      .execute()

    // レポートにタグを紐づける
    const reportWithTag = {
      ...report,
      tags: tags.map((tag) => {
        return tag ? { ...tag } : null
      }),
    }

    return reportWithTag
  }

  const create = async (form: FormReport): Promise<ReportWithTag> => {
    // レポートを作成する
    const { insertId } = await db.insertInto('reports')
      .values({
        text: form.text,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .executeTakeFirst()
    const reportId = Number(insertId)

    // タグを同期する
    await _syncTagNames(reportId, form.tagNames)

    return get(reportId)
  }

  const update = async (reportId: number, form: FormReport): Promise<ReportWithTag> => {
    // レポートを更新する
    const { numUpdatedRows } = await db.updateTable('reports')
      .set({
        text: form.text,
        updated_at: new Date(),
      })
      .where('id', '=', reportId)
      .executeTakeFirst()

    if (Number(numUpdatedRows) === 0) {
      throw new Error('no result')
    }

    // タグを同期する
    await _syncTagNames(reportId, form.tagNames)

    return get(reportId)
  }

  const remove = async (reportId: number): Promise<boolean> => {
    // 関連する reportTag を消す
    await db.deleteFrom('report_tags')
      .where('report_id', '=', reportId)
      .executeTakeFirst()

    // レポートを削除する
    const { numDeletedRows } = await db.deleteFrom('reports')
      .where('id', '=', reportId)
      .executeTakeFirst()

    if (Number(numDeletedRows) === 0) {
      throw new Error('no result')
    }

    return true
  }

  const clear = async (): Promise<number> => {
    // 関連する reportTag を消す
    await db.deleteFrom('report_tags')
      .executeTakeFirst()

    // レポートを削除する
    const { numDeletedRows } = await db.deleteFrom('reports')
      .executeTakeFirst()

    return Number(numDeletedRows)
  }

  /// ////////////////////////////////////////////////////////////

  /**
   * レポートのタグを同期する.
   * @param {number} reportId 対象のレポートID
   * @param {string[]} tagNames タグ名
   * @return {Promise<void>}
   */
  const _syncTagNames = async (reportId: number, tagNames: string[]): Promise<void> => {
    // レポートに紐づく中間テーブル（＋タグ名）を取得
    const reportTags = await db.selectFrom('report_tags')
      .selectAll('report_tags')
      .where('report_id', '=', reportId)
      .leftJoin('tags', 'tags.id', 'report_tags.tag_id')
      .select('tags.name as tag_name') // 比較用
      .execute()

    // tagNames を回して、reportTag に無ければ新規に作成する
    for (const tagName of tagNames) {
      const exist = reportTags.find(rt => rt.tag_name === tagName)
      if (!exist) {
        // tag を取得する
        const tag = await tagAPI.getByName(tagName)

        // タグが無ければ新規に作成する
        let tagId = tag?.id
        if (!tagId) {
          const newTag = await tagAPI.create({
            name: tagName,
          })

          tagId = Number(newTag.id)
        }

        // reportTag を新規に作成する
        await db.insertInto('report_tags')
          .values({
            report_id: reportId,
            tag_id: tagId,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .executeTakeFirst()
      }
    }

    // 逆に中間テーブルを回して、tagNames に無ければ削除する
    for (const reportTag of reportTags) {
      const exist = tagNames.find(n => n === reportTag.tag_name)
      if (!exist) {
        // reportTag を削除する
        await db.deleteFrom('report_tags')
          .where('id', '=', reportTag.id)
          .executeTakeFirst()
      }
    }
  }

  return {
    getAll,
    get,
    create,
    update,
    remove,
    clear,
  }
}
