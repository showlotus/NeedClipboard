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
      :options="options"
      placeholder="Select"
      class="w-40 no-drag"
    />
  </div>
</template>

<script lang="ts" setup>
import hotkeys from 'hotkeys-js'
import { ref, watch, computed } from 'vue'

const keyword = ref('')

const value = ref('all')
const options = [
  {
    value: 'all',
    label: 'All Types'
  },
  {
    value: 'text',
    label: 'Text Only'
  },
  {
    value: 'image',
    label: 'Images Only'
  },
  {
    value: 'file',
    label: 'Files Only'
  },
  {
    value: 'link',
    label: 'Links Only'
  },
  {
    value: 'color',
    label: 'Colors Only'
  }
]

const options_zh = [
  {
    value: 'all',
    label: '所有类型'
  },
  {
    value: 'text',
    label: '仅文本'
  },
  {
    value: 'image',
    label: '仅图片'
  },
  {
    value: 'file',
    label: '仅文件'
  },
  {
    value: 'link',
    label: '仅链接'
  },
  {
    value: 'color',
    label: '仅颜色'
  }
]

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
  console.log(elSelectRef)
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
