<template>
  <div
    class="flex justify-between items-center gap-2 select-none z-[2000] bg-[--nc-bg-color]"
  >
    <HotkeyTooltip placement="right" command="Ctrl ,">
      <div
        class="py-1 px-1 flex items-center rounded hover:bg-[--nc-item-color-hover]"
        @click="handleToggleSettingPanel"
      >
        <LogoDarkSvg v-if="isDark" class="w-4 h-4" />
        <LogoLightSvg v-else class="w-4 h-4" />
        <div class="ml-2 pr-1 text-sm mt-0.5 font-mono">
          {{ appName }}
        </div>
        <span
          v-if="isBeta"
          class="px-0.5 border border-solid border-current rounded-sm text-[9.5px] text-[--nc-group-label-color] opacity-50"
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

import LogoDarkSvg from '@/assets/app-dark.svg'
import LogoLightSvg from '@/assets/app-light.svg'
import { HOTKEY } from '@/constants/hotkey'
import { fetchUpdate } from '@/database/api'
import { useMainStore } from '@/stores/main'
import {
  ipcCopyToClipboard,
  ipcOnUpdateActiveApp,
  ipcPastToActiveApp
} from '@/utils/ipc'

const isBeta = pkg.version.includes('beta')
const appName = pkg.name
const settingVisible = ref(false)
const handleToggleSettingPanel = () => {
  settingVisible.value = !settingVisible.value
}

const { t } = useI18n()
const mainStore = useMainStore()

// TODO 监听活动应用
const activeApp = ref('')
ipcOnUpdateActiveApp((event, app) => {
  console.log(app)
  activeApp.value = app
})

const isDark = computed(() => mainStore.setting.theme === 'dark')
const primaryAction = computed(() => mainStore.setting.primaryAction)
const triggerLabelList = computed(() => {
  if (primaryAction.value === 'clipboard') {
    return [t('NC.copyToClipboard'), t('NC.pasteToSomeApp', [activeApp.value])]
  } else {
    return [t('NC.pasteToSomeApp', [activeApp.value]), t('NC.copyToClipboard')]
  }
})

const handleTriggerEnter = () => {
  hotkeys.trigger(HOTKEY.home_enter, 'home')
}
const handleTriggerCtrlEnter = () => {
  hotkeys.trigger(HOTKEY.home_ctrl_enter, 'home')
}

const activeRecord = computed(() => mainStore.activeRecord)
const triggerCopyToClipboard = async () => {
  await fetchUpdate(activeRecord.value.id)
  ipcCopyToClipboard(JSON.parse(JSON.stringify(activeRecord.value)))
}
const triggerPastToActiveApp = async () => {
  await fetchUpdate(activeRecord.value.id)
  ipcPastToActiveApp(JSON.parse(JSON.stringify(activeRecord.value)))
}
const triggerEvents = {
  enter: () => {},
  ctrlEnter: () => {}
}
watch(
  primaryAction,
  (val) => {
    if (val === 'app') {
      triggerEvents.enter = triggerPastToActiveApp
      triggerEvents.ctrlEnter = triggerCopyToClipboard
    } else {
      triggerEvents.enter = triggerCopyToClipboard
      triggerEvents.ctrlEnter = triggerPastToActiveApp
    }
  },
  { immediate: true }
)

hotkeys(HOTKEY.home_enter, 'home', () => triggerEvents.enter())
hotkeys(HOTKEY.home_ctrl_enter, 'home', () => triggerEvents.ctrlEnter())
hotkeys(HOTKEY.home_setting, () => {
  handleToggleSettingPanel()
})

watch(
  settingVisible,
  (val) => {
    if (val) {
      hotkeys.setScope('all')
    } else {
      hotkeys.setScope('home')
      hotkeys.trigger(HOTKEY.home_focus, 'home')
    }
  },
  { immediate: true }
)
</script>
