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
    <custom-select
      ref="customSelectRef"
      v-model="value"
      :options="typeOptions"
      placeholder="Select"
      class="w-40 no-drag"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import hotkeys from 'hotkeys-js'
import { useQueryTypeOptions } from '@/hooks/useTypeOptions'

const { typeOptions } = useQueryTypeOptions()
const keyword = ref('')
const value = ref('all')
watch([keyword, value], (val) => {
  const params = { keyword: val[0], type: val[1] }
  console.log(params)
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
  e.preventDefault()
  return false
})
</script>

<style></style>
