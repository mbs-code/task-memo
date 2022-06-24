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

  const createTagA = await db.insertInto('tags').values([
    {
      name: 'タグA',
      is_pinned: false,
      created_at: new Date(),
      updated_at: new Date(),
    }
  ]).executeTakeFirstOrThrow()

  const createTagB = await db.insertInto('tags').values([
    {
      name: 'タグB',
      is_pinned: false,
      created_at: new Date(),
      updated_at: new Date(),
    }
  ]).executeTakeFirstOrThrow()

  const createReport = await db.insertInto('reports').values({
    text: 'テキスト',
    created_at: new Date(),
    updated_at: new Date(),
  }).executeTakeFirstOrThrow()

  await db.insertInto('report_tags').values({
    report_id: Number(createReport.insertId),
    tag_id: Number(createTagA.insertId),
    created_at: new Date(),
    updated_at: new Date(),
  }).executeTakeFirstOrThrow()

  await db.insertInto('report_tags').values({
    report_id: Number(createReport.insertId),
    tag_id: Number(createTagB.insertId),
    created_at: new Date(),
    updated_at: new Date(),
  }).executeTakeFirstOrThrow()

  ///

  const reports = await db
    .selectFrom('reports')
    .selectAll()
    .execute()

  const reportIds = Array.from(new Set(reports.map(r => r.id)))
  console.log(reportIds)

  const reportTags = await db
    .selectFrom('report_tags')
    .selectAll()
    .where('report_id', 'in', reportIds)
    .execute()
  console.log(reportTags)

  const tagIds = Array.from(new Set(reportTags.map(rt => rt.tag_id)))
  console.log(tagIds)

  const tags = await db
    .selectFrom('tags')
    .selectAll()
    .where('id', 'in', tagIds)
    .execute()
  console.log(tags)

  const reportWithTags = reports.map((r) => {
    return {
      ...r,
      tags: reportTags
        .filter(rt => rt.report_id === r.id)
        .map(rt => tags.filter(t => rt.tag_id === t.id))
    }
  })
  console.log(reportWithTags)
})
</script>
