<template>
  <div
    class="py-1 px-1 flex gap-2 items-center text-xs rounded text-[--nc-code-color] font-bold"
    :class="{
      'group hover:bg-[--nc-item-color-hover]': openHoverStyle
    }"
  >
    <span v-if="label" class="pl-1">{{ label }}</span>
    <div class="flex flex-wrap gap-1">
      <span
        v-for="(t, i) in keys"
        :key="i"
        class="py-1 px-1.5 rounded bg-[--nc-code-bg-color] group-hover:bg-[--nc-code-bg-active-color]"
        >{{ t }}</span
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  label?: string
  value?: string
  separator?: string
  openHoverStyle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  value: '',
  separator: ' ',
  openHoverStyle: true
})

const keys = computed(() => props.value.trim().split(props.separator))
</script>

<style scoped></style>
