<template>
  <div class="h-full w-full flex justify-center items-center">
    <img :src="value" alt="" class="h-full object-contain" />
  </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ value: string }>(), {
  value: ''
})
</script>

<style scoped></style>
