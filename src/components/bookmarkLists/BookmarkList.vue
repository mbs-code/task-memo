<template>
  <template
    v-for="(bookmark, idx) in bookmarks"
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
import BookmarkAPI from '~~/src/apis/BookmarkAPI'
import { SearchReportParam } from '~~/src/apis/ReportAPI'
import { Bookmark } from '~~/src/databases/models/Bookmark'

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

const toast = useToast()
const bookmarks = ref<Bookmark[]>([])

const selectedBookmark = ref<Bookmark>()

const onRefresh = async () => {
  try {
    bookmarks.value = await BookmarkAPI.getAll({
      sort: ['id', 'desc'],
    })
  } catch (err) {
    toast.catchError(err)
  }
}
onMounted(async () => { await onRefresh() })

const onClickBookmark = (bookmark: Bookmark) => {
  if (bookmark.id !== selectedBookmark.value?.id) {
    selectedBookmark.value = bookmark
  } else {
    selectedBookmark.value = null
  }
}

watch(() => selectedBookmark.value, () => {
  emit('change:bookmark', selectedBookmark.value)
})
</script>
