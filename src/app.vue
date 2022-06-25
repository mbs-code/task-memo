<template>
  <div>
    <AppHeader @reload="onReload" />

    <div class="p-2">
      <NuxtPage :key="key" />
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
const key = ref<number>(Date.now())

const onReload = () => {
  key.value = Date.now()
}
</script>
