<template>
  <div class="pt-2 text-sm flex flex-col cursor-default select-none">
    <div class="py-2 px-3 text-sm font-bold text-[--nc-group-label-color]">
      {{ $t('NC.information') }}
    </div>
    <el-scrollbar>
      <div class="flex-1 h-0 px-3">
        <div
          v-for="(item, i) in info"
          :key="i"
          class="h-7 flex justify-between items-center text-xs border-b border-[--nc-info-border-color] last:border-none"
        >
          <span class="font-bold text-[--nc-group-label-color] min-w-40">{{
            item[0]
          }}</span>
          <!-- TODO only the path attribute need tooltip -->
          <AutoTooltip v-if="isFile" :key="activeRecord.id" :value="item[1]" />
          <span
            v-else
            class="text-[--el-color-primary] text-xs flex-1 text-right text-ellipsis overflow-hidden"
            >{{ item[1] }}</span
          >
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { TYPE_VALUE } from '@/constants/aria'
import { useMainStore } from '@/stores/main'

const { t } = useI18n()
const mainStore = useMainStore()
const activeRecord = computed(() => mainStore.activeRecord)
const isFile = computed(() => activeRecord.value.type === TYPE_VALUE.file)
const ops = {
  [TYPE_VALUE.text]: (data: any) => {
    return [
      [t('NC.source'), data.application],
      [t('NC.type'), t(`NC.${data.type.toLowerCase()}`)],
      [t('NC.characters'), data.characters],
      [t('NC.copied'), data.createTime]
    ]
  },
  [TYPE_VALUE.image]: (data: any) => {
    return [
      [t('NC.source'), data.application],
      [t('NC.type'), t(`NC.${data.type.toLowerCase()}`)],
      [t('NC.dimensions'), data.dimensions],
      [t('NC.imageSize'), data.size],
      [t('NC.copied'), data.createTime]
    ]
  },
  [TYPE_VALUE.link]: (data: any) => {
    return [
      [t('NC.source'), data.application],
      [t('NC.type'), t(`NC.${data.type.toLowerCase()}`)],
      [t('NC.characters'), data.characters],
      [t('NC.copied'), data.createTime]
    ]
  },
  [TYPE_VALUE.color]: (data: any) => {
    return [
      [t('NC.source'), data.application],
      [t('NC.type'), t(`NC.${data.type.toLowerCase()}`)],
      [t('NC.copied'), data.createTime]
    ]
  },
  [TYPE_VALUE.file]: (data: any) => {
    return [
      [t('NC.source'), data.application],
      [t('NC.type'), t(`NC.${data.type.toLowerCase()}`)],
      [t('NC.path'), data.path],
      [t('NC.fileSize'), data.size],
      [t('NC.fileCount'), data.fileCount],
      [t('NC.copied'), data.createTime]
    ]
  }
}

const info = computed(() => {
  const val = activeRecord.value
  if (!val || !val.type) {
    return []
  } else {
    return ops[val.type](val)
  }
})
</script>

<style scoped></style>
