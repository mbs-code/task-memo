<template>
  <div>
    <div class="m-2">
      <Button label="Submit" />
    </div>
    <NuxtWelcome />
  </div>
</template>

<script setup lang="ts">
import { db, migrator, Database } from '~~/src/databases/db'

onMounted(async () => {
  await Database.dbWipe()
  await migrator.migrateToLatest()

  const res = await db.insertInto('reports').values({
    text: 'テキスト',
    created_at: new Date(),
    updated_at: new Date(),
  }).executeTakeFirst()
  console.log(res)

  const report = await db
    .selectFrom('reports')
    .selectAll()
    .where('id', '=', Number(res.insertId))
    .executeTakeFirst()
  console.log(report)
})
</script>
