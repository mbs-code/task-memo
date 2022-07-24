<template>
  <div class="flex align-items-center">
    <i class="pr-2 pi pi-pencil" />
    <InputSwitch v-model="isEdit" />
  </div>

  <TagTreeRender
    :tag-tree="tagStore.tagTree"
    :selected-tags="_selectedTags"
    :disabled="!isEdit"
  />

  <TagGroupEditDialog
    v-model:visible="showTagGroupEditDialog"
    :tag-group="selectedTagGroup"
    :parent-tag-group="selectedParentTagGroup"
    @update:tag-group="tagStore.init()"
    @delete:tag-group="tagStore.init()"
  />

  <TagEditDialog
    v-model:visible="showTagEditDialog"
    :tag="selectedTag"
    :parent-tag-group="selectedParentTagGroup"
    @update:tag="tagStore.init()"
    @delete:tag="tagStore.init()"
  />
</template>

<script lang="ts">
import { InjectionKey } from 'vue'
import TagAPI from '~~/src/apis/TagAPI'
import TagGroupAPI from '~~/src/apis/TagGroupAPI'
import { Tag } from '~~/src/databases/models/Tag'
import { TagGroup } from '~~/src/databases/models/TagGroup'
import { useTagStore } from '~~/src/store/useTagStore'

export const onClickTagGroupKey: InjectionKey<(tagGroup?: TagGroup, parentTagGroup?: TagGroup) => void> = Symbol('onClickTagGroupKey')
export const onClickTagKey: InjectionKey<(tag?: Tag, parentTagGroup?: TagGroup) => void> = Symbol('onClickTagKey')
export const onUpdateTagGroupKey: InjectionKey<(tagGroupId: number, targetGroup: TagGroup, insertIndex: number) => void> = Symbol('onUpdateTagGroupKey')
export const onUpdateTagKey: InjectionKey<(tagId: number, targetGroup: TagGroup, insertIndex: number) => void> = Symbol('onUpdateTagKey')
</script>

<script setup lang="ts">
const props = defineProps<{
  selectedTags?: Tag[],
}>()
const emit = defineEmits<{ // eslint-disable-line func-call-spacing
  (e: 'update:selectedTags', tags: Tag[]): void,
}>()

const _selectedTags = computed({
  get: () => props.selectedTags ?? [],
  set: (tags: Tag[]) => emit('update:selectedTags', tags)
})

const tagStore = useTagStore()
const isEdit = ref<boolean>(false)

const showTagGroupEditDialog = ref<boolean>(false)
const showTagEditDialog = ref<boolean>(false)

const selectedParentTagGroup = ref<TagGroup>() // 親要素
const selectedTagGroup = ref<TagGroup>()
const selectedTag = ref<Tag>()

watch(isEdit, () => {
  // 編集したらリセット
  if (isEdit.value) { _selectedTags.value = [] }
})

const onClickTagGroup = (tagGroup?: TagGroup, parentTagGroup?: TagGroup) => {
  if (isEdit.value) {
    selectedTagGroup.value = tagGroup
    selectedParentTagGroup.value = parentTagGroup
    showTagGroupEditDialog.value = true
  }
}

const onClickTag = (tag?: Tag, parentTagGroup?: TagGroup) => {
  if (isEdit.value) {
    selectedTag.value = tag
    selectedParentTagGroup.value = parentTagGroup
    showTagEditDialog.value = true
  } else {
    const hasIndex = _selectedTags.value.findIndex(t => t.id === tag?.id)
    if (hasIndex >= 0) {
      _selectedTags.value.splice(hasIndex, 1)
    } else {
      _selectedTags.value.push(tag)
    }
  }
}

const onUpdateTagGroup = async (tagGroupId: number, targetGroup: TagGroup, insertIndex: number) => {
  // group を取りに行く
  const group = tagStore.tagGroups.find(g => g.id === tagGroupId)
  if (!group) { throw new Error('TagGroup ID が存在しません。 id=' + tagGroupId) }

  // 同じ親を持つ group を取得する
  const siblings = await TagGroupAPI.getAll({
    noGroup: !targetGroup.id,
    tagGroupId: targetGroup.id,
    sorts: [['priority', 'asc'], ['id', 'asc']]
  })

  // 配列に突っ込む
  const sorts = siblings.filter(g => g.id !== group.id) // 自身は取り除く
  sorts.splice(insertIndex, 0, group) // 挿入

  for (const key in sorts) {
    const sort = sorts[key]
    await TagGroupAPI.updateGroup(sort.id, targetGroup.id, Number(key))
  }

  tagStore.init()
}

const onUpdateTag = async (tagId: number, targetGroup: TagGroup, insertIndex: number) => {
  // tag を取りに行く
  const tag = await TagAPI.get(tagId)

  // 同じ親を持つ tag を取得する
  const siblings = await TagAPI.getAll({
    noGroup: !targetGroup.id,
    tagGroupId: targetGroup.id,
    sorts: [['priority', 'asc'], ['id', 'asc']]
  })

  // 配列に突っ込む
  const sorts = siblings.filter(t => t.id !== tag.id) // 自身は取り除く
  sorts.splice(insertIndex, 0, tag) // 挿入

  for (const key in sorts) {
    const sort = sorts[key]
    await TagAPI.updateGroup(sort.id, targetGroup.id, Number(key))
  }

  // 更新する
  tagStore.init()
}

provide(onClickTagGroupKey, onClickTagGroup)
provide(onClickTagKey, onClickTag)
provide(onUpdateTagGroupKey, onUpdateTagGroup)
provide(onUpdateTagKey, onUpdateTag)
</script>
