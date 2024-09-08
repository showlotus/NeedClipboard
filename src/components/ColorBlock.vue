<template>
  <div
    class="relative rounded-full after:block after:absolute after:inset-[-1.8px] after:border-2 after:rounded-full after:border-[currentColor] after:opacity-50"
    :style="{ color: value, backgroundColor: value }"
  ></div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ value: string }>(), {
  value: 'transparent'
})
</script>

<style scoped></style>
