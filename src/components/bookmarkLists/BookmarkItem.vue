<template>
  <Button
    class="flex align-items-center gap-1 panel-button"
    :class="{ 'p-button-text p-button-plain': !isSelected }"
    v-bind="$attrs"
  >
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 512 512"
      style="width: 1rem; height: 1rem; opacity: 1;"
      xml:space="preserve"
    >
      <g>
        <polygon
          points="20.317,0 20.317,512 256,426.452 491.683,512 491.683,0 "
          :style="{ fill: fillColor }"
        />
      </g>
    </svg>

    <div class="flex-grow-1 disable-drag">
      {{ name }}
    </div>
  </Button>
</template>

<script  lang="ts">
import { Bookmark } from '~~/src/databases/models/Bookmark'

export default {
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
const props = defineProps<{
  bookmark?: Bookmark,
  isSelected: boolean,
}>()

const name = computed(() => props.bookmark?.name ?? '-')
const fillColor = computed(() => props.bookmark?.color ?? '#4B4B4B')
</script>

<style scoped>
.dragging {
  background-color: var(--primary-color);
}
</style>
