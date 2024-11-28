export function throttle(callback: (...args: any[]) => void, wait = 200) {
  let timer = null as any
  return function (this: any, ...args: any[]) {
    if (timer) {
      return
    }
    timer = setTimeout(() => {
      callback.apply(this, args)
      clearTimeout(timer)
      timer = null
    }, wait)
  }
}
