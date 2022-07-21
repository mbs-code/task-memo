<template>
  <div
    class="flex align-items-center gap-1"
    :class="{ 'dragging': isDrag }"
    style="padding-left: 0.5rem"
    v-bind="$attrs"
  >
    <svg
      class="disable-drag"
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
          d="M497.004,258.8L262.098,23.873c-8.977-8.954-20.938-14.277-33.581-14.911L53.749,0.067
      C39.297-0.673,25.22,4.756,14.974,14.99C4.752,25.224-0.676,39.313,0.076,53.764l8.883,174.757
      c0.634,12.655,5.945,24.616,14.899,33.57l234.927,234.928c19.976,19.974,52.382,19.974,72.357,0l165.862-165.874
      C517.002,311.158,516.978,278.764,497.004,258.8z M154.587,154.59c-16.45,16.45-43.098,16.45-59.548,0
      c-16.45-16.45-16.45-43.11,0-59.56s43.098-16.45,59.548,0C171.037,111.48,171.037,138.14,154.587,154.59z"
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
import { Tag } from '~~/src/databases/models/Tag'

export default {
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
const props = defineProps<{
  tag?: Tag,
  isDrag: boolean,
}>()

const name = computed(() => props.tag?.name ?? '-')
const fillColor = computed(() => props.tag?.color ?? '#4B4B4B')
</script>

<style scoped>
.disable-drag {
  pointer-events: none;
}

.dragging {
  background-color: var(--primary-color);
}
</style>
