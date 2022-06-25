<template>
  <div>
    <ReportPanel
      v-for="report of reports"
      :key="report.id"
      :report="report"
      @reload="onRefresh"
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

onMounted(async () => { await onRefresh() })
</script>
