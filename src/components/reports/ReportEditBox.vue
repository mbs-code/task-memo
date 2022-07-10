<template>
  <div
    class="flex gap-2"
    @keydown.t.ctrl="openTagEditDialog"
    @keydown.s.ctrl="onSave"
    @keydown.ctrl.enter="onSave"
    @keydown.esc="onClose"
  >
    <div class="flex-grow-1">
      <div class="flex flex-wrap gap-2 mb-2">
        <Button
          class="report-tag-button p-button-primary p-button-text"
          icon="pi pi-list"
          label="タグ編集"
          @click="openTagEditDialog"
        />

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
      </div>

      <Textarea
        ref="refTextarea"
        v-model="form.text"
        auto-resize
        class="w-full"
        rows="3"
        helptext
      />

      <div class="flex gap-2 text-xs px-1">
        <span>保存: Ctrl+S</span>
        <span>タグ編集: Ctrl+T</span>
        <span v-if="!disableClose">閉じる: Esc</span>

        <div class="spacer" />

        <span>タグ: {{ tagAction.formSelectedTags.value.length }}</span>
        <span>行数: {{ textCount }}</span>
        <span>文字数: {{ lineCount }}</span>
      </div>
    </div>

    <div v-if="!disableClose">
      <Button
        class="report-tag-button p-button-text p-0 btn-fixed-size"
        icon="pi pi-times"
        @click="onClose"
      />
    </div>
  </div>

  <TagEditDialogd
    v-model:visible="showTagEditDialog"
    :report-tag-action="tagAction"
  />
</template>

<script setup lang="ts">
import fontColorContrast from 'font-color-contrast'
import { FormReport, useReportAPI } from '~~/src/apis/useReportAPI'
import { Database } from '~~/src/databases/Database'
import { ReportWithTag } from '~~/src/databases/models/Report'
import { Tag } from '~~/src/databases/models/Tag'
import { useReportTagAction } from '~~/src/composables/reports/useReportTagAction'

type Emit = {
  (e: 'reload'): void
  (e: 'close'): void
}
const emit = defineEmits<Emit>()
const props = defineProps<{
  report?: ReportWithTag,
  tags: Tag[],
  disableClose?: boolean,
}>()

const { db } = Database.getInstance()
const reportAPI = useReportAPI(db)
const toast = useToast()

const tagAction = useReportTagAction(
  computed(() => props.tags),
  (name) => { toast.warn(`「${name}」は追加済みです。`) },
)

const form = reactive<FormReport>({
  text: '',
  tagNames: [],
})

const lineCount = computed(() => form.text?.length ?? 0)
const textCount = computed(() => ((form.text ?? '').match(/\n/g) || []).length + 1)

const onInit = () => {
  form.text = props.report?.text || null

  tagAction.formSelectedTags.value = props.report?.tags ?? []
  tagAction.formTagNames.value = []
  tagAction.inputTagName.value = ''
}

const onSave = async () => {
  // 空なら送信しない
  if ((form.text?.trim().length ?? 0) === 0) { return }

  try {
    const data: FormReport = {
      ...form,
      tagNames: tagAction.getTagNames(),
    }

    const reportId = props.report?.id
    const res = reportId
      ? await reportAPI.update(reportId, data)
      : await reportAPI.create(data)

    const actStr = reportId ? '更新' : '作成'
    toast.success(`レポートを${actStr}しました。 id=${res.id}`)

    emit('reload')
    onClose()
  } catch (err) {
    toast.catchError(err)
  }
}

const onClose = () => {
  if (!props.disableClose) {
    emit('close')
  } else {
    onInit()
  }
}

onMounted(() => {
  onInit()
  onFocusTextarea()
})

watch(() => props.report, () => {
  onInit()
  onFocusTextarea()
})

/// //////////////////////////////////////////////////

const refTextarea = ref()
const onFocusTextarea = () => {
  refTextarea.value?.$el?.focus()
}

/// //////////////////////////////////////////////////

const showTagEditDialog = ref<boolean>(false)
const openTagEditDialog = () => {
  showTagEditDialog.value = true
}

watch(showTagEditDialog, () => {
  if (!showTagEditDialog.value) {
    onFocusTextarea()
  }
})
</script>
