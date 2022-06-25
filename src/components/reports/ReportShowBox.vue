<template>
  <div class="flex gap-2 mb-2">
    <div class="flex-grow-1">
      <div class="flex flex-wrap gap-2">
        <Button
          class="report-tag-button p-button-secondary p-button-outlined"
          icon="pi pi-clock"
          :label="createdAt"
        />

        <Button
          v-for="tag of report.tags"
          :key="`${report.id}-${tag.id}`"
          class="report-tag-button p-button-secondary"
          icon="pi pi-tag"
          :label="tag.name"
          :style="{
            backgroundColor: tag.color,
            color: fontColorContrast(tag.color, 0.7)
          }"
        />
      </div>
    </div>

    <div>
      <Button
        class="report-tag-button p-button-text"
        icon="pi pi-ellipsis-h"
        @click="onEdit"
      />
    </div>
  </div>

  <div class="report-text" @dblclick="onEdit">
    {{ report.text }}
  </div>
</template>

<script setup lang="ts">
import dateFormat from 'date-fns/format'
import fontColorContrast from 'font-color-contrast'
import { ReportWithTag } from '~~/src/databases/models/Report'

type Emit = {
  (e: 'edit'): void
}
const emit = defineEmits<Emit>()
const props = defineProps<{ report: ReportWithTag }>()

const createdAt = computed(() => dateFormat(props.report.created_at, 'yyyy-MM-dd HH:mm:ss'))
const onEdit = () => { emit('edit') }
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
