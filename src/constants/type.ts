import { OptionType } from '@/hooks/useTypeOptions'

export const TYPE_VALUE: Record<Lowercase<OptionType>, OptionType> = {
  all: 'All',
  text: 'Text',
  image: 'Image',
  color: 'Color',
  file: 'File',
  link: 'Link'
}

export const FILE_SUB_TYPE_VALUE = {
  file: 'file',
  folder: 'folder',
  folderFile: 'folder,file'
}
