<template>
  <div style="padding: 3px">
    <div
      :class="{
        'drag-separator': !disabled,
        'drag-over': isEnterTop,
      }"
      @drop.stop="onDrop($event, 0)"
      @dragenter.prevent="isEnterTop = true"
      @dragleave.prevent="isEnterTop = false"
      @dragover.prevent
    />

    <template
      v-for="(bookmark, idx) in bookmarks"
      :key="`b${idx}`"
    >
      <BookmarkItem
        :bookmark="bookmark"
        :is-drag="draggedBookmark?.id === bookmark.id"
        :is-selected="isSelected(bookmark)"
        :draggable="!disabled"
        @dragstart.stop="bookmarkStart($event, bookmark)"
        @dragend.stop="dragEnd"
        @drop.stop="onDrop($event, idx)"
        @dragenter.prevent="isEnterBookmarkId = idx"
        @dragleave.prevent="isEnterBookmarkId = null"
        @dragover.prevent
        @click="onClickBookmark(bookmark)"
      />

      <div
        :class="{
          'drag-separator': !disabled,
          'drag-over': isEnterBookmarkDivId === idx,
        }"
        @drop.stop="onDrop($event, idx + 1)"
        @dragenter.prevent="isEnterBookmarkDivId = idx"
        @dragleave.prevent="isEnterBookmarkDivId = null"
        @dragover.prevent
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { SearchReportParam } from '~~/src/apis/ReportAPI'
import { onClickBookmarkKey, onUpdateBookmarkKey } from '~~/src/components/bookmarkLists/BookmarkList.vue'
import { Bookmark } from '~~/src/databases/models/Bookmark'

const props = defineProps<{
  bookmarks: Bookmark[],
  searchReportParam?: SearchReportParam,
  disabled?: boolean,
}>()
const emit = defineEmits<{ // eslint-disable-line func-call-spacing
  (e: 'click:bookmark', bookmark: Bookmark): void,
}>()

const onClickBookmark = inject(onClickBookmarkKey)
const onUpdateBookmark = inject(onUpdateBookmarkKey)

///

const isEnterTop = ref<boolean>(false)
const isEnterBookmarkId = ref<number>(null)
const isEnterBookmarkDivId = ref<number>(null)

const draggedBookmark = ref<Bookmark>(null) // ドラッグ中の、ブックマーク

///

const bookmarkStart = (event: DragEvent, bookmark: Bookmark) => {
  if (!props.disabled) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.dropEffect = 'move'
    event.dataTransfer.setData('bookmark-id', String(bookmark.id))

    draggedBookmark.value = bookmark
  }
}

const onDrop = (event: DragEvent, insertBookmarkIndex: number) => {
  const bookmarkId = event.dataTransfer.getData('bookmark-id') ?? null

  if (bookmarkId) {
    onUpdateBookmark(Number(bookmarkId), insertBookmarkIndex)
  }

  dragEnd()
}

const dragEnd = () => {
  isEnterTop.value = false
  isEnterBookmarkId.value = null
  isEnterBookmarkDivId.value = null
}

///

const isSelected = (bookmark: Bookmark) => {
  const param = props.searchReportParam
  if (param) {
    const searchValues = bookmark?.json ? JSON.parse(bookmark.json) : {}

    const sortIds = param?.tagIds ?? []
    const bookIds = searchValues?.tagIds ?? []
    if (sortIds.sort().toString() === bookIds.sort().toString()) {
      // タグが一致していたらテキストも一致しているか確認する
      const paramText = param?.text ?? ''
      const searchText = searchValues?.text ?? ''
      return paramText === searchText
    }
  }
  return false
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
