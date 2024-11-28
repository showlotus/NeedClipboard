<template>
  <div class="text-xs">
    <component :is="dynamicView" />
  </div>
</template>

<script lang="ts" setup>
import { computed, h } from 'vue'

import { TYPE_VALUE } from '@/constants/type'
import { useMainStore } from '@/stores/main'

import ColorView from './ColorView.vue'
import FileView from './FileView.vue'
import ImageView from './ImageView.vue'
import TextView from './TextView.vue'

const mainStore = useMainStore()

const activeRecord = computed<any>(() => mainStore.activeRecord)
const dynamicView = computed(() => {
  if (!activeRecord.value) {
    return h('span')
  }

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
  return h('span')
})
</script>

<style scoped></style>
