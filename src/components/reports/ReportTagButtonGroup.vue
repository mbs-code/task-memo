<template>
  <Button
    v-for="tag of tags"
    :key="tag.name"
    class="report-tag-button p-button-secondary"
    :style="{
      backgroundColor: tag.color,
      color: fontColorContrast(tag.color, 0.7)
    }"
    @click="emit('remove:tag', tag.name)"
  >
    <div class="flex gap-2">
      <i class="pi pi-tag" />
      <span>{{ tag.name }}</span>
      <i class="pi pi-times-circle" />
    </div>
  </Button>

  <Button
    v-for="name of tagNames"
    :key="name"
    class="report-tag-button p-button-secondary p-button-outlined"
    icon="pi pi-pencil"
    :label="name"
    @click="emit('remove:tag', name)"
  >
    <div class="flex gap-2">
      <i class="pi pi-tag" />
      <span>{{ name }}</span>
      <i class="pi pi-times-circle" />
    </div>
  </Button>
</template>

<script setup lang="ts">
import fontColorContrast from 'font-color-contrast'
import { Tag } from '~~/src/databases/models/Tag'

defineProps<{
  tags: Tag[],
  tagNames: string[],
}>()
const emit = defineEmits<{ // eslint-disable-line func-call-spacing
  (e: 'remove:tag', value: string): void
}>()
</script>
