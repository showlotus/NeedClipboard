export function getActiveApp() {
  return window.ipcRenderer.invoke('get-active-app')
}

export function updateActiveShortcut(val: string) {
  return window.ipcRenderer.invoke('update-shortcut', val)
}
