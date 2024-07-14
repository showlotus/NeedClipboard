<template>
  <div><button class="bg-blue-500" @click="handleCopy">Copy</button></div>
</template>

<script setup lang="ts">
const files = [
  'C:\\Users\\showlotus\\Desktop\\WinCode\\t2',
  'C:\\Users\\showlotus\\Desktop\\WinCode\\t1.txt'
]

const handleCopy = () => {
  const dataTransfer = new DataTransfer()
  window.ipcRenderer.invoke('update-clipboard', files)
}
</script>
