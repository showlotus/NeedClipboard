/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

declare module '*.vue' {
  import type { DefineComponent, ComponentCustomProperties } from 'vue'
  const component: DefineComponent<{}, {}, any>

  export interface ComponentCustomProperties {
    $t: any
  }

  export default component
}

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer
}
