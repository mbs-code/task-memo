<template>
  <AutoComplete
    v-model="input"
    :suggestions="suggestionTags"
    complete-on-focus
    style="height: 2rem"
    @complete="onComplete"
    @item-select="onTagSelect"
    @change="onAddTag"
    @keydown.enter.stop="onAddTag"
  />
</template>

<script setup lang="ts">
import { Tag } from '~~/src/databases/models/Tag'

const props = defineProps<{
  tags:Tag[],
}>()
const emit = defineEmits<{ // eslint-disable-line func-call-spacing
  (e: 'add:tag', value: string): void
}>()

const input = ref<string>()
const suggestionTags = ref<string[]>([])

const onComplete = () => {
  const name = input.value?.trim()
  suggestionTags.value = (name
    ? props.tags.filter(t => t.name.toLowerCase().includes(name.toLowerCase()))
    : props.tags
  ).map(t => t.name)
}

const onTagSelect = (e: { value: string }) => {
  input.value = e.value
}

const onAddTag = () => {
  const name = input.value?.trim()
  if (name) {
    emit('add:tag', name)
  }
  input.value = null
}
</script>
