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
      class="el-input__wrapper w-full justify-start hover:input-shadow focus:focus-input-shadow outline-none caret-transparent"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
      @keyup="onKeyup"
      @keydown.prevent
    >
      <CodeBlock :value="recordingKeys" :openHoverStyle="false" class="-ml-1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { EVENT_CODE } from '@/constants/aria'
import { useRecordKey } from '@/hooks/useRecordKey'

withDefaults(defineProps<{ id: string }>(), {
  id: 'shortcut'
})
const modelValue = defineModel<string>()
const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const inputVal = computed({
  get() {
    return modelValue.value
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

// prettier-ignore
const { recordingKeys, onKeyup, onKeydown, onFocus, onBlur } = useRecordKey(inputVal)
</script>
