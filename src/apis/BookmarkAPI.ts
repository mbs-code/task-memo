import { Database } from '~~/src/databases/Database'
import { Nullable, SearchModel, SystemColumns } from '~~/src/databases/DBUtil'
import { Bookmark } from '~~/src/databases/models/Bookmark'

export type SearchBookmark = SearchModel<Bookmark>
export type FormBookmark = Nullable<Omit<Bookmark, SystemColumns>, 'priority'>

export default class BookmarkAPI {
  public static async getAll (params?: SearchBookmark): Promise<Bookmark[]> {
    // ブックマークを取得する
    const bookmarks = await Database.getDB()
      .selectFrom('bookmarks')
      .selectAll()
      .if(Boolean(params?.perPage), qb => qb.limit(params.perPage))
      .if(Boolean(params?.page), qb => qb.offset(params.page))
      .if(Boolean(params?.sort), qb => qb.orderBy(params.sort[0], params.sort[1]))
      .if(Boolean(params?.sorts), qb => params.sorts.reduce((qb, sort) => qb.orderBy(sort[0], sort[1]), qb))
      .execute()

    return bookmarks.map(bookmark => ({ ...bookmark }))
  }

  public static async get (bookmarkId: number): Promise<Bookmark> {
    // ブックマークを取得する
    const bookmark = await Database.getDB()
      .selectFrom('bookmarks')
      .selectAll()
      .where('id', '=', bookmarkId)
      .executeTakeFirstOrThrow()

    return { ...bookmark }
  }

  public static async create (form: FormBookmark): Promise<Bookmark> {
    // ブックマークを作成する
    const { insertId } = await Database.getDB()
      .insertInto('bookmarks')
      .values({
        name: form.name,
        json: form.json,
        color: form.color || null,
        priority: form.priority ?? 0,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .executeTakeFirst()

    return await this.get(Number(insertId))
  }

  public static async update (bookmarkId: number, form: FormBookmark): Promise<Bookmark> {
    // ブックマークを更新する
    const { numUpdatedRows } = await Database.getDB()
      .updateTable('bookmarks')
      .set({
        name: form.name,
        json: form.json,
        color: form.color || null,
        priority: form.priority ?? 0,
        updated_at: new Date(),
      })
      .where('id', '=', bookmarkId)
      .executeTakeFirst()

    if (Number(numUpdatedRows) === 0) {
      throw new Error('no result')
    }

    return await this.get(bookmarkId)
  }

  public static async remove (bookmarkId: number): Promise<boolean> {
    // ブックマークを削除する
    const { numDeletedRows } = await Database.getDB()
      .deleteFrom('bookmarks')
      .where('id', '=', bookmarkId)
      .executeTakeFirst()

    if (Number(numDeletedRows) === 0) {
      throw new Error('no result')
    }

    return true
  }

  public static async clear (): Promise<number> {
    // ブックマークを削除する
    const { numDeletedRows } = await Database.getDB()
      .deleteFrom('bookmarks')
      .executeTakeFirst()

    return Number(numDeletedRows)
  }
}
