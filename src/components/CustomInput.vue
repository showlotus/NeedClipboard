<template>
  <div class="custom-input flex flex-col items-start overflow-hidden">
    <el-input
      ref="elInputRef"
      v-model="model"
      v-bind="attrs"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown.space.prevent
    />
    <span class="custom-cursor text-base font-bold h-0">{{ model }}</span>
  </div>
</template>

<script lang="ts" setup>
import hotkeys from 'hotkeys-js'
import { ref, useAttrs } from 'vue'

const model = defineModel<string>({ default: '' })
const attrs = useAttrs()

const elInputRef = ref()
const isFocus = ref(false)

const handleFocus = () => {
  isFocus.value = true
}

const handleBlur = () => {
  isFocus.value = false
}

hotkeys('/', 'home', (e) => {
  if (!isFocus.value) {
    e?.preventDefault()
    const length = model.value.length
    elInputRef.value?.focus()
    elInputRef.value?.input.setSelectionRange(length, length)
  }
})
</script>

<style scoped lang="scss">
.custom-input {
  :deep(.el-input__wrapper) {
    padding-left: 0;
    padding-right: 0;
    font-size: 14px;
    box-shadow: none;
  }

  :deep(.el-input__inner) {
    /* font-weight: bold; */
  }
}
</style>
