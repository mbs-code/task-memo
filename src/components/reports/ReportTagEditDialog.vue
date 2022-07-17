<template>
  <Dialog
    v-model:visible="_visible"
    header="タグ編集ダイアログ"
    :modal="true"
    :maximizable="true"
  >
    <div class="grid p-2">
      <div class="col md-6 flex flex-column gap-2">
        <div class="flex gap-1 align-items-center">
          <div class="text-sm">
            新規タグ:
          </div>

          <ReportTagInput
            :tags="tagTreeAction.tags.value"
            @add:tag="onAddTag"
          />
        </div>

        <hr class="w-full">

        <div class="flex flex-wrap gap-2 mb-2">
          <ReportTagButtonGroup
            :tags="selectedTags"
            :tag-names="inputTagNames"
            @remove:tag="onRemoveTag"
          />
        </div>
      </div>

      <div class="col md-6">
        <TagTree :tag-tree-action="tagTreeAction" @select:tag="onSelectedTag" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { useTagTreeAction } from '~~/src/composables/reports/useTagTreeAction'
import { Tag } from '~~/src/databases/models/Tag'

const props = defineProps<{
  visible: boolean,
  selectedTags: Tag[],
  inputTagNames: string[],
  tagTreeAction: ReturnType<typeof useTagTreeAction>,
}>()
const emit = defineEmits<{ // eslint-disable-line func-call-spacing
  (e: 'update:visible', value: boolean): void,
  (e: 'add:tag', value: string): void,
  (e: 'remove:tag', value: string): void,
}>()

const _visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

// const onClose = () => { _visible.value = false }

///

const onSelectedTag = (tag: Tag) => {
  emit('add:tag', tag.name)
}

const onAddTag = (name: string) => {
  emit('add:tag', name)
}

const onRemoveTag = (name: string) => {
  emit('remove:tag', name)
}
</script>
