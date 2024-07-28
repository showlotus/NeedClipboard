<template>
  <div class="custom-input flex flex-col items-start overflow-hidden">
    <el-input v-model="model" v-bind="attrs" @blur="handleBlur" />
    <span class="custom-cursor text-base font-bold h-0">{{ model }}</span>
  </div>
</template>

<script lang="ts" setup>
import { useAttrs } from 'vue'

const model = defineModel<string>({ default: 'xxxxxx' })
const attrs = useAttrs()

// never blur
const handleBlur = (e: FocusEvent) => {
  // e.preventDefault()
  // ;(e.target as HTMLInputElement).focus()
  // return false
}
</script>

<style scoped>
.custom-input {
  :deep(.el-input__wrapper) {
    padding-left: 0;
    padding-right: 0;
    font-size: 16px;
    box-shadow: none;
  }

  :deep(.el-input__inner) {
    font-weight: bold;
  }
}
</style>
