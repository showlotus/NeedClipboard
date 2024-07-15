## 参考

> - https://www.cnblogs.com/xiaoniuzai/p/12597077.html
> - https://blog.csdn.net/2301_79959413/article/details/133343585
> - https://github.com/nodejs/node-gyp?tab=readme-ov-file#on-windows
> - https://blog.csdn.net/technologyleader/article/details/126488712
> - https://www.python.org/ftp/python/2.7/python-2.7.amd64.msi
> - https://nodejs.cn/api/addons.html#

> - https://github.com/nodejs/node-addon-api/blob/main/doc/setup.md （官方文档给力，打包 + 调用终于不报错了） !!!!!!!

> - Node Addon Api: https://github.com/nodejs/node-addon-api/blob/main/doc/README.md
> - 微软剪贴板 Api: https://learn.microsoft.com/zh-cn/windows/win32/dataxchg/clipboard

```shell
npm install --global --production windows-build-tools@4.0.0
```

## 难点

### 如何监听剪贴板

由 `C++` 插件提供监听剪贴板变化的方法，需要外部传入一个回调，当剪贴板变化时触发该回调函数；同时也需要提供一个卸载监听的方法，在 App 关闭前卸载监听。

### 如何展示剪贴版中的内容

## log

### 07/15

- 研究了好久，怎么减少复制后图片的体积。保存为二进制流也试了，最后发现同一张图片重复复制后，图片的体积稳定在一个 Copy 后的值左右，好奇怪！将从剪贴板获取到的图片（这时图片已经变大了）再写入剪贴板时，图片就不会增大了！感觉可能是，新图片的编码符合 electron 内部的要求，所以不会再对其进行重新编码了。试了一下，将剪贴板上的图片粘贴到飞书文档里，图片也不会变大。明天再用 Word 试一试，如果图片也不变大了，那就说明从剪贴板读取图片后，新图片 base64 的编码就已经符合要求了，后续再写入剪贴板时，就不会在对其进行编码了。

### 07/14

- Electron 将多个文件复制到剪贴板，试了好多种方法，都不太行。于是该用通过 C++ 实现，无敌的 C++ ！！！
- 以及从剪贴板中获取文件路径时乱码了，又是通过 C++ 处理的。
- 遇到一个问题，将 base64 写入剪贴板后，回导致图片变大。得想办法处理一下。

### 07/13

- 剪贴板格式对标 Raycast 再新增两种：Link、Color。

- 数据库表设计：设计一个主表记录一些公有属性字段，以及主键，还有若干不同类型的其他表，针对不同类型记录对应类型的特殊字段。

  - 查询：

    - 全类型查询：按关键词 `keyword` 查询，首先查询 `ClipboardTable` 表，查询条件为 `contentType` 为 `Text`/`File`/`Link`/`Color` 的数据，然后再根据 `contentType` 查找对应的表。

      - 如果是 `contentType` 为 `Text`，根据主键 `id` 查找表 `TextTable`，且字段 `content` 匹配关键字 `keyword`。
      - 如果是 `contentType` 为 `File`，根据主键 `id` 查找表 `FileTable`，且字段 `path` 匹配关键字 `keyword`。
      - 如果是 `contentType` 为 `Link`，根据主键 `id` 查找表 `LinkTable`，且字段 `content` 匹配关键字 `keyword`。
      - 如果是 `contentType` 为 `Color`，根据主键 `id` 查找表 `ColorTable`，且字段 `content` 匹配关键字 `keyword`。

    - 锁定类型查询：根据 `contentType` 查找对应的表，且对应字段匹配关键字 `keyword`。

  - 新增：

    - 先在 `ClipboardTable` 表中新增一条记录，获取主键后，再根据 `contentType` 向对应的表中插入数据。

  - 删除：

    - 先删除对应类型表中的记录，再删除 `ClipboardTable` 表中的数据。

  - 修改：

    - 选中某条记录时，将当前记录的创建时间更新为当前时间。

  - ClipboardTable，主表，记录主键和一些公有属性字段。

    |   字段名    |                                类型                                |                  描述                  |
    | :---------: | :----------------------------------------------------------------: | :------------------------------------: |
    |     id      |                              `Number`                              |               主键，自增               |
    | contentType | `String`，可选值：`Text` \| `File` \| `Image` \| `Link` \| `Color` |                  类型                  |
    | application |                         `String` 或 `Null`                         |                来源应用                |
    | createTime  |                              `String`                              | 创建时间，格式为 `yyyy-MM-DD HH:mm:ss` |

  - TextTable，记录 Content Type 为 `Text` 类型的数据

    |   字段名    |            类型             |             描述              |
    | :---------: | :-------------------------: | :---------------------------: |
    |     id      |          `Number`           | 外键，来源自 `ClipboardTable` |
    | contentType | `String`，值为固定值 `Text` |             类型              |
    |   content   |          `String`           |           文本内容            |
    | characters  |          `Number`           |            字符数             |

  - FileTable，记录 Content Type 为 `File` 类型的数据

    |   字段名    |            类型             |                描述                |
    | :---------: | :-------------------------: | :--------------------------------: |
    |     id      |          `Number`           |   外键，来源自 `ClipboardTable`    |
    | contentType | `String`，值为固定值 `File` |                类型                |
    |    path     |          `String`           | 文件路径，例如 `~/x/xx...src/code` |
    |    size     |          `String`           |       文件大小，例如 `16 KB`       |

  - ImageTable，记录 Content Type 为 `Image` 类型的数据

    |   字段名    |             类型             |              描述               |
    | :---------: | :--------------------------: | :-----------------------------: |
    |     id      |           `Number`           |  外键，来源自 `ClipboardTable`  |
    | contentType | `String`，值为固定值 `Image` |              类型               |
    |     url     |           `String`           |    图片的 URL，`Base64` 格式    |
    |   miniUrl   |           `String`           | 图片缩略图的 URL，`Base64` 格式 |
    | dimensions  |           `String`           |    图片尺寸，例如 `200×400`     |
    |    size     |           `String`           |     图片大小，例如 `20 KB`      |

  - LinkTable，记录 Content Type 为 `Link` 类型的数据

    |   字段名   |   类型   |             描述              |
    | :--------: | :------: | :---------------------------: |
    |     id     | `Number` | 外键，来源自 `ClipboardTable` |
    |  content   | `String` |           文本内容            |
    | characters | `Number` |            字符数             |

  - ColorTable，记录 Content Type 为 `Color` 类型的数据

    | 字段名  |   类型   |             描述              |
    | :-----: | :------: | :---------------------------: |
    |   id    | `Number` | 外键，来源自 `ClipboardTable` |
    | content | `String` |           文本内容            |

