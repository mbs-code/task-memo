<template>
  <Card class="m-2">
    <template #content>
      <div class="flex gap-2">
        <TagPanel
          v-for="tag of report.tags"
          :key="`${report.id}-${tag.id}`"
          :tag="tag"
        />
      </div>
      <div>{{ report.created_at }}</div>

      <div class="report-text">
        {{ report.text }}
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ReportWithTag } from '~~/src/databases/models/Report'

defineProps<{ report: ReportWithTag }>()
</script>
