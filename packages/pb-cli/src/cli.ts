import { program } from 'commander'
import { isAbsolute, join } from 'path'
import { createContainer } from './container'
import { Command } from './command/command'

program.option('-p, --proto-dir <protoDir>', '输入 proto 文件所在的目录，相对或者绝对路径')
program.option('-g, --glob <globPath>', '用于进一步过滤 protos 文件，默认为 **/*.proto')
program.option('--dry-run', '仅运行，不生成文件')
program.option('-o, --out-dir <outDir>', '指定生成的目录')
program.option('-v, --verbose', '输出更多信息')
program.option('--auto-clean', '清空目标目录')
program.option('--prettier', '应用当前项目的 prettier 进行格式化')

program.parse()

const options = program.opts()
function getPath() {
  const { protoDir } = options
  if (typeof protoDir !== 'string' || protoDir === '') {
    console.log('你需要指定 proto-dir, 例如: -p protos')
    process.exit(-1)
  }
  return isAbsolute(protoDir) ? protoDir : join(process.cwd(), protoDir)
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
const dryRun = options['dryRun']

const container = createContainer()
const cmd = container.get(Command)
cmd.compileProtos({
  dryRun,
  outDir: outputPath,
  protoDir: entryProtoFileEntryPath,
  protoGlob: options['globPath'],
  autoClean: options['autoClean'],
  withPrettier: options['prettier'],
})
