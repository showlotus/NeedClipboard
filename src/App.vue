<script setup lang="ts">
import Header from './components/Header.vue'
import List from './components/List.vue'
import View from './components/View.vue'
import Info from './components/Info.vue'
import Setting from './components/Setting.vue'

document.querySelector('html')?.classList.toggle('dark')
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <div class="drag p-4">
      <Header class="no-drag" />
    </div>
    <div class="w-full flex flex-1">
      <div class="w-2/5 bg-yellow-500">
        <List />
      </div>
      <div class="flex-1 flex flex-col">
        <div class="flex-1 bg-cyan-500">
          <View />
        </div>
        <div class="flex-1 bg-purple-500">
          <Info />
        </div>
      </div>
    </div>
    <div class="h-16 bg-pink-500">
      <Setting />
    </div>
  </div>
</template>

<style></style>
