import { Kysely } from 'kysely'
import { SystemColumns, Tables } from '~~/src/databases/db'
import { Bookmark } from '~~/src/databases/models/Bookmark'

export type SearchBookmark = {
  page?: number
  perPage?: number
}

export type FormBookmark = Omit<Bookmark, SystemColumns>

export const useReportAPI = (db: Kysely<Tables>) => {
  const getAll = async (params?: SearchBookmark) => {
    // ブックマークを取得する
    const bookmarks = await db.selectFrom('bookmarks')
      .selectAll()
      .if(Boolean(params?.perPage), qb => qb.limit(params.perPage))
      .if(Boolean(params?.page), qb => qb.offset(params.page))
      .execute()

    return bookmarks.map(bookmark => ({ ...bookmark }))
  }

  const get = async (bookmarkId: number) => {
    // ブックマークを取得する
    const bookmark = await db.selectFrom('bookmarks')
      .selectAll()
      .where('id', '=', bookmarkId)
      .executeTakeFirstOrThrow()

    return { ...bookmark }
  }

  const create = async (form: FormBookmark) => {
    // ブックマークを作成する
    const { insertId } = await db.insertInto('bookmarks')
      .values({
        text: form.text,
        color: form.color,
        priority: form.priority,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .executeTakeFirst()

    return get(Number(insertId))
  }

  const update = async (bookmarkId: number, form: FormBookmark) => {
    // ブックマークを更新する
    const { numUpdatedRows } = await db.updateTable('bookmarks')
      .set({
        text: form.text,
        color: form.color,
        priority: form.priority,
        updated_at: new Date(),
      })
      .where('id', '=', bookmarkId)
      .executeTakeFirst()

    if (Number(numUpdatedRows) === 0) {
      throw new Error('no result')
    }

    return get(bookmarkId)
  }

  const remove = async (bookmarkId: number) => {
    // ブックマークを削除する
    const { numDeletedRows } = await db.deleteFrom('bookmarks')
      .where('id', '=', bookmarkId)
      .executeTakeFirst()

    if (Number(numDeletedRows) === 0) {
      throw new Error('no result')
    }

    return true
  }

  const clear = async () => {
    // ブックマークを削除する
    const { numDeletedRows } = await db.deleteFrom('bookmarks')
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
