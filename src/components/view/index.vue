<template>
  <div class="text-xs">
    <!-- <ImageView /> -->
    <TextView v-model="content" />
    <!-- <FileView /> -->
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import imgUrl from '../img.txt?raw'

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
