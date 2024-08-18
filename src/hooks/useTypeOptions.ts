import { TYPE_VALUE } from '@/constants/aria'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export type ClipboardType = 'Text' | 'Image' | 'File' | 'Link' | 'Color'

export type OptionType = ClipboardType | 'All'

type TypeOptions = Array<{ label: string; value: OptionType }>

export function useQueryTypeOptions() {
  const { t } = useI18n()
  const typeOptions = computed<TypeOptions>(() => [
    {
      label: t('NC.typeAll'),
      value: TYPE_VALUE.all
    },
    {
      label: t('NC.typeText'),
      value: TYPE_VALUE.text
    },
    {
      label: t('NC.typeImage'),
      value: TYPE_VALUE.image
    },
    {
      label: t('NC.typeFile'),
      value: TYPE_VALUE.file
    },
    {
      label: t('NC.typeLink'),
      value: TYPE_VALUE.link
    },
    {
      label: t('NC.typeColor'),
      value: TYPE_VALUE.color
    }
  ])

  return {
    typeOptions
  }
}
