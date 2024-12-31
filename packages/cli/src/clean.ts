import { existsSync, lstatSync, rmSync } from 'fs'

export const deleteAsync = (dirPath: string) => {
  if (!existsSync(dirPath)) {
    return
  }

  const status = lstatSync(dirPath)
  if (!status.isDirectory()) {
    return
  }

  rmSync(dirPath, { recursive: true, force: true })
}

export const clean = () => {
  deleteAsync('./dist')
}
