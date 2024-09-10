export function omit<T extends Record<string, any>, U extends T>(
  obj: T,
  ...keys: (keyof T)[]
) {
  return Object.keys(obj).reduce((curr: any, key) => {
    if (!keys.includes(key)) {
      curr[key] = obj[key]
    }
    return curr
  }, {}) as U
}

export function pick<T extends Record<string, any>, U extends T>(
  obj: T,
  ...keys: (keyof T)[]
) {
  return Object.keys(obj).reduce((curr: any, key) => {
    if (keys.includes(key)) {
      curr[key] = obj[key]
    }
    return curr
  }, {}) as U
}

export function pickAndOmit<T extends Record<string, any>>(
  obj: T,
  ...keys: (keyof T)[]
) {
  return [pick(obj, ...keys), omit(obj, ...keys)]
}
