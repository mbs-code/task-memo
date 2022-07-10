<template>
  <div
    :class="{ 'bg-green-100': Boolean(draggedGroup), 'bg-blue-100': Boolean(isEnterArea) }"
    :draggable="!disabled"
    @dragstart.stop="groupStart($event, tagTree)"
    @dragend.stop="dragEnd"
    @drop.stop="onDrop($event, 0, tagTree.tags.length)"
    @dragenter.stop="isEnterArea = true"
    @dragleave.stop="isEnterArea = false"
    @dragover.prevent
  >
    <div
      class="flex gap-2 align-items-center"
      :class="{ 'text-red-500': Boolean(draggedGroup), 'text-blue-500': disabled }"
    >
      <Button
        class="report-tag-button p-button-text"
        :class="{ 'p-button-secondary': disabled }"
        icon="pi pi-folder"
        :label="tagTree.name"
        :disabled="disabled"
        @click="!isRoot && onTagGroupClick(tagTree, tagTree)"
      />

      <Button
        v-if="!disabled"
        class="report-tag-button p-button-text p-button-success"
        icon="pi pi-folder"
        @click="onTagGroupClick(null, tagTree)"
      />

      <Button
        v-if="!disabled"
        class="report-tag-button p-button-text p-button-success"
        icon="pi pi-tag"
        @click="onTagClick(null, tagTree)"
      />

      <div class="flex-grow-1" />
      <slot name="header" />
    </div>

    <div class="flex">
      <div class="ml-3" style="border-right: 4px solid lightgrey; border-radius: 1rem;" />

      <div class="flex-grow-1">
        <div
          class="p-1"
          :class="{ 'drag-over': isEnterTop }"
          @drop.stop="onDrop($event, 0, tagTree.tags.length)"
          @dragenter.stop="isEnterTop = true"
          @dragleave.stop="isEnterTop = false"
        />

        <div class="flex flex-wrap">
          <template
            v-for="(tag, idx) in tagTree.tags"
            :key="`${nest}-t${idx}`"
          >
            <div class="flex">
              <div
                class="p-1"
                :class="{ 'drag-over': isEnterTagId === idx }"
                @drop.stop="onDrop($event, 0, idx)"
                @dragenter.stop="isEnterTagId = idx"
                @dragleave.stop="isEnterTagId = null"
              />

              <Button
                :label="tag.name"
                icon="pi pi-tag"
                :draggable="!disabled"
                class="report-tag-button p-button-secondary"
                :class="{ 'text-red-500': draggedTag?.id === tag.id }"
                :style="{
                  backgroundColor: tag.color,
                  color: fontColorContrast(tag.color, 0.7)
                }"
                @drop.stop
                @dragstart.stop="tagStart($event, tag)"
                @dragend.stop="dragEnd"
                @click="onTagClick(tag, tagTree)"
              />
            </div>
          </template>

          <div
            v-if="tagTree.tags.length"
            class="p-1"
            :class="{ 'drag-over': isEnterLeft }"
            @drop.stop="onDrop($event, 0, tagTree.tags.length)"
            @dragenter.stop="isEnterLeft = true"
            @dragleave.stop="isEnterLeft = false"
          />
        </div>

        <div
          v-if="tagTree.tags.length"
          class="p-1"
          :class="{ 'drag-over': isEnterBottom }"
          @drop.stop="onDrop($event, 0, tagTree.tags.length)"
          @dragenter.stop="isEnterBottom = true"
          @dragleave.stop="isEnterBottom = false"
        />

        <div
          v-for="(group, idx) in tagTree.groups"
          :key="`${nest}-g${idx}`"
        >
          <TagTreeRender
            :tag-tree="group"
            :disabled="childDisabled"
            :nest="nest + 1"
            @delete:group="($1) => emit('delete:group', $1)"
            @delete:tag="($1) => emit('delete:tag', $1)"
          />

          <div
            class="p-1"
            :class="{ 'drag-over': isEnterGroupId === idx }"
            @drop.stop="onDrop($event, idx + 1, tagTree.tags.length)"
            @dragenter.stop="isEnterGroupId = idx"
            @dragleave.stop="isEnterGroupId = null"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import fontColorContrast from 'font-color-contrast'
import { onTagClickKey, onTagGroupClickKey, tagTreeActionKey } from '~~/src/components/tagTrees/TagTree.vue'
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

const isRoot = computed(() => props.nest === 0)

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

<style scoped lang="scss">
.drag-over {
  background-color: var(--primary-color);
}
</style>
