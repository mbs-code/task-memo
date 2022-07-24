<template>
  <div
    class="flex align-items-center gap-1"
    :class="{ 'dragging': isSelected }"
    style="padding-left: 0.5rem"
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
        <path
          class="st0"
          d="M463.511,0H27.022v512L256,361.971l228.978,150.023V0H463.511z M256,310.645L69.955,432.534V42.933h372.089
      v389.601L256,310.645z"
          :style="{ fill: fillColor }"
        />
      </g>
    </svg>

    <div class="flex-grow-1 disable-drag">
      {{ name }}
    </div>
  </div>
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
