import { defineStore } from 'pinia'
import BookmarkAPI from '~~/src/apis/BookmarkAPI'
import { Bookmark } from '~~/src/databases/models/Bookmark'

export const useBookmarkStore = defineStore('bookmarks', {
  state: () => {
    return {
      bookmarks: [] as Bookmark[],
    }
  },

  getters: { /** */ },

  actions: {
    /**
     * 初期化する.
     */
    async init () {
      try {
        this.bookmarks = await BookmarkAPI.getAll({ sorts: [['priority', 'asc'], ['id', 'asc']] })
      } catch (err) {
        const toast = useToast()
        toast.catchError(err)
      }
    },
  },
})
