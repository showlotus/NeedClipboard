<template>
  <el-scrollbar>
    <div class="flex">
      <pre class="text-xs py-3 pl-3 pr-3 font-[inherit]">{{ value }}</pre>
    </div>
  </el-scrollbar>
</template>

<script lang="ts" setup>
const value = defineModel<string>({ default: '' })
</script>

<style scoped></style>
