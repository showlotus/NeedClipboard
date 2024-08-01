<template>
  <el-scrollbar v-infinite-scroll="loadMore" class="overflow-y-auto pb-0">
    <div v-for="group in list" :key="group.label">
      <div
        class="mt-4 ml-4 mb-2 text-xs font-bold text-[--nc-group-label-color]"
      >
        {{ group.label }}
      </div>
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
import { computed, getCurrentInstance, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import hotkeys from 'hotkeys-js'
import dayjs from 'dayjs'
import {
  isLastMonth,
  isLastWeek,
  isLastYear,
  isLongAgo,
  isThisMonth,
  isThisWeek,
  isThisYear,
  isToday,
  isYesterday
} from '../utils/date'
const { t } = useI18n()

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

const groupMap = new Map([
  [
    'NC.today',
    {
      match: isToday,
      data: []
    }
  ],
  [
    'NC.yesterday',
    {
      match: isYesterday,
      data: []
    }
  ],
  [
    'NC.thisWeek',
    {
      match: isThisWeek,
      data: []
    }
  ],
  [
    'NC.lastWeek',
    {
      match: isLastWeek,
      data: []
    }
  ],
  [
    'NC.thisMonth',
    {
      match: isThisMonth,
      data: []
    }
  ],
  [
    'NC.lastMonth',
    {
      match: isLastMonth,
      data: []
    }
  ],
  [
    'NC.thisYear',
    {
      match: isThisYear,
      data: []
    }
  ],
  [
    'NC.lastYear',
    {
      match: isLastYear,
      data: []
    }
  ],
  [
    'NC.longAgo',
    {
      match: isLongAgo,
      data: []
    }
  ]
])

const list = ref<any[]>([])
const allList = ref<any[]>([])
const activeIndex = ref(-1)
const activeId = ref()
const previewId = computed(() => {
  if (activeIndex.value > -1) {
    return allList.value[activeIndex.value].id
  }
  return null
})

const formatOriginData = (data: any[]) => {
  data.sort((a, b) => (a.createDate < b.createDate ? 1 : -1))
  data.forEach((v) => {
    for (const { match, data } of groupMap.values()) {
      if (match(v.createDate)) {
        ;(data as any[]).push(v)
        break
      }
    }
  })

  const res = [] as any[]
  groupMap.forEach((val, key) => {
    if (val.data.length) {
      res.push({
        label: t(key),
        data: val.data
      })
      allList.value.push(...val.data)
    }
  })
  console.log(res)
  console.log(allList.value)
  list.value = res
  activeIndex.value = 0
  activeId.value = allList.value[0].id
}

let id = 1
const genMockData = (n: number) => {
  return new Array(n).fill(0).map((v, i) => {
    return {
      id: ++id,
      desc: btoa(`${i}`.repeat(i + 1)),
      createDate: dayjs()
        .subtract(Math.floor(Math.random() * 100), 'day')
        .format('YYYY/MM/DD HH:mm:ss')
    }
  })
}
formatOriginData(genMockData(20))

const handleClick = (id: number) => {
  activeId.value = id
  const idx = allList.value.findIndex((v) => v.id === id)
  activeIndex.value = idx
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
  e.preventDefault()
  if (activeIndex.value === 0) {
    return
  }
  activeIndex.value--
  getCurrItemEl().scrollIntoView({ block: 'center' })
})
hotkeys('down', (e) => {
  e.preventDefault()
  if (activeIndex.value === allList.value.length - 1) {
    return
  }
  activeIndex.value++
  getCurrItemEl().scrollIntoView({ block: 'center' })
})
hotkeys('enter', () => {
  if (activeIndex.value > -1) {
    activeId.value = allList.value[activeIndex.value].id
  }
})
</script>

<style scoped></style>
