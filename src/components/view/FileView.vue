<template>
  <el-scrollbar view-class="h-full">
    <div
      v-if="isFile"
      class="h-full flex flex-col justify-center items-center gap-3"
    >
      <FileSvg class="h-4/5" />
    </div>
    <div
      v-else-if="isFolder"
      class="h-full flex flex-col justify-center items-center gap-3"
    >
      <FolderSvg />
    </div>
    <div v-else-if="isFolderFile" class="text-sm font-[inherit] px-3 py-3 pr-4">
      <div v-for="(f, i) in data.files" :key="i" class="flex gap-2 py-0.5">
        <div class="w-5 h-5 min-w-5 flex justify-center">
          <FileSvg v-if="checkPathIsFile(f)" class="w-4" />
          <FolderSvg v-else class="w-5" />
        </div>
        <span>
          {{ f }}
        </span>
      </div>
    </div>
  </el-scrollbar>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import FileSvg from '@/assets/icons/file.svg'
import FolderSvg from '@/assets/icons/folder.svg'
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

const checkPathIsFile = (path: string) => /\.[^.]+$/.test(path)
</script>

<style scoped></style>