### 07/12

- 设置的配置文件借助 `electron-store` 存储在 （[app.getPath('userData')](https://www.electronjs.org/zh/docs/latest/api/app#appgetpathname)）下的 `settings.json` 中。
  ```json
  // settings.json
  {
    // 开机启动
    "openAtLogin": true,
    // 主题
    "theme": "system", // "light" or "dark"
    // 语言
    "language": "zh_CN", // "en_US"
    // 最大保留天数
    "maxRetainDays": 7, // 30 or 90 or 365 or Infinity/Never
    // 激活快捷键
    "shortcutKey": "Alt+Shift+C"
  }
  ```
- 预研：
  - 设置背景高斯模糊（不能设置全局背景色，否则模糊不生效）。
  - 任务栏右键菜单动态切换主题，改个属性就能实现，简简单单 ~
  - 借助 `vue-i18n` 实现语言切换。
- 剪贴板记录存储，主要分为三种格式：

  - 纯文本：

    ```json
    {
      "data": "abcdefg",
      "Content type": "Text",
      "Characters": 234
    }
    ```

  - 文件：

    ```json
    {
      "data": null,
      "Content type": "File",
      "Path": "~/xx/xxx...src/demo.png",
      "File size": "16 KB"
    }
    ```

  - 图片：

    ```json
    {
      "data": "data:image/jpeg;base64...",
      "Content type": "Image",
      "Dimensions": "200×400",
      "Image size": "33 KB"
    }
    ```

- 因为涉及到大数据的存储，使用 `JSON` 的话，不利于查询，就查了解决方案，找到两个库：

  - localForage：https://github.com/localForage/localForage 可以以键值对的形式存储 JS 中的数据类型。
  - Dexie.js：https://github.com/dexie/Dexie.js 可以进行一些数据库的操作，功能更强大一点。因为要考虑到查询到功能，于是就采用这个库。可以在应用退出前，根据配置的 _最大保留天数_ 清理数据库中过期的数据。

    - [dexie-website](https://github.com/dexie/dexie-website)
    - 参考文档：https://blog.csdn.net/hjb2722404/article/details/118670300

### 07/10

- 系统托盘需要展示的菜单栏功能：
  - 开机启动，官方 API [getLoginItemSettings](https://www.electronjs.org/zh/docs/latest/api/app#appgetloginitemsettingsoptions-macos-windows)
  - 主题切换
    - 跟随系统
    - 浅色
    - 暗色
  - 退出
- 如何删除记录。

### 07/04

- 试了一下，直接用 `Base64` 格式展示，图片大小也不是很大，而且方便存储。刚好上次预研，看了一下如何把数据存储在本机上，找到一个库 `electron-store`，可以以 JSON 的格式记录，这样刚好记录 `Base64` 格式。
- 关于历史记录存储在本机上，还有需要考虑：存在哪个目录下，以及是否按当前时间拆分文件夹（具体到日应该就行）因为有一个配置，当前记录最大留存多久，刚好可以根据天来判断。

### 07/03

- 看了看 Raycast 中 Clipboard 的处理逻辑，如果是复制的某个文件，则直接引用这个文件的路径，进行展示什么的。如果文件被删除了，Clipboard 中也会同步删除剪贴板历史记录中的这个文件。
- 重点工作就是：怎么记录图片以及展示。

### 07/02

- 研究了一下主进程如何和渲染进程通信，试了一下把复制到的文本显示在渲染进程中，嘿嘿，效果不错。不过只能在 windows 虚拟机里开发，有些许麻烦，不过倒也还凑合。
- 纯文本展示还得考虑转义字符的问题，图片还不知道怎么展示为好。今天搜了搜解决方案，倒是可以转成 `Base64` 的格式，但是如果一个图片很大，转换后的结果就更大了..... 以及如何展示缩略图
- 文件的展示，之前想着直接引用复制的文件路径，但是如果源文件被删除了，那咋办?

### 07/01

- 本来想弄一个工作区的，结果死活弄不好，不是这报错就是那报错，算了，放弃了.....
- [clang-format config](https://www.cnblogs.com/oloroso/p/14699855.html)
