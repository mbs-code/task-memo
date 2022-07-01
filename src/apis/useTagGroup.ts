import { Kysely } from 'kysely'
import { Tables } from '~~/src/databases/Database'
import { Nullable, SearchModel, SystemColumns } from '~~/src/databases/DBUtil'
import { TagGroup } from '~~/src/databases/models/TagGroup'

export type SeatchTag = SearchModel<TagGroup>
export type FormTag = Nullable<Omit<TagGroup, SystemColumns | 'path'>, 'priority'>

export const useTagGroupAPI = (db: Kysely<Tables>) => {
  const getAll = async (params?: SeatchTag): Promise<TagGroup[]> => {
    // タググループを取得する
    const tagGroups = await db.selectFrom('tag_groups')
      .selectAll()
      .if(Boolean(params?.perPage), qb => qb.limit(params.perPage))
      .if(Boolean(params?.page), qb => qb.offset(params.page))
      .if(Boolean(params?.sort), qb => qb.orderBy(params.sort, params?.order ?? 'asc'))
      .execute()

    return tagGroups.map(tg => ({ ...tg }))
  }

  const get = async (tagId: number): Promise<TagGroup> => {
    // タググループを取得する
    const tagGroup = await db.selectFrom('tag_groups')
      .selectAll()
      .where('id', '=', tagId)
      .executeTakeFirstOrThrow()

    return { ...tagGroup }
  }

  const create = async (form: FormTag): Promise<TagGroup> => {
    // タググループを作成する
    const { insertId } = await db.insertInto('tag_groups')
      .values({
        name: form.name,
        color: form.color,
        priority: form.priority ?? 0,
        tag_group_id: form.tag_group_id,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .executeTakeFirst()

    return get(Number(insertId))
  }

  const update = async (tagId: number, form: FormTag): Promise<TagGroup> => {
    // タググループを更新する
    const { numUpdatedRows } = await db.updateTable('tag_groups')
      .set({
        name: form.name,
        color: form.color,
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

  const remove = async (tagId: number): Promise<boolean> => {
    // 関連する tag から親をを消す
    await db.updateTable('tags')
      .set({ tag_group_id: null })
      .where('tag_group_id', '=', tagId)
      .executeTakeFirst()

    // 関連する tagGroup から親をを消す
    await db.updateTable('tag_groups')
      .set({ tag_group_id: null })
      .where('tag_group_id', '=', tagId)
      .executeTakeFirst()

    // タグを削除する
    const { numDeletedRows } = await db.deleteFrom('tag_groups')
      .where('id', '=', tagId)
      .executeTakeFirst()

    return Number(numDeletedRows) > 0
  }

  const clear = async (): Promise<number> => {
    // 関連する tag から親をを消す
    await db.updateTable('tags')
      .set({ tag_group_id: null })
      .executeTakeFirst()

    // タググループを削除する
    const { numDeletedRows } = await db.deleteFrom('tag_groups')
      .executeTakeFirst()

    return Number(numDeletedRows)
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
