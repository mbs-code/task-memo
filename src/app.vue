<template>
  <div>
    <AppHeader @reload="onReload" />

    <NuxtPage :key="key" />
    <!-- <div class="main-viewport">
      <NuxtPage :key="key" />
    </div> -->

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
  height: calc(100vh - 64px);
}
</style>
