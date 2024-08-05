<template>
  <component :is="dynamicSvg" class="w-5 h-5" />
</template>

<script lang="ts" setup>
import TextSvg from '@/assets/icons/Text.svg?component'
import ImageSvg from '@/assets/icons/Image.svg?component'
import LinkSvg from '@/assets/icons/Link.svg?component'
import FileSvg from '@/assets/icons/File.svg?component'
import FolderListSvg from '@/assets/icons/Folder-List.svg?component'
import FolderSvg from '@/assets/icons/Folder.svg?component'
import { computed } from 'vue'

type Type = 'Text' | 'Image' | 'Link' | 'File' | 'FileList' | 'Folder'

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
  } else if (props.type === 'FileList') {
    return FolderListSvg
  } else if (props.type === 'Folder') {
    return FolderSvg
  }
  return {}
})
</script>

<style scoped></style>
