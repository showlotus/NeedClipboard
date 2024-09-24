import { faker } from '@faker-js/faker'
import dayjs from 'dayjs'
import { Ref, ref } from 'vue'

import { DATE_TEMPLATE } from '@/constants/date'
import { fetchSearch } from '@/database/api'
import { SearchParams } from '@/stores/main'
import {
  ValidateDate,
  isLastMonth,
  isLastWeek,
  isLastYear,
  isLongAgo,
  isThisMonth,
  isThisWeek,
  isThisYear,
  isToday,
  isYesterday
} from '@/utils/date'
import { ipcGetAppIcon } from '@/utils/ipc'

function calculateBase64Size(base64String: string) {
  // 去掉 Base64 前缀
  const base64Data = base64String.split(',')[1]

  // 计算等号的数量
  const padding = (base64Data.match(/=/g) || []).length

  // 计算实际有效长度
  const sizeInBytes = (base64Data.length * 3) / 4 - padding

  return sizeInBytes
}

export function genMockApplications() {
  return [
    { name: 'Visual Studio Code', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHsSURBVDhPjdLfT9NQFMDxs9XAJCE65lQiJKxlxH8A/wR98n/QxMSYCP4a2yJsgTrYBpoVHzTGGIMyMbq5OSJjbL4RYkIYlG4sxviAProHugIvkBxvK12OD2Rr8nnqvd/enlyAJh9eLNy5MLe9LySrh/zzH/Emt/1b1jlWmIHAV9T1ze8ahET10PXsu9Qw5AjkkzBcQFNfRkPq2MBFf95hH8kl4GEeKXdaQwpOS+WPML2Ftli5wktlt17UN9v8uQr4c0hxvkXNnWIBAiBWRhMXK9XORuUbNl+2At5FpNp82W/3U0p3b1JDCpyPlVvwpIT/EVcQhhbqOrxfJvWTIWJbb6KGlDGDrkjpknVK2YMpBesmVtHqWdA6vfNXzEGxwEnhQw0p4935B5l+i3dpFyIyQnSzzhqVNeekcpkEbMJ7FiDAfi9zE+5m0OBhQwsVEcIsQrRPyOGjX2jl52pIAQx+RpNlMK22e7LXuHG5BOPsNERLSF6++u7nOT6uIgWtA+k4DKSRu51SnJ5Pgv6lU+FNOyeuK/BoAylLaEN1zapIHXuR9EiLWJwFcR0p1xsWIBpe5RPB4lsYZXM50jOjItUwoC/gAsWnEGQRpuf1jqH7ZfXgjPQr0lRAX2QNrl13TP/Wul78OXBI26/MjX8B31GcF8UYjTwAAAAASUVORK5CYII=' },
    { name: 'Clash Verge', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALdSURBVDhPbVNrTxNBFF31Txli4g/yQ6NYWyi0uyDBIB9QxNgaMRHS8BKRCAF5VGgKPspSW1EJlVcppdilLXS72+3MHG8LBTRO9mbu3jvnnnsmcyWJFoCrlb3qJzLX+Uiknz0M7DF5ijF5mvHOhSQfWvNjO193fq6GuQw23673GO5ZlBqnUHZPoyzPwJJnYbnnKbYAwx2GOZbyEubKv8RSzrcW0G4HkG8KiKISYIY8Kwx5HobnA3Q5KApKmOWboyJbH0fOlw1eJpYyY8meHdsKUh7V1DpU5F2L0AlYUII4UZaR93xB1vUV2c5N/Jb3zf07WeTeWL6qHH1Lv/7TEcfPxriIu9ZhHVnQQwc4qP+IQ/snpO1hHNz9SjEN5SOGfU8GCXeB77osFH/hhrTj1/rVO0lEnEkWU1JgBqfugMJqDiehDE6WNOir+WqMGwKJ9gK2mk226eQ4GMCQpLZqex/tGSzZNfFFyaFcFAB9/1uccpsPSthoYiLeBGy1Iy0tOXMs5DhG0H6CJXcBVuECLRj5/OK/TLmNNo51Aq97gB9uCGnRUWCLTh1zNh3RXqNKnApbSEfL500cqhxa7LTQbp/ANwfwXQZiHioQajGT8/cMTNuKItpXqh7aXrDw+dlpMcGAlR6GdPi0wPaAwIoDIkIdxCoSov2Wf8pWwvsGk03YS0iECXG2dlY5kmsXElKqQIja/ySDhRpIxgCGJW0DdZP1DBMNZTHuZBhxMKjvOIrHALPoCkiJTr46KTBO4GlinlPAZ8g/2sTN6luIDHPv4C2BUTc3B5qBXjvQ1wKMPwfGyHrbAC8x+ik2eh/mIOXVN3hRm4vKMF2Ze4rgCxvwqhn8ZQuYV4Z4QizdZD3k+9rAelvBvfeAqedYJsy10+k7m6rKHnoNn9cFPG4EntAtP20lMFm3AjyqFKL2A8RcA9ewf41zkp7nxCCGfB1IdykQXS3E3on0uyEM79Y0XyL+A5Wb/oFWe3GcAAAAAElFTkSuQmCC' },
    { name: 'Microsoft Edge', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMcSURBVDhPXdNrSJNhFAfw11S8TLdZVEJUBH3qOqe00pGS2EU3tzSzpBUllUU3CEsp0zA1y+vMlbaCihC7YB+KIGvbO5fLvOTu2eYNStMuq7RBSPv3XtTKA+fD8+H8znkOz0MQMyJK+10dpR91R+o/QNjqQJTRhnUdXYg1kZ546xNdYt+DxTNrmHOk1iOO1Ix7onTfEEF+QERLH1YZ7BC0mql8g+jOFsSZn0Hy7o53+6BK/R9CFwtf/PAKtW5E6D5iNTmIlXonA6w0sMCa163YaL+PLT2NUAxdROZI9l9E8PynR6gZg0D7GQLdMFaRA1hOOrBMb6bShAhjO9Z2aBBvvQepsx67h85h/+hRHPu6V0ysbvaoBS/GsEjtwJySNswu7cbcyyaEVxixpKGTAegUGkmIOx9jk7UecmcZDn46hCNfMlzEiqaR3/zClwgttoFX5kRYZS/mKPswT9WP8Ku9WFDbxgACgxYx7feQaKtAqqsAisEs7B/aAWKhuh9B+SZwSnoQWuqkEBeLFHVhcYX51nyVi1z64BVExruIa69GoqUEMutxKAb24cB7CQi6a0CBHUEX3iK4uAchpe/AzdaBk3TJOLVp0aOXvWsNVxHbVo6EriIGSLenYU8vBfjl2eCf70DAeQcCaaTQDo68BqEpdSenAKH2ulpEKiFuLcfm1wchM2VipyMFuxxxbmLWGRv88uzTSNCxZoTIr1DANf00oKkfFmkvIkZfgA0tByDvlGN7d4I3wxKdTvjk2Nw04juJBGc+RMhWFUJSVF5O2s10GhFpC8UiTXHTejJrOKEl3Z1klDaldcSK2QanrWqfXBsY5KwdAYeesgA9xbbrXm5q3f+vbnKsMEkZg7ORY/X45FoZxP+EgSquZQAa4qbWg5tybYInq3Vxk2t0fGm1my+pnOAnlnn+AqetYiLH4p1CghUNLCBTgru1lgbAk6vAk10BP7kafEmFl5pg8gpTDIOwk/jmmBGsaGSvIa1CaHIVeMlKNiVVnjBJ1Yzif78WtRO/XMu4b64F/qc6EHi4GRxqsbMVt39xpcobM7/yH8MX8z4v1sxGAAAAAElFTkSuQmCC' }
  ]
}

export function genMockData(n = 10) {
  const applications = genMockApplications()
  const t = ['Text', 'Image', 'File', 'Link', 'Color']
  return new Array(n).fill(0).map(async (_, i) => {
    const type = t[i % t.length]
    const data = {} as any
    if (type === 'Color') {
      data.content = faker.color.rgb({ format: 'css' })
    } else if (type === 'Text') {
      data.content = faker.string
        .alpha({ length: { min: 100, max: 2000 } })
        .replace(/(?!^)(?=(\w{80})+$)/g, '\n')
      data.characters = data.content.length
    } else if (type === 'Image') {
      const w = Math.floor(Math.random() * 1000 + 200)
      const h = Math.floor(Math.random() * 1000 + 200)

      data.url = faker.image.dataUri({
        width: w,
        height: h,
        type: 'svg-base64'
      })

      // data.url = faker.image.nature(1200, 500, true)
      // data.url = faker.image.nature(500, 500, true)
      // data.url = faker.image.nature(2500, 1200, true)
      data.width = w
      data.height = h
      // data.dimensions = w + '×' + h
      data.content = ''
      data.size = calculateBase64Size(data.url)
    } else if (type === 'Link') {
      const url = faker.internet.url()
      data.content = url
      data.characters = url.length
    } else if (type === 'File') {
      const subType = ['file', 'folder', 'folder,file'][i % 3]
      data.subType = subType
      if (subType === 'file') {
        const name = faker.system.commonFileName()
        const path =
          new Array(10)
            .fill(0)
            .map(() => faker.system.directoryPath())
            .join('') +
          '/' +
          name
        data.content = name
        data.path = path
        // data.size =
        //   faker.number.float({ min: 10, max: 100, multipleOf: 0.02 }) + ' KB'
      } else if (subType === 'folder') {
        const path = new Array(10)
          .fill(0)
          .map(() => faker.system.directoryPath())
          .join('')
        data.path = path
        data.content = path.split('/').at(-1)
        // data.size =
        //   faker.number.float({ min: 10, max: 100, multipleOf: 0.02 }) + ' KB'
      } else if (subType === 'folder,file') {
        const path = new Array(10)
          .fill(0)
          .map(() => faker.system.directoryPath())
          .join('')
        const files = new Array(20)
          .fill(0)
          .map(() =>
            Math.random() > 0.5
              ? faker.system.commonFileName()
              : faker.system.directoryPath()
          )
        data.path = path
        data.content = path.split('/').at(-1)
        data.files = files
        // data.fileCount = files.length
      }
    }
    return {
      id: faker.string.uuid(),
      type,
      ...data,
      application: applications[i % applications.length], // faker.person.fullName(),
      createTime: dayjs()
        .subtract(Math.floor(Math.random() * 100), 'day')
        .format(DATE_TEMPLATE)
    }
  })
}

function handleGroup(data: any[]) {
  const groupMap = new Map<string, { match: ValidateDate; data: any[] }>([
    [
      'NC.today',
      {
        match: isToday,
        data: []
      }
    ],
    [
      'NC.yesterday',
      {
        match: isYesterday,
        data: []
      }
    ],
    [
      'NC.thisWeek',
      {
        match: isThisWeek,
        data: []
      }
    ],
    [
      'NC.lastWeek',
      {
        match: isLastWeek,
        data: []
      }
    ],
    [
      'NC.thisMonth',
      {
        match: isThisMonth,
        data: []
      }
    ],
    [
      'NC.lastMonth',
      {
        match: isLastMonth,
        data: []
      }
    ],
    [
      'NC.thisYear',
      {
        match: isThisYear,
        data: []
      }
    ],
    [
      'NC.lastYear',
      {
        match: isLastYear,
        data: []
      }
    ],
    [
      'NC.longAgo',
      {
        match: isLongAgo,
        data: []
      }
    ]
  ])

  groupMap.forEach((val) => {
    val.data = []
  })
  data.forEach((v) => {
    for (const { match, data } of groupMap.values()) {
      if (match(v.createTime)) {
        data.push(v)
        break
      }
    }
  })

  const groupedData = [] as any[]
  const flattenData = [] as any[]
  groupMap.forEach((val, key) => {
    if (val.data.length) {
      groupedData.push({
        label: key,
        data: val.data
      })
      flattenData.push(...val.data)
    }
  })
  return { groupedData, flattenData }
}

export function useSearch(params: Ref<SearchParams>) {
  let currPage = 1
  const pageSize = 20
  const isFullLoad = ref(false)
  const groupedData = ref<any[]>([])
  const flattenData = ref<any[]>([])
  const search = async (page?: number) => {
    currPage = !page ? 1 : page
    const prevData = currPage === 1 ? [] : flattenData.value
    const { result, totals } = await fetchSearch({
      ...params.value,
      currPage,
      pageSize
    })
    isFullLoad.value = result.length + flattenData.value.length === totals
    const groupRes = handleGroup(prevData.concat(result))
    groupedData.value = groupRes.groupedData
    flattenData.value = groupRes.flattenData
  }

  const next = () => {
    if (isFullLoad.value) {
      return
    }
    search(++currPage)
  }
  return { groupedData, flattenData, search, next, isFullLoad }
}
