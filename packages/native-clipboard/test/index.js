const NativeClipboard = require('../build/Release/native-clipboard')

console.log(NativeClipboard)

let timer = setInterval(() => {
  console.log(NativeClipboard.getCursorAppInfo())
}, 1000)

// // 监听 10 秒后停止
setTimeout(() => {
  clearInterval(timer)
  timer = null

  //   NativeClipboard.stopListeningHandle()
  console.log('Stopped listening')
}, 10000)
