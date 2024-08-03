<template>
  <div class="h-full w-full py-2 flex justify-center items-center">
    <img :src="url" alt="" class="h-full" />
  </div>
</template>

<script lang="ts" setup>
import imgUrl from '../img.txt?raw'

const url = defineModel<string>({ default: imgUrl })
</script>

<style scoped></style>
