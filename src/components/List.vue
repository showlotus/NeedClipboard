<template>
  <el-scrollbar v-infinite-scroll="loadMore" class="overflow-y-auto pb-0">
    <div v-for="group in list" :key="group.label">
      <div class="mt-4 ml-4 mb-2 text-xs">{{ group.label }}</div>
      <div
        v-for="item in group.data"
        :key="item.id"
        :data-id="item.id"
        class="ml-2 mr-2 pl-2 pr-2 h-10 leading-10 rounded-md text-ellipsis overflow-hidden whitespace-nowrap select-none"
        :class="{
          'bg-[--nc-item-color-active]': activeId === item.id,
          'bg-[--nc-item-color-hover]':
            activeId !== item.id && previewId === item.id,
          'hover:bg-[--nc-item-color-hover]': activeId !== item.id
        }"
        @click="handleClick(item.id)"
      >
        {{ item.desc }}
      </div>
    </div>
    <div class="mb-2"></div>
  </el-scrollbar>
</template>

<script lang="ts" setup>
import { getCurrentInstance, ref } from 'vue'
import hotkeys from 'hotkeys-js'
import dayjs from 'dayjs'

const activeId = ref()
const previewId = ref()
let id = 1

// const

const genMockData = (n: number, createDate = new Date()) => {
  return new Array(n).fill(0).map((v, i) => {
    return {
      id: ++id,
      desc: `${i}`.repeat(i + 1),
      createDate
    }
  })
}

/**
 * Today            今天
 * Yesterday        昨天
 * This Week        本周
 * Last Week        上周
 * This Month       本月
 * Last Month       上个月
 * This Year        本年
 * Last Year        去年
 * Long Ago         很久以前
 */

console.log('today', dayjs().format('YYYY/MM/DD HH:mm:ss'))
console.log('yesterday', dayjs().set('day', 0).format('YYYY/MM/DD HH:mm:ss'))
console.log('this week', dayjs().set('day', -1).format('YYYY/MM/DD HH:mm:ss'))
console.log('last week', dayjs().format('YYYY/MM/DD HH:mm:ss'))
console.log(
  'this month',
  dayjs().startOf('month').format('YYYY/MM/DD HH:mm:ss')
)
console.log('last month', dayjs('2024/06/01').format('YYYY/MM/DD HH:mm:ss'))
console.log('this year', dayjs('2024/05/01').format('YYYY/MM/DD HH:mm:ss'))
console.log('last year', dayjs('2023/07/29').format('YYYY/MM/DD HH:mm:ss'))
console.log('long ago', dayjs('2022/07/29').format('YYYY/MM/DD HH:mm:ss'))

const list = ref([
  {
    // label: 'Today',
    label: '今天',
    data: genMockData(10)
  },
  {
    // label: 'Yesterday',
    label: '昨天',
    data: genMockData(4)
  }
])
const handleClick = (id: number) => {
  activeId.value = id
  previewId.value = id
}
const handleMouseenter = (id: number) => {
  previewId.value = id
}

const loadMore = () => {
  console.log('loadMore')
}

const instance = getCurrentInstance()
const getCurrItemEl = () => {
  return instance?.proxy?.$el.querySelector(
    `div[data-id="${previewId.value}"]`
  ) as HTMLElement
}
hotkeys('up', (e) => {
  previewId.value--
  getCurrItemEl().scrollIntoView({ behavior: 'smooth', block: 'center' })
  e.preventDefault()
})
hotkeys('down', (e) => {
  previewId.value++
  getCurrItemEl().scrollIntoView({ behavior: 'smooth', block: 'center' })
  e.preventDefault()
})
hotkeys('enter', () => {})
</script>

<style scoped></style>
