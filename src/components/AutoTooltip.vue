<template>
  <div @mouseenter="handleMouseEnter">
    <span v-if="!ellipsisText">{{ value }}</span>
    {{ ellipsisText }}
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, onMounted, onUpdated, ref } from 'vue'

const props = withDefaults(defineProps<{ value: string }>(), {
  value: ''
})

const instance = getCurrentInstance()
const isOverflow = ref(false)
const checkIsOverflow = () => {
  const el = instance?.proxy!.$el
  let range: any = document.createRange()
  range.setStart(el, 0)
  range.setEnd(el, el.childNodes.length)
  const rangeWidth = range.getBoundingClientRect().width
  console.log(rangeWidth, el.offsetWidth)
  // 可接受的偏移范围内
  const inOffset = (o: number) => rangeWidth - el.offsetWidth > o
  isOverflow.value = rangeWidth > el.offsetWidth && inOffset(1)
  range = null
  return isOverflow.value
}

const ellipsisText = ref('')
const overrideSlot = () => {
  const el = instance?.proxy!.$el
  const elWidth = el.getBoundingClientRect().width
  const textContent = el.textContent as string
  const span = document.createElement('span')
  span.style.visibility = 'hidden'
  span.style.whiteSpace = 'nowrap'
  document.body.appendChild(span)
  let start = 0
  let end = textContent.length
  while (start < end) {
    const mid = Math.floor((start + end) / 2)
    const text = textContent.slice(0, mid) + '...' + textContent.slice(-mid)
    span.textContent = text
    if (span.getBoundingClientRect().width > elWidth) {
      end = mid
    } else {
      start = mid + 1
    }
  }
  console.log(span)
  console.log(span.getBoundingClientRect().width)
  ellipsisText.value =
    textContent.slice(0, start - 1) + '...' + textContent.slice(-(start - 1))
  console.log(el.innerText)
  document.body.removeChild(span)
}

onMounted(() => {
  checkIsOverflow() && overrideSlot()
})

onUpdated(() => {
  checkIsOverflow() && overrideSlot()
})

const handleMouseEnter = (e: MouseEvent) => {
  if (!isOverflow.value) {
    return
  }
}
</script>
