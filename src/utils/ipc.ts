export async function getActiveApp() {
  return await window.ipcRenderer.invoke('get-active-app')
}
