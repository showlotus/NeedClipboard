import { Ref, ref } from 'vue'
import { faker } from '@faker-js/faker'
import { SearchParams } from '@/stores/main'
import dayjs from 'dayjs'

function genMockData(n = 10) {
  const types = [
    'Color',
    'Text',
    'Image',
    'Link',
    'File',
    'FolderFile',
    'Folder'
  ]
  return new Array(n).fill(0).map((_, i) => {
    const type = types[i % types.length]
    const data = {} as any
    if (type === 'Color') {
      data.desc = faker.color.rgb({ format: 'css' })
    } else if (type === 'Text') {
      data.desc = faker.string.alpha({ length: { min: 10, max: 20 } })
      data.characters = data.desc.length
    } else if (type === 'Image') {
      data.desc = 'Image(640 x 480)'
      data.url = faker.image.dataUri({ type: 'svg-base64' })
      data.demensions = '640×480'
      data.size = '200 KB'
    } else if (type === 'Link') {
      const url = faker.internet.url()
      data.desc = url
    } else if (type === 'File') {
      data.desc = faker.system.commonFileName()
      data.path = faker.system.filePath()
      data.size =
        faker.number.float({ min: 10, max: 100, multipleOf: 0.02 }) + ' KB'
    } else if (type === 'Folder') {
      const path = faker.system.directoryPath()
      data.desc = path
      data.size =
        faker.number.float({ min: 10, max: 100, multipleOf: 0.02 }) + ' KB'
      data.path = path
    } else if (type === 'FolderFile') {
      const path = faker.system.directoryPath()
      data.desc = path
      data.path = path
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

async function fetchQuery(params: SearchParams) {
  console.log(params)
  return {
    result: [{}],
    totals: 10
  }
}

export function useSearch(params: Ref<SearchParams>) {
  let currPage = 1
  const pageSize = 10
  const isFullLoad = ref(false)
  const data = ref<any[]>([])
  const search = async (page?: number) => {
    currPage = !page ? 1 : page
    const { result, totals } = await fetchQuery({
      ...params.value,
      currPage,
      pageSize
    })
    isFullLoad.value = result.length + data.value.length === totals
    // TODO 对数据进行分组
    data.value = data.value.concat(result)
    console.log(data.value)
    console.log(genMockData())
  }

  const next = () => {
    if (isFullLoad.value) {
      return
    }
    search(++currPage)
  }
  return { data, search, next, isFullLoad }
}
