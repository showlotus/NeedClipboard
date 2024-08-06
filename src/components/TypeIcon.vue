<template>
  <div class="flex justify-center items-center w-5 h-5">
    <component :is="dynamicSvg" class="w-4 h-4" />
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
    return TextSvg
  } else if (props.type === 'Image') {
    return ImageSvg
  } else if (props.type === 'Link') {
    return LinkSvg
  } else if (props.type === 'File') {
    return FileSvg
  } else if (props.type === 'Folder') {
    return FolderSvg
  } else if (props.type === 'FolderFile') {
    return FolderFileSvg
  }
  return {}
})
</script>

<style scoped></style>
