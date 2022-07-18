<template>
  <div>
    <AppHeader @reload="onReload" />

    <div class="p-2 main-viewport">
      <NuxtPage :key="key" />
    </div>

    <Toast />
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { useTagStore } from '~~/src/store/useTagStore'
import { Database } from '~~/src/databases/Database'

Database.debug = process.dev

const key = ref<number>(Date.now())
const onReload = () => {
  key.value = Date.now()
}

const tagStore = useTagStore()
onMounted(() => {
  tagStore.init()
})
</script>

<style scoped>
.main-viewport {
  overflow-y: scroll;
  height: calc(100vh - 64px);
}
</style>
