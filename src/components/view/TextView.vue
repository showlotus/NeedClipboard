<template>
  <pre>{{ value }}</pre>
</template>

<script lang="ts" setup>
const value = defineModel<string>({ default: '' })
</script>

<style scoped></style>
