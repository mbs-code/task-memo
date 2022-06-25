<template>
  <div>
    <div class="flex gap-2 surface-500 p-2">
      <nuxt-link class="no-underline-all flex-initial" :to="{ name: 'index' }">
        <Button class="p-button-secondary" label="Home" />
      </nuxt-link>

      <nuxt-link class="no-underline-all flex-initial" :to="{ name: 'test' }">
        <Button class="p-button-secondary" label="Home" />
      </nuxt-link>
    </div>

    <div class="p-2">
      <NuxtPage />
    </div>
  </div>
</template>
