<template>
  <div>
    <Card class="m-2">
      <template #content>
        <ReportEditBox
          disable-close
          :tags="tags"
          @reload="onRefresh"
        />
      </template>
    </Card>

    <ReportPanel
      v-for="report of reports"
      :key="report.id"
      :report="report"
      :tags="tags"
      @reload="onRefresh"
    />

    <Button class="float-button" label="+" />
  </div>
</template>

<script setup lang="ts">
import { useReportAPI } from '~~/src/apis/useReportAPI'
import { useTagAPI } from '~~/src/apis/useTagAPI'
import { Database } from '~~/src/databases/Database'
import { ReportWithTag } from '~~/src/databases/models/Report'
import { Tag } from '~~/src/databases/models/Tag'

const { db } = Database.getInstance()
const reportAPI = useReportAPI(db)
const tagAPI = useTagAPI(db)
const toast = useToast()

const reports = ref<ReportWithTag[]>([])
const tags = ref<Tag[]>([])

const onRefresh = async () => {
  try {
    reports.value = await reportAPI.getAll({
      sort: 'id',
      order: 'desc',
    })
    tags.value = await tagAPI.getAll({ sort: 'id' })
  } catch (err) {
    toast.catchError(err)
  }
}

onMounted(async () => { await onRefresh() })
</script>

<style scoped lang="scss">
.float-button {
  position: absolute;
  z-index: 100;
  bottom: 10px;
  right: 10px;
}
</style>
