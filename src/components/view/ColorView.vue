<template>
  <div class="h-full flex flex-col gap-3 justify-center items-center text-base">
    <div
      class="w-20 h-20 rounded-full relative after:block after:absolute after:inset-[-3px] after:border-4 after:rounded-full after:border-[currentColor] after:opacity-50"
      :style="{
        color: value,
        backgroundColor: value
      }"
    ></div>
    <span class="text-xs">{{ value }}</span>
  </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ value: string }>(), {
  value: 'transparent'
})
</script>

<style scoped></style>
