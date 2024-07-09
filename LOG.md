## 参考

> - https://www.cnblogs.com/xiaoniuzai/p/12597077.html
> - https://blog.csdn.net/2301_79959413/article/details/133343585
> - https://github.com/nodejs/node-gyp?tab=readme-ov-file#on-windows
> - https://blog.csdn.net/technologyleader/article/details/126488712
> - https://www.python.org/ftp/python/2.7/python-2.7.amd64.msi
> - https://nodejs.cn/api/addons.html#

> - https://github.com/nodejs/node-addon-api/blob/main/doc/setup.md （官方文档给力，打包 + 调用终于不报错了） !!!!!!!

> - Node Addon Api: https://github.com/nodejs/node-addon-api/blob/main/doc/README.md

```shell
npm install --global --production windows-build-tools@4.0.0
```

## 难点

### 如何监听剪贴板

由 `C++` 插件提供监听剪贴板变化的方法，需要外部传入一个回调，当剪贴板变化时触发该回调函数；同时也需要提供一个卸载监听的方法，在 App 关闭前卸载监听。

### 如何展示剪贴版中的内容

## log

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
