<template>
  <div
    class="flex gap-2"
    @keydown.t.ctrl="openTagEditDialog"
    @keydown.s.ctrl="onSave"
    @keydown.ctrl.enter="onSave"
    @keydown.esc="onClose"
  >
    <div class="flex-grow-1">
      <div class="flex flex-wrap gap-2 mb-2">
        <Button
          class="report-tag-button p-button-primary p-button-text"
          icon="pi pi-list"
          label="タグ編集"
          @click="openTagEditDialog"
        />

        <Button
          v-for="tag of formSelectedTags"
          :key="tag.name"
          class="report-tag-button p-button-secondary"
          :style="{
            backgroundColor: tag.color,
            color: fontColorContrast(tag.color, 0.7)
          }"
          @click="onRemoveTag(tag)"
        >
          <div class="flex gap-2">
            <i class="pi pi-tag" />
            <span>{{ tag.name }}</span>
            <i class="pi pi-times-circle" />
          </div>
        </Button>

        <Button
          v-for="name of formTagNames"
          :key="name"
          class="report-tag-button p-button-secondary p-button-outlined"
          icon="pi pi-pencil"
          :label="name"
          @click="onRemoveTag(name)"
        >
          <div class="flex gap-2">
            <i class="pi pi-tag" />
            <span>{{ name }}</span>
            <i class="pi pi-times-circle" />
          </div>
        </Button>

        <div class="flex gap-1 align-items-center">
          <div class="text-sm">
            新規タグ:
          </div>
          <AutoComplete
            v-model="inputTagName"
            :suggestions="filteredInputTags"
            complete-on-focus
            style="height: 2rem"
            @complete="onSuggestedTags"
            @item-select="onSelectedTag"
            @change="onAddTag"
          />
        </div>
      </div>

      <Textarea
        ref="refTextarea"
        v-model="form.text"
        auto-resize
        class="w-full"
        rows="3"
        helptext
      />

      <div class="flex gap-2 text-xs px-1">
        <span>保存: Ctrl+S</span>
        <span>タグ編集: Ctrl+T</span>
        <span v-if="!disableClose">閉じる: Esc</span>

        <div class="spacer" />

        <span>タグ: {{ formSelectedTags.length }}</span>
        <span>行数: {{ textCount }}</span>
        <span>文字数: {{ lineCount }}</span>
      </div>
    </div>

    <div v-if="!disableClose">
      <Button
        class="report-tag-button p-button-text p-0 btn-fixed-size"
        icon="pi pi-times"
        @click="onClose"
      />
    </div>
  </div>

  <TagEditDialog
    v-model:visible="showTagEditDialog"
    v-model:selected-tags="formSelectedTags"
    v-model:input-names="formTagNames"
  />
</template>

<script setup lang="ts">
import fontColorContrast from 'font-color-contrast'
import { FormReport, useReportAPI } from '~~/src/apis/useReportAPI'
import { Database } from '~~/src/databases/Database'
import { ReportWithTag } from '~~/src/databases/models/Report'
import { Tag } from '~~/src/databases/models/Tag'

type Emit = {
  (e: 'reload'): void
  (e: 'close'): void
}
const emit = defineEmits<Emit>()
const props = defineProps<{
  report?: ReportWithTag,
  tags: Tag[],
  disableClose?: boolean,
}>()

const { db } = Database.getInstance()
const reportAPI = useReportAPI(db)
const toast = useToast()

const form = reactive<FormReport>({
  text: '',
  tagNames: [],
})
const formSelectedTags = ref<Tag[]>([])
const formTagNames = ref<string[]>([])

const lineCount = computed(() => form.text?.length ?? 0)
const textCount = computed(() => ((form.text ?? '').match(/\n/g) || []).length + 1)

const onInit = () => {
  form.text = props.report?.text || null

  formSelectedTags.value = props.report?.tags ?? []
  formTagNames.value = []
}

const onSave = async () => {
  // 空なら送信しない
  if ((form.text?.trim().length ?? 0) === 0) { return }

  try {
    const tagNames = formSelectedTags.value.map(t => t.name)
    tagNames.push(...formTagNames.value)

    const data: FormReport = { ...form, tagNames }

    const reportId = props.report?.id
    const res = reportId
      ? await reportAPI.update(reportId, data)
      : await reportAPI.create(data)

    const actStr = reportId ? '更新' : '作成'
    toast.success(`レポートを${actStr}しました。 id=${res.id}`)

    emit('reload')
    onClose()
  } catch (err) {
    toast.catchError(err)
  }
}

const onClose = () => {
  if (!props.disableClose) {
    emit('close')
  } else {
    onInit()
  }
}

onMounted(() => {
  onInit()
  onFocusTextarea()
})

watch(() => props.report, () => {
  onInit()
  onFocusTextarea()
})

/// //////////////////////////////////////////////////

const inputTagName = ref<string>()
const filteredInputTags = ref<string[]>([])

const onSuggestedTags = () => {
  const name = inputTagName.value?.trim()
  filteredInputTags.value = (name
    ? props.tags.filter(t => t.name.toLowerCase().includes(name))
    : props.tags
  ).map(t => t.name)
}

const onSelectedTag = (e: { value: string }) => {
  inputTagName.value = e.value
  onAddTag()
}

const onAddTag = () => {
  const name = inputTagName.value?.trim()

  // タグにあるか判断
  const tag = props.tags.find(t => t.name === name)
  if (tag) {
    // タグにあれば、既に存在していないことを確認して追加
    const exist = formSelectedTags.value.find(t => t.id === tag.id)
    if (!exist) {
      formSelectedTags.value.push({ ...tag })
    } else {
      toast.warn(`「${name}」は追加済みです。`)
    }
  } else {
    // タグに無ければ、文字列追加を行う
    const exist = formTagNames.value.find(n => n === name)
    if (!exist) {
      formTagNames.value.push(name)
    } else {
      toast.warn(`「${name}」は追加済みです。`)
    }
  }

  inputTagName.value = null
}

const onRemoveTag = (value: Tag | string) => {
  if (typeof value === 'string') {
  // 文字列だったら文字列配列から取り除く
    const idx = formTagNames.value.findIndex(n => n === value)
    if (idx >= 0) {
      formTagNames.value.splice(idx, 1)
    }
  } else {
    // タグだったらタグ配列から取り除く
    const idx = formSelectedTags.value.findIndex(t => t.id === value.id)
    if (idx >= 0) {
      formSelectedTags.value.splice(idx, 1)
    }
  }
}

/// //////////////////////////////////////////////////

const refTextarea = ref()
const onFocusTextarea = () => {
  refTextarea.value?.$el?.focus()
}

/// //////////////////////////////////////////////////

const showTagEditDialog = ref<boolean>(false)
const openTagEditDialog = () => {
  showTagEditDialog.value = true
}

watch(showTagEditDialog, () => {
  if (!showTagEditDialog.value) {
    onFocusTextarea()
  }
})
</script>
