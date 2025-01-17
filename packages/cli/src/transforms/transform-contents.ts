import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import { isStringLiteral } from '@babel/types'
import { transformTo } from './transform-path'

export function transformContent(content: string, filePath: string): string {
  const ast = parse(content, { sourceType: 'module' })

  traverse(ast, {
    // babel 类型投毒？
    ImportOrExportDeclaration(path: any) {
      if (isStringLiteral(path.node.source)) {
        const importPath = path.node.source.value
        if (importPath.startsWith('.') || importPath.startsWith('/')) {
          // 之后这里是否可以改成嗅探
          path.node.source.value = transformTo(path.node.source.value, '.mjs', filePath)
        }
      }
    },
  })

  return generate(ast).code
}
