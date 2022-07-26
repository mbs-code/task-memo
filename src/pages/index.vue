<template>
  <div>
    <Splitter style="background: unset !important;">
      <SplitterPanel class="panel-viewport">
        <BookmarkList
          :search-report-param="reportParam"
          @change:bookmark="onClickBookmark"
        />
        <hr>
        <TagTree v-model:selectedTags="selectedTags" />
      </SplitterPanel>

      <SplitterPanel class="panel-viewport">
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
      </SplitterPanel>
    </Splitter>
  </div>
</template>

<script setup lang="ts">
import { ReportAPI, SearchReportParam } from '~~/src/apis/ReportAPI'
import { Bookmark } from '~~/src/databases/models/Bookmark'
import { ReportWithTag } from '~~/src/databases/models/Report'
import { Tag } from '~~/src/databases/models/Tag'
import { useTagStore } from '~~/src/store/useTagStore'

const tagStore = useTagStore()
const toast = useToast()

const selectedTags = ref<Tag[]>([])
const reports = ref<ReportWithTag[]>([])

const reportParam = computed<SearchReportParam>(() => ({
  tagIds: selectedTags.value.map(t => t.id),
  text: '',
}))

const onRefresh = async () => {
  try {
    reports.value = await ReportAPI.getAll({
      ...reportParam.value,
      sort: ['id', 'desc'],
    })

    await tagStore.init()
  } catch (err) {
    toast.catchError(err)
  }
}

onMounted(async () => { await onRefresh() })
watch(() => [...selectedTags.value], async () => { await onRefresh() })

const onClickBookmark = (bookmark?: Bookmark) => {
  const tagIds = bookmark?.json
    ? JSON.parse(bookmark.json)?.tagIds
    : []
  const tags = tagIds.map((tid: number) => tagStore.tags.find(t => t.id === tid))

  selectedTags.value = tags
}
</script>

<style scoped>
.panel-viewport {
  height: calc(100vh - 66px);
  overflow-y: scroll;
  padding-top: 0.5rem;
  padding-left: 0.5rem;
}
</style>
