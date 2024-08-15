import { Ref, ref } from 'vue'
import { faker } from '@faker-js/faker'
import { SearchParams } from '@/stores/main'
import dayjs from 'dayjs'

function genMockData(n = 10) {
  const t = ['Text', 'Image', 'File', 'Link', 'Color']
  return new Array(n).fill(0).map((_, i) => {
    const type = t[i % t.length]
    const data = { subType: null } as any
    if (type === 'Color') {
      data.desc = faker.color.rgb({ format: 'css' })
    } else if (type === 'Text') {
      data.desc = faker.string.alpha({ length: { min: 10, max: 20 } })
      data.characters = data.desc.length
    } else if (type === 'Image') {
      data.desc = 'Image(640×480)'
      data.url = faker.image.dataUri({ type: 'svg-base64' })
      data.dimensions = '640×480'
      data.size = '200 KB'
    } else if (type === 'Link') {
      const url = faker.internet.url()
      data.desc = url
    } else if (type === 'File') {
      const subType = ['file', 'folder', 'folder,file'][i % 3]
      data.subType = subType
      if (subType === 'file') {
        data.desc = faker.system.commonFileName()
        data.path = faker.system.filePath()
        data.size =
          faker.number.float({ min: 10, max: 100, multipleOf: 0.02 }) + ' KB'
      } else if (subType === 'folder') {
        const path = faker.system.directoryPath()
        data.desc = path
        data.size =
          faker.number.float({ min: 10, max: 100, multipleOf: 0.02 }) + ' KB'
        data.path = path
      } else if (subType === 'folder,file') {
        const path = faker.system.directoryPath()
        data.desc = path
        data.path = path
      }
    }
    return {
      id: faker.string.uuid(),
      type,
      ...data,
      application: null,
      createDate: dayjs()
        .subtract(Math.floor(Math.random() * 100), 'day')
        .format('YYYY/MM/DD HH:mm:ss')
    }
  })
}

const mockData = genMockData(100)
mockData.sort((a, b) => (a.createDate < b.createDate ? 1 : -1))
console.log(mockData)

async function fetchQuery(params: SearchParams) {
  console.log(params)
  const { keyword, type, currPage, pageSize } = params
  const data = mockData.filter((v) => {
    if (type === 'all') {
      return !keyword || v.desc.includes(keyword)
    } else {
      return type === v.type && (!keyword || v.desc.includes(keyword))
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

export function useSearch(params: Ref<SearchParams>) {
  let currPage = 1
  const pageSize = 20
  const isFullLoad = ref(false)
  const data = ref<any[]>([])
  const search = async (page?: number) => {
    currPage = !page ? 1 : page
    if (currPage === 1) {
      data.value = []
    }
    const { result, totals } = await fetchQuery({
      ...params.value,
      currPage,
      pageSize
    })
    isFullLoad.value = result.length + data.value.length === totals
    // TODO 对数据进行分组
    data.value = data.value.concat(result)
    console.log('search result', data.value)
  }

  const next = () => {
    if (isFullLoad.value) {
      return
    }
    search(++currPage)
  }
  return { data, search, next, isFullLoad }
}
