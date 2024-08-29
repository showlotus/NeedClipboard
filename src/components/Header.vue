<template>
  <div class="flex gap-4 drag">
    <div class="flex-1 w-0 flex">
      <custom-input
        v-model="keyword"
        autofocus
        placeholder="please input something..."
        class="no-drag min-w-80"
      />
    </div>
    <HotkeyTooltip placement="left" command="Ctrl,P">
      <custom-select
        ref="customSelectRef"
        v-model="value"
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

import { useQueryTypeOptions } from '@/hooks/useTypeOptions'
import { SearchParams, useMainStore } from '@/stores/main'

const { typeOptions } = useQueryTypeOptions()
const keyword = ref('')
const value = ref('All')
const mainStore = useMainStore()
watch([keyword, value], (val) => {
  const params = { keyword: val[0], type: val[1] } as SearchParams
  mainStore.updateSearchParams(params)
})

const customSelectRef = ref()
const elSelectRef = computed(() => {
  return customSelectRef.value?.elSelectRef
})

watch(
  () => elSelectRef.value?.expanded,
  (newVal) => {
    if (!newVal) {
      hotkeys.trigger('/', 'home')
    }
  }
)

hotkeys.filter = () => true
hotkeys('ctrl+p', 'home', () => {
  elSelectRef.value?.focus()
  elSelectRef.value?.toggleMenu()
})

// 禁用 tab 的默认行为
hotkeys('tab', 'home', (e) => {
  return false
})
</script>

<style></style>
