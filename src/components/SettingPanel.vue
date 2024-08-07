<template>
  <el-drawer
    v-model="value"
    direction="btt"
    size="100%"
    :modal="false"
    class="setting-drawer !h-auto top-0 bottom-10 shadow-none !bg-[--nc-bg-color]"
    :z-index="1000"
    append-to-body
    :lock-scroll="false"
  >
    <el-form
      label-position="right"
      label-width="auto"
      :model="setting"
      style="max-width: 600px"
    >
      <el-form-item label="Open At Login">
        <el-switch v-model="setting.openAtLogin" />
      </el-form-item>
      <el-form-item label="Keep History For">
        <custom-select
          v-model="setting.keepDays"
          :options="keepDaysOptions"
          class="w-40"
        />
      </el-form-item>
      <el-form-item label="Theme">
        <el-radio-group v-model="setting.theme">
          <el-radio value="system">System</el-radio>
          <el-radio value="light">Light</el-radio>
          <el-radio value="dark">Dark</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Language">
        <el-radio-group v-model="setting.language">
          <el-radio value="en_US">English</el-radio>
          <el-radio value="zh_CN">Chinese</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Shortcut Key">
        <Shortcut />
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script lang="ts" setup>
import { useDarkTheme, useLightTheme, useSystemTheme } from '@/utils/theme'
import { nextTick, ref, watch } from 'vue'

type Theme = 'system' | 'light' | 'dark'

interface Setting {
  theme: Theme
  language: string
  openAtLogin: boolean
  shortcutKey: string
  keepDays: number
}

const value = defineModel<boolean>({ default: false })

const setting = ref<Setting>({
  theme: 'system',
  language: 'en_US',
  openAtLogin: false,
  shortcutKey: 'Alt+C',
  keepDays: 7
})

const ops = {
  system: useSystemTheme,
  light: useLightTheme,
  dark: useDarkTheme
}

window.ipcRenderer.on('update-theme', (_event, theme) => {
  // setting.value.theme = theme
  // console.log('update-theme', theme)
  // ops[setting.value.theme]?.()
})

watch(
  () => setting.value.theme,
  (val) => {
    ops[val]?.()
  },
  { immediate: true }
)

const keepDaysOptions = ref([
  {
    label: '7 Days',
    value: 7
  },
  {
    label: '30 Days',
    value: 30
  },
  {
    label: '3 Months',
    value: 90
  },
  {
    label: '6 Months',
    value: 180
  },
  {
    label: '1 Year',
    value: 360
  },
  {
    label: 'Unlimited',
    value: Infinity
  }
])
</script>

<style>
.el-drawer__header {
  margin-bottom: 0;
}

.el-radio__input.is-checked .el-radio__inner::after {
  background-color: var(--nc-bg-color);
}

.el-form-item__label-wrap {
  display: flex;
  align-items: center;
}
</style>
