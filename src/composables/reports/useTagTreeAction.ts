import { Kysely } from 'kysely'
import { useTagAPI } from '~~/src/apis/useTagAPI'
import { useTagGroupAPI } from '~~/src/apis/useTagGroupAPI'
import { Tables } from '~~/src/databases/Database'
import { Tag } from '~~/src/databases/models/Tag'
import { TagGroup } from '~~/src/databases/models/TagGroup'

export type TagTreeItem = Tag & {
  groups: TagTreeItem[],
  tags: Tag[],
}

export const useTagTreeAction = (db: Kysely<Tables>, toast: ReturnType<typeof useToast>) => {
  const tagAPI = useTagAPI(db)
  const tagGroupAPI = useTagGroupAPI(db)

  const tags = ref<Tag[]>([])
  const tagGroups = ref<TagGroup[]>([])

  /// ////////////////////////////////////////////////////////////

  const tagTree = computed<TagTreeItem>(() => {
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
      .filter(tg => tg.tag_group_id === (tagGroup?.id ?? null))
      .map(tg => _mapped(tg))

    // このグループに紐づくタグを取得
    const childTags = tags.value
      .filter(t => t.tag_group_id === (tagGroup?.id ?? null))

    // 結合して返却する
    return {
      ...tagGroup,
      groups: childGroups,
      tags: childTags,
    }
  }

  /// ////////////////////////////////////////////////////////////

  /**
   * 初期化する.
   *
   * @return Primise<void>
   */
  const onInit = async () => {
    try {
      tags.value = await tagAPI.getAll({ sorts: [['priority', 'asc'], ['id', 'asc']] })
      tagGroups.value = await tagGroupAPI.getAll({ sorts: [['priority', 'asc'], ['id', 'asc']] })
    } catch (err) {
      toast.catchError(err)
    }
  }

  const onUpdateGroup = async (tagGroupId: number, targetGroup: TagGroup | null, insertId: number) => {
    // group を取りに行く
    const group = tagGroups.value.find(g => g.id === tagGroupId)
    if (!group) { throw new Error('TagGroup ID が存在しません。 id=' + tagGroupId) }

    // 同じ親を持つ group を取得する
    const siblings = await tagGroupAPI.getAll({
      noGroup: !targetGroup.id,
      tagGroupId: targetGroup.id,
      sorts: [['priority', 'asc'], ['id', 'asc']]
    })

    // 配列に突っ込む
    const sorts = siblings.filter(g => g.id !== group.id) // 自身は取り除く
    sorts.splice(insertId, 0, group) // 挿入

    for (const key in sorts) {
      const sort = sorts[key]
      await tagGroupAPI.updateGroup(sort.id, targetGroup.id, Number(key))
    }

    // 更新する
    onInit()
  }

  const onUpdateTag = async (tagId: number, targetGroup: TagGroup | null, insertId: number) => {
    // tag を取りに行く
    const tag = await tagAPI.get(tagId)

    // 同じ親を持つ tag を取得する
    const siblings = await tagAPI.getAll({
      noGroup: !targetGroup.id,
      tagGroupId: targetGroup.id,
      sorts: [['priority', 'asc'], ['id', 'asc']]
    })

    // 配列に突っ込む
    const sorts = siblings.filter(t => t.id !== tag.id) // 自身は取り除く
    sorts.splice(insertId, 0, tag) // 挿入

    for (const key in sorts) {
      const sort = sorts[key]
      await tagAPI.updateGroup(sort.id, targetGroup.id, Number(key))
    }

    // 更新する
    onInit()
  }

  return {
    tags: readonly(tags),
    tagGroups: readonly(tagGroups),
    tagTree,

    onInit,
    onUpdateGroup,
    onUpdateTag,
  }
}

export type TagTreeActionType = ReturnType<typeof useTagTreeAction>
