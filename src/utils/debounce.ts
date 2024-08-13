export function debounce(callback: (...args: any[]) => void, wait = 200) {
  let timer = null as any
  return function (this: any, ...args: any[]) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      callback.apply(this, args)
      clearTimeout(timer)
      timer = null
    }, wait)
  }
}
