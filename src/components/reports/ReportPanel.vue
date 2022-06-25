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
        @close="isEdit = false"
        @reload="emit('reload')"
      />
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ReportWithTag } from '~~/src/databases/models/Report'

type Emit = {
  (e: 'reload'): void
}
const emit = defineEmits<Emit>()
defineProps<{ report: ReportWithTag }>()

const isEdit = ref<boolean>(false)
</script>
