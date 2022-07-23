<template>
  <div>
    <TagTree v-model:selectedTags="selectedTags" />

    <Card class="m-2">
      <template #content>
        <ReportEditBox
          disable-close
          @reload="onRefresh"
        />
      </template>
    </Card>

    <ReportPanel
      v-for="report of reports"
      :key="report.id"
      :report="report"
      @reload="onRefresh"
    />

    <Button class="float-button" label="+" />
  </div>
</template>

<script setup lang="ts">
import { ReportAPI } from '~~/src/apis/ReportAPI'
import { ReportWithTag } from '~~/src/databases/models/Report'
import { Tag } from '~~/src/databases/models/Tag'
import { useTagStore } from '~~/src/store/useTagStore'

const tagStore = useTagStore()
const toast = useToast()

const selectedTags = ref<Tag[]>([])
const reports = ref<ReportWithTag[]>([])

const onRefresh = async () => {
  try {
    reports.value = await ReportAPI.getAll({
      tagIds: selectedTags.value.map(t => t.id),
      sort: ['id', 'desc'],
    })

    await tagStore.init()
  } catch (err) {
    toast.catchError(err)
  }
}

onMounted(async () => { await onRefresh() })
watch(() => [...selectedTags.value], async () => { await onRefresh() })
</script>

<style scoped lang="scss">
.float-button {
  position: absolute;
  z-index: 100;
  bottom: 10px;
  right: 10px;
}
</style>
