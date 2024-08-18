<template>
  <div
    class="rounded-full border-[2px] border-[--nc-color-block-border-color] group-[.is-active]:border-[--nc-color-block-border-active-color]"
    :style="{ color: value, backgroundColor: value }"
  ></div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ value: string }>(), {
  value: 'transparent'
})
</script>

<style scoped></style>
