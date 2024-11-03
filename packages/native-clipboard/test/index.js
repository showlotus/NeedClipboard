// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const NativeClipboard = require('../dist')

console.log(NativeClipboard)

NativeClipboard.watch((type, data, source, app) => {
  console.log('clipboard changed!')
  console.log(
    JSON.stringify(
      {
        type,
        data,
        source,
        app
      },
      null,
      2
    )
  )
})

// 监听 10 秒后停止
setTimeout(() => {
  // console.log('stop watch')
  // NativeClipboard.unwatch()
}, 10000)
