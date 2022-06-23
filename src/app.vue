<template>
  <div>
    <NuxtWelcome />
  </div>
</template>

<script setup lang="ts">
import { db, migrator } from '~~/src/databases/db'

onMounted(async () => {
  const { results } = await migrator.migrateToLatest()
  console.log(results)

  const res = await db.insertInto('persons').values({
    first_name: 'ファースト',
    last_name: null,
  }).executeTakeFirst()
  console.log(res)

  const person = await db
    .selectFrom('persons')
    .selectAll()
    .where('id', '=', Number(res.insertId))
    .executeTakeFirst()
  console.log(person)
})
</script>
