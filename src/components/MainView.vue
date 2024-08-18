<template>
  <div>
    <div v-show="!showEmpty" class="w-full h-full flex">
      <List
        class="w-2/5 h-full border-r border-[--el-border-color] relative"
        @on-update="handleUpdate"
      />
      <div class="w-0 flex-1 flex flex-col">
        <View class="flex-[3] h-0" />
        <Info class="flex-[2] h-0 border-t border-[--el-border-color]" />
      </div>
    </div>
    <div
      v-show="showEmpty"
      class="w-full h-full flex justify-center items-center"
    >
      {{ t('NC.noResults') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const showEmpty = ref(false)
const handleUpdate = (isEmpty: boolean) => {
  showEmpty.value = isEmpty
}
</script>

<style scoped></style>
