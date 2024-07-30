<template>
  <div class="custom-input flex flex-col items-start overflow-hidden">
    <el-input
      ref="elInputRef"
      v-model="model"
      v-bind="attrs"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <span class="custom-cursor text-base font-bold h-0">{{ model }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ref, useAttrs } from 'vue'
import hotkeys from 'hotkeys-js'
import { bindDocEvent } from '../utils/dom'
import { EVENT_CODE } from '../constants/aria'

const model = defineModel<string>({ default: '' })
const attrs = useAttrs()

const elInputRef = ref()
const isFocus = ref(false)

const handleFocus = () => {
  isFocus.value = true
  // bindDocEvent('keydown', (e: Event) => {
  //   if ([EVENT_CODE.up, EVENT_CODE.down].includes((e as KeyboardEvent).key)) {
  //     // e.preventDefault()
  //   }
  // })
  // hotkeys.unbind('/')
}

const handleBlur = () => {
  isFocus.value = false
  // hotkeys('/')
}

// bindDocEvent('keydown', (e: Event) => {
//   const key = (e as KeyboardEvent).key
//   if (key === '/' && !isFocus.value) {
//     elInputRef.value?.focus()
//     e.preventDefault()
//   }
// })

hotkeys('/', (e) => {
  if (!isFocus.value) {
    e.preventDefault()
    elInputRef.value?.focus()
  }
})
</script>

<style scoped lang="scss">
.custom-input {
  :deep(.el-input__wrapper) {
    padding-left: 0;
    padding-right: 0;
    font-size: 16px;
    box-shadow: none;
  }

  :deep(.el-input__inner) {
    /* font-weight: bold; */
  }
}
</style>
