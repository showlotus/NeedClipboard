<template>
  <div>
    <div v-show="!showEmpty" class="w-full h-full flex">
      <List class="w-2/5 h-full" @on-update="handleUpdate" />
      <div class="h-full -ml-[1px] border-r border-[--el-border-color]"></div>
      <div class="w-0 flex-1 flex flex-col-reverse">
        <Info class="border-t border-[--el-border-color]" />
        <View class="flex-[1] h-0" />
      </div>
    </div>
    <div
      v-show="showEmpty"
      class="w-full h-full flex justify-center items-center"
    >
      {{ $t('NC.noResults') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const showEmpty = ref(false)
const handleUpdate = (isEmpty: boolean) => {
  showEmpty.value = isEmpty
}
</script>

<style scoped></style>
