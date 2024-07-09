<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'

window.ipcRenderer.on('clipboard-change', (_event, ...args) => {
  console.log(...args)
})
</script>

<template>
  <div
    class="drag-area"
    style="
      height: 100px;
      border-radius: 10px;
      border: 2px dashed orange;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 20px;
    "
  >
    可拖动区域
  </div>
  <div class="content">
    <HelloWorld msg="Electron + Vite + Vue" />
  </div>
</template>

<style>
.drag-area {
  -webkit-app-region: drag;
}

.content {
  -webkit-app-region: no-drag;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo.electron:hover {
  filter: drop-shadow(0 0 2em #9feaf9);
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
