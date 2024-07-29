import { extname, relative, dirname, join } from 'path'
import { statSync, existsSync } from 'fs'

function isDirectory(path: string) {
  if (!existsSync(path)) {
    return false
  }

  return statSync(path).isDirectory()
}

function customResolve(moduleName: string, basedir: string) {
  const path = join(dirname(basedir), moduleName)
  if (isDirectory(path)) {
    return join(path, 'index.mjs')
  }
  return path
}

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

export function transformTo(path: string, suffix: string, requestFilePath?: string) {
  let finialPath = path
  if (requestFilePath) {
    finialPath = customResolve(path, requestFilePath)
    finialPath = relative(dirname(requestFilePath), finialPath)
    if (!finialPath.startsWith('.')) {
      finialPath = `./${finialPath}`
    }
  }
  const ext = extname(finialPath)
  return finialPath.replace(new RegExp(`${ext}$`), suffix)
}
