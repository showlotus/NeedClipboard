<template>
  <div
    v-if="info.length"
    class="py-2 text-sm flex flex-col cursor-default select-none"
  >
    <!-- <div class="py-1 px-3 text-sm font-bold text-[--nc-group-label-color]">
      {{ $t('NC.information') }}
    </div> -->
    <div class="flex-1 px-3">
      <div
        v-for="(item, i) in info"
        :key="i"
        class="h-7 flex justify-between items-center text-xs border-b border-[--nc-info-border-color] last:border-none"
      >
        <span class="text-[--nc-group-label-color] min-w-40">{{
          item[0]
        }}</span>
        <AutoTooltip
          v-if="isFile && item[0] === t('NC.path')"
          :key="activeRecord.id"
          :value="item[1]"
        />
        <div
          v-else
          class="text-[--el-color-primary] text-xs flex-1 flex justify-end gap-2 text-ellipsis overflow-hidden"
          v-html="item[1]"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { TYPE_VALUE } from '@/constants/type'
import {
  ClipboardTableType,
  FileDataType,
  ImageDataType,
  TextDataType
} from '@/database'
import { useMainStore } from '@/stores/main'

const { t } = useI18n()
const mainStore = useMainStore()
const activeRecord = computed(() => mainStore.activeRecord)
const isFile = computed(() => activeRecord.value.type === TYPE_VALUE.file)
const genSource = (data: ClipboardTableType) => {
  return /* html */ `
    <img src="${data.application!.icon}" />
    ${data.application!.name}
  `
}
const ops = {
  [TYPE_VALUE.text]: (data: TextDataType) => {
    return [
      [t('NC.source'), genSource(data)],
      [t('NC.type'), t(`NC.${data.type.toLowerCase()}`)],
      [t('NC.characters'), data.content.length],
      [t('NC.copied'), data.createTime]
    ]
  },
  [TYPE_VALUE.image]: (data: ImageDataType) => {
    return [
      [t('NC.source'), genSource(data)],
      [t('NC.type'), t(`NC.${data.type.toLowerCase()}`)],
      [t('NC.dimensions'), `${data.width}×${data.height}`],
      [t('NC.imageSize'), data.size],
      [t('NC.copied'), data.createTime]
    ]
  },
  [TYPE_VALUE.link]: (data: TextDataType) => {
    return [
      [t('NC.source'), genSource(data)],
      [t('NC.type'), t(`NC.${data.type.toLowerCase()}`)],
      [t('NC.characters'), data.content.length],
      [t('NC.copied'), data.createTime]
    ]
  },
  [TYPE_VALUE.color]: (data: TextDataType) => {
    return [
      [t('NC.source'), genSource(data)],
      [t('NC.type'), t(`NC.${data.type.toLowerCase()}`)],
      [t('NC.copied'), data.createTime]
    ]
  },
  [TYPE_VALUE.file]: (data: FileDataType) => {
    return [
      [t('NC.source'), genSource(data)],
      [t('NC.type'), t(`NC.${data.type.toLowerCase()}`)],
      [t('NC.path'), data.path],
      // [t('NC.fileSize'), data.size],
      [t('NC.fileCount'), data.files?.length],
      [t('NC.copied'), data.createTime]
    ]
  }
}

const info = computed(() => {
  const val = activeRecord.value
  if (!val || !val.type) {
    return []
  } else {
    return ops[val.type](val).filter((v) => v[1])
  }
})
</script>

<style scoped></style>
