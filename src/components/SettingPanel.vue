<template>
  <el-drawer
    v-model="modelValue"
    direction="ltr"
    size="30%"
    :modal="true"
    class="setting-drawer !h-auto top-0 !bottom-10 !bg-[--nc-bg-color] min-w-60"
    :z-index="1000"
    :show-close="false"
    :lock-scroll="false"
    append-to-body
  >
    <template #header> {{ $t('NC.setting') }} </template>
    <el-scrollbar class="h-full">
      <div class="h-full mt-[18px] flex gap-4 select-none">
        <el-form
          label-position="top"
          label-width="auto"
          class="flex-1 mx-5"
          style="max-width: 600px"
        >
          <el-form-item :label="$t('NC.primaryAction')">
            <custom-select
              v-model="primaryAction"
              :options="primaryActionOptions"
              class="w-full"
            />
          </el-form-item>
          <el-form-item :label="$t('NC.keepHistoryFor')">
            <custom-select
              v-model="keepDays"
              :options="keepDaysOptions"
              class="w-full"
            />
          </el-form-item>
          <el-form-item :label="$t('NC.language')">
            <custom-select
              v-model="language"
              :options="languageOptions"
              class="w-full"
            />
          </el-form-item>

          <el-form-item :label="$t('NC.themeMode')">
            <custom-select
              v-model="theme"
              :options="themeOptions"
              class="w-full"
            />
          </el-form-item>
          <el-form-item>
            <template #label>
              <label for="shortcut" class="block w-full h-full">{{
                $t('NC.activateHotkey')
              }}</label>
            </template>
            <Shortcut id="shortcut" v-model="shortcutKey" class="w-full" />
          </el-form-item>
          <el-form-item :label="$t('NC.startup')" label-position="left">
            <el-switch v-model="startup" />
          </el-form-item>
        </el-form>
      </div>
    </el-scrollbar>
  </el-drawer>
</template>

<script lang="ts" setup>
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useSettingOptions } from '@/hooks/useSettingOptions'
import { useUpdateSetting } from '@/hooks/useUpdateSetting'
import { useDarkTheme, useLightTheme, useSystemTheme } from '@/utils/ipc/theme'

const modelValue = defineModel<boolean>({ default: false })
// prettier-ignore
const {
  primaryAction,
  keepDays,
  language,
  theme,
  shortcutKey,
  startup
} = useUpdateSetting()

// prettier-ignore
const {
  themeOptions,
  languageOptions,
  keepDaysOptions,
  primaryActionOptions
} = useSettingOptions()

const ops = {
  system: useSystemTheme,
  light: useLightTheme,
  dark: useDarkTheme
}

const { locale } = useI18n()
watch(theme, (val) => {
  ops[val]?.()
})
watch(language, (val) => {
  locale.value = val
})
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
