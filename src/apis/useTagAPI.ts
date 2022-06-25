import { DeleteResult, Kysely } from 'kysely'
import { Tables } from '~~/src/databases/Database'
import { Nullable, SearchModel, SystemColumns } from '~~/src/databases/DBUtil'
import { Tag } from '~~/src/databases/models/Tag'

export type SeatchTag = SearchModel<Tag> & { parentTagId?: number }
export type FormTag = Nullable<Omit<Tag, SystemColumns | 'path'>, 'is_pinned' | 'priority'>

export const useTagAPI = (db: Kysely<Tables>) => {
  const getAll = async (params?: SeatchTag) => {
    // タグ配列を取得する
    const tags = await db.selectFrom('tags')
      .selectAll()
      .if(Boolean(params?.perPage), qb => qb.limit(params.perPage))
      .if(Boolean(params?.page), qb => qb.offset(params.page))
      .if(Boolean(params?.sort), qb => qb.orderBy(params.sort, params?.order ?? 'asc'))
      .execute()

    return tags.map(tag => ({ ...tag }))
  }

  const get = async (tagId: number) => {
    // タグを取得する
    const tag = await db.selectFrom('tags')
      .selectAll()
      .where('id', '=', tagId)
      .executeTakeFirstOrThrow()

    return { ...tag }
  }

  const getByName = async (tagName: string) => {
    // タグを取得する
    const tag = await db.selectFrom('tags')
      .selectAll()
      .where('name', '=', tagName)
      .executeTakeFirstOrThrow()

    return { ...tag }
  }

  const create = async (form: FormTag) => {
    // タグを作成する
    const { insertId } = await db.insertInto('tags')
      .values({
        name: form.name,
        color: form.color,
        is_pinned: form.is_pinned,
        priority: form.priority,
        parent_tag_id: form.parent_tag_id,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .executeTakeFirst()

    const tagId = Number(insertId)

    // タグのパスを同期する
    await _syncTagPath(tagId, null, form.parent_tag_id)

    return get(tagId)
  }

  const update = async (tagId: number, form: FormTag) => {
    // パス更新用に現在の値を取得する
    const { parent_tag_id: parentTagId } = await get(tagId)

    // レポートを更新する
    const { numUpdatedRows } = await db.updateTable('tags')
      .set({
        name: form.name,
        color: form.color,
        is_pinned: form.is_pinned,
        priority: form.priority,
        parent_tag_id: form.parent_tag_id,
        updated_at: new Date(),
      })
      .where('id', '=', tagId)
      .executeTakeFirst()

    if (Number(numUpdatedRows) === 0) {
      throw new Error('no result')
    }

    // タグのパスを同期する
    await _syncTagPath(tagId, parentTagId, form.parent_tag_id)

    return get(tagId)
  }

  const remove = async (tagId: number) => {
    // 関連する reportTag を消す
    const { numDeletedRows } = await _removeRecursive(tagId)

    return Number(numDeletedRows) > 0
  }

  const clear = async () => {
    // 関連する reportTag を消す
    await db.deleteFrom('report_tags')
      .executeTakeFirst()

    // タグを削除する
    const { numDeletedRows } = await db.deleteFrom('tags')
      .executeTakeFirst()

    return Number(numDeletedRows)
  }

  /// ////////////////////////////////////////////////////////////

  /**
   * _syncTagPath() で使用する再帰的子タグ更新関数.
   * @param {Tag | null} parentTag 親のタグ
   * @param {Tag} tag タグ
   * @return {Promise<void>}
   */
  const __syncTagPathRecursive = async (parentTag: Tag = null, tag: Tag): Promise<void> => {
    const path = parentTag
      ? `${parentTag.path}/${tag.id}`
      : `${tag.id}`

    // パスの更新
    await db.updateTable('tags')
      .set({ path })
      .where('id', '=', tag.id)
      .executeTakeFirst()

    // 再度自身を取得する
    const newTag = await get(tag.id)

    // 子供を探索して、再帰的に処理する
    const childTags = await getAll({ parentTagId: tag.id })
    for (const childTag of childTags) {
      await __syncTagPathRecursive(newTag, childTag)
    }
  }

  /**
   * タグのパスを同期する.
   * @param {number} tagId 対象のタグID
   * @param {number | null} oldParentTagId 以前の親タグID
   * @param {number | null} nowParentTagId 現在の親タグID
   * @return {Promise<void>}
   */
  const _syncTagPath = async (tagId: number, oldParentTagId?: number, nowParentTagId?: number): Promise<void> => {
    // 自身を取得する
    const tag = await get(tagId)

    // ■ null(root要素) から子要素になる場合
    if (!oldParentTagId && nowParentTagId) {
      // 親要素を取得する
      const parentTag = await get(nowParentTagId)

      // タグを再帰的に更新する
      await __syncTagPathRecursive(parentTag, tag)
    }

    // ■ 子要素から null(root要素) になる場合
    if (oldParentTagId && !nowParentTagId) {
      // タグを再帰的に更新する
      await __syncTagPathRecursive(null, tag)
    }

    // ■ 子要素から別の子要素になる場合
    // 変わっていないなら何もしない
    if (oldParentTagId && nowParentTagId && oldParentTagId !== nowParentTagId) {
      // 親要素を取得する
      const parentTag = await get(nowParentTagId)

      // タグを再帰的に更新する
      await __syncTagPathRecursive(parentTag, tag)
    }

    // ■ parentId が null のとき、path の先頭が自身のIDになっているか確認する
    // create 時の対策
    if (!nowParentTagId && !tag.path.startsWith(String(nowParentTagId))) {
      // タグを再帰的に更新する
      await __syncTagPathRecursive(null, tag)
    }
  }

  /**
   * タグを再帰的に削除する.
   * @param {number} tagId 対象のタグID
   * @returns {Promise<DeleteResult>}
   */
  const _removeRecursive = async (tagId: number): Promise<DeleteResult> => {
    // 子供を探索して、再帰的に処理する
    const childTags = await getAll({ parentTagId: tagId })
    for (const childTag of childTags) {
      await _removeRecursive(childTag.id)
    }

    // 関連する reportTag を消す
    await db.deleteFrom('report_tags')
      .where('tag_id', '=', tagId)
      .executeTakeFirst()

    // タグを削除する
    const res = await db.deleteFrom('tags')
      .where('id', '=', tagId)
      .executeTakeFirst()

    return res
  }

  return {
    getAll,
    get,
    getByName,
    create,
    update,
    remove,
    clear,
  }
}
