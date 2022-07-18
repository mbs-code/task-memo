import { Database } from '~~/src/databases/Database'
import { Nullable, SearchModel, SystemColumns } from '~~/src/databases/DBUtil'
import { Tag } from '~~/src/databases/models/Tag'

export type SeatchTag = SearchModel<Tag> & {
  noGroup?: boolean
  tagGroupId?: number
}
export type FormTag = Nullable<Omit<Tag, SystemColumns | 'path'>, 'is_pinned' | 'priority'>

export default class TagAPI {
  public static async getAll (params?: SeatchTag): Promise<Tag[]> {
    // タグ配列を取得する
    const tags = await Database.getDB()
      .selectFrom('tags')
      .selectAll()
      .if(Boolean(params?.noGroup), qb => qb.where('tag_group_id', 'is', null))
      .if(Boolean(params?.tagGroupId), qb => qb.where('tag_group_id', '=', params.tagGroupId))
      .if(Boolean(params?.perPage), qb => qb.limit(params.perPage))
      .if(Boolean(params?.page), qb => qb.offset(params.page))
      .if(Boolean(params?.sort), qb => qb.orderBy(params.sort[0], params.sort[1]))
      .if(Boolean(params?.sorts), qb => params.sorts.reduce((qb, sort) => qb.orderBy(sort[0], sort[1]), qb))
      .execute()

    return tags.map(tag => ({ ...tag }))
  }

  public static async get (tagId: number): Promise<Tag> {
    // タグを取得する
    const tag = await Database.getDB()
      .selectFrom('tags')
      .selectAll()
      .where('id', '=', tagId)
      .executeTakeFirstOrThrow()

    return { ...tag }
  }

  public static async getByName (tagName: string): Promise<Tag> {
    // タグを取得する
    const tag = await Database.getDB()
      .selectFrom('tags')
      .selectAll()
      .where('name', '=', tagName)
      .executeTakeFirst()

    return { ...tag }
  }

  public static async create (form: FormTag): Promise<Tag> {
    // タグを作成する
    const { insertId } = await Database.getDB()
      .insertInto('tags')
      .values({
        name: form.name,
        color: form.color || null,
        is_pinned: form.is_pinned ?? false,
        priority: form.priority ?? 0,
        tag_group_id: form.tag_group_id || null,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .executeTakeFirst()

    return await this.get(Number(insertId))
  }

  public static async update (tagId: number, form: FormTag): Promise<Tag> {
    // タグを更新する
    const { numUpdatedRows } = await Database.getDB()
      .updateTable('tags')
      .set({
        name: form.name,
        color: form.color || null,
        is_pinned: form.is_pinned ?? false,
        priority: form.priority ?? 0,
        tag_group_id: form.tag_group_id || null,
        updated_at: new Date(),
      })
      .where('id', '=', tagId)
      .executeTakeFirst()

    if (Number(numUpdatedRows) === 0) {
      throw new Error('no result')
    }

    return await this.get(tagId)
  }

  public static async updateGroup (tagId: number, tagGroupId?: number, priority?: number): Promise<Tag> {
    // タグのグループのみを更新する
    const { numUpdatedRows } = await Database.getDB()
      .updateTable('tags')
      .set({
        tag_group_id: tagGroupId || null,
        priority: priority ?? 0,
      })
      .where('id', '=', tagId)
      .executeTakeFirst()

    if (Number(numUpdatedRows) === 0) {
      throw new Error('no result')
    }

    return await this.get(tagId)
  }

  public static async remove (tagId: number): Promise<boolean> {
    // 関連する reportTag を消す
    await Database.getDB()
      .deleteFrom('report_tags')
      .where('tag_id', '=', tagId)
      .executeTakeFirst()

    // タグを削除する
    const { numDeletedRows } = await Database.getDB()
      .deleteFrom('tags')
      .where('id', '=', tagId)
      .executeTakeFirst()

    return Number(numDeletedRows) > 0
  }

  public static async clear (): Promise<number> {
    // 関連する reportTag を消す
    await Database.getDB()
      .deleteFrom('report_tags')
      .executeTakeFirst()

    // タグを削除する
    const { numDeletedRows } = await Database.getDB()
      .deleteFrom('tags')
      .executeTakeFirst()

    return Number(numDeletedRows)
  }
}
