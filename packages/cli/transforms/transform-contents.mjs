import { parse } from '@babel/parser'
import defaultExport from '@babel/traverse'
import printExport from '@babel/generator'
import { isStringLiteral } from '@babel/types'
import { isAbsolute } from 'path'
import { transformTo } from '../transforms/transform-path.mjs'

let generate = printExport
generate = generate.default

let traverse = defaultExport
traverse = traverse.default
/**
 * @param {string} path
 * @param {string} content
 */
export function transformContent(content) {
  const ast = parse(content, { sourceType: 'module' })

  traverse(ast, {
    ImportOrExportDeclaration(path) {
      if (isStringLiteral(path.node.source)) {
        const importPath = path.node.source.value
        if (!isAbsolute(importPath)) {
          path.node.source.value = transformTo(path.node.source.value, '.mjs')
        }
      }
    },
  })

  return generate(ast).code
}
