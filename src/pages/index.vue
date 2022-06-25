<template>
  <div>
    <div>home</div>
    <div>home</div>
    <div>{{ reports }}</div>
  </div>
</template>

<script setup lang="ts">
import { useReportAPI } from '~~/src/apis/useReportAPI'
import { Database } from '~~/src/databases/Database'
import { Report } from '~~/src/databases/models/Report'

const { db } = Database.getInstance()
const reportAPI = useReportAPI(db)

const reports = ref<Report[]>([])

onMounted(async () => {
  reports.value = await reportAPI.getAll()
})

</script>
