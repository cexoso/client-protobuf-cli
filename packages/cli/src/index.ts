import { program } from 'commander'
import { build } from './build'
import { clean } from './clean'

function assertFormat(format: string[]) {
  const validItem = new Set(['ESM', 'CommonJS'])
  if (format.every((item) => validItem.has(item))) {
    new Error('--format only support ESM、CommonJS')
  }
}

program
  .command('build')
  .description('构建 ts 到 dist 目录，附带 package.json')
  .option('-f, --format <format...>', '支持 ESM 和 CommonJS')
  .action((args) => {
    const format = args.format || ['ESM', 'CommonJS']
    assertFormat(format)
    build({
      format,
    })
  })

program
  .command('clean')
  .description('清除 dist 目录')
  .action(() => {
    clean()
  })

program.parse()
