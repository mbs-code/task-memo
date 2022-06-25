<template>
  <Dialog v-model:visible="_visible" header="Confirmation" :modal="true">
    <pre>
      {{ selectedTags }}
    </pre>

    <template #footer>
      <Button
        label="No"
        icon="pi pi-times"
        class="p-button-text"
        @click="onClose"
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        class="p-button-text"
        autofocus
        @click="onClose"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
type Emit = {
  (e: 'update:visible', value: boolean): void
}
const emit = defineEmits<Emit>()
const props = defineProps<{
  visible: boolean,
}>()

const _visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

const selectedTags = ref()

const onClose = () => { _visible.value = false }
</script>
