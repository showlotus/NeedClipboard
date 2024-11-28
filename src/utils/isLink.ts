export function isLink(url: string) {
  let l
  try {
    l = new URL(url.trim())
  } catch (err) {
    return false
  }
  return ['http:', 'https:'].includes(l.protocol)
}
