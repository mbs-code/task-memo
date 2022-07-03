import { Kysely } from 'kysely'
import { Tables } from '~~/src/databases/Database'
import { Nullable, SearchModel, SystemColumns } from '~~/src/databases/DBUtil'
import { Tag } from '~~/src/databases/models/Tag'

export type SeatchTag = SearchModel<Tag>
export type FormTag = Nullable<Omit<Tag, SystemColumns | 'path'>, 'is_pinned' | 'priority'>

export const useTagAPI = (db: Kysely<Tables>) => {
  const getAll = async (params?: SeatchTag): Promise<Tag[]> => {
    // タグ配列を取得する
    const tags = await db.selectFrom('tags')
      .selectAll()
      .if(Boolean(params?.perPage), qb => qb.limit(params.perPage))
      .if(Boolean(params?.page), qb => qb.offset(params.page))
      .if(Boolean(params?.sort), qb => qb.orderBy(params.sort, params?.order ?? 'asc'))
      .execute()

    return tags.map(tag => ({ ...tag }))
  }

  const get = async (tagId: number): Promise<Tag> => {
    // タグを取得する
    const tag = await db.selectFrom('tags')
      .selectAll()
      .where('id', '=', tagId)
      .executeTakeFirstOrThrow()

    return { ...tag }
  }

  const getByName = async (tagName: string): Promise<Tag> => {
    // タグを取得する
    const tag = await db.selectFrom('tags')
      .selectAll()
      .where('name', '=', tagName)
      .executeTakeFirst()

    return { ...tag }
  }

  const create = async (form: FormTag): Promise<Tag> => {
    // タグを作成する
    const { insertId } = await db.insertInto('tags')
      .values({
        name: form.name,
        color: form.color,
        is_pinned: form.is_pinned ?? false,
        priority: form.priority ?? 0,
        tag_group_id: form.tag_group_id,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .executeTakeFirst()

    return get(Number(insertId))
  }

  const update = async (tagId: number, form: FormTag): Promise<Tag> => {
    // タグを更新する
    const { numUpdatedRows } = await db.updateTable('tags')
      .set({
        name: form.name,
        color: form.color,
        is_pinned: form.is_pinned ?? false,
        priority: form.priority ?? 0,
        tag_group_id: form.tag_group_id,
        updated_at: new Date(),
      })
      .where('id', '=', tagId)
      .executeTakeFirst()

    if (Number(numUpdatedRows) === 0) {
      throw new Error('no result')
    }

    return get(tagId)
  }

  const updateGroup = async (tagId: number, tagGroupId?: number): Promise<Tag> => {
    // タグのグループのみを更新する
    const { numUpdatedRows } = await db.updateTable('tags')
      .set({
        tag_group_id: tagGroupId ?? null,
      })
      .where('id', '=', tagId)
      .executeTakeFirst()

    if (Number(numUpdatedRows) === 0) {
      throw new Error('no result')
    }

    return get(tagId)
  }

  const remove = async (tagId: number): Promise<boolean> => {
    // 関連する reportTag を消す
    await db.deleteFrom('report_tags')
      .where('tag_id', '=', tagId)
      .executeTakeFirst()

    // タグを削除する
    const { numDeletedRows } = await db.deleteFrom('tags')
      .where('id', '=', tagId)
      .executeTakeFirst()

    return Number(numDeletedRows) > 0
  }

  const clear = async (): Promise<number> => {
    // 関連する reportTag を消す
    await db.deleteFrom('report_tags')
      .executeTakeFirst()

    // タグを削除する
    const { numDeletedRows } = await db.deleteFrom('tags')
      .executeTakeFirst()

    return Number(numDeletedRows)
  }

  return {
    getAll,
    get,
    getByName,
    create,
    update,
    updateGroup,
    remove,
    clear,
  }
}
