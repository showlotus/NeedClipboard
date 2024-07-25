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

### 07/25

- 周末浅浅地学习了 TDD 的相关知识，发现在项目里是可以用单元测试的，首先得把整个项目设计好。根据不同的功能拆分出一个个单独的模块，然后给这些单独的功能模块编写单元测试，这是可行的。在正式开发前，根据要实现的功能先写单元测试，然后再开发功能模块的具体实现。

### 07/20

- 起初发现 Raycast 打开后，面板内的输入框居然也能聚焦，并且后面的浏览器地址栏中的光标依然也在，起初以为是 Raycast 做了啥处理，后来试了试：点击微信聊天输入框后，再打开 Raycast ，光标就消失了，打开终端也是如此。那估计就是 Chrome 做了啥处理。还有一个更呆的，由于是在 Windows 虚拟机里开发，打开 Raycast 在本机系统里，俩都不是一个系统，我还搁那纳闷呢，居然还能这样，我真是个憨憨 😅。
- 测试 C++ 打包后的模块，总是需要启动 Electron 应用，后来发现，直接运行一个 node 脚本也是能测试的，这样就简单多了。
- 另外，陷入了一个误区，查资料搜索功能实现的代码时，总是想着直接用 node-addon 实现，但是一步到位的话，每次都得重新打包，然后测试，就很麻烦。于是想了想，先通过原生 C++ 实现，然后再去研究 node-addon 的版本，主要功能逻辑还是需要通过 C++ 实现，node-addon 做的只是处理参数：传入参数和返回参数，基本上没啥需要特别处理的逻辑。
- 需要实现选中某个记录后，自动填充到当前光标聚焦的应用中。

### 07/17

- 居然可以将 `Ctrl` + `C` 录制为快捷键，嘶...，这样会导致 `Ctrl` + `C` 不会触发复制。
- 默认的快捷键由 `Alt` + `Shift` + `C` 改为了 `Alt` + `V`，更方便一点。
- 昨天看书《微前端的设计与实现》里提到了一种架构设计：前端层、API 层、持久层。然后联想到最近在预研这个剪贴板功能实现的时候，大多数都是通过主进程 `ipcMain` 和渲染进程 `ipcRender` 间进行通信，以及需要用到 `IndexedDB` 去存储剪贴板的历史记录，刚好和这种设计不谋而合。前端层对应的就是页面，持久层就是数据库，对应 `IndexedDB`，而 API 层就可以作为主进程和渲染进程间通信的抽象，以及前端层需要操作数据库的抽象。所以需要重点设计这个 API 层，下列操作都通过 API 层去实现：
  - 主进程与渲染进程通信（例如，获取/更新全局设置）
  - 操作数据库（查询/更改/删除/清空数据库）

### 07/16

- 在 Word 中图片也不会变大，不过有一点就是，粘贴在 Word 中后，图片的尺寸默认会变大一点，导致再从 Word 中复制图片时，图片体积会增大很多。关于 Office 系列应用的复制粘贴在后续版本再实现叭，现在暂不考虑了。
- 在配置中自定义录制全局快捷键，借鉴 VSCode 中快捷键的处理逻辑：
  - 按下某些键时，记录这些键到一个 Set 集合中，防止重复
  - 松开所有按键后，再按下新的键时，清空上一次记录的集合
  - 输入框聚焦时，移除所有全局快捷键
  - 输入框回车时，更新全局快捷键
  - 输入框失焦时，重新注册所有快捷键
- `Alt` + `D` 触发不了，也没法录制，很怪！
- 添加 eslint 配置
- 想加一个单元测试，但是看了看 electron 官方推荐的好像有点麻烦。如果实在要搞的话，就用官方推荐的再加上 Vitest 去做测试。不过首要前提是，要写好测试用例，打算先写一个文档版的，后续无论做不做单元测试，都以这个文档版的为准。

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
- 格式化 C++ 代码配置 [clang-format config](https://www.cnblogs.com/oloroso/p/14699855.html)
