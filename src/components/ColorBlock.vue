<template>
  <div
    class="rounded-full border-[2px] border-[--nc-color-block-border-color] group-[.is-active]:border-[--nc-color-block-border-active-color]"
    :style="{ color, backgroundColor: color }"
  ></div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{ color?: string }>()
const color = computed(() => props.color)
</script>

<style scoped></style>
