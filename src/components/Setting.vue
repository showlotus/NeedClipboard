<template>
  <div class="flex items-center gap-2 select-none">
    <div>logo</div>

    <button class="bg-blue-300 p-0.5 rounded" @click="toggleLightTheme">
      light
    </button>
    <button class="bg-green-300 p-0.5 rounded" @click="toggleDarkTheme">
      dark
    </button>
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
// toggleDarkTheme()
</script>

<style scoped></style>
