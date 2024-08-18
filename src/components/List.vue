<template>
  <el-scrollbar ref="elScrollbarRef">
    <div v-infinite-scroll="loadMore" :infinite-scroll-immediate="false">
      <div v-for="group in groupedData" :key="group.label">
        <div
          class="mt-4 ml-4 mb-2 text-xs font-bold text-[--nc-group-label-color]"
        >
          {{ t(group.label) }}
        </div>
        <div
          v-for="item in group.data"
          :key="item.id"
          :data-id="'NC_' + item.id"
          class="group mx-2.5 px-2 h-10 leading-10 rounded-md select-none flex items-center gap-2"
          :class="{
            'is-active': activeId === item.id,
            'bg-[--nc-item-color-active]': activeId === item.id,
            'hover:bg-[--nc-item-color-hover]': activeId !== item.id
          }"
          @click="handleClick(item.id)"
        >
          <TypeIcon :data="item" class="min-w-6" />
          <span class="overflow-hidden text-ellipsis whitespace-nowrap">
            {{ item.content }}
          </span>
        </div>
      </div>
      <div
        v-if="hasScrollbar && isFullLoad"
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
import { useMainStore } from '@/stores/main'
import { useSearch } from '@/hooks/useSearch'
import { debounce } from '@/utils/debounce'
import { throttle } from '@/utils/throttle'

const { t } = useI18n()
const mainStore = useMainStore()
const searchParams = computed(() => mainStore.searchParams)
// prettier-ignore
const { groupedData, flattenData, search, next, isFullLoad } = useSearch(searchParams)
const elScrollbarRef = ref()
watch(
  searchParams,
  () => {
    search().then(() => {
      elScrollbarRef.value?.setScrollTop(0)
      activeIndex.value = 0
      mainStore.updateActiveRecord(flattenData.value[0])
    })
  },
  { immediate: true }
)
const hasScrollbar = ref(false)
const handleCheckScrollbar = () => {
  const el = instance?.proxy!.$el as HTMLDivElement
  const viewEl = el?.querySelector('.el-scrollbar__view') as HTMLElement
  if (!viewEl) {
    return false
  }
  if (viewEl.clientHeight > el.clientHeight) {
    console.log('has scrollbar')
  }
  return viewEl.clientHeight > el.clientHeight
}
const emit = defineEmits(['on-update'])
watch(flattenData, (val) => {
  console.log(val.length)
  emit('on-update', !val.length)
  nextTick(() => {
    hasScrollbar.value = handleCheckScrollbar()
  })
})

const activeIndex = ref(-1)
watch(activeIndex, (val) => {
  mainStore.updateActiveRecord(flattenData.value[val])
})
const activeId = computed(() => {
  return flattenData.value[activeIndex.value]?.id
})

const loadMore = () => {
  if (isFullLoad.value) {
    return
  }

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
  const idx = flattenData.value.findIndex((v) => v.id === id)
  activeIndex.value = idx
}

const instance = getCurrentInstance()
const getCurrItemEl = () => {
  return instance?.proxy?.$el.querySelector(
    `div[data-id="NC_${activeId.value}"]`
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
  if (activeIndex.value === flattenData.value.length - 1) {
    return
  }
  activeIndex.value++
  scrollIntoView()
})
hotkeys('enter', 'home', () => {
  console.log('Past to Clipboard', flattenData.value[activeIndex.value])
})
hotkeys('ctrl+enter', 'home', () => {
  console.log('Past to Action App', flattenData.value[activeIndex.value])
})
</script>

<style lang="scss" scoped></style>
