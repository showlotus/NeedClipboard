<template>
  <div class="flex justify-center items-center w-6 h-6">
    <component :is="dynamicSvg" />
  </div>
</template>

<script lang="ts" setup>
import { computed, h, useAttrs } from 'vue'
import TextSvg from '@/assets/icons/text.svg?component'
import ImageSvg from '@/assets/icons/image.svg?component'
import LinkSvg from '@/assets/icons/link.svg?component'
import FileSvg from '@/assets/icons/file.svg?component'
import FolderFileSvg from '@/assets/icons/folder-file.svg?component'
import FolderSvg from '@/assets/icons/folder.svg?component'
import ColorBlock from './ColorBlock.vue'

type ClipboardType =
  | 'Color'
  | 'Text'
  | 'Image'
  | 'Link'
  | 'File'
  | 'Folder'
  | 'FolderFile'

interface Props {
  type: ClipboardType
  color?: string
}

const props = defineProps<Props>()
const ops = {
  Color: () => h(ColorBlock, { class: 'w-4 h-4', color: props.color }),
  Text: () => h(TextSvg, { class: 'w-5' }),
  Image: () => h(ImageSvg, { class: 'w-[22px]' }),
  Link: () => h(LinkSvg, { class: 'w-5' }),
  File: () => h(FileSvg, { class: 'h-[18px]' }),
  Folder: () => h(FolderSvg, { class: 'w-5' }),
  FolderFile: () => h(FolderFileSvg, { class: 'w-5' })
}

const dynamicSvg = computed(() => {
  return ops[props.type]?.()
})
</script>

<style scoped></style>
