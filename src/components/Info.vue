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
          <span class="font-bold text-[--nc-group-label-color] min-w-40">{{
            item[0]
          }}</span>
          <span class="text-[--el-color-primary] text-sm">{{ item[1] }}</span>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useMainStore } from '@/stores/main'
import { TYPE_VALUE } from '@/constants/aria'

const mainStore = useMainStore()
const activeRecord = computed(() => mainStore.activeRecord)
const info = ref<Array<any[]>>([])
const formatText = () => {
  return { characters: 'Characters' }
}
const foramtImage = () => {
  return { dimensions: 'Dimensions', size: 'Size' }
}
const formatLink = () => {
  return { characters: 'Characters' }
}
const formatFile = () => {
  return { path: 'Path', size: 'Size' }
}
const formatColor = () => {
  return []
}
const ops = {
  [TYPE_VALUE.text]: formatText,
  [TYPE_VALUE.image]: foramtImage,
  [TYPE_VALUE.link]: formatLink,
  [TYPE_VALUE.color]: formatColor,
  [TYPE_VALUE.file]: formatFile
}
const formatInfo = (data: any) => {
  const res = [] as any
  res.push(['Source', data.application])
  res.push(['Content Type', data.type])
  const fields = ops[data.type]() as Record<string, string>
  Object.keys(fields).forEach((key) => {
    res.push([fields[key], data[key]])
  })
  res.push(['Copied', data.createTime])
  console.log(fields)
  return res
}
watch(activeRecord, (val) => {
  console.log('watch', val)
  info.value = formatInfo(val)
})

// const info = ref([
//   ['Source', 'Code'],
//   ['Type', 'Text'],
//   ['Characters', '11'],
//   ['Copied', 'Today, 19:55:30'],

//   ['Source', 'Code'],
//   ['Type', 'Text'],
//   ['Characters', '11'],
//   ['Copied', 'Today, 19:55:30']
// ])
</script>

<style scoped></style>
