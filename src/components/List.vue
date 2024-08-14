<template>
  <el-scrollbar>
    <div v-infinite-scroll="loadMore" :infinite-scroll-immediate="false">
      <div v-for="group in list" :key="group.label">
        <div
          class="mt-4 ml-4 mb-2 text-xs font-bold text-[--nc-group-label-color]"
        >
          {{ t(group.label) }}
        </div>
        <div
          v-for="item in group.data"
          :key="item.id"
          :data-id="item.id"
          class="group mx-2.5 px-2 h-10 leading-10 rounded-md text-ellipsis overflow-hidden whitespace-nowrap select-none flex items-center gap-2"
          :class="{
            'is-active': activeId === item.id,
            'bg-[--nc-item-color-active]': activeId === item.id,
            'hover:bg-[--nc-item-color-hover]': activeId !== item.id
          }"
          @click="handleClick(item.id)"
        >
          <TypeIcon
            :type="item.type"
            v-bind="{ ...(item.type === 'Color' ? { color: item.desc } : {}) }"
          />
          {{ item.desc }}
        </div>
      </div>
      <div
        v-if="isFullLoad"
        class="text-center pt-3 pb-1 text-[--nc-group-label-color] text-xs select-none"
      >
        <span
          class="before:content-['-----'] before:mr-2 after:content-['-----'] after:ml-2"
        >
          {{ t('NC.inTheEnd') }}</span
        >
      </div>
      <div class="mb-2"></div>
    </div>
  </el-scrollbar>
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue'
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
import { useMainStore } from '@/stores/main'
import { useSearch } from '@/hooks/useSearch'
import { debounce } from '@/utils/debounce'
import { throttle } from '@/utils/throttle'

const { t } = useI18n()
const mainStore = useMainStore()
const searchParams = computed(() => mainStore.searchParams)
const { data, search, next, isFullLoad } = useSearch(searchParams)
watch(
  searchParams,
  () => {
    search()
  },
  { immediate: true }
)

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
const activeId = computed(() => {
  return allList.value[activeIndex.value]?.id
})
const previewId = computed(() => {
  if (activeIndex.value > -1) {
    return allList.value[activeIndex.value].id
  }
  return null
})

const formatOriginData = (data: any[]) => {
  // clear
  list.value = []
  allList.value = []
  groupMap.forEach((val) => {
    val.data = []
  })

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
  const allRes = [] as any[]
  groupMap.forEach((val, key) => {
    if (val.data.length) {
      res.push({
        label: key,
        data: val.data
      })
      allRes.push(...val.data)
    }
  })
  // console.log(res)
  list.value = res
  allList.value = allRes
}

const genMockData = (() => {
  let id = 1
  const types = [
    'Color',
    'Text',
    'Image',
    'Link',
    'File',
    'FolderFile',
    'Folder'
  ]
  const colors = [
    '#24acf2',
    '#ff6c37',
    '#f04b3d',
    '#0073c7',
    '#ffe947',
    '#7356e2',
    '#7b2fa0'
  ]
  return (n: number, date?: string) => {
    return new Array(n).fill(0).map((v, i) => {
      return {
        id: ++id,
        desc:
          i % 7 === 0
            ? colors[Math.floor(Math.random() * colors.length)]
            : btoa(`${i}`.repeat(i + 1)),
        type: types[i % 7],
        createDate:
          date ||
          dayjs()
            .subtract(Math.floor(Math.random() * 100), 'day')
            .format('YYYY/MM/DD HH:mm:ss')
      }
    })
  }
})()
formatOriginData(genMockData(10))

const loadMore = () => {
  if (isFullLoad.value) {
    return
  }
  console.log('loadMore')
  const data = genMockData(5, '2020/01/01 01:00:00')
  formatOriginData(allList.value.concat(data))

  // TODO 通过上下按键触发滚动时，才需要将当前聚焦元素滚动到视图中
  // scrollIntoView()

  next()
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
  // activeId.value = id
  const idx = allList.value.findIndex((v) => v.id === id)
  activeIndex.value = idx
}

const instance = getCurrentInstance()
const getCurrItemEl = () => {
  return instance?.proxy?.$el.querySelector(
    `div[data-id="${previewId.value}"]`
  ) as HTMLElement
}
const scrollIntoView = () => {
  nextTick(() => {
    getCurrItemEl().scrollIntoView({
      block: 'center'
    })
  })
}
hotkeys('up', 'home', (e) => {
  showScrollbar()
  e.preventDefault()
  if (activeIndex.value === 0) {
    return
  }
  activeIndex.value--
  scrollIntoView()
})
hotkeys('down', 'home', (e) => {
  showScrollbar()
  e.preventDefault()
  if (activeIndex.value === allList.value.length - 1) {
    return
  }
  activeIndex.value++
  scrollIntoView()
})
hotkeys('enter', 'home', () => {
  console.log('Past to Clipboard', allList.value[activeIndex.value])
})
hotkeys('ctrl+enter', 'home', () => {
  console.log('Past to Action App', allList.value[activeIndex.value])
})
</script>

<style lang="scss" scoped></style>
