<template>
  <div class="flex justify-between items-center gap-2 select-none">
    <div>logo</div>

    <CodeBlock value="light" @click="toggleLightTheme" />
    <CodeBlock value="dark" @click="toggleDarkTheme" />

    <div class="flex-1 flex justify-end items-center gap-1">
      <CodeBlock
        label="Paste to Clipboard"
        value="Enter"
        @click="handlePastToClipboard"
      />
      <span class="text-[--nc-code-color] text-xs"> | </span>
      <CodeBlock
        label="Paste to Google Chrome"
        value="Ctrl,Enter"
        @click="handlePastToApp"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const toggleLightTheme = () => {
  document.querySelector('html')?.classList.remove('dark')
  window.ipcRenderer.invoke('set-theme', 'light')
}
const toggleDarkTheme = () => {
  document.querySelector('html')?.classList.add('dark')
  window.ipcRenderer.invoke('set-theme', 'dark')
}
toggleDarkTheme()

const handlePastToClipboard = () => {
  console.log('Past to Clipboard')
}
const handlePastToApp = () => {
  console.log('Past to App')
}
</script>

<style scoped></style>
