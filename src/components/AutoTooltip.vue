<template>
  <el-tooltip
    :visible="visible"
    :content="value"
    :effect="theme"
    :show-arrow="false"
    placement="top"
  >
    <div
      ref="wrapEl"
      class="text-[--el-color-primary] text-xs flex-1 text-right text-ellipsis overflow-hidden"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <span v-if="!ellipsisText">{{ value }}</span>
      {{ ellipsisText }}
    </div>
  </el-tooltip>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'

import { useMainStore } from '@/stores/main'
import { ipcGetTheme } from '@/utils/ipc/theme'

withDefaults(defineProps<{ value: string }>(), {
  value: ''
})

const mainStore = useMainStore()
const theme = ref('dark')
watch(
  () => mainStore.setting?.theme,
  async () => {
    theme.value = await ipcGetTheme()
  }
)

const visible = ref(false)
const wrapEl = ref<HTMLDivElement>()
const isOverflow = ref(false)
const checkIsOverflow = () => {
  const el = wrapEl.value!
  let range: any = document.createRange()
  range.setStart(el, 0)
  range.setEnd(el, el.childNodes.length)
  const rangeWidth = range.getBoundingClientRect().width
  // 可接受的偏移范围内
  const inOffset = (o: number) => rangeWidth - el.offsetWidth > o
  isOverflow.value = rangeWidth > el.offsetWidth && inOffset(1)
  range = null
  return isOverflow.value
}

const ellipsisText = ref('')
const overrideSlot = () => {
  const el = wrapEl.value!
  const elWidth = el.getBoundingClientRect().width
  const fontSize = getComputedStyle(el).fontSize
  const textContent = el.textContent as string
  const span = document.createElement('span')
  span.style.visibility = 'hidden'
  span.style.fontSize = fontSize
  span.style.whiteSpace = 'nowrap'
  document.body.appendChild(span)
  let start = 0
  let end = textContent.length
  const linkSymbol = '...'
  while (start < end) {
    const mid = Math.floor((start + end) / 2)
    const text =
      textContent.slice(0, mid) + linkSymbol + textContent.slice(-mid)
    span.textContent = text
    if (span.getBoundingClientRect().width > elWidth) {
      end = mid
    } else {
      start = mid + 1
    }
  }
  ellipsisText.value =
    textContent.slice(0, start - 1) +
    linkSymbol +
    textContent.slice(-(start - 1))
  document.body.removeChild(span)
}

onMounted(() => {
  checkIsOverflow() && overrideSlot()
})

const handleMouseEnter = () => {
  if (isOverflow.value) {
    visible.value = true
  }
}

const handleMouseLeave = () => {
  visible.value = false
}
</script>
