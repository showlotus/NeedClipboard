<template>
  <el-drawer
    v-model="value"
    direction="btt"
    size="100%"
    :modal="false"
    class="setting-drawer !h-auto top-0 bottom-10 shadow-none !bg-[--nc-bg-color]"
    :z-index="1000"
    append-to-body
  >
    <el-form
      label-position="right"
      label-width="auto"
      :model="setting"
      style="max-width: 600px"
    >
      <el-form-item label="Theme">
        <el-radio-group v-model="setting.theme">
          <el-radio value="system" size="large">System</el-radio>
          <el-radio value="light" size="large">Light</el-radio>
          <el-radio value="dark" size="large">Dark</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Activity zone">
        <el-input v-model="setting.region" />
      </el-form-item>
      <el-form-item label="Activity form">
        <el-input v-model="setting.type" />
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script lang="ts" setup>
import { useDarkTheme, useLightTheme, useSystemTheme } from '@/utils/theme'
import { nextTick, ref, watch } from 'vue'

type Theme = 'system' | 'light' | 'dark'

const value = defineModel<boolean>({ default: false })

const toggleLightTheme = () => {
  document.querySelector('html')?.classList.remove('dark')
  window.ipcRenderer.invoke('set-theme', 'light')
}
const toggleDarkTheme = () => {
  document.querySelector('html')?.classList.add('dark')
  window.ipcRenderer.invoke('set-theme', 'dark')
}

const setting = ref<{ theme: Theme; region: string; type: string }>({
  theme: 'system',
  region: '',
  type: ''
})

const ops = {
  system: useSystemTheme,
  light: useLightTheme,
  dark: useDarkTheme
}

window.ipcRenderer.on('update-theme', (_event, theme) => {
  setting.value.theme = theme
  console.log('update-theme', theme)
  ops[setting.value.theme]?.()
})

watch(
  () => setting.value.theme,
  (val) => {
    ops[val]?.()
  },
  { immediate: true }
)
</script>

<style>
.el-radio__input.is-checked .el-radio__inner::after {
  background-color: var(--nc-bg-color);
}
</style>
