<template>
  <div>
    <ReportPanel
      v-for="report of reports"
      :key="report.id"
      :report="report"
    />
  </div>
</template>

<script setup lang="ts">
import { useReportAPI } from '~~/src/apis/useReportAPI'
import { Database } from '~~/src/databases/Database'
import { ReportWithTag } from '~~/src/databases/models/Report'

const { db } = Database.getInstance()
const reportAPI = useReportAPI(db)
const toast = useToast()

const reports = ref<ReportWithTag[]>([])

onMounted(async () => {
  await onRefresh()
})

const onRefresh = async () => {
  try {
    reports.value = await reportAPI.getAll({
      sort: 'id',
      order: 'desc',
    })
  } catch (err) {
    toast.catchError(err)
  }
}
</script>

<style scoped lang="scss">

.report-text {
  white-space: pre-wrap;

  // タイトル扱い
  &:first-line {
    font-size: 1.25rem;
    line-height: 2em;
    font-weight: bold;
    color: var(--primary-color);
  }
}
</style>
