<template>
  <div class="py-3 px-3">{{ data?.files?.join(',\n') || data.path }}</div>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{ data: any }>(), {
  data: {}
})
</script>

<style scoped></style>
