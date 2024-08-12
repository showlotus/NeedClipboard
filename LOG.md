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

> - [如何更新](https://www.electronjs.org/zh/docs/latest/tutorial/%E6%8E%A8%E9%80%81%E6%9B%B4%E6%96%B0%E6%95%99%E7%A8%8B)

```shell
npm install --global --production windows-build-tools@4.0.0
```

## 难点

### 需要 C++ 实现的功能

- 监听剪贴板变化（需要外部传入一个回调，当剪贴板变化时触发该回调函数），同时提供当前剪贴板的文件类型；同时也需要提供一个卸载监听的方法，在 App 关闭前卸载监听；
- 将多个文件路径粘贴到剪贴板中（对于不存在的文件路径会怎样？）；
- 监听当前活动窗口的变化，比如，打开了 A 应用，然后打开剪贴板，选中某条内容后，关闭剪贴板，同时激活 A 应用。
- 将剪贴版中的内容自动回填到当前活动应用中。

### 如何监听剪贴板

由 `C++` 插件提供监听剪贴板变化的方法，需要外部传入一个回调，当剪贴板变化时触发该回调函数；同时也需要提供一个卸载监听的方法，在 App 关闭前卸载监听。

### 如何展示剪贴版中的内容

## log

### 08/12

- `use hook` snippet template:

  ```json
  {
    "export use hook": {
      "prefix": "euh",
      "body": ["export function $TM_FILENAME_BASE() {", "\treturn", "}", ""],
      "description": "export use hook"
    }
  }
  ```

- 新增了 `Color` 类型的图标展示和预览展示，还需要对颜色进行检测，判断是否是一个合法的颜色值，问了问 GPT，结果头一回知道还能用 `Option` 构造函数判断一个具名颜色是否是内置的颜色值。

  ```js
  function isColorNameValid(colorName) {
    const s = new Option().style
    s.color = colorName
    return s.color !== ''
  }
  ```

  方法是有了，明天写写测试用例，测一下这个方法。

### 08/11

- 研究了一下如何将剪贴板中选中的内容回填到当前活动活动窗口中，使用 C++ 内置的 `SendMessage(hwnd, WM_PASTE, 0, 0)` 事件不生效（有可能是不在同一个进程中？），然后又查到一种方案，手动触发 `Ctrl + V` 倒是能实现粘贴。好在能实现就行，（不过自动回填的前提是，需要判断当前窗口是否有光标聚焦，在考虑要不要判断🤔），后续可以再优化。同时还需要开启一个线程监听当前活动窗口，当需要回填时，聚焦该活动窗口。
- 全局语言切换倒腾了好久，明明语言已经切换了，但是视图就是不更新，把 `vue-i18n` 的官方文档看了又看，结果还是没用。最后突然想到 `t` 方法使用的地方不太对，不能用 `ref` 定义变量，应该用 `computed` 定义变量，这样才不会丢失语言的响应式，麻了，真是个笨比 🙃。

### 08/07

- 改了改配色（浅色主题还是白底好看），加上了设置面板，用一个自底向上的抽屉组件来实现。设置面板打开的时候，需要禁用全局快捷键，以及通过 `ESC` 键进行一些快捷操作时，还要选择合适的时机去关闭整个剪贴板，得想想怎么实现比较好，感觉通过一个栈去记录当前的浮层，应该可以实现。
  - 研究了一下 `element-plus` 里如果弹出多个弹窗时，点击 `Esc`，只会关闭最上层的弹窗。发现实现逻辑好复杂，看不太懂 [捂脸]，明天再研究一下，如果再看不懂就换个方法。
- 切换到系统主题后，修改当前系统主题也会同步更改剪贴板的主题色。
- 设置之间的联动，通过在设置面板里修改主题，同步更改整个应用的主题，而且在系统托盘里也能修改。在想需不需要支持在配置文件中修改主题后，也能实现同步？
- 把配置面板中的一些配置完善了一下，就是配置有点少，需要调整一下排版，怎么让它看起来好看一点。

### 08/06

- 在 Mac 电脑上可能由于显示器分辨率很高，所以图标看起来贼清晰，然而在 windows 系统上，有些图标就糊糊的....
- 大致知道原因了，因为导出 SVG 的时候，有些图标的宽高比不是 1:1，导致在一个正方形容器里撑开展示的时候，会有部分比例失调，重新导出一个宽高比为 1:1 的 SVG 应该就可以了。（重新导出了一下，还是有点糊糊的，感觉还是显示器的问题，单独针对不同的图标设置了宽和高，看着还可以，木得办法了...）
- 底部快捷键提示组件做了一下，还差一个 logo，以及设置面板的打开逻辑。

### 08/05

- 周日开始着手自己画图标，今天下班回来就给六个图标画完了，嘿嘿，贼好看～

### 08/03

- 获取新数据时，直接将整个列表重新排序，这样处理比较方便点。
- 关于内容区的展示，也按照类型进行分别展示，主要分为：纯文本、图片、颜色、文件、文件夹、文件列表。
- 而在列表里也需要根据类型在前面加一个图标作为区分，翻了翻图标库，找到几个比较满意的，但是风格不太一致，在想要不要自己重新画一批图标。

### 08/02

- 按下 `Up` 和 `Down` 两个按键时，显示 `el-scrollbar` 滚动条，是通过额外追加 class 覆写样式实现的，导致没有动画效果，有些生硬。而原生的样式是通过鼠标移入和移除触发的，并且还有渐变动画。想到一个妙招：通过 `dispatchEvent` 手动触发元素上绑定的 `mousemove` 和 `mouseleave` 事件，这样就可以和原样式保持一致，而且还不用写多余的样式，完美！
- 加上了无限滚动，踩了一个坑：`el-scrollbar` 和 `v-infinite-scroll` 同时使用时，指令不能直接写在 `el-scrollbar` 上，需要在内部新建一个元素，在这个元素上添加指令，而且还不能开启 `overflow: auto`。

### 08/01

- 尝试着给 `date.ts` 下的所有日期校验函数，写了些单元测试用例，感觉挺有意思的，越写越上头，嘿嘿。
- 将数据按照创建日期进行分组展示，通过 `Up` 和 `Down` 两个按键控制聚焦的项。
- 浅色主题的背景色和边框颜色调整了一下，纯白色太刺眼了，稍微灰一点点，柔和一些。

### 07/31

- 输入框自动聚焦，以及下拉菜单快捷键触发。

### 07/29

- 安装 `dayjs`、`hotkeys-js`

  ```shell
  pnpm add -D dayjs hotkeys-js
  ```

### 07/28

- 把界面布局整了整，tailwindcss 用的是越来越顺手了，以及两种主题的色调。

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
