<template>
  <div>
    <div class="m-2">
      <Button label="Submit" />
    </div>
    <NuxtWelcome />
  </div>
</template>

<script setup lang="ts">
import { Database } from '~~/src/databases/db'
import { useReportAPI } from '~~/src/apis/useReportAPI'
import { useTagAPI } from '~~/src/apis/useTagAPI'

onMounted(async () => {
  Database.debug = true
  const db = Database.getInstance()

  await Database.dbWipe()
  await Database.getMigrator().migrateToLatest()

  const tagAPI = useTagAPI(db)
  const reportAPI = useReportAPI(db)
  await tagAPI.clear()
  await reportAPI.clear()

  const a = await tagAPI.create({
    name: 'a',
    is_pinned: false,
    priority: 0,
  })

  const b = await tagAPI.create({
    name: 'b',
    is_pinned: false,
    priority: 0,
    parent_tag_id: a.id,
  })

  const c = await tagAPI.create({
    name: 'c',
    is_pinned: false,
    priority: 0,
    parent_tag_id: a.id,
  })

  const d = await tagAPI.create({
    name: 'd',
    is_pinned: false,
    priority: 0,
    parent_tag_id: c.id,
  })

  const e = await tagAPI.create({
    name: 'e',
    is_pinned: false,
    priority: 0,
    parent_tag_id: c.id,
  })

  const z = await tagAPI.create({
    name: 'z',
    is_pinned: false,
    priority: 0,
    parent_tag_id: e.id,
  })

  await tagAPI.update(e.id, {
    name: 'e',
    is_pinned: false,
    priority: 0,
    parent_tag_id: b.id,
  })

  console.log('----------')

  const rem = await tagAPI.remove(c.id)
  console.log(rem)

  const tags = await tagAPI.getAll()
  console.log(tags)

  // await reportAPI.create({
  //   text: 'text',
  //   tagNames: ['tag'],
  // })

  // const report = await reportAPI.create({
  //   text: 'テキスト',
  //   tagNames: ['タグA', 'タグB'],
  // })
  // await reportAPI.update(report.id, {
  //   text: report.text,
  //   tagNames: report.tags.map(t => t.name)
  // })

  // const reports = await reportAPI.getAll()
  // console.log(reports)
})
</script>
