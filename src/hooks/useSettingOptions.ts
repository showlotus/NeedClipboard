import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useSettingOptions() {
  const { t } = useI18n()
  const languageOptions = computed(() => [
    { label: t('NC.english'), value: 'en_US' },
    { label: t('NC.chinese'), value: 'zh_CN' }
  ])
  const themeOptions = computed(() => [
    { label: t('NC.system'), value: 'system' },
    { label: t('NC.light'), value: 'light' },
    { label: t('NC.dark'), value: 'dark' }
  ])
  const keepDaysOptions = computed(() => [
    {
      label: t('NC.sevenDays'),
      value: 7
    },
    {
      label: t('NC.thirtyDays'),
      value: 30
    },
    {
      label: t('NC.threeMonths'),
      value: 90
    },
    {
      label: t('NC.sixMonths'),
      value: 180
    },
    {
      label: t('NC.oneYear'),
      value: 360
    },
    {
      label: t('NC.unlimited'),
      value: 999
    }
  ])
  const primaryActionOptions = computed(() => [
    {
      label: t('NC.pasteToActiveApp'),
      value: 'app'
    },
    {
      label: t('NC.copyToClipboard'),
      value: 'clipboard'
    }
  ])

  return {
    languageOptions,
    themeOptions,
    keepDaysOptions,
    primaryActionOptions
  }
}
