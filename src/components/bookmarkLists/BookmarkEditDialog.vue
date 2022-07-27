<template>
  <Dialog
    v-model:visible="_visible"
    header="ブックマーク設定"
    :modal="true"
    :maximizable="true"
    :style="{ width: '400px' }"
  >
    <div class="field">
      <label>ブックマーク名</label>
      <InputText
        v-model="form.name"
        class="w-full"
        autofocus
      />
    </div>

    <div class="field">
      <label>色</label>
      <InputText
        v-model="form.color"
        class="w-full"
      />
    </div>

    <template #footer>
      <div class="flex">
        <Button
          icon="pi pi-trash"
          class="p-button-text p-button-danger"
          @click="onDelete"
        />

        <div class="flex-grow-1" />

        <Button
          icon="pi pi-save"
          class="p-button-text p-button-success"
          label="保存"
          autofocus
          @click="onSave"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { fromJSON } from 'postcss'
import { useConfirm } from 'primevue/useconfirm'
import BookmarkAPI, { FormBookmark } from '~~/src/apis/BookmarkAPI'
import { SearchReportParam } from '~~/src/apis/ReportAPI'
import { Bookmark } from '~~/src/databases/models/Bookmark'
import { TagGroup } from '~~/src/databases/models/TagGroup'

const props = defineProps<{
  visible: boolean,
  bookmark?: Bookmark,
  searchReportParam?: SearchReportParam,
}>()

const emit = defineEmits<{ // eslint-disable-line func-call-spacing
  (e: 'update:visible', value: boolean): void,
  (e: 'update:bookmark', bookmark: Bookmark): void,
  (e: 'delete:bookmark'): void,
}>()

const toast = useToast()
const confirm = useConfirm()

const _visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

const onClose = () => { _visible.value = false }

///

watch(() => props.visible, () => onInit())

const form = reactive<FormBookmark>({
  name: '',
  json: '',
  color: null,
  priority: 0, // default
})

const onInit = () => {
  form.name = props.bookmark?.name || ''
  form.json = props.bookmark?.json || ''
  form.color = props.bookmark?.color || null
  form.priority = props.bookmark?.priority || 0
}

const onSave = async () => {
  // 空なら送信しない
  if ((form.name?.trim().length ?? 0) === 0) { return }

  try {
    const data: FormBookmark = { ...form }

    // bookmark の指定が無ければ json を作る
    if (!props.bookmark) {
      data.json = props.searchReportParam
        ? JSON.stringify(props.searchReportParam)
        : null
    }

    const bookmarkId = props.bookmark?.id
    const newBookmark = bookmarkId
      ? await BookmarkAPI.update(bookmarkId, data)
      : await BookmarkAPI.create(data)

    const actStr = bookmarkId ? '更新' : '作成'
    toast.success(`ブックマークを${actStr}しました。 id=${newBookmark.id}`)

    emit('update:bookmark', newBookmark)
    onClose()
  } catch (err) {
    toast.catchError(err)
  }
}

const onDelete = () => {
  confirm.require({
    message: '消すぞ',
    accept: async () => {
      if (props.bookmark?.id) {
        await BookmarkAPI.remove(props.bookmark.id)
        emit('delete:bookmark')
        onClose()
      }
    },
  })
}
</script>
