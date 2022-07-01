<template>
  <draggable
    v-model="_tasks"
    class="dragArea"
    tag="ul"
    group="tagTree"
    item-key="name"
    :disabled="disabled"
  >
    <template #item="{ element }">
      <li class="bg-cyan-500">
        <p class="bg-orange-500">
          {{ element.name }}
        </p>

        <TagTreeNested
          v-model:tasks="element.tasks"
          class="bg-pink-500"
          :nest="nest + 1"
          :disabled="disabled"
        />
      </li>
    </template>
  </draggable>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'

type TreeItem = {
  name: string,
  tasks: TreeItem[],
}

type Emit = {
  (e: 'update:tasks', value: any[]): void
}
const emit = defineEmits<Emit>()
const props = withDefaults(defineProps<{
  tasks: TreeItem[],
  disabled: boolean,
  nest: number,
}>(), {
  disabled: false,
  nest: 0,
})

const _tasks = computed({
  get: () => {
    return props.tasks
  },
  set: (items: TreeItem[]) => {
    emit('update:tasks', items)
  }
})

</script>

<style scoped>
.dragArea {
  min-height: 50px;
  outline: 1px dashed;
}
</style>
