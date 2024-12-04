import { program } from 'commander'
import { isAbsolute, join } from 'path'

program.option('-p, --path <path>', '输入文件的相对/绝对路径')
program.option('-s, --service-name <service_name>', '命名服务上注册的服务命名, 用于服务发现')
program.option('--dry-run', '仅运行，不生成文件')
program.option('-o, --out-dir <outDir>', '指定生成的目录')
program.parse()

const options = program.opts()
function getPath() {
  const { path } = options
  if (typeof path !== 'string' || path === '') {
    return null
  }
  return isAbsolute(path) ? path : join(process.cwd(), path)
}

function getOutPath() {
  const { outDir } = options
  if (typeof outDir !== 'string' || outDir === '') {
    return process.cwd()
  }
  return isAbsolute(outDir) ? outDir : join(process.cwd(), outDir)
}

const entryProtoFileEntryPath = getPath()
const outputPath = getOutPath()

const dryRun = options.dryRun
