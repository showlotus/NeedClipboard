<template>
  <div class="flex flex-col border p-4 mt-4">
    先按所需的组合键，再按 Enter 键。
    <input
      class="border-cyan-300 border-2 p-2 text-center"
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
import { ref } from 'vue'

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
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
    return key.slice(5)
  } else if (key === 'Meta') {
    return 'Super'
  }
  return key.replace(/^[\s\S]/, (val) => val.toUpperCase())
}
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
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
  } else {
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
