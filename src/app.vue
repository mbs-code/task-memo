<template>
  <div>
    <div class="m-2">
      <Button label="Submit" />
    </div>
    <NuxtWelcome />
  </div>
</template>

<script setup lang="ts">
import { useReportAPI } from '~~/src/apis/useReportAPI'

onMounted(async () => {
  const reportAPI = useReportAPI()
  await reportAPI.clear()

  await reportAPI.create({
    text: 'text',
    tagNames: ['tag'],
  })

  const report = await reportAPI.create({
    text: 'テキスト',
    tagNames: ['タグA', 'タグB'],
  })
  await reportAPI.update(report.id, {
    text: report.text,
    tagNames: report.tags.map(t => t.name)
  })

  const reports = await reportAPI.getAll()
  console.log(reports)
})
</script>
