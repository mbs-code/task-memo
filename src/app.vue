<template>
  <div>
    <NuxtWelcome />
  </div>
</template>

<script setup lang="ts">
import db from '~~/src/databases/db'

onMounted(async () => {
  const res = await db.insertInto('person').values({
    first_name: 'ファースト',
    last_name: null,
  }).executeTakeFirst()
  console.log(res)
})
</script>
