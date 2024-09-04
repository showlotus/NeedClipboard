export function getTheme() {
  return window.ipcRenderer.invoke('get-theme')
}

export async function useSystemTheme() {
  window.ipcRenderer.invoke('set-theme', 'system')
  const theme = await getTheme()
  if (theme === 'light') {
    document.querySelector('html')!.classList.remove('dark')
  } else {
    document.querySelector('html')!.classList.add('dark')
  }
}

export function useLightTheme() {
  document.querySelector('html')!.classList.remove('dark')
  window.ipcRenderer.invoke('set-theme', 'light')
}

export function useDarkTheme() {
  document.querySelector('html')!.classList.add('dark')
  window.ipcRenderer.invoke('set-theme', 'dark')
}
