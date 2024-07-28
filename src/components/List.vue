<template>
  <div v-infinite-scroll="loadMore" class="overflow-y-auto pb-2">
    <div v-for="group in list" :key="group.label">
      <div class="mt-4 ml-4 mb-2 text-xs">{{ group.label }}</div>
      <div
        v-for="item in group.data"
        :key="item.id"
        class="ml-2 mr-2 pl-2 pr-2 h-10 leading-10 rounded-md text-ellipsis overflow-hidden whitespace-nowrap select-none font-medium"
        :class="{
          'bg-[--nc-item-color-active]': activeId === item.id,
          'hover:bg-[--nc-item-color-hover]': activeId !== item.id
        }"
        @click="handleClick(item.id)"
      >
        {{ item.desc }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeId = ref('1')
const genMockData = (n: number) => {
  return new Array(n).fill(0).map((v, i) => {
    return {
      id: `${Date.now()}_${i}`,
      desc: `${i}`.repeat(i + 1)
    }
  })
}
const list = ref([
  {
    label: 'Today',
    data: genMockData(10)
  },
  {
    label: 'Yesterday',
    data: genMockData(4)
  }
])
const handleClick = (id: string) => {
  activeId.value = id
}

const loadMore = () => {
  console.log('loadMore')
}
</script>

<style scoped></style>
