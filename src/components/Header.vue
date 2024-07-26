<template>
  <div class="flex">
    <el-input></el-input>
    <el-select v-model="value" placeholder="Select" style="width: 240px">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('all')
const options = [
  {
    value: 'all',
    label: 'All Types'
  },
  {
    value: 'text',
    label: 'Text Only'
  },
  {
    value: 'image',
    label: 'Images Only'
  },
  {
    value: 'file',
    label: 'Files Only'
  },
  {
    value: 'link',
    label: 'Links Only'
  },
  {
    value: 'color',
    label: 'Colors Only'
  }
]
</script>

<style>
.el-popper__arrow {
  display: none;
}
</style>
