import { Database } from '~~/src/databases/Database'
import { Nullable, SearchModel, SystemColumns } from '~~/src/databases/DBUtil'
import { TagGroup } from '~~/src/databases/models/TagGroup'

export type SeatchTag = SearchModel<TagGroup> & {
  noGroup?: boolean
  tagGroupId?: number
}
export type FormTagGroup = Nullable<Omit<TagGroup, SystemColumns | 'path'>, 'priority'>

export default class TagGroupAPI {
  public static async getAll (params?: SeatchTag): Promise<TagGroup[]> {
    // タググループを取得する
    const tagGroups = await Database.getDB()
      .selectFrom('tag_groups')
      .selectAll()
      .if(Boolean(params?.noGroup), qb => qb.where('tag_group_id', 'is', null))
      .if(Boolean(params?.tagGroupId), qb => qb.where('tag_group_id', '=', params.tagGroupId))
      .if(Boolean(params?.perPage), qb => qb.limit(params.perPage))
      .if(Boolean(params?.page), qb => qb.offset(params.page))
      .if(Boolean(params?.sort), qb => qb.orderBy(params.sort[0], params.sort[1]))
      .if(Boolean(params?.sorts), qb => params.sorts.reduce((qb, sort) => qb.orderBy(sort[0], sort[1]), qb))
      .execute()

    return tagGroups.map(tg => ({ ...tg }))
  }

  public static async get (tagId: number): Promise<TagGroup> {
    // タググループを取得する
    const tagGroup = await Database.getDB()
      .selectFrom('tag_groups')
      .selectAll()
      .where('id', '=', tagId)
      .executeTakeFirstOrThrow()

    return { ...tagGroup }
  }

  public static async create (form: FormTagGroup): Promise<TagGroup> {
    // タググループを作成する
    const { insertId } = await Database.getDB()
      .insertInto('tag_groups')
      .values({
        name: form.name,
        color: form.color || null,
        priority: form.priority ?? 0,
        tag_group_id: form.tag_group_id || null,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .executeTakeFirst()

    return await this.get(Number(insertId))
  }

  public static async update (tagGroupId: number, form: FormTagGroup): Promise<TagGroup> {
    // タググループを更新する
    const { numUpdatedRows } = await Database.getDB()
      .updateTable('tag_groups')
      .set({
        name: form.name,
        color: form.color || null,
        priority: form.priority ?? 0,
        tag_group_id: form.tag_group_id || null,
        updated_at: new Date(),
      })
      .where('id', '=', tagGroupId)
      .executeTakeFirst()

    if (Number(numUpdatedRows) === 0) {
      throw new Error('no result')
    }

    return await this.get(tagGroupId)
  }

  public static async updateGroup (tagGroupId: number, parentTagGroupId?: number, priority?: number): Promise<TagGroup> {
    // タググループのグループのみを更新する
    const { numUpdatedRows } = await Database.getDB()
      .updateTable('tag_groups')
      .set({
        tag_group_id: parentTagGroupId || null,
        priority: priority ?? 0,
      })
      .where('id', '=', tagGroupId)
      .executeTakeFirst()

    if (Number(numUpdatedRows) === 0) {
      throw new Error('no result')
    }

    return await this.get(tagGroupId)
  }

  public static async remove (tagGroupId: number): Promise<boolean> {
    // 関連する tag を消す
    await Database.getDB()
      .deleteFrom('tags')
      .where('tag_group_id', '=', tagGroupId)
      .executeTakeFirst()

    // 関連する tagGroup を消す
    await Database.getDB()
      .deleteFrom('tag_groups')
      .where('tag_group_id', '=', tagGroupId)
      .executeTakeFirst()

    // タググループを削除する
    const { numDeletedRows } = await Database.getDB()
      .deleteFrom('tag_groups')
      .where('id', '=', tagGroupId)
      .executeTakeFirst()

    return Number(numDeletedRows) > 0
  }

  public static async clear (): Promise<number> {
    // 関連する tag を消す
    await Database.getDB()
      .deleteFrom('tags')
      .where('tag_group_id', 'is not', null)
      .executeTakeFirst()

    // タググループを削除する
    const { numDeletedRows } = await Database.getDB()
      .deleteFrom('tag_groups')
      .executeTakeFirst()

    return Number(numDeletedRows)
  }
}
