<template>
  <el-drawer
    v-model="value"
    direction="ltr"
    size="30%"
    :modal="true"
    class="setting-drawer !h-auto top-0 !bottom-10 !bg-[--nc-bg-color] min-w-60"
    :z-index="1000"
    :show-close="false"
    :lock-scroll="false"
    :close-on-press-escape="false"
    append-to-body
  >
    <template #header> {{ t('NC.setting') }} </template>
    <el-scrollbar class="h-full">
      <div class="h-full mt-[18px] flex gap-4 select-none">
        <el-form
          label-position="top"
          label-width="auto"
          :model="setting"
          class="flex-1 mx-5"
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
          </el-form-item>

          <el-form-item :label="t('NC.themeMode')">
            <custom-select
              v-model="setting.theme"
              :options="themeOptions"
              class="w-full"
            />
          </el-form-item>
          <el-form-item>
            <template #label>
              <label for="shortcut" class="block w-full h-full">{{
                t('NC.activateHotkey')
              }}</label>
            </template>
            <Shortcut
              id="shortcut"
              v-model="setting.shortcutKey"
              class="w-full"
            />
          </el-form-item>
          <el-form-item :label="t('NC.startup')" label-position="left">
            <el-switch v-model="setting.startup" />
          </el-form-item>
        </el-form>
      </div>
    </el-scrollbar>
  </el-drawer>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useSettingOptions } from '@/hooks/useSettingOptions'
import { useMainStore } from '@/stores/main'
import { useDarkTheme, useLightTheme, useSystemTheme } from '@/utils/ipc'

const value = defineModel<boolean>({ default: false })
const mainStore = useMainStore()
const setting = computed(() => mainStore.setting)

// prettier-ignore
const { themeOptions, languageOptions, keepDaysOptions, primaryActionOptions } = useSettingOptions()

const ops = {
  system: useSystemTheme,
  light: useLightTheme,
  dark: useDarkTheme
}

window.ipcRenderer.on('update-theme', (_event, theme) => {
  // setting.value.theme = theme
  // console.log('update-theme', theme)
  // ops[setting.value.theme]?.() // BUG 死循环
})

watch(
  () => setting.value.theme,
  (val) => {
    ops[val]?.()
  },
  { immediate: true }
)

const { t, locale } = useI18n()
watch(
  () => setting.value.language,
  (val) => {
    locale.value = val
  },
  { immediate: true }
)
</script>

<style lang="scss">
.setting-drawer {
  .el-drawer__body {
    --el-drawer-padding-primary: 0;
    /* --el-drawer-padding-primary: 12; */
  }

  .el-drawer__header {
    color: var(--el-text-color-regular);
    margin-bottom: 0;
  }

  .el-radio__input.is-checked .el-radio__inner::after {
    background-color: var(--nc-bg-color);
  }

  .el-form-item--label-top .el-form-item__label {
    /* margin-bottom: 4px; */
    --el-form-label-font-size: 0.75rem;
    color: var(--nc-group-label-color);
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
