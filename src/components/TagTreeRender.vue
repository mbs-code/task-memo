<template>
  <div
    style="border: 1px solid grey;"
    :draggable="!disabled"
    @dragstart.stop="groupStart($event, tagTree)"
    @dragend.stop="dragEnd"
    @dragenter.prevent="groupEnter"
    @dragover.prevent="groupOver"
    @drop.stop="onDrop($event, 0, tagTree.tags.length)"
  >
    <div :class="{ 'text-red-500': Boolean(draggedGroup), 'text-blue-500': disabled }">
      ■{{ tagTree.name }} disabled: {{ disabled }}
    </div>

    <div
      class="p-2 bg-red-100"
      @drop.stop="onDrop($event, 0, tagTree.tags.length)"
    />

    <div class="flex flex-wrap">
      <div
        v-if="tagTree.tags.length"
        class="p-2 bg-green-100"
        @drop.stop="onDrop($event, 0, 0)"
      />

      <template
        v-for="(tag, idx) in tagTree.tags"
        :key="`${nest}-t${idx}`"
      >
        <Button
          :label="tag.name"
          :draggable="!disabled"
          class="p-button-outlined h-2rem"
          :class="{ 'text-red-500': draggedTag?.id === tag.id }"
          @dragstart.stop="tagStart($event, tag)"
          @dragend.stop="dragEnd"
        />

        <div
          class="p-2 bg-blue-100"
          @drop.stop="onDrop($event, 0, idx + 1)"
        />
      </template>
    </div>

    <div
      v-if="tagTree.tags.length"
      class="p-2 bg-orange-100"
      @drop.stop="onDrop($event, 0, tagTree.tags.length)"
    />

    <div
      v-for="(group, idx) in tagTree.groups"
      :key="`${nest}-g${idx}`"
      class="ml-4"
    >
      <TagTreeRender
        :tag-tree="group"
        :disabled="childDisabled"
        :nest="nest + 1"
        @update:group="($1, $2, $3) => emit('update:group', $1, $2, $3)"
        @update:tag="($1, $2, $3) => emit('update:tag', $1, $2, $3)"
      />

      <div
        class="p-2 bg-yellow-100"
        @drop.stop="onDrop($event, idx + 1, tagTree.tags.length)"
      />
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
  (e: 'update:group', id: number, targetGroup: TagGroup | null, insertIndex: number): void,
  (e: 'update:tag', id: number, targetGroup: TagGroup | null, insertIndex: number): void,
}>()

// const isDrag = ref<boolean>(false)
// const dragMode = ref<'tag' | 'group'>(null) // ドラッグモード
const draggedGroup = ref<TagGroup>(null) // ドラッグ中の、グループ
const draggedTag = ref<Tag>(null) // ドラッグ中の、タグ

const childDisabled = computed(() => {
  return props.disabled || Boolean(draggedGroup.value)
})

///

const groupStart = (event: DragEvent, tagGroup: TagGroup) => {
  console.log('start group', tagGroup.id)

  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.setData('group-id', String(tagGroup.id))

  draggedGroup.value = tagGroup
}

const tagStart = (event: DragEvent, tag: Tag) => {
  console.log('start tag', tag.id, tag.name)

  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.setData('tag-id', String(tag.id))

  draggedTag.value = tag
  console.log(draggedTag.value)
}

const onDrop = (event: DragEvent, insertGroupIndex: number, insertTagIndex: number) => {
  // -1 は最大値

  const tagId = event.dataTransfer.getData('tag-id') ?? null
  const groupId = event.dataTransfer.getData('group-id') ?? null
  console.log('onDrop:', props.tagTree.name)
  console.log('groupId', groupId, '::', insertGroupIndex)
  console.log('tagId', tagId, '::', insertTagIndex)

  // console.log('onDrop', 'tag: ' + tagId, 'group: ' + groupId, '=>', tagGroup.name)
  // console.log(tagGroup)
  // // const dragList = this.lists.find(list => list.id == dragId)
  // // dragList.category = dropCategory

  if (tagId) {
    emit('update:tag', Number(tagId), props.tagTree, insertTagIndex)
  }

  // 無効ではなく、自身で持っていない場合は drop 処理
  if (!(props.disabled || Boolean(draggedGroup.value) || Boolean(draggedTag.value))) {
    if (groupId) {
      emit('update:group', Number(groupId), props.tagTree, insertGroupIndex)
    }
  }

  dragEnd()
}

const dragEnd = () => {
  console.log('end')
  draggedTag.value = null
  draggedGroup.value = null
}

///

const groupEnter = () => {
  // isDrag.value = true
  console.log('xx enter ' + props.tagTree.name)
}

const groupOver = (event: DragEvent) => {
  // isDrag.value = true
  // console.log('xx over ' + props.tagTree.name)
}

// const groupLeave = () => {
//   isDrag.value = false
//   console.log('xx leave ' + props.tagTree.name)
// }

///

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
