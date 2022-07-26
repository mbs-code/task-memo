<template>
  <div style="padding: 3px">
    <template
      v-for="(bookmark, idx) in bookmarks"
      :key="`b${idx}`"
    >
      <BookmarkItem
        :bookmark="bookmark"
        :is-selected="isSelected(bookmark)"
        @click="emit('click:bookmark', bookmark)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { SearchReportParam } from '~~/src/apis/ReportAPI'
import { Bookmark } from '~~/src/databases/models/Bookmark'

const props = defineProps<{
  bookmarks: Bookmark[],
  searchReportParam?: SearchReportParam,
  disabled?: boolean,
}>()
const emit = defineEmits<{ // eslint-disable-line func-call-spacing
  (e: 'click:bookmark', bookmark: Bookmark): void,
}>()

///

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
</script>
