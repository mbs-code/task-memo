<template>
  <div>
    <TagTreeRender
      :tag-tree="tagTree"
      :disabled="false"
      @update:group="onUpdateGroup"
      @update:tag="onUpdateTag"
    />
  </div>

  <!-- <TagTreeNested v-model:tasks="data" :disabled="false" /> -->
</template>

<script setup lang="ts">
import { useTagAPI } from '~~/src/apis/useTagAPI'
import { useTagGroupAPI } from '~~/src/apis/useTagGroup'
import { TagTreeItem } from '~~/src/composables/reports/useTagTree'
import { Database } from '~~/src/databases/Database'
import { TagGroup } from '~~/src/databases/models/TagGroup'

const props = defineProps<{
  tagTree: TagTreeItem,
}>()
const emit = defineEmits<{ // eslint-disable-line func-call-spacing
  (e: 'update'): void
}>()

const { db } = Database.getInstance()
const tagAPI = useTagAPI(db)
const tagGroupAPI = useTagGroupAPI(db)

const onUpdateGroup = async (
  groupId: number,
  targetGroup: TagGroup | null,
  insertId: number,
) => {
  console.log('> update', insertId)

  // group を取りに行く
  const group = await tagGroupAPI.get(groupId)
  console.log(group)

  // 同じ親を持つ group を取得する
  const siblings = await tagGroupAPI.getAll({
    noGroup: !targetGroup.id,
    tagGroupId: targetGroup.id,
    sorts: [['priority', 'asc'], ['id', 'asc']]
  })
  console.log(siblings)

  // 配列に突っ込む
  const sorts = siblings.filter(g => g.id !== group.id) // 自身は取り除く
  sorts.splice(insertId, 0, group) // 挿入
  console.log(sorts)

  for (const key in sorts) {
    const sort = sorts[key]
    await tagGroupAPI.updateGroup(sort.id, targetGroup.id, Number(key))
  }

  emit('update')
}

const onUpdateTag = async (
  tagId: number,
  targetGroup: TagGroup | null,
  insertId: number,
) => {
  console.log('> update', insertId)

  // tag を取りに行く
  const tag = await tagAPI.get(tagId)
  console.log(tag)

  // 同じ親を持つ tag を取得する
  const siblings = await tagAPI.getAll({
    noGroup: !targetGroup.id,
    tagGroupId: targetGroup.id,
    sorts: [['priority', 'asc'], ['id', 'asc']]
  })
  console.log(siblings)

  // 配列に突っ込む
  const sorts = siblings.filter(t => t.id !== tag.id) // 自身は取り除く
  sorts.splice(insertId, 0, tag) // 挿入
  console.log(sorts)

  for (const key in sorts) {
    const sort = sorts[key]
    await tagAPI.updateGroup(sort.id, targetGroup.id, Number(key))
  }

  emit('update')
}
</script>
