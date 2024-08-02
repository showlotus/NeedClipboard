<template>
  <el-scrollbar>
    <div v-infinite-scroll="loadMore" :infinite-scroll-immediate="false">
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
          class="mx-2.5 px-2 h-10 leading-10 rounded-md text-ellipsis overflow-hidden whitespace-nowrap select-none"
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
    </div>
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
const activeIndex = ref(0)
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
  if (list.value.length) {
    list.value[list.value.length - 1]
  }
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
  list.value = list.value.concat(res)
  console.log(list.value)
  // 合并相同 label 下的 data
  for (let i = list.value.length - 1; i >= 0; i--) {
    const headIdx = list.value.findIndex((v) => v.label === list.value[i].label)
    if (headIdx > -1 && headIdx !== i) {
      list.value[headIdx].data.push(...list.value[i])
      list.value.splice(i, 1)
    }
  }
  activeId.value = allList.value[0].id

  // clear groupMap
  groupMap.forEach((val) => {
    val.data = []
  })
}

let id = 1
const genMockData = (n: number, date?: string) => {
  return new Array(n).fill(0).map((v, i) => {
    return {
      id: ++id,
      desc: btoa(`${i}`.repeat(i + 1)),
      createDate:
        date ||
        dayjs()
          .subtract(Math.floor(Math.random() * 100), 'day')
          .format('YYYY/MM/DD HH:mm:ss')
    }
  })
}
formatOriginData(genMockData(10))
const loadMore = () => {
  console.log('loadMore')

  formatOriginData(genMockData(5, '2020/01/01 01:00:00'))
}

const throttle = (callback: (...args: any[]) => void, wait = 200) => {
  let timer = null as any
  return function (this: any, ...args: any[]) {
    if (timer) {
      return
    }
    timer = setTimeout(() => {
      callback.apply(this, args)
      clearTimeout(timer)
      timer = null
    }, wait)
  }
}

const debounce = (callback: (...args: any[]) => void, wait = 200) => {
  let timer = null as any
  return function (this: any, ...args: any[]) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      callback.apply(this, args)
      clearTimeout(timer)
      timer = null
    }, wait)
  }
}

const hideScrollbar = debounce(() => {
  const el = instance?.proxy!.$el as HTMLDivElement
  el.dispatchEvent(new Event('mouseleave'))
}, 1000)
const showScrollbar = throttle(() => {
  const el = instance?.proxy!.$el as HTMLDivElement
  el.dispatchEvent(new Event('mousemove'))
  hideScrollbar()
})
const handleClick = (id: number) => {
  activeId.value = id
  const idx = allList.value.findIndex((v) => v.id === id)
  activeIndex.value = idx
}

const instance = getCurrentInstance()
const getCurrItemEl = () => {
  return instance?.proxy?.$el.querySelector(
    `div[data-id="${previewId.value}"]`
  ) as HTMLElement
}
hotkeys('up', (e) => {
  showScrollbar()
  e.preventDefault()
  if (activeIndex.value === 0) {
    return
  }
  activeIndex.value--
  getCurrItemEl().scrollIntoView({ block: 'center' })
})
hotkeys('down', (e) => {
  showScrollbar()
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

<style lang="scss" scoped></style>
