<template>
  <TagGroupItem
    :tag-group="tagTree"
    :disabled="disabled"
    :is-drag="Boolean(draggedGroup)"
    :is-enter="Boolean(isEnterArea) || Boolean(isEnterTop) || isEnterGroupId !== null || isEnterTagId !== null || isEnterTagDivId !== null"
    :draggable="!disabled"
    @dragstart.stop="groupStart($event, tagTree)"
    @dragend.stop="dragEnd"
    @drop.prevent="onDrop($event, 0, tagTree.tags.length)"
    @dragenter.stop="isEnterArea = true"
    @dragleave.stop="isEnterArea = false"
    @dragover.prevent
    @click:tagGroup="onClickTagGroup(null, tagTree)"
    @click:tag="onClickTag(null, tagTree)"
    @click="onClickTagGroup(tagTree, null)"
  >
    <div class="flex-grow-1">
      <div
        class="drag-separator"
        :class="{ 'drag-over': isEnterTop }"
        @drop.stop="onDrop($event, 0, 0)"
        @dragenter.prevent="isEnterTop = true"
        @dragleave.prevent="isEnterTop = false"
        @dragover.prevent
      />

      <template
        v-for="(tag, idx) in tagTree.tags"
        :key="`${nest}-t${idx}`"
      >
        <TagItem
          :tag="tag"
          :is-drag="draggedTag?.id === tag.id"
          :is-selected="Boolean(selectedTags.find((t) => t.id === tag.id))"
          :draggable="!disabled"
          @dragstart.stop="tagStart($event, tag)"
          @dragend.stop="dragEnd"
          @drop.stop="onDrop($event, 0, idx)"
          @dragenter.prevent="isEnterTagId = idx"
          @dragleave.prevent="isEnterTagId = null"
          @dragover.prevent
          @click="onClickTag(tag, tagTree)"
        />

        <div
          class="drag-separator"
          :class="{ 'drag-over': isEnterTagDivId === idx }"
          @drop.stop="onDrop($event, 0, idx + 1)"
          @dragenter.prevent="isEnterTagDivId = idx"
          @dragleave.prevent="isEnterTagDivId = null"
          @dragover.prevent
        />
      </template>

      <template
        v-for="(group, idx) in tagTree.groups"
        :key="`${nest}-g${idx}`"
      >
        <TagTreeRender
          :tag-tree="group"
          :selected-tags="selectedTags"
          :disabled="childDisabled"
          :nest="nest + 1"
          @delete:group="($1) => emit('delete:group', $1)"
          @delete:tag="($1) => emit('delete:tag', $1)"
        />

        <div
          class="drag-separator"
          :class="{ 'drag-over': isEnterGroupId === idx }"
          @drop.prevent="onDrop($event, idx + 1, tagTree.tags.length)"
          @dragenter.prevent="isEnterGroupId = idx"
          @dragleave.prevent="isEnterGroupId = null"
          @dragover.prevent
        />
      </template>
    </div>
  </TagGroupItem>
</template>

<script setup lang="ts">
import { onClickTagKey, onClickTagGroupKey, onUpdateTagGroupKey, onUpdateTagKey } from '~~/src/components/tagTrees/TagTree.vue'
import { Tag } from '~~/src/databases/models/Tag'
import { TagGroup } from '~~/src/databases/models/TagGroup'
import { TagTreeItem } from '~~/src/store/useTagStore'

const props = withDefaults(defineProps<{
  tagTree: TagTreeItem,
  selectedTags: Tag[],
  disabled?: boolean,
  nest?: number
}>(), {
  disabled: false,
  nest: 0,
})
const emit = defineEmits<{ // eslint-disable-line func-call-spacing
  (e: 'delete:group', id: number): void,
  (e: 'delete:tag', id: number): void,
}>()

const onClickTagGroup = inject(onClickTagGroupKey)
const onClickTag = inject(onClickTagKey)
const onUpdateTagGroup = inject(onUpdateTagGroupKey)
const onUpdateTag = inject(onUpdateTagKey)

///

const isEnterArea = ref<boolean>(false)
const isEnterTop = ref<boolean>(false)
const isEnterBottom = ref<boolean>(false)
const isEnterGroupId = ref<number>(null)
const isEnterLeft = ref<boolean>(false)
const isEnterTagId = ref<number>(null)
const isEnterTagDivId = ref<number>(null)

const draggedGroup = ref<TagGroup>(null) // ドラッグ中の、グループ
const draggedTag = ref<Tag>(null) // ドラッグ中の、タグ

const childDisabled = computed(() => {
  return props.disabled || Boolean(draggedGroup.value)
})

const isRoot = computed(() => props.nest === 0)

///

const groupStart = (event: DragEvent, tagGroup: TagGroup) => {
  if (!props.disabled) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.dropEffect = 'move'
    event.dataTransfer.setData('group-id', String(tagGroup.id))

    draggedGroup.value = tagGroup
  }
}

const tagStart = (event: DragEvent, tag: Tag) => {
  if (!props.disabled) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.dropEffect = 'move'
    event.dataTransfer.setData('tag-id', String(tag.id))

    draggedTag.value = tag
  }
}

const onDrop = (event: DragEvent, insertGroupIndex: number, insertTagIndex: number) => {
  const tagId = event.dataTransfer.getData('tag-id') ?? null
  const groupId = event.dataTransfer.getData('group-id') ?? null

  if (tagId) {
    onUpdateTag(Number(tagId), props.tagTree, insertTagIndex)
  }

  // 無効ではなく、自身で持っていない場合は drop 処理
  if (!(props.disabled || Boolean(draggedGroup.value) || Boolean(draggedTag.value))) {
    if (groupId) {
      onUpdateTagGroup(Number(groupId), props.tagTree, insertGroupIndex)
    }
  }

  dragEnd()
}

const dragEnd = () => {
  isEnterArea.value = null
  isEnterTop.value = null
  isEnterBottom.value = null
  isEnterGroupId.value = null
  isEnterLeft.value = null
  isEnterTagId.value = null
  isEnterTagDivId.value = null

  draggedTag.value = null
  draggedGroup.value = null
}
</script>

<style scoped lang="scss">
.drag-over {
  background-color: var(--surface-700);
}

.drag-separator {
  height: 6px;
}
</style>
