<template>
  <div
    class="flex justify-between items-center gap-2 select-none z-[2000] bg-[--nc-bg-color]"
  >
    <HotkeyTooltip placement="right" command="Ctrl ,">
      <div
        class="py-1 px-1 flex items-center rounded hover:bg-[--nc-item-color-hover]"
        @click="handleToggleSettingPanel"
      >
        <LogoSvg class="w-4 h-4 text-[--el-text-color-regular]" />
        <div class="ml-2 pr-1 text-sm mt-0.5">
          {{ appName }}
        </div>
        <span
          v-if="isBeta"
          class="px-0.5 border border-solid border-current rounded-sm italic font-bold text-[9.5px] text-[--nc-group-label-color] opacity-50"
          >Beta
        </span>
      </div>
    </HotkeyTooltip>

    <transition name="el-fade-in-linear">
      <div
        v-show="!settingVisible"
        class="flex-1 flex justify-end items-center gap-1"
      >
        <CodeBlock
          :label="triggerLabelList[0]"
          value="Enter"
          @click="handleTriggerEnter"
        />
        <span class="text-[--nc-code-color] text-xs"> | </span>
        <CodeBlock
          :label="triggerLabelList[1]"
          value="Ctrl Enter"
          @click="handleTriggerCtrlEnter"
        />
      </div>
    </transition>

    <SettingPanel v-model="settingVisible" />
  </div>
</template>

<script lang="ts" setup>
import pkg from '$/package.json'
import hotkeys from 'hotkeys-js'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import LogoSvg from '@/assets/icons/logo.svg'
import { useMainStore } from '@/stores/main'
import { ipcGetActiveApp } from '@/utils/ipc'

const isBeta = pkg.version.includes('beta')
const appName = pkg.name
const settingVisible = ref(false)
const handleToggleSettingPanel = () => {
  settingVisible.value = !settingVisible.value
}

const { t } = useI18n()
const mainStore = useMainStore()

const ops = {
  clipboard() {},
  app() {}
}

// TODO 监听活动应用
const activeApp = ref('Google Chrome')
const triggerLabelList = computed(() => {
  if (mainStore.setting.primaryAction === 'clipboard') {
    return [t('NC.copyToClipboard'), t('NC.pasteToSomeApp', [activeApp.value])]
  } else {
    return [t('NC.pasteToSomeApp', [activeApp.value]), t('NC.copyToClipboard')]
  }
})

const triggerTips = computed(() => {
  const res = [{ label: '' }, { label: '' }]
})

const handleTriggerEnter = () => {
  hotkeys.trigger('enter', 'home')
}
const handleTriggerCtrlEnter = () => {
  hotkeys.trigger('ctrl+enter', 'home')
}

hotkeys('enter', 'home', () => {
  if (mainStore.setting.primaryAction === 'clipboard') {
    console.log('Copy to Clipboard' /* activeItem.value */)
  } else {
    console.log('Past to Action App' /* activeItem.value */)
  }
})
hotkeys('ctrl+enter', 'home', () => {
  if (mainStore.setting.primaryAction === 'app') {
    console.log('Copy to Clipboard' /* activeItem.value */)
  } else {
    console.log('Past to Action App' /* activeItem.value */)
  }
})

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
