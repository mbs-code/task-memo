<template>
  <Dialog
    v-model:visible="_visible"
    header="タグ設定"
    :modal="true"
    :maximizable="true"
  >
    <div class="field">
      <label>タグ名</label>
      <InputText v-model="form.name" />
    </div>

    <div class="field">
      <label>色</label>
      <InputText v-model="form.color" />
    </div>

    <template #footer>
      <Button
        label="Delete"
        icon="pi pi-times"
        class="p-button-text"
        @click="onDelete"
      />

      <Button
        label="No"
        icon="pi pi-times"
        class="p-button-text"
        @click="onClose"
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        class="p-button-text"
        autofocus
        @click="onSave"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm'
import { FormTag, useTagAPI } from '~~/src/apis/useTagAPI'
import { Database } from '~~/src/databases/Database'
import { Tag } from '~~/src/databases/models/Tag'
import { TagGroup } from '~~/src/databases/models/TagGroup'

const props = defineProps<{
  visible: boolean,
  tag?: Tag,
  parentTagGroup?: TagGroup,
}>()

const emit = defineEmits<{ // eslint-disable-line func-call-spacing
  (e: 'update:visible', value: boolean): void,
  (e: 'update:tag', tag: Tag): void,
  (e: 'delete:tag'): void,
}>()

const { db } = Database.getInstance()
const tagAPI = useTagAPI(db)
const toast = useToast()
const confirm = useConfirm()

const _visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

const onClose = () => { _visible.value = false }

///

watch(() => props.visible, () => onInit())

const form = reactive<FormTag>({
  name: '',
  color: null,
  is_pinned: false, // default
  priority: 0, // default
  tag_group_id: 0,
})

const onInit = () => {
  form.name = props.tag?.name || ''
  form.color = props.tag?.color || null
  form.is_pinned = props.tag?.is_pinned || false
  form.priority = props.tag?.priority || 0
  form.tag_group_id = props.tag?.tag_group_id || props.parentTagGroup?.id || 0
}

const onSave = async () => {
  // 空なら送信しない
  if ((form.name?.trim().length ?? 0) === 0) { return }

  try {
    const data: FormTag = { ...form }

    const tagId = props.tag?.id
    const newTag = tagId
      ? await tagAPI.update(tagId, data)
      : await tagAPI.create(data)

    const actStr = tagId ? '更新' : '作成'
    toast.success(`タグを${actStr}しました。 id=${newTag.id}`)

    emit('update:tag', newTag)
    onClose()
  } catch (err) {
    toast.catchError(err)
  }
}

const onDelete = () => {
  confirm.require({
    message: '消すぞ',
    accept: async () => {
      if (props.tag?.id) {
        await tagAPI.remove(props.tag.id)
        emit('delete:tag')
        onClose()
      }
    },
  })
}
</script>
