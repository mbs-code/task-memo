<template>
  <template
    v-for="(bookmark, idx) in bookmarks"
    :key="`b${idx}`"
  >
    <BookmarkItem
      :bookmark="bookmark"
      :is-selected="false"
      @click="onClickBookmark(bookmark)"
    />
  </template>
</template>

<script setup lang="ts">
import BookmarkAPI from '~~/src/apis/BookmarkAPI'
import { Bookmark } from '~~/src/databases/models/Bookmark'

const props = defineProps<{
  selectedBookmark?: Bookmark,
}>()
const emit = defineEmits<{ // eslint-disable-line func-call-spacing
  (e: 'update:selectedBookmark', bookmark: Bookmark): void,
}>()

const _selectedBookmark = computed({
  get: () => props.selectedBookmark,
  set: (bookmark: Bookmark) => emit('update:selectedBookmark', bookmark)
})

///

const toast = useToast()
const bookmarks = ref<Bookmark[]>([])

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
  if (bookmark.id !== _selectedBookmark.value?.id) {
    _selectedBookmark.value = bookmark
  } else {
    _selectedBookmark.value = null
  }
}
</script>
