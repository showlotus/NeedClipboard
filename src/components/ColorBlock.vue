<template>
  <div
    class="w-full h-full rounded-full shadow-color-block"
    :style="{ color, backgroundColor: color, borderColor: 'red' }"
  ></div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{ color?: string }>()
const color = computed(() => props.color)
</script>

<style scoped></style>
