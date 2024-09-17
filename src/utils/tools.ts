export function omit<T extends Record<string, any>, U extends (keyof T)[]>(
  obj: T,
  ...keys: U
): Omit<T, U[number]> {
  return Object.keys(obj).reduce((res: any, key) => {
    if (!keys.includes(key)) {
      res[key] = obj[key]
    }
    return res
  }, {})
}

export function pick<T extends Record<string, any>, U extends (keyof T)[]>(
  obj: T,
  ...keys: U
): Pick<T, U[number]> {
  return Object.keys(obj).reduce((res: any, key) => {
    if (keys.includes(key)) {
      res[key] = obj[key]
    }
    return res
  }, {})
}

export function pickAndOmit<
  T extends Record<string, any>,
  U extends (keyof T)[]
>(obj: T, ...keys: U) {
  return [pick(obj, ...keys), omit(obj, ...keys)] as const
}

export function isEqualArray(curr: string[], other: string[]) {
  if (curr.length !== other.length) {
    return false
  }

  for (const v of curr) {
    if (!other.includes(v)) {
      return false
    }
  }

  for (const v of other) {
    if (!curr.includes(v)) {
      return false
    }
  }

  return true
}
