<template>
  <div class="flex gap-2">
    <div class="flex-grow-1">
      <Textarea
        ref="refTextarea"
        v-model="form.text"
        auto-resize
        class="w-full"
        rows="8"
        helptext
        @keydown.s.ctrl="onSave"
        @keydown.esc="onClose"
      />
      <small>保存 Ctrl+S, 閉じる Esc</small>
    </div>

    <div>
      <Button
        class="p-button-text p-0 btn-fixed-size"
        icon="pi pi-times"
        @click="onClose"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Textarea from 'primevue/textarea'
import { FormReport, useReportAPI } from '~~/src/apis/useReportAPI'
import { Database } from '~~/src/databases/Database'
import { ReportWithTag } from '~~/src/databases/models/Report'

type Emit = {
  (e: 'reload'): void
  (e: 'close'): void
}
const emit = defineEmits<Emit>()
const props = defineProps<{ report: ReportWithTag }>()

const { db } = Database.getInstance()
const reportAPI = useReportAPI(db)
const toast = useToast()

const form = reactive<FormReport>({
  text: '',
  tagNames: [],
})

const onInit = () => {
  form.text = props.report.text
}

const onSave = async () => {
  try {
    const reportId = props.report.id
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

const onClose = () => { emit('close') }

/// //////////////////////////////////////////////////

const refTextarea = ref()
onMounted(() => {
  onInit()
  refTextarea.value.$el.focus()
})

watch(props.report, () => {
  onInit()
  refTextarea.value.$el.focus()
})
</script>

<style scoped>
.btn-fixed-size {
  min-width: 3rem;
  height: calc(1.75rem);
}
</style>
