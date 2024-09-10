<template>
  <div class="flex justify-center items-center w-6 h-6">
    <component :is="dynamicSvg" />
  </div>
</template>

<script lang="ts" setup>
import { computed, h } from 'vue'

import FileSvg from '@/assets/icons/file.svg?component'
import FolderFileSvg from '@/assets/icons/folder-file.svg?component'
import FolderSvg from '@/assets/icons/folder.svg?component'
import ImageSvg from '@/assets/icons/image.svg?component'
import LinkSvg from '@/assets/icons/link.svg?component'
import TextSvg from '@/assets/icons/text.svg?component'
import { FILE_SUB_TYPE_VALUE, TYPE_VALUE } from '@/constants/aria'
import { ClipboardType } from '@/hooks/useTypeOptions'

import ColorBlock from './ColorBlock.vue'

interface Props {
  data: {
    [K in string]: string
  } & { type: ClipboardType }
}

const props = defineProps<Props>()
const ops = {
  Color: () => h(ColorBlock, { class: 'w-4 h-4', value: props.data.content }),
  Text: () => h(TextSvg, { class: 'w-5' }),
  Image: () => h(ImageSvg, { class: 'w-[22px]' }),
  Link: () => h(LinkSvg, { class: 'w-5' }),
  File: () => h(FileSvg, { class: 'h-[18px]' }),
  Folder: () => h(FolderSvg, { class: 'w-5' }),
  FolderFile: () => h(FolderFileSvg, { class: 'w-5' })
}

const dynamicSvg = computed(() => {
  const type = props.data.type
  if (type === TYPE_VALUE.file) {
    const subType = props.data.subType
    if (subType === FILE_SUB_TYPE_VALUE.folder) {
      return () => h(FolderSvg, { class: 'w-5' })
    } else if (subType === FILE_SUB_TYPE_VALUE.folderFile) {
      return () => h(FolderFileSvg, { class: 'w-5' })
    }
  }
  return ops[type]?.()
})
</script>

<style scoped></style>
