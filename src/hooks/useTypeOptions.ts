import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export type ClipboardType = 'text' | 'image' | 'file' | 'link' | 'color'

export type OptionType = ClipboardType | 'all'

type TypeOptions = Array<{ label: string; value: OptionType }>

export function useQueryTypeOptions() {
  const { t } = useI18n()
  const typeOptions = computed<TypeOptions>(() => [
    {
      label: t('NC.typeAll'),
      value: 'all'
    },
    {
      label: t('NC.typeText'),
      value: 'text'
    },
    {
      label: t('NC.typeImage'),
      value: 'image'
    },
    {
      label: t('NC.typeFile'),
      value: 'file'
    },
    {
      label: t('NC.typeLink'),
      value: 'link'
    },
    {
      label: t('NC.typeColor'),
      value: 'color'
    }
  ])

  return {
    typeOptions
  }
}
