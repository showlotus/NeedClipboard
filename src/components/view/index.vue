<template>
  <div class="text-xs">
    <!-- <ImageView /> -->
    <!-- <TextView v-model="content" /> -->
    <!-- <FileView /> -->
    <!-- <ColorView /> -->
    <component :is="dynamicView" />
  </div>
</template>

<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import imgUrl from '../img.txt?raw'
import { useMainStore } from '@/stores/main'
import { TYPE_VALUE } from '@/constants/aria'
import TextView from './TextView.vue'
import ColorView from './ColorView.vue'
import ImageView from './ImageView.vue'
import FileView from './FileView.vue'

const mainStore = useMainStore()

const activeRecord = computed<any>(() => mainStore.activeRecord)
const dynamicView = computed(() => {
  const type = activeRecord.value.type
  if ([TYPE_VALUE.text, TYPE_VALUE.link].includes(type)) {
    return h(TextView, { value: activeRecord.value.content })
  } else if (type === TYPE_VALUE.color) {
    return h(ColorView, { value: activeRecord.value.content })
  } else if (type === TYPE_VALUE.image) {
    return h(ImageView, { value: activeRecord.value.url })
  } else if (type === TYPE_VALUE.file) {
    return h(FileView, { data: activeRecord.value })
  }
  return ''
})

const contentType = ref('Text')

const url = ref(imgUrl)

const content = ref(`nextTick(() => {
    getCurrItemEl().scrollIntoView({ block: 'center' })
  })
<template>
  <div class="h-full w-full flex justify-center items-center">
    <img :src="url" alt="" class="h-full" /><img :src="url" alt="" class="h-full" /><img :src="url" alt="" class="h-full" /><img :src="url" alt="" class="h-full" />xxxxxxxxxxxx
  </div>
</template>

import imgUrl from '../img.txt?raw'

const url = defineModel<string>({ default: imgUrl })

<style scoped></style>

今天是周一`)
</script>

<style scoped></style>
