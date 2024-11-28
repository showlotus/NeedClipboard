window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (event) => {
    event.matches ? toggleDark() : toggleLight()
  })

export function ipcGetTheme(): Promise<'light' | 'dark'> {
  return window.ipcRenderer.invoke('get-theme')
}

export async function useSystemTheme() {
  window.ipcRenderer.invoke('set-theme', 'system')
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDarkMode ? toggleDark() : toggleLight()
}

export function useLightTheme() {
  toggleLight()
  window.ipcRenderer.invoke('set-theme', 'light')
}

export function useDarkTheme() {
  toggleDark()
  window.ipcRenderer.invoke('set-theme', 'dark')
}

function toggleLight() {
  document.querySelector('html')!.classList.remove('dark')
}

function toggleDark() {
  document.querySelector('html')!.classList.add('dark')
}
