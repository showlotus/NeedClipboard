<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import HelloWorld from './components/HelloWorld.vue'
import DataBase from './components/DataBase.vue'
import { computed, getCurrentInstance, onMounted } from 'vue'

const { t } = useI18n()

const msg = computed(() => t('hello'))

const instance = getCurrentInstance()
const updateLocaleLanguage = (language: 'zh_CN' | 'en_US') => {
  instance!.proxy!.$i18n.locale = language
}
// 监听切换语言
window.ipcRenderer.on('change-language', (_event, language) => {
  console.log('change language ->', language)
  updateLocaleLanguage(language)
})
// 首次渲染，获取当前语言
window.ipcRenderer.invoke('get-language').then((language) => {
  console.log('curr language is', language)
  updateLocaleLanguage(language)
})

window.ipcRenderer.on('clipboard-change', (_event, ...args) => {
  console.log(...args)
})

window.ipcRenderer.on('render', () => {
  // TODO 打开窗口时，更新视图
  console.log('app render')
})

const handleSaveStore = () => {
  window.ipcRenderer.invoke('save-store', 'aaa')
}

const handleSaveRecord = () => {
  window.ipcRenderer.invoke('save-record', 'aaa')
}

const toggleLanguage = (language: 'zh_CN' | 'en_US') => {
  window.ipcRenderer.invoke('set-language', language)
}
const toggleTheme = (theme: 'system' | 'light' | 'dark') => {
  window.ipcRenderer.invoke('set-theme', theme)
}
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
  <DataBase />
  <div class="content">
    <HelloWorld :msg="msg" />

    <button @click="handleSaveStore">Save Store</button>
    <button
      class="text-emerald-500 bg-red-200 dark:text-red-300 dark:bg-green-300"
      @click="handleSaveRecord"
    >
      Save Record
    </button>

    <button @click="toggleLanguage('zh_CN')">zh_CN</button>
    <button @click="toggleLanguage('en_US')">en_US</button>

    <hr />

    <button @click="toggleTheme('system')">system</button>
    <button @click="toggleTheme('light')">light</button>
    <button @click="toggleTheme('dark')">dark</button>
  </div>

  <h1 class="text-3xl font-bold underline">{{ t('hello') }}</h1>
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
</style>
