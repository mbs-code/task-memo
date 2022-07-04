<template>
  <div>
    <TagTree :tag-tree="tagTree.tagTrees.value" @update="tagTree.onInit()" />

    <pre>{{ tagTree.tagTrees.value }}</pre>

    <Card class="m-2">
      <template #content>
        <ReportEditBox
          disable-close
          :tags="tagTree.tags.value"
          @reload="onRefresh"
        />
      </template>
    </Card>

    <ReportPanel
      v-for="report of reports"
      :key="report.id"
      :report="report"
      :tags="tagTree.tags.value"
      @reload="onRefresh"
    />

    <Button class="float-button" label="+" />
  </div>
</template>

<script setup lang="ts">
import { useReportAPI } from '~~/src/apis/useReportAPI'
import { useTagTree } from '~~/src/composables/reports/useTagTree'
import { Database } from '~~/src/databases/Database'
import { ReportWithTag } from '~~/src/databases/models/Report'

const { db } = Database.getInstance()
const reportAPI = useReportAPI(db)
const toast = useToast()

const tagTree = useTagTree(db, toast)

const reports = ref<ReportWithTag[]>([])

const onRefresh = async () => {
  try {
    reports.value = await reportAPI.getAll({
      sort: ['id', 'desc'],
    })

    await tagTree.onInit()
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
