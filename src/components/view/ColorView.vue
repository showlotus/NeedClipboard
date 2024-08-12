<template>
  <div class="h-full flex flex-col gap-3 justify-center items-center text-base">
    <div
      class="w-20 h-20 rounded-full relative after:block after:absolute after:inset-[-4px] after:border-4 after:rounded-full after:border-[currentColor] after:opacity-50"
      :style="{
        color,
        backgroundColor: color
      }"
    ></div>
    <span>{{ color }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const color = ref('#0073c7')
</script>

<style scoped></style>
