<template>
  <div
    class="group py-1 px-1 flex gap-2 items-center text-xs rounded hover:bg-[--nc-item-color-hover]"
  >
    <span v-if="label" class="pl-1">{{ label }}</span>
    <div class="flex gap-1">
      <span
        v-for="(t, i) in keys"
        :key="i"
        class="py-1 px-1.5 rounded bg-[--nc-code-bg-color] text-[--nc-code-color] group-hover:bg-[--nc-code-bg-active-color]"
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
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  value: ''
})

const keys = computed(() => props.value.split(','))

console.log(props)
</script>

<style scoped></style>
