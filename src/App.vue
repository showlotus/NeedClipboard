<script setup lang="ts"></script>

<template>
  <div class="w-full h-full flex flex-col">
    <div class="drag p-4">
      <Header />
    </div>
    <div class="w-full flex flex-1">
      <div class="w-2/5 border-yellow-500 border">
        <List />
      </div>
      <div class="flex-1 flex flex-col">
        <div class="flex-1 border-cyan-500 border">
          <View />
        </div>
        <div class="flex-1 border-purple-500 border">
          <Info />
        </div>
      </div>
    </div>
    <div class="h-16 border-pink-500 border">
      <Setting />
    </div>
  </div>
</template>

<style></style>
