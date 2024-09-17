<template>
  <div>
    <!-- 
    <button class="bg-blue-500" @click="handleCopyFiles">Copy Files</button>
    <button class="bg-pink-500" @click="handleCopyImage">Copy Image</button>
    <button class="bg-green-500" @click="handleCopyImageFromDB">
      Copy Image From DB
    </button>
    <button class="bg-purple-500" @click="handleCopyImageFromUrl">
      Copy Image From URL
    </button>
    <button class="bg-orange-500" @click="handleCopyText">Copy Text</button>

    <img :src="img" alt="" />
    -->
  </div>
</template>
<script setup lang="ts">
// import { ref } from 'vue'

// import DB from '../database'
// import imgUrl2 from './img2.txt?raw'
// import imgUrl from './img.txt?raw'

// const handleCopyFiles = () => {
//   const files = [
//     'C:\\Users\\showlotus\\Desktop\\WinCode\\t2',
//     'C:\\Users\\showlotus\\Desktop\\WinCode\\t1.txt'
//   ]
//   window.ipcRenderer.invoke('update-clipboard-file', files)
// }

// const img2 =
//   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
// const img = ref(imgUrl)

// const handleCopyImage = () => {
//   const img = imgUrl
//   window.ipcRenderer.invoke('update-clipboard-image', img)
// }

// const handleCopyImageFromDB = async () => {
//   const count = await DB.image.count()
//   DB.image.get(count).then((res: any) => {
//     console.log(res)
//     window.ipcRenderer.invoke('update-clipboard-image-buffer', res)
//   })
// }

// const handleCopyImageFromUrl = async () => {
//   const count = await DB.image.count()
//   DB.image.get(count).then((res: any) => {
//     console.log(res)
//     window.ipcRenderer.invoke('update-clipboard-image-url', res)
//   })
// }

// const handleCopyText = () => {
//   const text = 'test text'
//   window.ipcRenderer.invoke('update-clipboard-text', text)
// }
</script>
