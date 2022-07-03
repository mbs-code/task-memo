<template>
  <div>
    <TagTreeRender
      :tag-tree="tagTree"
      :disabled="false"
      @update:node="onUpdateNode"
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

const onUpdateNode = async (mode: 'tag' | 'group', id: number, targetGroup: TagGroup | null) => {
  if (mode === 'tag') {
    await tagAPI.updateGroup(id, targetGroup.id)
    emit('update')
  } else if (mode === 'group' && id !== targetGroup.id) {
    console.log('change')
    await tagGroupAPI.updateGroup(id, targetGroup.id)
    emit('update')
  }
}
</script>
