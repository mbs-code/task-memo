<template>
  <div
    class="flex gap-2"
    @keydown.t.ctrl="openTagEditDialog"
    @keydown.s.ctrl="onSave"
    @keydown.esc="onClose"
  >
    <div class="flex-grow-1">
      <div class=" mb-2">
        <div class="flex flex-wrap gap-2">
          <Button
            class="report-tag-button p-button-primary p-button-text"
            icon="pi pi-plus"
            label="タグ編集"
            @click="openTagEditDialog"
          />

          <Button
            v-for="tag of report?.tags ?? []"
            :key="`${report.id}-${tag.id}`"
            class="report-tag-button p-button-secondary"
            icon="pi pi-tag"
            :label="tag.name"
            :style="{
              backgroundColor: tag.color,
              color: fontColorContrast(tag.color, 0.7)
            }"
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

      <div class="flex gap-2 text-xs">
        <span>保存: Ctrl+S</span>
        <span>タグ編集: Ctrl+T</span>
        <span v-if="!disableClose">閉じる: Esc</span>

        <div class="spacer" />

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

  <TagEditDialog
    v-model:visible="showTagEditDialog"
  />
</template>

<script setup lang="ts">
import fontColorContrast from 'font-color-contrast'
import { FormReport, useReportAPI } from '~~/src/apis/useReportAPI'
import { Database } from '~~/src/databases/Database'
import { ReportWithTag } from '~~/src/databases/models/Report'

type Emit = {
  (e: 'reload'): void
  (e: 'close'): void
}
const emit = defineEmits<Emit>()
const props = defineProps<{
  report?: ReportWithTag,
  disableClose?: boolean,
}>()

const { db } = Database.getInstance()
const reportAPI = useReportAPI(db)
const toast = useToast()

const form = reactive<FormReport>({
  text: '',
  tagNames: [],
})
const lineCount = computed(() => form.text?.length ?? 0)
const textCount = computed(() => ((form.text ?? '').match(/\n/g) || []).length + 1)

const onInit = () => {
  form.text = props.report?.text || null
}

const onSave = async () => {
  try {
    const reportId = props.report?.id
    const res = reportId
      ? await reportAPI.update(reportId, form)
      : await reportAPI.create(form)

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
