<template>
  <div class="flex gap-4 drag">
    <div class="flex-1 w-0 flex">
      <custom-input
        v-model="keyword"
        autofocus
        :placeholder="$t('NC.inputPlaceholder')"
        class="no-drag min-w-80"
      />
    </div>
    <HotkeyTooltip placement="left" command="Ctrl P">
      <custom-select
        ref="customSelectRef"
        v-model="type"
        :options="typeOptions"
        placeholder="Select"
        class="w-40 no-drag"
      />
    </HotkeyTooltip>
  </div>
</template>

<script lang="ts" setup>
import hotkeys from 'hotkeys-js'
import { computed, ref, watch } from 'vue'

import { OptionType, useQueryTypeOptions } from '@/hooks/useTypeOptions'
import { SearchParams, useMainStore } from '@/stores/main'
import { ipcToggleVisible } from '@/utils/ipc'

const { typeOptions } = useQueryTypeOptions()
const keyword = ref<string>('')
const type = ref<OptionType>('All')
const mainStore = useMainStore()
watch([keyword, type], ([keywordVal, typeVal]) => {
  const params = { keyword: keywordVal, type: typeVal } as SearchParams
  mainStore.updateSearchParams(params)
})

const customSelectRef = ref()
const elSelectRef = computed(() => {
  return customSelectRef.value?.elSelectRef
})

watch(
  () => elSelectRef.value?.expanded,
  (newVal: boolean) => {
    if (!newVal) {
      hotkeys.trigger('/', 'home')
    }
  }
)

hotkeys.filter = () => true
hotkeys('esc', 'home', () => {
  if (keyword.value) {
    keyword.value = ''
  } else {
    ipcToggleVisible()
  }
})
hotkeys('ctrl+p', 'home', () => {
  elSelectRef.value?.focus()
  elSelectRef.value?.toggleMenu()
})

// 禁用 TAB 键的默认行为
hotkeys('tab', 'home', () => {
  return false
})
</script>

<style></style>
