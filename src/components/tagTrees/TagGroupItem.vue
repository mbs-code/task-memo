<template>
  <div
    class="pl-1 border-3"
    :class="{
      'border-transparent': !isEnter,
      'drag-over-area': isEnter,
      'dragging': isDrag,
    }"
  >
    <div
      class="flex align-items-center gap-1"
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
            class="st0"
            d="M465.929,121.035H249.246c-25.444,0-46.071-20.627-46.071-46.071v-3.644c0-25.444-20.627-46.071-46.071-46.071
          H46.071C20.627,25.25,0,45.877,0,71.321v49.714v49.342v270.302c0,25.444,20.627,46.071,46.071,46.071h419.858
          c25.444,0,46.071-20.627,46.071-46.071V167.107C512,141.663,491.373,121.035,465.929,121.035z"
            :style="{ fill: fillColor }"
          />
        </g>
      </svg>

      <div class="flex-grow-1 disable-drag">
        {{ name }}
      </div>

      <Button
        class="tree-button p-button-text p-button-success"
        icon="pi pi-folder"
        @click="emit('click:tagGroup')"
      />

      <Button
        class="tree-button p-button-text p-button-success"
        icon="pi pi-tag"
        @click="emit('click:tag')"
      />
    </div>

    <div class="flex">
      <div style="background-color: lightgrey; width: 2px; margin: 0 0.25rem;" />

      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { TagGroup } from '~~/src/databases/models/TagGroup'

export default {
  inheritAttrs: false,
}
</script>

<script setup lang="ts">
const props = defineProps<{
  tagGroup?: TagGroup,
  isDrag: boolean,
  isEnter: boolean,
}>()
const emit = defineEmits<{ // eslint-disable-line func-call-spacing
  (e: 'click:tagGroup'): void,
  (e: 'click:tag'): void,
}>()

const name = computed(() => props.tagGroup?.name ?? '-')
const fillColor = computed(() => '#4B4B4B')
</script>

<style scoped lang="scss">
.disable-drag {
  pointer-events: none;
  user-select: none;
}

.tree-button {
  width: 2rem;
  height: 1rem;

  ::v-deep(.pi) {
    font-size: 1rem;
  }
}

.dragging {
  background-color: var(--primary-color);
}

.drag-over-area {
  border-color: var(--surface-700);
}
</style>
