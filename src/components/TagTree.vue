<template>
  <div>{{ data }}</div>

  <TagTreeNested v-model:tasks="data" :disabled="false" />
</template>

<script setup lang="ts">
import { TagTreeItem } from '~~/src/composables/reports/useTagTree'

const props = defineProps<{
  tagTrees: TagTreeItem,
}>()

const data = ref([
  {
    name: 'task 1',
    tasks: [
      {
        name: 'task 2',
        tasks: []
      }
    ]
  },
  {
    name: 'task 3',
    tasks: [
      {
        name: 'task 4',
        tasks: []
      }
    ]
  },
  {
    name: 'task 5',
    tasks: []
  }
])
</script>
