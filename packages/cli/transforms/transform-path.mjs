import { extname } from 'path'
/**
 * @param {Record<string, number>} pairs
 */
export function transformPath(pairs) {
  /**
   * @param { string } input
   */
  return (input) => {
    const ext = extname(input)
    for (let [from, to] of Object.entries(pairs)) {
      if (ext === from) {
        return transformTo(input, to)
      }
    }
    return input
  }
}

/**
 * @param {string} path
 * @param {string} suffix
 */
export function transformTo(path, suffix) {
  const ext = extname(path)
  return path.replace(new RegExp(`${ext}$`), suffix)
}
