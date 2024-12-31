import { parse } from '@babel/parser'
import defaultExport from '@babel/traverse'
import printExport from '@babel/generator'
import { isStringLiteral } from '@babel/types'
import { transformTo } from '../transforms/transform-path'

let generate = printExport
// @ts-ignore
generate = generate.default

let traverse = defaultExport
// @ts-ignore
traverse = traverse.default

export function transformContent(content: string): string {
  const ast = parse(content, { sourceType: 'module' })

  traverse(ast, {
    // babel 类型投毒？
    ImportOrExportDeclaration(path: any) {
      if (isStringLiteral(path.node.source)) {
        const importPath = path.node.source.value
        if (importPath.startsWith('./') || importPath.startsWith('/')) {
          // 之后这里是否可以改成嗅探
          path.node.source.value = transformTo(path.node.source.value, '.mjs')
        }
      }
    },
  })

  return generate(ast).code
}
