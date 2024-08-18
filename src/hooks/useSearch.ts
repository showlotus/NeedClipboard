import { Ref, ref } from 'vue'
import { faker } from '@faker-js/faker'
import { SearchParams } from '@/stores/main'
import dayjs from 'dayjs'
import {
  isLastMonth,
  isLastWeek,
  isLastYear,
  isLongAgo,
  isThisMonth,
  isThisWeek,
  isThisYear,
  isToday,
  isYesterday,
  ValidateDate
} from '@/utils/date'
import { FILE_SUB_TYPE_VALUE, TYPE_VALUE } from '@/constants/aria'

function genMockData(n = 10) {
  const t = ['Text', 'Image', 'File', 'Link', 'Color']
  return new Array(n).fill(0).map((_, i) => {
    const type = t[i % t.length]
    const data = { subType: null } as any
    if (type === 'Color') {
      data.content = faker.color.rgb({ format: 'css' })
    } else if (type === 'Text') {
      data.content = faker.string
        .alpha({ length: { min: 100, max: 2000 } })
        .replace(/(?!^)(?=(\w{80})+$)/g, '\n')
      data.characters = data.content.length
    } else if (type === 'Image') {
      data.url = faker.image.dataUri({ width: 2000, type: 'svg-base64' })
      data.dimensions = '640×480'
      data.content = 'Image(640×480)'
      data.size = '200 KB'
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
        data.size =
          faker.number.float({ min: 10, max: 100, multipleOf: 0.02 }) + ' KB'
      } else if (subType === 'folder') {
        const path = new Array(10)
          .fill(0)
          .map(() => faker.system.directoryPath())
          .join('')
        data.path = path
        data.content = path.split('/').at(-1)
        data.size =
          faker.number.float({ min: 10, max: 100, multipleOf: 0.02 }) + ' KB'
      } else if (subType === 'folder,file') {
        const path = new Array(10)
          .fill(0)
          .map(() => faker.system.directoryPath())
          .join('')
        const files = new Array(3)
          .fill(0)
          .map(() => /* path + '/' + */ faker.system.commonFileName())
        data.path = path
        data.content = path.split('/').at(-1)
        data.files = files
      }
    }
    return {
      id: faker.string.uuid(),
      type,
      ...data,
      application: faker.person.fullName(),
      createTime: dayjs()
        .subtract(Math.floor(Math.random() * 100), 'day')
        .format('YYYY/MM/DD HH:mm:ss')
    }
  })
}

const mockData = genMockData(100)
mockData.sort((a, b) => (a.createTime < b.createTime ? 1 : -1))
console.log(mockData)

function searchKeyword(data: any, keyword: string) {
  if (!keyword) {
    return true
  }

  return data.content.includes(keyword)
  if (data.type === TYPE_VALUE.file) {
    if (data.subType === FILE_SUB_TYPE_VALUE.folderFile) {
      return data.files.some((v: any) => v.includes(keyword))
    } else {
      return data.content.some()
    }
  } else {
    return data.content.includes(keyword)
  }
}

async function fetchQuery(params: SearchParams) {
  console.log(params)
  const { keyword, type, currPage, pageSize } = params
  const data = mockData.filter((v) => {
    if (type === TYPE_VALUE.all) {
      return searchKeyword(v, keyword)
    } else {
      return type === v.type && searchKeyword(v, keyword)
    }
  })
  const start = pageSize * (currPage - 1)
  const end = start + pageSize
  const result = data.slice(start, end)
  return {
    result,
    totals: data.length
  }
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
    if (currPage === 1) {
      flattenData.value = []
    }
    const { result, totals } = await fetchQuery({
      ...params.value,
      currPage,
      pageSize
    })
    isFullLoad.value = result.length + flattenData.value.length === totals
    const groupRes = handleGroup(flattenData.value.concat(result))
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
