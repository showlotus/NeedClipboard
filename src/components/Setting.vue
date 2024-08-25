<template>
  <div
    class="flex justify-between items-center gap-2 select-none z-[2000] bg-[--nc-bg-color]"
  >
    <HotkeyTooltip placement="right" command="Ctrl ," separator=" ">
      <div
        class="py-1 px-1 flex items-center gap-2 rounded hover:bg-[--nc-item-color-hover]"
        @click="handleToggleSettingPanel"
      >
        <LogoSvg class="w-4 h-4 text-[--el-text-color-regular]" />
        <span class="pr-1 text-sm">Need Clipboard</span>
      </div>
    </HotkeyTooltip>

    <div class="flex-1 flex justify-end items-center gap-1">
      <CodeBlock
        label="Copy to Clipboard"
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

    <SettingPanel v-model="settingVisible" />
  </div>
</template>

<script lang="ts" setup>
import hotkeys from 'hotkeys-js'
import { ref, watch } from 'vue'
import LogoSvg from '@/assets/icons/logo.svg'

const handlePastToClipboard = () => {
  hotkeys.trigger('enter', 'home')
}
const handlePastToApp = () => {
  hotkeys.trigger('ctrl+enter', 'home')
}

const settingVisible = ref(false)
const handleToggleSettingPanel = () => {
  settingVisible.value = !settingVisible.value
}

hotkeys('ctrl+,', () => {
  handleToggleSettingPanel()
})

watch(
  settingVisible,
  (val) => {
    if (val) {
      hotkeys.setScope('all')
    } else {
      hotkeys.setScope('home')
      hotkeys.trigger('/', 'home')
    }
  },
  { immediate: true }
)
</script>

<style scoped></style>
