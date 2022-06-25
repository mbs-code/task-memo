<template>
  <Card class="m-2">
    <template #content>
      <div class="flex flex-wrap gap-2">
        <div class="flex flex-grow-1 flex-wrap gap-2">
          <TagPanel
            v-for="tag of report.tags"
            :key="`${report.id}-${tag.id}`"
            :tag="tag"
          />
        </div>

        <Tag
          class="report-time"
          icon="pi pi-clock"
          :value="createdAt"
          :style="{
          }"
        />

        <Button
          class="p-button-text p-0"
          icon="pi pi-ellipsis-h"
        />
      </div>

      <div class="mt-2 report-text">
        {{ report.text }}
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import dateFormat from 'date-fns/format'
import { ReportWithTag } from '~~/src/databases/models/Report'

const props = defineProps<{ report: ReportWithTag }>()

const createdAt = computed(() => dateFormat(props.report.created_at, 'yyyy-MM-dd HH:mm:ss'))
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

.report-time {
  border: solid 1px;
  color: var(--text-color);
  border-color: var(--text-color);
  background-color: #fff;
}
</style>
