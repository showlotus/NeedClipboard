<template>
  <component :is="dynamicSvg" class="w-6 h-6 p-0.5" />
</template>

<script lang="ts" setup>
import TextSvg from '@/assets/icons/text.svg?component'
import ImageSvg from '@/assets/icons/image.svg?component'
import LinkSvg from '@/assets/icons/link.svg?component'
import FileSvg from '@/assets/icons/file.svg?component'
import FolderFileSvg from '@/assets/icons/folder-file.svg?component'
import FolderSvg from '@/assets/icons/folder.svg?component'
import { computed } from 'vue'

type Type = 'Text' | 'Image' | 'Link' | 'File' | 'FolderFile' | 'Folder'

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
  } else if (props.type === 'FolderFile') {
    return FolderFileSvg
  } else if (props.type === 'Folder') {
    return FolderSvg
  }
  return {}
})
</script>

<style scoped></style>
