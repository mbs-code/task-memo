<template>
  <div>
    <TagTree :tag-tree-action="tagTreeAction" @select:tag="onSelectedTag" />

    <Card class="m-2">
      <template #content>
        <ReportEditBox
          disable-close
          :tag-tree-action="tagTreeAction"
          @reload="onRefresh"
        />
      </template>
    </Card>

    <ReportPanel
      v-for="report of reports"
      :key="report.id"
      :report="report"
      :tag-tree-action="tagTreeAction"
      @reload="onRefresh"
    />

    <Button class="float-button" label="+" />
  </div>
</template>

<script setup lang="ts">
import { ReportAPI } from '~~/src/apis/ReportAPI'
import { useTagTreeAction } from '~~/src/composables/reports/useTagTreeAction'
import { ReportWithTag } from '~~/src/databases/models/Report'
import { Tag } from '~~/src/databases/models/Tag'

const toast = useToast()
const tagTreeAction = useTagTreeAction(toast)

const reports = ref<ReportWithTag[]>([])

const onSelectedTag = (tag?: Tag) => {
  console.log(tag)
}

const onRefresh = async () => {
  try {
    reports.value = await ReportAPI.getAll({
      sort: ['id', 'desc'],
    })

    await tagTreeAction.onInit()
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
