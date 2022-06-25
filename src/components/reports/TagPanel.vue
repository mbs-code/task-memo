<template>
  <Tag
    :value="tag.name"
    :style="{
      backgroundColor: bgColor,
      color: fontColor,
    }"
  />
</template>

<script setup lang="ts">
import fontColorContrast from 'font-color-contrast'
import { Tag as TagModel } from '~~/src/databases/models/Tag'

const props = defineProps<{ tag: TagModel }>()

const bgColor = props.tag.color || 'darkgray'
const fontColor = computed(() => fontColorContrast(bgColor, 0.7))
</script>
