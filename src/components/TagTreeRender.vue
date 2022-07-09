<template>
  <div
    style="border: 1px solid grey;"
    :class="{ 'border-pink-500 bg-pink-300': isEnterArea }"
    :draggable="!disabled"
    @dragstart.stop="groupStart($event, tagTree)"
    @dragend.stop="dragEnd"
    @drop.stop="onDrop($event, 0, tagTree.tags.length)"
    @dragenter.stop="isEnterArea = true"
    @dragleave.stop="isEnterArea = false"
    @dragover.prevent
  >
    <div :class="{ 'text-red-500': Boolean(draggedGroup), 'text-blue-500': disabled }">
      <span>■{{ tagTree.name }}</span>
      <Button
        v-if="nest !== 0"
        class="p-button-text"
        @click="onTagGroupClick(tagTree, tagTree)"
      >
        Edit
      </Button>

      <Button
        class="p-button-text"
        @click="onTagGroupClick(null, tagTree)"
      >
        NewTagGroup
      </Button>

      <Button
        class="p-button-text"
        @click="onTagClick(null, tagTree)"
      >
        NewTag
      </Button>
    </div>

    <div
      class="p-2 bg-red-100"
      :class="{ 'bg-red-900': isEnterTop }"
      @drop.stop="onDrop($event, 0, tagTree.tags.length)"
      @dragenter.stop="isEnterTop = true"
      @dragleave.stop="isEnterTop = false"
    />

    <div class="flex flex-wrap">
      <div
        v-if="tagTree.tags.length"
        class="p-2 bg-green-100"
        :class="{ 'bg-green-900': isEnterLeft }"
        @drop.stop="onDrop($event, 0, 0)"
        @dragenter.stop="isEnterLeft = true"
        @dragleave.stop="isEnterLeft = false"
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
          @drop.stop
          @dragstart.stop="tagStart($event, tag)"
          @dragend.stop="dragEnd"
          @click="onTagClick(tag, tagTree)"
        />

        <div
          class="p-2 bg-blue-100"
          :class="{ 'bg-blue-900': isEnterTagId === idx }"
          @drop.stop="onDrop($event, 0, idx + 1)"
          @dragenter.stop="isEnterTagId = idx"
          @dragleave.stop="isEnterTagId = null"
        />
      </template>
    </div>

    <div
      v-if="tagTree.tags.length"
      class="p-2 bg-orange-100"
      :class="{ 'bg-orange-900': isEnterBottom }"
      @drop.stop="onDrop($event, 0, tagTree.tags.length)"
      @dragenter.stop="isEnterBottom = true"
      @dragleave.stop="isEnterBottom = false"
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
        @delete:group="($1) => emit('delete:group', $1)"
        @delete:tag="($1) => emit('delete:tag', $1)"
      />

      <div
        class="p-2 bg-yellow-100"
        :class="{ 'bg-yellow-900': isEnterGroupId === idx }"
        @drop.stop="onDrop($event, idx + 1, tagTree.tags.length)"
        @dragenter.stop="isEnterGroupId = idx"
        @dragleave.stop="isEnterGroupId = null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onTagClickKey, onTagGroupClickKey, tagTreeActionKey } from '~~/src/components/TagTree.vue'
import { TagTreeItem } from '~~/src/composables/reports/useTagTreeAction'
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
  (e: 'delete:group', id: number): void,
  (e: 'delete:tag', id: number): void,
}>()

const tagTreeAction = inject(tagTreeActionKey)
const onTagGroupClick = inject(onTagGroupClickKey)
const onTagClick = inject(onTagClickKey)

///

const isEnterArea = ref<boolean>(false)
const isEnterTop = ref<boolean>(false)
const isEnterBottom = ref<boolean>(false)
const isEnterGroupId = ref<number>(null)
const isEnterLeft = ref<boolean>(false)
const isEnterTagId = ref<number>(null)

const draggedGroup = ref<TagGroup>(null) // ドラッグ中の、グループ
const draggedTag = ref<Tag>(null) // ドラッグ中の、タグ

const childDisabled = computed(() => {
  return props.disabled || Boolean(draggedGroup.value)
})

///

const groupStart = (event: DragEvent, tagGroup: TagGroup) => {
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.setData('group-id', String(tagGroup.id))

  draggedGroup.value = tagGroup
}

const tagStart = (event: DragEvent, tag: Tag) => {
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.setData('tag-id', String(tag.id))

  draggedTag.value = tag
}

const onDrop = (event: DragEvent, insertGroupIndex: number, insertTagIndex: number) => {
  const tagId = event.dataTransfer.getData('tag-id') ?? null
  const groupId = event.dataTransfer.getData('group-id') ?? null

  if (tagId) {
    tagTreeAction.onUpdateTag(Number(tagId), props.tagTree, insertTagIndex)
  }

  // 無効ではなく、自身で持っていない場合は drop 処理
  if (!(props.disabled || Boolean(draggedGroup.value) || Boolean(draggedTag.value))) {
    if (groupId) {
      tagTreeAction.onUpdateGroup(Number(groupId), props.tagTree, insertGroupIndex)
    }
  }

  dragEnd()
}

const onDeleteGroup = (tagGroup: TagGroup) => {
  emit('delete:group', tagGroup.id)
}

const onDeleteTag = (tag: Tag) => {
  emit('delete:tag', tag.id)
}

const dragEnd = () => {
  isEnterArea.value = null
  isEnterTop.value = null
  isEnterBottom.value = null
  isEnterGroupId.value = null
  isEnterLeft.value = null
  isEnterTagId.value = null

  draggedTag.value = null
  draggedGroup.value = null
}
</script>
