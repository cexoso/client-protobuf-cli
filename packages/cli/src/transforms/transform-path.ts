import { extname } from 'path'

export function transformPath(pairs: Record<string, string>) {
  return (input: string) => {
    const ext = extname(input)
    for (let [from, to] of Object.entries(pairs)) {
      if (ext === from) {
        return transformTo(input, to)
      }
    }
    return input
  }
}

export function transformTo(path: string, suffix: string) {
  const ext = extname(path)
  return path.replace(new RegExp(`${ext}$`), suffix)
}
