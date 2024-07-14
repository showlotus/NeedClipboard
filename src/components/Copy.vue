<template>
  <div>
    <button class="bg-blue-500" @click="handleCopyFiles">Copy Files</button>
    <button class="bg-pink-500" @click="handleCopyImage">Copy Image</button>
  </div>
</template>

<script setup lang="ts">
const handleCopyFiles = () => {
  const files = [
    'C:\\Users\\showlotus\\Desktop\\WinCode\\t2',
    'C:\\Users\\showlotus\\Desktop\\WinCode\\t1.txt'
  ]
  window.ipcRenderer.invoke('update-clipboard-file', files)
}

const handleCopyImage = () => {
  const img = ''
  window.ipcRenderer.invoke('update-clipboard-image', img)
}
</script>
