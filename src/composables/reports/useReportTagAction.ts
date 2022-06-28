import { ComputedRef } from 'nuxt/dist/app/compat/capi'
import { Tag } from '~~/src/databases/models/Tag'

export type TagTreeItem = Tag & { children: TagTreeItem[] }

export const useReportTagAction = (
  tags: ComputedRef<Tag[]>,
  onExists: (name: string) => void,
) => {
  // 現在選択しているタグ
  const formSelectedTags = ref<Tag[]>([])
  // 現在新規に追加するタグ名
  const formTagNames = ref<string[]>([])

  const getTagNames = () => {
    const tagNames = formSelectedTags.value.map(t => t.name)
    tagNames.push(...formTagNames.value)
    return tagNames
  }

  /// ////////////////////////////////////////////////////////////

  // 検索 & 入力用の文字列
  const inputTagName = ref<string>('')

  // テキストにあるタグを追加する
  const onAddTag = () => {
    const name = inputTagName.value?.trim()

    // タグにあるか判断
    const tag = tags.value.find(t => t.name === name)
    if (tag) {
      // タグにあれば、既に存在していないことを確認して追加
      const exist = formSelectedTags.value.find(t => t.id === tag.id)
      if (!exist) {
        formSelectedTags.value.push({ ...tag })
      } else {
        onExists && onExists(name)
      }
    } else {
      // タグに無ければ、文字列追加を行う
      const exist = formTagNames.value.find(n => n === name)
      if (!exist) {
        formTagNames.value.push(name)
      } else {
        onExists && onExists(name)
      }
    }

    inputTagName.value = null
  }

  // タグを削除する
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

  /// ////////////////////////////////////////////////////////////

  // auto complete 用
  const filteredInputTags = ref<string[]>([])

  // 検索イベント
  const onSuggestedTags = () => {
    const name = inputTagName.value?.trim()
    filteredInputTags.value = (name
      ? tags.value.filter(t => t.name.toLowerCase().includes(name))
      : tags.value
    ).map(t => t.name)
  }

  // auto complete からタグを選択したとき
  const onSelectedTag = (e: { value: string }) => {
    inputTagName.value = e.value
  }

  /// ////////////////////////////////////////////////////////////

  // タグツリー用データ
  const tagTrees = computed(() => {
    // ルート要素をピックして、再起取得していく
    const roots: TagTreeItem[] = tags.value
      .filter(t => !t.parent_tag_id)
      .map(t => _convertNodeRecursive(tags.value, t))
    return roots
  })

  const _convertNodeRecursive = (allTags: Tag[], tag: Tag) => {
    // 子を探索
    const children = allTags
      .filter(t => t.parent_tag_id === tag.id)
      .map(t => _convertNodeRecursive(allTags, t))

    const hasChild = children.length
    return {
      key: tag.id,
      label: tag.name,
      data: tag,
      icon: `pi ${hasChild ? 'pi-tags' : 'pi-tag'}`,
      children,
    }
  }

  // ツリーのタグ選択値
  const selectedTreeKeys = computed({
    get: () => {
      // tag 配列を { 1: true, 2: true } 形式に変換
      return Object.fromEntries(
        formSelectedTags.value.map((t: Tag) => [t.id, true])
      )
    },
    set: (obj) => {
      // { 1: true, 2: true } を tag 配列に組み直す
      const selectedTags: Tag[] = Object.keys(obj)
        .map((key) => {
          return tags.value.find(t => t.id === Number(key))
        }).filter(t => t)
      formSelectedTags.value = selectedTags
    },
  })

  const expandTreeKeys = ref()
  const onTreeExpandAll = () => {
    expandTreeKeys.value = {
      ...Object.fromEntries(
        tags.value.map((t: Tag) => [t.id, true])
      )
    }
  }

  const onTreeCallapseAll = () => {
    expandTreeKeys.value = {}
  }

  /// ////////////////////////////////////////////////////////////

  return {
    formSelectedTags,
    formTagNames,
    getTagNames,

    inputTagName,
    onAddTag,
    onRemoveTag,

    filteredInputTags,
    onSuggestedTags,
    onSelectedTag,

    tagTrees,
    selectedTreeKeys,
    expandTreeKeys,
    onTreeCallapseAll,
    onTreeExpandAll,
  }
}
