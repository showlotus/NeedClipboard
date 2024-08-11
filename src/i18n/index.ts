import data from './data.json'

export type Lang = 'zh_CN' | 'en_US'

interface OriginData {
  [K: string]: {
    [Y in Lang]: string
  }
}

type ResultData = Record<Lang, Record<string, string>>

export function formatI18nJson(data: OriginData) {
  const obj = {} as any
  Object.keys(data).forEach((key) => {
    const item = data[key]
    Object.keys(item).forEach((lang) => {
      if (!obj[lang]) {
        obj[lang] = {}
      }
      obj[lang][key] = item[lang as Lang]
    })
  })
  return obj as ResultData
}

export default formatI18nJson(data)
