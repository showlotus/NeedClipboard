<template>
  <div @mouseenter="handleMouseEnter"><slot /></div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, onActivated, onMounted, onUpdated, ref } from 'vue'

const instance = getCurrentInstance()
const isOverflow = ref(false)
const checkIsOverflow = () => {
  const el = instance?.proxy.$el
  let range = document.createRange()
  range.setStart(el, 0)
  range.setEnd(el, el.childNodes.length)
  const rangeWidth = range.getBoundingClientRect().width
  console.log(rangeWidth, el.offsetWidth)
  // 可接受的偏移范围内
  const inOffset = (o) => rangeWidth - el.offsetWidth > o
  isOverflow.value = rangeWidth > el.offsetWidth && inOffset(1)
  range = null
  return isOverflow.value
}

const overrideSlot = () => {
  const el = instance?.proxy.$el
  const textContent = el.textContent as string
  const mid = Math.floor(textContent.length / 2)
  el.textContent =
    textContent.slice(0, mid - 5) + '...' + textContent.slice(mid + 5)
  console.log(textContent)
}
onMounted(() => {
  checkIsOverflow() && overrideSlot()
})

onUpdated(() => {
  checkIsOverflow() && overrideSlot()
})

const handleMouseEnter = (e: MouseEvent) => {
  const el = e.target as HTMLElement
  let range = document.createRange()
  range.setStart(el, 0)
  range.setEnd(el, el.childNodes.length)
  const rangeWidth = range.getBoundingClientRect().width
  console.log(el.offsetWidth, rangeWidth)
  // 可接受的偏移范围内
  const inOffset = (o) => rangeWidth - el.offsetWidth > o
  range = null
}
</script>
