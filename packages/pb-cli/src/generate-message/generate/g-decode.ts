import { Field, MapField, Root, Type } from 'protobufjs'
import { isScalarType, mapScalarToDecodeMethod, isEnum } from './scalar'
import { camel } from 'radash'
import { upperCaseFirst } from '../../prettier/string-format'
import { formatTypescript } from '../../prettier'
import { inject, injectable } from 'inversify'
import { TSFilesManager } from '../../files-manager/files-manager'
import { File } from '../../files-manager/file'
import { getFilenameByType } from '../get-filename-by-type'

@injectable()
export class DecoderGenerater {
  constructor(@inject(TSFilesManager) private filesManager: TSFilesManager) {}
  #addImport(field: Field | MapField, modulePath: string, member: string) {
    const file = this.filesManager.getTSFileByProtoPath(getFilenameByType(field))
    file.addImport({ absolutePath: modulePath, member })
  }
  #messageDecodeMap = new Map<
    string,
    {
      content: string
      file: File
    }
  >()
  #mapTypeToDecodeMethod(root: Root, type: string) {
    if (isScalarType(type)) {
      return {
        typeName: mapScalarToDecodeMethod(type),
        file: '@protobuf-es/core',
      }
    }
    if (isEnum(root.lookupTypeOrEnum(type))) {
      return {
        typeName: 'readEnum',
        file: '@protobuf-es/core',
      }
    }
    const decodeName = 'decode' + upperCaseFirst(type)
    const resolvedType = root.lookupType(type)
    return {
      typeName: decodeName,
      file: this.#generateMessageDecodeCodeIfNeed(resolvedType).file.finalTsAbsolutePath,
    }
  }
  #getAndCompileDependenciesDecode(fields: Field[]) {
    if (fields.length === 0) {
      return []
    }
    const root = fields[0].root
    return fields
      .filter((field) => !Boolean(field instanceof MapField))
      .map((field) => {
        return this.#mapTypeToDecodeMethod(root, field.type)
      })
  }

  #transformMapType(field: MapField, writeToContent: (content: string) => void) {
    const decodeName = 'decode' + upperCaseFirst(field.name)

    const keyReader = this.#mapTypeToDecodeMethod(field.root, field.keyType).typeName
    const valueReader = this.#mapTypeToDecodeMethod(field.root, field.type).typeName
    const valueType = isScalarType(field.type) ? 'scalar' : 'message'

    this.#addImport(field, '@protobuf-es/core', 'defineMap')
    const context = `const ${decodeName} = defineMap({
      keyReader: ${keyReader},
      valueReader: ${valueReader},
      valueType: '${valueType}',
    })\n`
    writeToContent(context)
    return decodeName
  }

  #generateMessageDecodeCodeIfNeed(type: Type) {
    let result = this.#messageDecodeMap.get(type.name)
    if (result === undefined) {
      const currentFile = this.filesManager.getTSFileByProtoPath(getFilenameByType(type))
      let preContext = ''
      result = {
        content: '',
        file: currentFile,
      }
      this.#messageDecodeMap.set(type.name, result)
      const typeName = upperCaseFirst(type.name)
      const name = 'decode' + typeName
      const genFieldDecode = (field: Field) => {
        const tag = field.id
        let config = ''
        const repeatedDescription = field.repeated ? 'isRepeat: true, ' : ''
        const name = camel(field.name)
        if (field instanceof MapField) {
          const decodeName = this.#transformMapType(field, (context) => {
            preContext += context
          })
          config = `{ type: 'message', decode: ${decodeName}, name: '${name}', isMap: true }`
        } else if (isScalarType(field.type) || isEnum(field.resolvedType!)) {
          const decode = this.#mapTypeToDecodeMethod(field.root, field.type).typeName
          config = `{ type: 'scalar', ${repeatedDescription}decode: ${decode}, name: '${name}' }`
        } else {
          const decodeName = 'decode' + upperCaseFirst(field.type)
          config = `{ type: 'message', ${repeatedDescription}decode: ${decodeName}, name: '${name}' }`
        }
        return `[${tag}, ${config}],`
      }

      const files = this.#getAndCompileDependenciesDecode(type.fieldsArray)

      files.map(({ file, typeName }) => {
        currentFile.addImport({
          absolutePath: file,
          member: typeName,
        })
      })

      const body = `export const ${name} = defineMessage<${typeName}>(
        new Map([
          ${type.fieldsArray.map((field) => genFieldDecode(field)).join('\n')}
        ])
      )`
      result.content = formatTypescript(`
        ${preContext}
        ${body}
      `)
      result.file.write(result.content)
      currentFile.addImport({
        absolutePath: '@protobuf-es/core',
        member: 'defineMessage',
      })
      this.#messageDecodeMap.set(type.name, result)
    }
    return result
  }

  generateDecodeCode(type: Type) {
    this.#generateMessageDecodeCodeIfNeed(type)
  }
}
