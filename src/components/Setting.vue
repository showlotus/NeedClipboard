<template>
  <div class="flex items-center gap-2 select-none">
    <div>logo</div>

    <span class="bg-blue-300 p-0.5 rounded" @click="toggleLightTheme">
      light
    </span>
    <span class="bg-green-300 p-0.5 rounded" @click="toggleDarkTheme">
      dark
    </span>

    <TextSvg width="40px" height="40px" />
    <Text2Svg width="40px" height="40px" />
    <FileSvg width="40px" height="40px" />
    <FolderListSvg width="40px" height="40px" />
    <FolderSvg width="40px" height="40px" />
    <ImgSvg width="40px" height="40px" />
    <LinkSvg width="40px" height="40px" />
  </div>
</template>

<script lang="ts" setup>
import TextSvg from '@/assets/icons/text.svg?component'
import Text2Svg from '@/assets/icons/text-1.svg'
import FileSvg from '@/assets/icons/file-1.svg'
import FolderListSvg from '@/assets/icons/folder-list.svg'
import FolderSvg from '@/assets/icons/folder.svg'
import ImgSvg from '@/assets/icons/img.svg'
import LinkSvg from '@/assets/icons/link.svg'

const toggleLightTheme = () => {
  document.querySelector('html')?.classList.remove('dark')
  window.ipcRenderer.invoke('set-theme', 'light')
}
const toggleDarkTheme = () => {
  document.querySelector('html')?.classList.add('dark')
  window.ipcRenderer.invoke('set-theme', 'dark')
}
toggleDarkTheme()
</script>

<style scoped></style>
