<template>
  <Tag
    :value="tag.name"
    :style="{
      backgroundColor: tag.color || 'darkgray',
      color: fontColorContrast(tag.color || 'darkgray', 0.7),
    }"
  />
</template>

<script setup lang="ts">
import fontColorContrast from 'font-color-contrast'
import { Tag as TagModel } from '~~/src/databases/models/Tag'

defineProps<{ tag: TagModel }>()
</script>
