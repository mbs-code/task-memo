import { Kysely } from 'kysely'
import { useTagAPI } from '~~/src/apis/useTagAPI'
import { useTagGroupAPI } from '~~/src/apis/useTagGroup'
import { Tables } from '~~/src/databases/Database'
import { Tag } from '~~/src/databases/models/Tag'
import { TagGroup } from '~~/src/databases/models/TagGroup'

export type TagTreeItem = Tag & {
  groups: TagTreeItem[],
  tags: Tag[],
}

export const useTagTree = (db: Kysely<Tables>, toast: ReturnType<typeof useToast>) => {
  const tagAPI = useTagAPI(db)
  const tagGroupAPI = useTagGroupAPI(db)

  const tags = ref<Tag[]>([])
  const tagGroups = ref<TagGroup[]>([])

  const onInit = async () => {
    try {
      tags.value = await tagAPI.getAll({ sorts: [['priority', 'asc'], ['id', 'asc']] })
      tagGroups.value = await tagGroupAPI.getAll({ sorts: [['priority', 'asc'], ['id', 'asc']] })
    } catch (err) {
      toast.catchError(err)
    }
  }

  /// ////////////////////////////////////////////////////////////

  const tagTrees = computed<TagTreeItem>(() => {
    // タググループの親を探して再起取得する
    const rootTagGroups = _mapped(null)
    return {
      name: 'root',
      ...rootTagGroups,
    }
  })

  const _mapped = (tagGroup?: TagGroup) => {
    // 子グループを探索して再起取得する
    const childGroups = tagGroups.value
      .filter(tg => tg.tag_group_id === (tagGroup?.id || null))
      .map(tg => _mapped(tg))

    // このグループに紐づくタグを取得
    const childTags = tags.value
      .filter(t => t.tag_group_id === (tagGroup?.id || null))

    // 結合して返却する
    return {
      ...tagGroup,
      groups: childGroups,
      tags: childTags,
    }
  }

  return {
    onInit,

    tags,
    tagGroups,
    tagTrees,
  }
}
