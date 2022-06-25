<template>
  <div class="flex gap-2 surface-500 p-2">
    <nuxt-link class="no-underline-all flex-initial" :to="{ name: 'index' }">
      <Button class="p-button-secondary" label="Home" />
    </nuxt-link>

    <nuxt-link class="no-underline-all flex-initial" :to="{ name: 'test' }">
      <Button class="p-button-secondary" label="Test" />
    </nuxt-link>

    <div class="spacer" />

    <Button
      class="p-button-danger p-button-outlined surface-200"
      label="ResetDB"
      @click="onResetDB"
    />
  </div>
</template>

<script setup lang="ts">
import { Database } from '~~/src/databases/Database'
import { useToast } from '~~/src/composables/useToast'
import { useTestSeeder } from '~~/src/composables/useTestSeeder'

type Emit = {
  (e: 'reload'): void
}
const emit = defineEmits<Emit>()

const { db, migrator } = Database.getInstance()
const testSeeder = useTestSeeder(db)
const toast = useToast()

const onResetDB = async () => {
  try {
    await Database.dbWipe()
    await migrator.migrateToLatest()
    await testSeeder.seed()

    toast.info('DB をリセットしました。')
    emit('reload')
  } catch (err) {
    toast.catchError(err)
  }
}
</script>
