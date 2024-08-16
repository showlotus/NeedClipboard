<template>
  <div class="pt-2 text-sm flex flex-col">
    <div class="py-2 px-3 text-xs font-bold text-[--nc-group-label-color]">
      Information
    </div>
    <el-scrollbar>
      <div class="flex-1 h-0 px-3">
        <div
          v-for="(item, i) in info"
          :key="i"
          class="h-7 flex justify-between items-center text-xs border-b border-[--nc-info-border-color] last:border-none"
        >
          <span class="font-bold text-[--nc-group-label-color]">{{
            item[0]
          }}</span>
          <span class="text-[--el-color-primary]">{{ item[1] }}</span>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const info = ref([
  ['Source', 'Code'],
  ['Type', 'Text'],
  ['Characters', '11'],
  ['Copied', 'Today, 19:55:30'],

  ['Source', 'Code'],
  ['Type', 'Text'],
  ['Characters', '11'],
  ['Copied', 'Today, 19:55:30']
])
</script>

<style scoped></style>
