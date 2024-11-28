<template>
  <el-scrollbar>
    <div class="flex">
      <pre class="text-xs py-3 px-3 font-[inherit]">{{ value.trim() }}</pre>
    </div>
  </el-scrollbar>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ value: string }>(), {
  value: ''
})
</script>

<style scoped></style>
