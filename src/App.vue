<script setup lang="ts">
import { getCurrentInstance } from 'vue'

// getCurrentInstance()!.proxy!.$i18n.locale = 'en_US'
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <Header
      class="drag pt-3 pb-3 pl-4 pr-4 border-b border-[--el-border-color]"
    />
    <div class="w-full flex flex-1 h-0">
      <List class="w-2/5 h-full border-r border-[--el-border-color] relative" />
      <div class="flex-1 flex flex-col">
        <View class="flex-1" />
        <Info class="flex-1 border-t border-[--el-border-color]" />
      </div>
    </div>
    <Setting
      class="h-10 pl-4 pr-4 pt-1 pb-1 border-t border-[--el-border-color]"
    />
  </div>
</template>

<style></style>
