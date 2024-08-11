<template>
  <div class="flex flex-col">
    <el-input v-model="model" class="w-full" />
    <!-- 先按所需的组合键，再按 Enter 键。 -->
    <input
      class="text-center h-0"
      type="text"
      @focus="handleFocus"
      @keydown="handleKeydown"
      @keyup="handleKeyup"
      @blur="handleBlur"
    />
    {{ result }}
  </div>
</template>

<script setup lang="ts">
import { EVENT_CODE } from '@/constants/aria'
import { ref } from 'vue'

const model = defineModel<string>({ default: '' })

const keys = new Set<string>()
const keydownKeys = new Set<string>()
const result = ref('')

const handleFocus = () => {
  // TODO 失效当前全局快捷键
  console.log('focus')
  window.ipcRenderer.invoke('unregister-all-shortcut')
}
const handleBlur = () => {
  console.log('blur')
  // TODO 重新注册全局快捷键
  window.ipcRenderer.invoke('register-all-shortcut')
}
const formatKey = (key: string) => {
  if (
    [
      EVENT_CODE.left,
      EVENT_CODE.up,
      EVENT_CODE.right,
      EVENT_CODE.down
    ].includes(key)
  ) {
    return key.slice(5)
  } else if (key === EVENT_CODE.meta) {
    return EVENT_CODE.super
  }
  return key.replace(/^[\s\S]/, (val) => val.toUpperCase())
}
const handleKeydown = (e: KeyboardEvent) => {
  const uselessKeys = [EVENT_CODE.esc]
  if (e.key === EVENT_CODE.enter) {
    // TODO 重新设置当前全局快捷键
    // 首先判断是否冲突，若冲突则提示，否则提示修改成功
    const value = Array.from(keys.values())
    window.ipcRenderer.invoke('update-shortcut', value).then((res) => {
      console.log('修改快捷键是否成功', res)
      if (res) {
        console.log('Enter', value)
        const target = e.target as HTMLInputElement
        target.value = ''
        target.blur()
      } else {
        alert('快捷键冲突：' + value)
      }
    })
  } else if (!uselessKeys.includes(e.key)) {
    // 重新录制，清空上次录制的键
    if (keydownKeys.size === 0) {
      keys.clear()
    }

    console.log(e)

    const key = formatKey(e.key)
    keys.add(key)
    keydownKeys.add(key)
    console.log('keydown', key)
    updateValue(e.target as HTMLInputElement)
  }
  e.preventDefault()
  return false
}
const handleKeyup = (e: KeyboardEvent) => {
  const key = formatKey(e.key)
  if (keydownKeys.has(key)) {
    keydownKeys.delete(key)
  }
}
const updateValue = (input: HTMLInputElement) => {
  input.value = Array.from(keys.values())
    .map((v) => formatKey(v))
    .join(' + ')
}
</script>
