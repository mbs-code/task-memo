<template>
  <Card class="m-2">
    <template #content>
      <ReportShowBox
        v-if="!isEdit"
        :report="report"
        @edit="isEdit = true"
      />

      <ReportEditBox
        v-else
        :report="report"
        :tags="tags"
        @close="isEdit = false"
        @reload="emit('reload')"
      />
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ReportWithTag } from '~~/src/databases/models/Report'
import { Tag } from '~~/src/databases/models/Tag'

type Emit = {
  (e: 'reload'): void
}
const emit = defineEmits<Emit>()
defineProps<{
  report: ReportWithTag,
  tags: Tag[],
}>()

const isEdit = ref<boolean>(false)
</script>
