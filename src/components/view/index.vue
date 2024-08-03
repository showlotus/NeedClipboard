<template>
  <div class="pt-2 pb-2 pl-3 pr-3 text-xs">
    <!-- <ImageView /> -->
    <!-- <TextView v-model="content" /> -->
    <FileView />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import imgUrl from '../img.txt?raw'

const contentType = ref('Text')

const url = ref(imgUrl)

const content = ref(`nextTick(() => {
    getCurrItemEl().scrollIntoView({ block: 'center' })
  })`)
</script>

<style scoped></style>
