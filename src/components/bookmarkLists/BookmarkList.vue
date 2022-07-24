<template>
  <template
    v-for="(bookmark, idx) in bookmarkStore.bookmarks"
    :key="`b${idx}`"
  >
    <BookmarkItem
      :bookmark="bookmark"
      :is-selected="isSelected(bookmark)"
      @click="onClickBookmark(bookmark)"
    />
  </template>
</template>

<script setup lang="ts">
import { SearchReportParam } from '~~/src/apis/ReportAPI'
import { Bookmark } from '~~/src/databases/models/Bookmark'
import { useBookmarkStore } from '~~/src/store/useBookmarkStore'

const props = defineProps<{
  searchReportParam?: SearchReportParam,
}>()
const emit = defineEmits<{ // eslint-disable-line func-call-spacing
  (e: 'change:bookmark', bookmark?: Bookmark): void,
}>()

const isSelected = (bookmark: Bookmark) => {
  const param = props.searchReportParam
  if (param) {
    const sortIds = param?.tagIds ?? []
    const bookIds = bookmark.json
      ? (JSON.parse(bookmark.json)?.tagIds ?? [])
      : []
    if (sortIds.sort().toString() === bookIds.sort().toString()) {
      return true
    }
    // TODO: search 未実装
  }
  return false
}

///

const bookmarkStore = useBookmarkStore()

const selectedBookmark = ref<Bookmark>()

const onClickBookmark = (bookmark: Bookmark) => {
  if (bookmark.id !== selectedBookmark.value?.id) {
    selectedBookmark.value = bookmark
  } else {
    selectedBookmark.value = null
  }

  emit('change:bookmark', selectedBookmark.value)
}
</script>
