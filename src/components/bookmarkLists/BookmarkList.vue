<template>
  <div class="flex align-items-center">
    <i class="pr-2 pi pi-pencil" />
    <InputSwitch v-model="isEdit" />
  </div>

  <BookmarkRenderer
    :bookmarks="bookmarkStore.bookmarks"
    :search-report-param="searchReportParam"
    @click:bookmark="onClickBookmark"
  />

  <BookmarkEditDialog
    v-model:visible="showBookmarkEditDialog"
    :bookmark="selectedBookmark"
    @update:bookmark="bookmarkStore.init()"
    @delete:bookmark="bookmarkStore.init()"
  />
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

const bookmarkStore = useBookmarkStore()
const isEdit = ref<boolean>(false)

const showBookmarkEditDialog = ref<boolean>(false)

const selectedBookmark = ref<Bookmark>()

const onClickBookmark = (bookmark: Bookmark) => {
  if (isEdit.value) {
    selectedBookmark.value = bookmark
    showBookmarkEditDialog.value = true
  } else {
    if (bookmark.id !== selectedBookmark.value?.id) {
      selectedBookmark.value = bookmark
    } else {
      selectedBookmark.value = null
    }

    emit('change:bookmark', selectedBookmark.value)
  }
}
</script>
