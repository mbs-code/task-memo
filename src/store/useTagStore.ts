import { defineStore } from 'pinia'
import TagAPI from '~~/src/apis/TagAPI'
import TagGroupAPI from '~~/src/apis/TagGroupAPI'
import { Tag } from '~~/src/databases/models/Tag'
import { TagGroup } from '~~/src/databases/models/TagGroup'

export type TagTreeItem = Tag & {
  groups: TagTreeItem[],
  tags: Tag[],
}

export const useTagStore = defineStore('todos', {
  state: () => {
    return {
      tags: [] as Tag[],
      tagGroups: [] as TagGroup[],
    }
  },

  getters: {
    tagTree (state) {
      const _mappedFunc = (tagGroups: TagGroup[], tags: Tag[], tagGroup?: TagGroup) => {
        // 子グループを探索して再起取得する
        const childGroups = tagGroups
          .filter(tg => tg.tag_group_id === (tagGroup?.id ?? null))
          .map(tg => _mappedFunc(tagGroups, tags, tg))

        // このグループに紐づくタグを取得
        const childTags = tags
          .filter(t => t.tag_group_id === (tagGroup?.id ?? null))

        // 結合して返却する
        return {
          ...tagGroup,
          groups: childGroups,
          tags: childTags,
        }
      }

      // タググループの親を探して再起取得する
      const rootTagGroups = _mappedFunc(state.tagGroups, state.tags, null)
      return {
        name: 'root',
        ...rootTagGroups,
      }
    }
  },

  actions: {
    /**
     * 初期化する.
     */
    async init () {
      try {
        this.tags = await TagAPI.getAll({ sorts: [['priority', 'asc'], ['id', 'asc']] })
        this.tagGroups = await TagGroupAPI.getAll({ sorts: [['priority', 'asc'], ['id', 'asc']] })
      } catch (err) {
        const toast = useToast()
        toast.catchError(err)
      }
    },
  },
})
