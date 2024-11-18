<template>
  <el-scrollbar ref="elScrollbarRef">
    <div v-infinite-scroll="loadMore" :infinite-scroll-immediate="false">
      <div v-for="group in groupedData" :key="group.label">
        <div class="mt-4 ml-4 mb-2 text-xs text-[--nc-group-label-color]">
          {{ $t(group.label) }}
        </div>
        <div
          v-for="item in group.data"
          :key="item.id"
          :data-id="item.id"
          class="group mx-2.5 px-2 h-10 leading-10 rounded-md select-none flex items-center gap-2 overflow-hidden relative"
          :class="{
            'is-active': activeId === item.id,
            'bg-[--nc-item-color-active]': activeId === item.id,
            'hover:bg-[--nc-item-color-hover]': activeId !== item.id
          }"
          @click.left="handleClick(item.id)"
          @dblclick.left="handleOpenMenu(item)"
          @click.right="handleOpenMenu(item)"
        >
          <TypeIcon :data="item" class="min-w-6" />
          <span
            v-if="item.type !== 'Image'"
            class="overflow-hidden text-sm text-ellipsis whitespace-nowrap"
          >
            {{ item.content }}
          </span>
          <img
            v-else
            :src="item.url"
            class="flex-1 w-0 max-w-6 max-h-6 object-cover"
          />
        </div>
      </div>
      <div
        v-if="hasScrollbar && isFullLoad"
        class="text-center pt-3 pb-1 text-[--nc-group-label-color] text-xs select-none"
      >
        <span
          class="before:content-['-----'] before:mr-2 after:content-['-----'] after:ml-2"
        >
          {{ $t('NC.inTheEnd') }}</span
        >
      </div>
      <div class="mb-2"></div>
    </div>

    <Menu
      v-model:visible="menuVisible"
      :trigger-ref="menuTriggerRef"
      @on-delete="handleMenuDelete"
    />
  </el-scrollbar>
</template>

<script lang="ts" setup>
import hotkeys from 'hotkeys-js'
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue'

import { HOTKEY } from '@/constants/hotkey'
import { fetchDelete } from '@/database/api'
import { useSearch } from '@/hooks/useSearch'
import { useMainStore } from '@/stores/main'
import { debounce } from '@/utils/debounce'
import { ipcOnHideWin, ipcOnShowWin, ipcOnUpdateClipboard } from '@/utils/ipc'
import { ipcGetTheme } from '@/utils/ipc/theme'
import { throttle } from '@/utils/throttle'

const mainStore = useMainStore()
const searchParams = computed(() => mainStore.searchParams)
const theme = ref('dark')
watch(
  () => mainStore.setting?.theme,
  async () => {
    theme.value = await ipcGetTheme()
  }
)
// prettier-ignore
const {
  groupedData,
  flattenData,
  search,
  refresh,
  next,
  isFullLoad
} = useSearch(searchParams)
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
  const wrapEl = el?.querySelector('.el-scrollbar__wrap') as HTMLElement
  if (!wrapEl) {
    return false
  }
  return wrapEl.scrollHeight > wrapEl.clientHeight
}
const emit = defineEmits(['on-update'])
watch(flattenData, (val) => {
  emit('on-update', !val.length)
  nextTick(() => {
    hasScrollbar.value = handleCheckScrollbar()
  })
})

const activeIndex = ref(-1)
watch(activeIndex, (val) => {
  mainStore.updateActiveRecord(flattenData.value[val])
  menuVisible.value = false
})
const activeItem = computed(() => {
  return flattenData.value?.[activeIndex.value]
})
const activeId = computed(() => activeItem.value?.id)

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

const menuVisible = ref(false)
const menuTriggerRef = ref<HTMLElement | null>(null)
const handleOpenMenu = (item: any) => {
  handleClick(item.id)
  nextTick(() => {
    menuVisible.value = true
    menuTriggerRef.value = getCurrActiveItemEl()
  })
}
const handleMenuDelete = async () => {
  await fetchDelete(activeId.value)
  await refresh()
  activeIndex.value = Math.min(
    Math.max(activeIndex.value, 0),
    flattenData.value.length - 1
  )
  mainStore.updateActiveRecord(flattenData.value[activeIndex.value])
}

const instance = getCurrentInstance()
const getCurrActiveItemEl = () => {
  return instance?.proxy?.$el.querySelector(
    `div[data-id="${activeId.value}"]`
  ) as HTMLElement
}
const scrollIntoView = () => {
  nextTick(() => {
    getCurrActiveItemEl()?.scrollIntoView({
      block: 'center'
    })
  })
}

hotkeys(HOTKEY.home_prev, 'home', (e) => {
  showScrollbar()
  e.preventDefault()
  if (activeIndex.value === 0) {
    return
  }
  activeIndex.value--
  scrollIntoView()
})
hotkeys(HOTKEY.home_next, 'home', (e) => {
  showScrollbar()
  e.preventDefault()
  if (activeIndex.value === flattenData.value.length - 1) {
    return
  }
  activeIndex.value++
  scrollIntoView()
})
hotkeys(HOTKEY.home_menu, 'home', () => {
  if (activeItem.value) {
    menuTriggerRef.value = getCurrActiveItemEl()
    menuVisible.value = !menuVisible.value
  }
})
hotkeys(HOTKEY.home_delete, 'home', () => {
  if (activeItem.value) {
    handleMenuDelete()
  }
})
ipcOnUpdateClipboard((_) => {
  search().then(() => {
    activeIndex.value = 0
    mainStore.updateActiveRecord(flattenData.value[activeIndex.value])
    scrollIntoView()
  })
})
ipcOnShowWin(() => {
  hotkeys.trigger(HOTKEY.home_focus, 'home')
})
ipcOnHideWin(() => {
  activeIndex.value = 0
  mainStore.updateActiveRecord(flattenData.value[0])
  scrollIntoView()
})
</script>
