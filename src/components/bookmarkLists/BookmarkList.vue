<template>
  <div class="flex align-items-center">
    <i class="pr-2 pi pi-pencil" />
    <InputSwitch v-model="isEdit" />

    <Button icon="pi pi-save" label="検索結果を保存" @click="onClickCreate" />
  </div>

  <BookmarkRenderer
    :bookmarks="bookmarkStore.bookmarks"
    :search-report-param="searchReportParam"
    :disabled="!isEdit"
    @click:bookmark="onClickBookmark"
  />

  <BookmarkEditDialog
    v-model:visible="showBookmarkEditDialog"
    :bookmark="selectedBookmark"
    :search-report-param="searchReportParam"
    @update:bookmark="bookmarkStore.init()"
    @delete:bookmark="bookmarkStore.init()"
  />
</template>

<script lang="ts">
import { InjectionKey } from 'vue'
import BookmarkAPI from '~~/src/apis/BookmarkAPI'
import { SearchReportParam } from '~~/src/apis/ReportAPI'
import { Bookmark } from '~~/src/databases/models/Bookmark'
import { useBookmarkStore } from '~~/src/store/useBookmarkStore'

export const onClickBookmarkKey: InjectionKey<(bookmark?: Bookmark) => void> = Symbol('onClickBookmarkKey')
export const onUpdateBookmarkKey: InjectionKey<(bookmarkId: number, insertIndex: number) => void> = Symbol('onUpdateTagKey')
</script>

<script setup lang="ts">
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

const onClickCreate = () => {
  selectedBookmark.value = null
  showBookmarkEditDialog.value = true
}

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

const onUpdateBookmark = async (bookmarkId: number, insertIndex: number) => {
  // bookmark を取りに行く
  const bookmark = await BookmarkAPI.get(bookmarkId)

  // 同じ親を持つ tag を取得する
  const siblings = await BookmarkAPI.getAll({
    sorts: [['priority', 'asc'], ['id', 'asc']]
  })

  // 配列に突っ込む
  const sorts = siblings.filter(b => b.id !== bookmark.id) // 自身は取り除く
  sorts.splice(insertIndex, 0, bookmark) // 挿入

  for (const key in sorts) {
    const sort = sorts[key]
    await BookmarkAPI.updateSort(sort.id, Number(key))
  }

  // 更新する
  bookmarkStore.init()
}

provide(onClickBookmarkKey, onClickBookmark)
provide(onUpdateBookmarkKey, onUpdateBookmark)
</script>
