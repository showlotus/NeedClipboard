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

export function calculateBase64Size(base64String: string) {
  const base64Data = base64String.split(',')[1]
  const padding = (base64Data.match(/=/g) || []).length
  const sizeInBytes = ((base64Data.length * 3) / 4 - padding) / 1024
  const unitArr = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const idx = Math.floor(Math.log(sizeInBytes) / Math.log(1024))
  const size = (sizeInBytes / Math.pow(1024, idx)).toFixed(2)
  return `${size} ${unitArr[idx]}`
}

export function calculateBase64Size2(base64String: string) {
  const [prefix, base64Data] = base64String.split(',')
  const mime = prefix.split(/:|;/)[1]
  const bstr = atob(base64Data)
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  const bytes = new File([u8arr], 'image', { type: mime }).size / 1024
  console.log(bytes)
  const unitArr = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const idx = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = (bytes / Math.pow(1024, idx)).toFixed(2)
  return `${size} ${unitArr[idx]}`
}

export function genMockApplications() {
  return [
    {
      name: 'Visual Studio Code',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHsSURBVDhPjdLfT9NQFMDxs9XAJCE65lQiJKxlxH8A/wR98n/QxMSYCP4a2yJsgTrYBpoVHzTGGIMyMbq5OSJjbL4RYkIYlG4sxviAProHugIvkBxvK12OD2Rr8nnqvd/enlyAJh9eLNy5MLe9LySrh/zzH/Emt/1b1jlWmIHAV9T1ze8ahET10PXsu9Qw5AjkkzBcQFNfRkPq2MBFf95hH8kl4GEeKXdaQwpOS+WPML2Ftli5wktlt17UN9v8uQr4c0hxvkXNnWIBAiBWRhMXK9XORuUbNl+2At5FpNp82W/3U0p3b1JDCpyPlVvwpIT/EVcQhhbqOrxfJvWTIWJbb6KGlDGDrkjpknVK2YMpBesmVtHqWdA6vfNXzEGxwEnhQw0p4935B5l+i3dpFyIyQnSzzhqVNeekcpkEbMJ7FiDAfi9zE+5m0OBhQwsVEcIsQrRPyOGjX2jl52pIAQx+RpNlMK22e7LXuHG5BOPsNERLSF6++u7nOT6uIgWtA+k4DKSRu51SnJ5Pgv6lU+FNOyeuK/BoAylLaEN1zapIHXuR9EiLWJwFcR0p1xsWIBpe5RPB4lsYZXM50jOjItUwoC/gAsWnEGQRpuf1jqH7ZfXgjPQr0lRAX2QNrl13TP/Wul78OXBI26/MjX8B31GcF8UYjTwAAAAASUVORK5CYII='
    },
    {
      name: 'Clash Verge',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALdSURBVDhPbVNrTxNBFF31Txli4g/yQ6NYWyi0uyDBIB9QxNgaMRHS8BKRCAF5VGgKPspSW1EJlVcppdilLXS72+3MHG8LBTRO9mbu3jvnnnsmcyWJFoCrlb3qJzLX+Uiknz0M7DF5ijF5mvHOhSQfWvNjO193fq6GuQw23673GO5ZlBqnUHZPoyzPwJJnYbnnKbYAwx2GOZbyEubKv8RSzrcW0G4HkG8KiKISYIY8Kwx5HobnA3Q5KApKmOWboyJbH0fOlw1eJpYyY8meHdsKUh7V1DpU5F2L0AlYUII4UZaR93xB1vUV2c5N/Jb3zf07WeTeWL6qHH1Lv/7TEcfPxriIu9ZhHVnQQwc4qP+IQ/snpO1hHNz9SjEN5SOGfU8GCXeB77osFH/hhrTj1/rVO0lEnEkWU1JgBqfugMJqDiehDE6WNOir+WqMGwKJ9gK2mk226eQ4GMCQpLZqex/tGSzZNfFFyaFcFAB9/1uccpsPSthoYiLeBGy1Iy0tOXMs5DhG0H6CJXcBVuECLRj5/OK/TLmNNo51Aq97gB9uCGnRUWCLTh1zNh3RXqNKnApbSEfL500cqhxa7LTQbp/ANwfwXQZiHioQajGT8/cMTNuKItpXqh7aXrDw+dlpMcGAlR6GdPi0wPaAwIoDIkIdxCoSov2Wf8pWwvsGk03YS0iECXG2dlY5kmsXElKqQIja/ySDhRpIxgCGJW0DdZP1DBMNZTHuZBhxMKjvOIrHALPoCkiJTr46KTBO4GlinlPAZ8g/2sTN6luIDHPv4C2BUTc3B5qBXjvQ1wKMPwfGyHrbAC8x+ik2eh/mIOXVN3hRm4vKMF2Ze4rgCxvwqhn8ZQuYV4Z4QizdZD3k+9rAelvBvfeAqedYJsy10+k7m6rKHnoNn9cFPG4EntAtP20lMFm3AjyqFKL2A8RcA9ewf41zkp7nxCCGfB1IdykQXS3E3on0uyEM79Y0XyL+A5Wb/oFWe3GcAAAAAElFTkSuQmCC'
    },
    {
      name: 'Microsoft Edge',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMcSURBVDhPXdNrSJNhFAfw11S8TLdZVEJUBH3qOqe00pGS2EU3tzSzpBUllUU3CEsp0zA1y+vMlbaCihC7YB+KIGvbO5fLvOTu2eYNStMuq7RBSPv3XtTKA+fD8+H8znkOz0MQMyJK+10dpR91R+o/QNjqQJTRhnUdXYg1kZ546xNdYt+DxTNrmHOk1iOO1Ix7onTfEEF+QERLH1YZ7BC0mql8g+jOFsSZn0Hy7o53+6BK/R9CFwtf/PAKtW5E6D5iNTmIlXonA6w0sMCa163YaL+PLT2NUAxdROZI9l9E8PynR6gZg0D7GQLdMFaRA1hOOrBMb6bShAhjO9Z2aBBvvQepsx67h85h/+hRHPu6V0ysbvaoBS/GsEjtwJySNswu7cbcyyaEVxixpKGTAegUGkmIOx9jk7UecmcZDn46hCNfMlzEiqaR3/zClwgttoFX5kRYZS/mKPswT9WP8Ku9WFDbxgACgxYx7feQaKtAqqsAisEs7B/aAWKhuh9B+SZwSnoQWuqkEBeLFHVhcYX51nyVi1z64BVExruIa69GoqUEMutxKAb24cB7CQi6a0CBHUEX3iK4uAchpe/AzdaBk3TJOLVp0aOXvWsNVxHbVo6EriIGSLenYU8vBfjl2eCf70DAeQcCaaTQDo68BqEpdSenAKH2ulpEKiFuLcfm1wchM2VipyMFuxxxbmLWGRv88uzTSNCxZoTIr1DANf00oKkfFmkvIkZfgA0tByDvlGN7d4I3wxKdTvjk2Nw04juJBGc+RMhWFUJSVF5O2s10GhFpC8UiTXHTejJrOKEl3Z1klDaldcSK2QanrWqfXBsY5KwdAYeesgA9xbbrXm5q3f+vbnKsMEkZg7ORY/X45FoZxP+EgSquZQAa4qbWg5tybYInq3Vxk2t0fGm1my+pnOAnlnn+AqetYiLH4p1CghUNLCBTgru1lgbAk6vAk10BP7kafEmFl5pg8gpTDIOwk/jmmBGsaGSvIa1CaHIVeMlKNiVVnjBJ1Yzif78WtRO/XMu4b64F/qc6EHi4GRxqsbMVt39xpcobM7/yH8MX8z4v1sxGAAAAAElFTkSuQmCC'
    },
    {
      name: 'Windows 资源管理器',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJnSURBVDhPpZNZSJRRGIZ/TE0TR0fzIvDCCAIvAitJKTXLJZfc2iPqosCKMEsrW6nEVpMku4ksvYsCU1pgXFNzbWZ0dBx1dHT0oruWCSJNnf/pzMxPlBhBffDcvc97Ps7hSP89ExVSpYAFsFkrpEwl9udZQPwVR0mYEl14rI8lxv+CIzO/3PpIYqxcqpS0pRJ1RRK189CXh2Dr3APmHBg+DIOHwLQfjHuhfzv0pWPXxSPZxwph8iZMFIH1CoxdAEsBjObBULYQRElfplPAkAq9ydCTCPp4wWYkLGdE8KCr3bQPBoRg3OU6pT9LEbcq4haBS0S3EbTRomDwgCKK1RyicYciZihiiiBJiAmKGCvEGHi3Abk7QhQ4xIHdTlHu24ZsyETuTROkIvckIesTkXVxyNpNAiFqo4QYidwVjr0jTBQYdzrXne3J4H1DIiMvYjHXxGCujsL8fL0gQrAOc1U4luo1fGlay1zHauztq5hrCxUFYl3ZkM6kJo7chyUsLbP+JPDeOIGlFgLujqIuGUFdPEz+g8t8bQpltnUlsy0rRIEhDbs+GVNVlDMY4AjeMeN/ewj/W4P43TDhd92Iqqgf30IDvld7+axZzkxzCDNNwaJAXJBdl4DxWaQIDqC61o866z7qlOLf8M8sY8n5brzPdvLpdTDfG5cxXR8kCsSz2MUFGZ+G43NJh89FrSt4rgvvgg68Trez+FQbi/Na8TzZgkduMx9fBjFdF8BUrUoU6GJs9u5ojE/C8HIE8986g54nmvE4/gb3nEbcjzWw6Gg9bkdqccvW8KFGxZTGh2+vvGzKj/jXkaQfu4s6znHuGNoAAAAASUVORK5CYII='
    },
    {
      name: '任务管理器',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAI4SURBVDhPxZPLbpJBHMXnAXwPfQF3ta66cWFMNNrEhXGjKxeaRmMTjWmbiFfAUoGCFixtsFQK5eMWCwhNWxQtakKtglAupeXyQWtV7t9x5isQ9QU6yS9n/mdOzsxmyMEvVyCUcAZCcAXew+kPwfHmnUCB3RcU1eZZERh0BuddYTNsC8uYX1jC/OvFBOG8QaG08wMMnlH+n91/KDJKjB2YXX4Q1vR34AaX2g91aIc7FETKIjOcB8Ts9HcPwwkeh+6si1rg90OiUizhbYy4092ZMWV2CmTG5uka+rdZ9OizGHSkkW97+SKFqi6YRb8hTudSl8lZDmTa4u4al0wJXHDvoleXgXctj+hmEbkij1yBx7A7hd7xuLjvMGG0grCWjnFmOoUri79w2beHY5NbOCKPI5opIJcvYsC6gaPqJK5aU+jRJnHx5QY0hlkQ1jJE20OxHI7TmwdDNdwK13FtuYITpjzkvjS28gWcNyZx1lbCOY6+1LOHfnsZKp0RhLWcmuNxWPYdp608hj41IIm0RB0IVtA3lUWfPo2Tphxuhqq4vVrH4IcafelvKLQGECVtub70EyPhKqSRBsa+taCOAaqYAOlaE3c/1jC8WoXkcx3yL00oowIUX1s0X4NcrQNhLZpIBa8SDdjSLdgzAlybApwUjs5zySbM9MxClcu04Gj7L9ZreDA6LhCZSpegQKqagFT5XOTx02d4NMbQiqGHCg1VDe4/UQv35CqBepDIlIJkVBlv/4gDW4T8AWNtemiHN++0AAAAAElFTkSuQmCC'
    },
    {
      name: '设置',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAC6SURBVDhPpZGxDcIwEEUzAiMwGmNQpmUKBsgKjEAfCVHTUECXChmelW/dnR0JyV/6kfPv5/vuMgzHOXWxJR6mR+bWu2MUxsszgdfySbvxlskZUIv+KmB/umdzC9SivwSQjuF8fa/2GtTwuE54MJ8FLccdaAyh1FsG+7GIJrgLZGBZgrRIAW/RdegK6B7BFoEzrHV7AXABsOs3WmLYArXorwJIB7TMsqDadzeLlfAj88Ud2HfHpvg35/QFZ+vbxwDykMcAAAAASUVORK5CYII='
    },
    {
      name: 'Notepad',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIoSURBVDhPhZDbU1JhFMV5yAem/iGnG2WgoIFWapJl2cXKFEqzmmb6C6yZ8qF6LTXUakLNFDGLuCsKyEVKUzQNDletGR9Xm4/THO0wtmfWzPfw/dZae0v+naLWx9k9ui79bu+C0+KIbj2I/Ma+juco7XfibnCD3s9wzGBHmy+FvfSW9VjR4uGgNQW3eEyYZuca7oc3cS+0gTuBLG7PZdDmT+OmNwndbAKtMxxuTMdxfSqGOnMEPCZMk32VUrPoILCdwFuUqv8LevLgNfdPNLnWUGMKiw0u26IMLNJ37aqLFHRqNCQ2aLQssbqaQS/URi8q3s2SZqB664HyzTRKSYqBKZy3RlE5EhAbNHz6vmPPq+51XKG7XHL8YKkXrCto+LKMsxSkHvaLDeonFxhYqPZ2aScXUT7oExtozV/pQOsoy9V9navrhnzAhZI+F472OSEzOHC4146aiW9Q0no8Jkzt+Dyr22hbpT1XcI7q1n9ewhlarY5SaycWUE0hJ8cjkNNdeEyY6rEw27NQ7e2qHA2jhBrymDBVI0E60HK+7qt83UO9NhzotmF/txXFLy0ofmHBcfon63eLDTTDc9BS3dMfF9merK4pgqqxeWgoNQeWvw9ASf8OGpxigxNGz449c2CurvpDCBUEqggsG/JDYfThSI9FbGB+okMmk0E6nUYqlWJKJpNIJBLgOI4pHo8jFothqLNZbPBUJd18pJDiofz/6lRIf+UpieQP9dD8kPxOLfAAAAAASUVORK5CYII='
    },
    {
      name: 'OUTLOOK',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFlSURBVDhPtZPLSsNAFIYPCELBtxF8GkEQFBfai8ZU3AruXAnSVVdCRWgXim4EkaZpUi0GBHHR2otWLNVgaWytJXqcGTNDpgQFLz/8zHAy85FzGRCK5UOwZI4Tz0JU34RI7gTmszYsaEhW9E4FSDUyoBRKsGwiKAbCInFMR4jmEMLE3wLiBQSV+N8BNOZ3ROuRVDckgLJfx/vOAJ2+i+tHDRyJkoMeYFjHpfYnhAMmU2X2IWU94uHVE9vHMtVAQLbSwbEVco/+CQfoNQe3zx9ECpfNLlqNZwFIX9jSZWWvJgPaLy5O7ZQFIKE38dV9F4BRUp/VgzqGVBPjJFUqCdAbvOH07rUEoDEOSBhNFqcQLglg3XUxedYSgOKtg8UbR6pBxe6zlUsCzKWrLJg8bYkiztCUAorIJQFoG9dI62gtqGkb/XMwLJaev41/Mkg/G+VfPyYu+pzV/IT3nLcIQIOw1v4aAPABUxc7Sp66oigAAAAASUVORK5CYII='
    },
    {
      name: 'WeLinkPC',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAF7SURBVDhPpVPLSwJBHN7/K8pDUJQbCEUiGB2id/QSM0ixQw8hrCgikqT3oUuHCjSoDgVFoFT3IHpAlhT7dF11/doZUVjZQ+bhg/n9vsdvZphhRNYS+LHWZHm2Fpz1byBa4iFehizMRH8B8TKVTC4H8TJmRCWgAeLkMOR5n6lAHOmC5HebcgQ0QPKOI/f+aipQtjcgL86ZcgSFI7Q3Ia9p4O3N4DtsUPbDkKZGqUC9iEIc6wFnq4eyt4nMzRVS60tlATpyby+QfC7IywGol2fIPsTAtTYg+xgH19ZIe7nnJygHW9ASH0itLhgD1PMInZw+PYIcnEFeTUN09VMjx9YV6mkPMrfXekgYvNNmDEitBZGJ3yF7HwPvYKF9JaAc7kLZCVFeS35CDq1AdA/Q6cWLLQUIvU7kJQlq9ITWauSYTpP8E7SWZr10F9p3UteJEAY7jQEEQrcDnN1aqPXzC31OcC2WEk+2LXqG6IUWe4aA/6D6p1z1Z6ruO1sCv+bRqURsuTZHAAAAAElFTkSuQmCC'
    }
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
  const DEFAULT_PAGE_SIZE = 20
  const isFullLoad = ref(false)
  const groupedData = ref<any[]>([])
  const flattenData = ref<any[]>([])
  const search = async (options?: { page: number; pageSize?: number }) => {
    const { page, pageSize = DEFAULT_PAGE_SIZE } = options || { page: 1 }
    currPage = page
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

  const next = async () => {
    if (isFullLoad.value) {
      return
    }
    await search({ page: ++currPage })
  }

  const refresh = async () => {
    const page = currPage
    await search({ page: 1, pageSize: flattenData.value.length })
    currPage = page
  }
  return { groupedData, flattenData, search, next, refresh, isFullLoad }
}
