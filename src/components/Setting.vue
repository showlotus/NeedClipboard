<template>
  <div>
    Setting

    <button class="bg-blue-500 p-2 rounded" @click="toggleLightTheme">
      light
    </button>
    <button class="bg-green-500 p-2 rounded" @click="toggleDarkTheme">
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
</script>

<style scoped></style>
