<template>
  <Dialog
    v-model:visible="_visible"
    header="タググループ設定"
    :modal="true"
    :maximizable="true"
  >
    <div class="field">
      <label>タグ名</label>
      <InputText v-model="form.name" />
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
import { FormTagGroup, useTagGroupAPI } from '~~/src/apis/useTagGroupAPI'
import { Database } from '~~/src/databases/Database'
import { Tag } from '~~/src/databases/models/Tag'
import { TagGroup } from '~~/src/databases/models/TagGroup'

const props = defineProps<{
  visible: boolean,
  tagGroup?: TagGroup,
  parentTagGroup?: TagGroup,
}>()

const emit = defineEmits<{ // eslint-disable-line func-call-spacing
  (e: 'update:visible', value: boolean): void,
  (e: 'update:tagGroup', tagGroup: TagGroup): void,
  (e: 'delete:tagGroup'): void,
}>()

const { db } = Database.getInstance()
const tagGroupAPI = useTagGroupAPI(db)
const toast = useToast()
const confirm = useConfirm()

const _visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

const onClose = () => { _visible.value = false }

///

watch(() => props.visible, () => onInit())

const form = reactive<FormTagGroup>({
  name: '',
  priority: 0, // default
  tag_group_id: 0,
})

const onInit = () => {
  form.name = props.tagGroup?.name || ''
  form.priority = props.tagGroup?.priority || 0
  form.tag_group_id = props.tagGroup?.tag_group_id || props.parentTagGroup?.id || 0
}

const onSave = async () => {
  // 空なら送信しない
  if ((form.name?.trim().length ?? 0) === 0) { return }

  try {
    const data: FormTagGroup = { ...form }

    const tagGroupId = props.tagGroup?.id
    const newTagGroup = tagGroupId
      ? await tagGroupAPI.update(tagGroupId, data)
      : await tagGroupAPI.create(data)

    const actStr = tagGroupId ? '更新' : '作成'
    toast.success(`タググループを${actStr}しました。 id=${newTagGroup.id}`)

    emit('update:tagGroup', newTagGroup)
    onClose()
  } catch (err) {
    toast.catchError(err)
  }
}

const onDelete = () => {
  confirm.require({
    message: '消すぞ',
    accept: async () => {
      if (props.tagGroup?.id) {
        await tagGroupAPI.remove(props.tagGroup.id)
        emit('delete:tagGroup')
        onClose()
      }
    },
  })
}

</script>
