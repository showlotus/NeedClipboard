<template>
  <div>
    <el-input v-model="model" v-bind="attrs" class="custom-input" />
    <span>{{ model }}</span>
  </div>
</template>

<script lang="ts" setup>
import { useAttrs } from 'vue'

const model = defineModel({ default: '' })
const attrs = useAttrs()
</script>

<style scoped>
.custom-input {
}
</style>
