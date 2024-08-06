<template>
  <div class="flex justify-center items-center w-6 h-6">
    <component :is="dynamicSvg" />
  </div>
</template>

<script lang="ts" setup>
import { computed, h } from 'vue'
import TextSvg from '@/assets/icons/text.svg?component'
import ImageSvg from '@/assets/icons/image.svg?component'
import LinkSvg from '@/assets/icons/link.svg?component'
import FileSvg from '@/assets/icons/file.svg?component'
import FolderFileSvg from '@/assets/icons/folder-file.svg?component'
import FolderSvg from '@/assets/icons/folder.svg?component'

type Type = 'Text' | 'Image' | 'Link' | 'File' | 'Folder' | 'FolderFile'

interface Props {
  type: Type
}

const props = defineProps<Props>()

const dynamicSvg = computed(() => {
  if (props.type === 'Text') {
    return h(TextSvg, { class: 'w-[19px]' })
  } else if (props.type === 'Image') {
    return h(ImageSvg, { class: 'w-[19px]' })
  } else if (props.type === 'Link') {
    return h(LinkSvg, { class: 'w-[19px]' })
  } else if (props.type === 'File') {
    return h(FileSvg, { class: 'w-[17px]' })
  } else if (props.type === 'Folder') {
    return h(FolderSvg, { class: 'w-5' })
  } else if (props.type === 'FolderFile') {
    return h(FolderFileSvg, { class: 'w-5' })
  }
  return h('span')
})
</script>

<style scoped></style>
