<template>
  <el-scrollbar>
    <div class="flex">
      <pre class="text-sm py-3 px-3 font-[inherit]">{{ value }}</pre>
    </div>
  </el-scrollbar>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ value: string }>(), {
  value: ''
})
</script>

<style scoped></style>
