import { extname, relative, dirname } from 'path'
import { Module } from 'module'

function customResolve(moduleName: string, basedir: string) {
  try {
    // @ts-ignore
    return Module._resolveFilename(moduleName, {
      id: basedir,
      filename: basedir,
      // @ts-ignore
      paths: Module._nodeModulePaths(basedir),
    })
  } catch (err) {
    return null
  }
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
