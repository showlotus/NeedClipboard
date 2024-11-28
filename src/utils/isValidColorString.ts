function isValidColor(color: string) {
  color = color.trim()
  // 匹配 HEX 颜色
  const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$/

  // 匹配 RGB 颜色
  const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/

  // 匹配 HSL 颜色
  const hslRegex =
    /^hsl\(\s*(\d{1,3})\s*,\s*([0-9]{1,2}|100)%\s*,\s*([0-9]{1,2}|100)%\s*\)$/

  return hexRegex.test(color) || rgbRegex.test(color) || hslRegex.test(color)
}

function isColorNameValid(colorName: string) {
  colorName = colorName.trim()
  const s = new Option().style
  s.color = colorName
  return s.color !== ''
}

export function isValidColorString(color: string) {
  return isValidColor(color) || isColorNameValid(color)
}
