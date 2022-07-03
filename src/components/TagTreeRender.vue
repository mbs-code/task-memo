<template>
  <div
    :class="{ 'bg-cyan-500': isDrag }"
    style="border: 1px solid grey;"
    :draggable="!disabled"
    @dragstart.stop="groupStart($event, tagTree)"
    @dragend.stop="isDrag = false"
    @dragenter.prevent="groupEnter"
    @dragover.prevent="groupOver"
  >
    <div>
      ■{{ tagTree.name }} {{ disabled }} {{ isDrag }}
    </div>

    <div
      class="p-2 bg-red-300"
      @drop.stop="onDrop($event, tagTree)"
    />

    <div
      v-for="(group, __) in tagTree.groups"
      :key="`${nest}-g${__}`"
      class="ml-4"
    >
      <!-- class="m-2" -->
      <TagTreeRender
        :tag-tree="group"
        :disabled="disabled || isDrag"
        :nest="nest + 1"
        @update:node="($1, $2, $3) => emit('update:node', $1, $2, $3)"
      />

      <div
        class="p-2 bg-yellow-300"
        @drop.stop="onDrop($event, tagTree)"
      />
    </div>

    <div class="flex flex-wrap">
      <template
        v-for="(tag, __) in tagTree.tags"
        :key="`${nest}-t${__}`"
      >
        <Button
          :label="tag.name"
          :draggable="!disabled"
          @dragstart.stop="tagStart($event, tag)"
          @dragend.stop="isDrag = false"
        />
        <div
          class="p-2 bg-cyan-300"
          @drop.stop="onDrop($event, tagTree)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TagTreeItem } from '~~/src/composables/reports/useTagTree'
import { Tag } from '~~/src/databases/models/Tag'
import { TagGroup } from '~~/src/databases/models/TagGroup'

const props = withDefaults(defineProps<{
  tagTree: TagTreeItem,
  disabled?: boolean,
  nest?: number
}>(), {
  disabled: false,
  nest: 0,
})
const emit = defineEmits<{ // eslint-disable-line func-call-spacing
  (e: 'update:node', mode: 'tag' | 'group', id: number, targetGroup: TagGroup | null): void
}>()

const isDrag = ref<boolean>(false)

const onDrop = (event: DragEvent, tagGroup: TagGroup) => {
  const tagId = event.dataTransfer.getData('tag-id') ?? null
  const groupId = event.dataTransfer.getData('group-id') ?? null
  console.log('onDrop', 'tag: ' + tagId, 'group: ' + groupId, '=>', tagGroup.name)
  console.log(tagGroup)
  // const dragList = this.lists.find(list => list.id == dragId)
  // dragList.category = dropCategory
  if (props.disabled || isDrag.value) {
    console.log('return')
    isDrag.value = false
    return
  }

  if (tagId) {
    emit('update:node', 'tag', Number(tagId), tagGroup)
  }

  if (groupId) {
    emit('update:node', 'group', Number(groupId), tagGroup)
  }

  isDrag.value = false

  // if (tagId) {
  //   const tag = props.tagTree.tags.find(t => t.id === Number(tagId))
  //   console.log(tag)
  // }

  // if (groupId) {
  //   const group = props.tagTree.groups.find(g => g.id === Number(groupId))
  //   console.log(group)
  // }

  // emit('update:node')
}

const groupEnter = () => {
  // isDrag.value = true
  console.log('xx enter ' + props.tagTree.name)
}

const groupOver = (event: DragEvent) => {
  // isDrag.value = true
  console.log('xx over ' + props.tagTree.name)
}

// const groupLeave = () => {
//   isDrag.value = false
//   console.log('xx leave ' + props.tagTree.name)
// }

///

const groupStart = (event: DragEvent, tagGroup: TagGroup) => {
  console.log('start group', tagGroup.id)

  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.setData('group-id', String(tagGroup.id))

  isDrag.value = true
}

const tagStart = (event: DragEvent, tag: Tag) => {
  console.log('start tag', tag.id, tag.name)

  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.setData('tag-id', String(tag.id))

  isDrag.value = true
}

// const groupStart = (e, tagGroup: TagGroup) => {
//   console.log('start group', tagGroup.id, tagGroup.name, e)
// }

// const groupEnd = (e, tagGroup: TagGroup) => {
//   console.log('end group', tagGroup.id, tagGroup.name, e)
// }

// const tagEnd = (e, tag: Tag) => {
//   console.log('end tag', tag.id, tag.name, e)
// }
</script>
