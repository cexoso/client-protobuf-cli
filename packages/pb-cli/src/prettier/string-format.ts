export function upperCaseFirst(str: string) {
  if (str.length === 0) {
    return str
  }
  if (str.length === 1) {
    return str.toUpperCase()
  }
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function lowerCaseFirst(str: string) {
  if (str.length === 0) {
    return str
  }
  if (str.length === 1) {
    return str.toUpperCase()
  }
  return str.charAt(0).toLowerCase() + str.slice(1)
}
