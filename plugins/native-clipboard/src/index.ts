import { platform } from 'os'

let NativeClipboard: any

if (platform() === 'win32') {
  NativeClipboard = require('../build/Release/native-clipboard.node')
}

export interface NativeClipboardType {
  /**
   * 监听剪贴板变化
   * @param {function(type, data, source, app): void} callback - 回调函数
   *    @param {"TEXT" | "IMAGE" | "FILE"} callback.type - 剪贴板类型
   *    @param {string} callback.data - 剪贴板内容
   *    @param {string} callback.source - 剪贴板来源 exe 路径
   *    @param {string} callback.app - 剪贴板来源应用程序名称
   */
  watch(
    callback: (
      type: 'TEXT' | 'IMAGE' | 'FILE',
      data: string,
      source: string,
      app: string
    ) => void
  ): void
  /**
   * 停止监听剪贴板
   */
  unwatch(): void
  /**
   * 获取当前窗口句柄
   */
  getCurrentWindowHandle(): string
  /**
   * 根据句柄激活窗口
   */
  activateWindowByHandle(hwnd: string): void
  /**
   * 根据句柄获取应用名称
   */
  getAppNameByHandle(hwnd: string): string
}

export default {
  watch(callback): void {
    return NativeClipboard.watch(callback)
  },
  unwatch(): void {
    return NativeClipboard.unwatch()
  },
  getCurrentWindowHandle(): string {
    return NativeClipboard.getCurrentWindowHandle()
  },
  activateWindowByHandle(hwnd: string): void {
    return NativeClipboard.activateWindowByHandle(hwnd)
  },
  getAppNameByHandle(hwnd: string): string {
    return NativeClipboard.getAppNameByHandle(hwnd)
  }
} as NativeClipboardType
