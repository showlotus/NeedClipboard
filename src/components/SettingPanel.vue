<template>
  <el-drawer
    v-model="value"
    direction="ltr"
    size="30%"
    :modal="true"
    class="setting-drawer !h-auto top-0 !bottom-10 !bg-[--nc-bg-color] min-w-60"
    :z-index="1000"
    :with-header="false"
    append-to-body
    :lock-scroll="false"
  >
    <el-scrollbar class="h-full px-5">
      <div class="h-full mt-[18px] flex gap-4">
        <el-form
          label-position="top"
          label-width="auto"
          :model="setting"
          class="flex-1"
          style="max-width: 600px"
        >
          <el-form-item :label="t('NC.primaryAction')">
            <custom-select
              v-model="setting.primaryAction"
              :options="primaryActionOptions"
              class="w-full"
            />
          </el-form-item>
          <el-form-item :label="t('NC.keepHistoryFor')">
            <custom-select
              v-model="setting.keepDays"
              :options="keepDaysOptions"
              class="w-full"
            />
          </el-form-item>
          <el-form-item :label="t('NC.language')">
            <custom-select
              v-model="setting.language"
              :options="languageOptions"
              class="w-full"
            />
            <!-- <el-radio-group v-model="setting.language">
            <el-radio value="en_US">English</el-radio>
            <el-radio value="zh_CN">Chinese</el-radio>
          </el-radio-group> -->
          </el-form-item>

          <el-form-item :label="t('NC.themeMode')">
            <custom-select
              v-model="setting.theme"
              :options="themeOptions"
              class="w-full"
            />

            <!-- <el-radio-group v-model="setting.theme">
            <el-radio value="system">System</el-radio>
            <el-radio value="light">Light</el-radio>
            <el-radio value="dark">Dark</el-radio>
          </el-radio-group> -->
          </el-form-item>
          <el-form-item :label="t('NC.activateHotkey')">
            <!-- <Shortcut /> -->
            <el-input v-model="setting.shortcutKey" class="w-full" />
          </el-form-item>
          <el-form-item :label="t('NC.startup')" label-position="left">
            <el-switch v-model="setting.startup" />
          </el-form-item>
        </el-form>
        <!-- <div class="flex-1 border-red-500 border"></div> -->
      </div>
    </el-scrollbar>
  </el-drawer>
</template>

<script lang="ts" setup>
import { useSettingOptions } from '@/hooks/useSettingOptions'
import { useDarkTheme, useLightTheme, useSystemTheme } from '@/utils/theme'
import { getCurrentInstance, inject, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

type Theme = 'system' | 'light' | 'dark'

interface Setting {
  primaryAction: 'clipboard' | 'app'
  theme: Theme
  language: string
  startup: boolean
  shortcutKey: string
  keepDays: number
}

const value = defineModel<boolean>({ default: false })

const setting = ref<Setting>({
  primaryAction: 'clipboard',
  theme: 'dark',
  language: 'en_US',
  startup: false,
  shortcutKey: 'Alt+C',
  keepDays: 7
})

const { themeOptions, languageOptions, keepDaysOptions, primaryActionOptions } =
  useSettingOptions()

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

const updateLanguage = inject<(val: string) => void>('updateLanguage')!
watch(
  () => setting.value.language,
  (val) => {
    updateLanguage(val)
  },
  { immediate: true }
)

console.log(t('NC.pasteToSomeApp', ['Code']))
</script>

<style lang="scss">
.setting-drawer {
  .el-drawer__body {
    padding: 0;
    --el-drawer-padding-primary: 0;
    /* --el-drawer-padding-primary: 12; */
  }

  .el-drawer__header {
    margin-bottom: 0;
  }

  .el-radio__input.is-checked .el-radio__inner::after {
    background-color: var(--nc-bg-color);
  }

  .el-form-item--label-top .el-form-item__label {
    /* margin-bottom: 4px; */
    /* --el-form-label-font-size: 12px; */
  }

  .el-form-item__content {
    justify-content: flex-end;
  }

  .el-form-item__label-wrap {
    display: flex;
    align-items: center;
  }
}
</style>
