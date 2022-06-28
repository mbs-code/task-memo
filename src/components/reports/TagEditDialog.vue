<template>
  <Dialog
    v-model:visible="_visible"
    header="Confirmation"
    :modal="true"
    :maximizable="true"
  >
    <div class="grid p-2">
      <div class="col">
        <Button @click="tagAction.onTreeExpandAll">
          すべて表示
        </Button>

        <Button @click="tagAction.onTreeCallapseAll">
          閉じる
        </Button>

        <Tree
          v-model:selectionKeys="tagAction.selectedTreeKeys.value"
          v-model:expandedKeys="tagAction.expandTreeKeys.value"
          :value="tagAction.tagTrees.value"
          selection-mode="multiple"
          :meta-key-selection="false"
        />
      </div>

      <div class="col flex flex-column gap-2">
        <div class="flex gap-1 align-items-center">
          <div class="text-sm">
            新規タグ:
          </div>
          <AutoComplete
            v-model="tagAction.inputTagName.value"
            :suggestions="tagAction.filteredInputTags.value"
            complete-on-focus
            style="height: 2rem"
            @complete="tagAction.onSuggestedTags"
            @item-select="tagAction.onSelectedTag"
            @change="tagAction.onAddTag"
            @keydown.ctrl.enter.stop="tagAction.onAddTag"
          />
        </div>

        <hr class="w-full">

        <div class="flex flex-wrap gap-2 mb-2">
          <Button
            v-for="tag of tagAction.formSelectedTags.value"
            :key="tag.name"
            class="report-tag-button p-button-secondary"
            :style="{
              backgroundColor: tag.color,
              color: fontColorContrast(tag.color, 0.7)
            }"
            @click="tagAction.onRemoveTag(tag)"
          >
            <div class="flex gap-2">
              <i class="pi pi-tag" />
              <span>{{ tag.name }}</span>
              <i class="pi pi-times-circle" />
            </div>
          </Button>

          <Button
            v-for="name of tagAction.formTagNames.value"
            :key="name"
            class="report-tag-button p-button-secondary p-button-outlined"
            icon="pi pi-pencil"
            :label="name"
            @click="tagAction.onRemoveTag(name)"
          >
            <div class="flex gap-2">
              <i class="pi pi-tag" />
              <span>{{ name }}</span>
              <i class="pi pi-times-circle" />
            </div>
          </Button>
        </div>
      </div>
    </div>

    <template #footer>
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
        @click="onClose"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import fontColorContrast from 'font-color-contrast'
import { useReportTagAction } from '~~/src/composables/reports/useReportTagAction'

type Emit = {
  (e: 'update:visible', value: boolean): void
}
const emit = defineEmits<Emit>()
const props = defineProps<{
  visible: boolean,
  reportTagAction: ReturnType<typeof useReportTagAction>,
}>()

const tagAction = computed(() => props.reportTagAction)

const _visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

const onClose = () => { _visible.value = false }
</script>
