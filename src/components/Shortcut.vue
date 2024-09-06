<template>
  <div class="w-full">
    <input :id="id" type="text" class="w-0 h-0" @focus="handleInputFocus" />
    <div
      ref="contentRef"
      contenteditable="plaintext-only"
      class="el-input__wrapper w-full justify-start hover:input-shadow focus:focus-input-shadow outline-none caret-[--el-color-primary]"
      @focus="onFocus"
      @blur="onBlur"
      @keydown.prevent="onKeydown"
      @keyup="onKeyup"
      @input="onInput"
    >
      <CodeBlock
        contenteditable="false"
        :value="recordingKeys"
        :open-hover-style="false"
        class="-ml-1 !text-[--el-text-color-regular] !font-normal"
      />
      <span ref="gapRef" class="w-0.5">{{ ' ' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

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

const handleInputFocus = (e: FocusEvent) => {
  const target = (e.target as HTMLInputElement).nextSibling! as HTMLDivElement
  const range = document.createRange()
  range.selectNodeContents(target)
  range.collapse(false)
  const selection = window.getSelection()!
  selection.removeAllRanges()
  selection.addRange(range)
}

const gapRef = ref()
const onInput = () => {
  gapRef.value.textContent = ' '
}
</script>
