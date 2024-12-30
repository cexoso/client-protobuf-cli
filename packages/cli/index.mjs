import { program } from 'commander'
import { build } from './build.mjs'
import { clean } from './clean.mjs'

program
  .command('build')
  .description('构建 ts 到 dist 目录，附带 package.json')
  .option('-f, --format <format>', '支持 ESM 和 CommonJS')
  .action(() => {
    build()
  })

program
  .command('clean')
  .description('清除 dist 目录')
  .action(() => {
    clean()
  })

program.parse()
