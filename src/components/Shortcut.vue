<template>
  <div class="w-full">
    <input
      :id="id"
      type="text"
      class="w-0 h-0"
      @focus="(e) => e.target.nextSibling.focus()"
    />
    <div
      ref="contentRef"
      contenteditable="plaintext-only"
      class="el-input__wrapper w-full justify-start hover:input-shadow focus:focus-input-shadow outline-none caret-[--el-color-primary]"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
      @keyup="onKeyup"
      @keydown.prevent
    >
      <CodeBlock
        :value="recordingKeys"
        :open-hover-style="false"
        class="-ml-1"
      />
      <span class="w-0.5">{{ ' ' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useRecordKey } from '@/hooks/useRecordKey'

withDefaults(defineProps<{ id: string }>(), {
  id: 'shortcut'
})
const modelValue = defineModel<string>()
const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const inputVal = computed<string>({
  get() {
    return modelValue.value!
  },
  set(val: string) {
    emit('update:modelValue', val)
  }
})

// prettier-ignore
const { recordingKeys, onKeyup, onKeydown, onFocus, onBlur } = useRecordKey(inputVal)
</script>
