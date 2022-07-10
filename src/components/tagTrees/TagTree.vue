<template>
  <Card>
    <template #content>
      <TagTreeRender
        :tag-tree="tagTreeAction.tagTree.value"
        :disabled="!isEdit"
        @delete:group="onDeleteGroup"
        @delete:tag="onDeleteTag"
      >
        <template #header>
          <InputSwitch v-model="isEdit" />
          <i class="pi pi-pencil" />
        </template>
      </TagTreeRender>
    </template>
  </Card>

  <TagGroupEditDialog
    v-model:visible="showTagGroupEditDialog"
    :tag-group="selectedTagGroup"
    :parent-tag-group="selectedParentTagGroup"
    @update:tag-group="tagTreeAction.onInit()"
    @delete:tag-group="tagTreeAction.onInit()"
  />

  <TagEditDialog
    v-model:visible="showTagEditDialog"
    :tag="selectedTag"
    :parent-tag-group="selectedParentTagGroup"
    @update:tag="tagTreeAction.onInit()"
    @delete:tag="tagTreeAction.onInit()"
  />
</template>

<script lang="ts">
import { InjectionKey } from 'vue'
import { useTagAPI } from '~~/src/apis/useTagAPI'
import { useTagGroupAPI } from '~~/src/apis/useTagGroupAPI'
import { TagTreeActionType, useTagTreeAction } from '~~/src/composables/reports/useTagTreeAction'
import { Database } from '~~/src/databases/Database'
import { Tag } from '~~/src/databases/models/Tag'
import { TagGroup } from '~~/src/databases/models/TagGroup'

export const tagTreeActionKey: InjectionKey<Readonly<TagTreeActionType>> = Symbol('tagTreeAction')
export const onTagGroupClickKey: InjectionKey<(tagGroup?: TagGroup, parentTagGroup?: TagGroup) => void> = Symbol('onTagGroupClickKey')
export const onTagClickKey: InjectionKey<(tag?: Tag, parentTagGroup?: TagGroup) => void> = Symbol('onTagClickKey')
</script>

<script setup lang="ts">
const props = defineProps<{
  tagTreeAction: ReturnType<typeof useTagTreeAction>,
}>()
const emit = defineEmits<{ // eslint-disable-line func-call-spacing
  (e: 'update'): void,
  (e: 'select:tag', tag: Tag): void,
}>()

const isEdit = ref<boolean>(false)

const { db } = Database.getInstance()
const tagAPI = useTagAPI(db)
const tagGroupAPI = useTagGroupAPI(db)

const showTagGroupEditDialog = ref<boolean>(false)
const showTagEditDialog = ref<boolean>(false)

const selectedParentTagGroup = ref<TagGroup>() // 親要素
const selectedTagGroup = ref<TagGroup>()
const selectedTag = ref<Tag>()

const onTagGroupClick = (tagGroup?: TagGroup, parentTagGroup?: TagGroup) => {
  if (isEdit.value) {
    selectedTagGroup.value = tagGroup
    selectedParentTagGroup.value = parentTagGroup
    showTagGroupEditDialog.value = true
  }
}

const onTagClick = (tag?: Tag, parentTagGroup?: TagGroup) => {
  if (isEdit.value) {
    selectedTag.value = tag
    selectedParentTagGroup.value = parentTagGroup
    showTagEditDialog.value = true
  } else {
    emit('select:tag', tag)
  }
}

provide(tagTreeActionKey, props.tagTreeAction)
provide(onTagGroupClickKey, onTagGroupClick)
provide(onTagClickKey, onTagClick)

const onDeleteGroup = async (groupId: number) => {
  await tagGroupAPI.remove(groupId)
  emit('update')
}

const onDeleteTag = async (tagId: number) => {
  await tagAPI.remove(tagId)
  emit('update')
}
</script>
