<template>
  <div class="flex gap-2">
    <div class="flex-grow-1">
      {{ report }}
    </div>

    <div>
      <Button
        class="p-button-text p-0 btn-fixed-size"
        icon="pi pi-times"
        @click="onClose"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ReportWithTag } from '~~/src/databases/models/Report'

type Emit = {
  (e: 'close'): void
}
const emit = defineEmits<Emit>()
const props = defineProps<{ report: ReportWithTag }>()

const onClose = () => { emit('close') }
</script>

<style scoped>
.btn-fixed-size {
  min-width: 3rem;
  height: calc(1.75rem);
}
</style>
