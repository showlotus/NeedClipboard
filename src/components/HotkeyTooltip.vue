<template>
  <el-tooltip :show-arrow="false" v-bind="$attrs" popper-class="p-0">
    <template #content>
      <CodeBlock :value="command" v-bind="$attrs" />
    </template>
    <slot />
  </el-tooltip>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ command: string }>(), {
  command: ''
})
</script>

<style scoped></style>
