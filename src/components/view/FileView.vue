<template>
  <div class="h-full py-3 px-3">
    <div
      v-if="isFile"
      class="h-full flex flex-col justify-center items-center gap-3"
    >
      <div class="w-28 h-40 border border-blue-300"></div>
      <span>{{ data.content }}</span>
    </div>
    <div
      v-else-if="isFolder"
      class="h-full flex flex-col justify-center items-center gap-3"
    >
      <div class="w-28 h-40 border border-blue-300"></div>
      <span>{{ data.content }}</span>
    </div>
    <el-scrollbar v-else-if="isFolderFile" class="text-sm font-[inherit]">
      <div>
        <div v-for="(f, i) in data.files" :key="i" class="flex gap-2">
          <div class="w-5 h-5 min-w-5 border border-blue-100"></div>
          <span>
            {{ f }}
          </span>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { FILE_SUB_TYPE_VALUE } from '@/constants/aria'

const props = withDefaults(defineProps<{ data: any }>(), {
  data: {}
})

const isFile = computed(() => props.data.subType === FILE_SUB_TYPE_VALUE.file)
const isFolder = computed(
  () => props.data.subType === FILE_SUB_TYPE_VALUE.folder
)
const isFolderFile = computed(
  () => props.data.subType === FILE_SUB_TYPE_VALUE.folderFile
)
</script>

<style scoped></style>
