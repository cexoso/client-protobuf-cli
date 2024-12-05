import { Field, Type } from 'protobufjs'
import { isScalarType, mapScalarToDecodeMethod, isEnum } from './scalar'
import { camel } from 'radash'
import { upperCaseFirst } from '../../prettier/string-format'
import { formatTypescript } from '../../prettier'
import { inject, injectable } from 'inversify'
import { FilesManager } from '../../files-manager/files-manager'
import { File } from '../../files-manager/file'
import { getFilenameByType } from '../get-filename-by-type'

@injectable()
export class DecoderGenerater {
  constructor(@inject(FilesManager) private filesManager: FilesManager) {}
  #addImport(field: Field, modulePath: string, member: string) {
    const file = this.filesManager.getFileByPath(getFilenameByType(field))
    file.addImport({ absolutePath: modulePath, member })
  }
  #messageDecodeMap = new Map<
    string,
    {
      content: string
      file: File
    }
  >()
  #mapTypeToDecodeMethod(field: Field) {
    if (isScalarType(field.type)) {
      return mapScalarToDecodeMethod(field)
    }
    return 'readEnum'
  }
  #getAndCompileDependenciesDecode(fields: Field[]) {
    return fields
      .filter((field) => !isScalarType(field.type) && !isEnum(field.resolvedType!))
      .map((field) => {
        const decodeName = 'decode' + upperCaseFirst(field.type)
        return {
          typeName: decodeName,
          file: this.#generateMessageDecodeCodeIfNeed(field.root.lookupType(field.type)).file!,
        }
      })
  }
  #generateMessageDecodeCodeIfNeed(type: Type) {
    let result = this.#messageDecodeMap.get(type.name)
    if (result === undefined) {
      const currentFile = this.filesManager.getFileByPath(getFilenameByType(type))

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
        if (isScalarType(field.type) || isEnum(field.resolvedType!)) {
          const decode = this.#mapTypeToDecodeMethod(field)
          this.#addImport(field, '@protobuf-es/core', decode)
          config = `{ type: 'scalar', ${repeatedDescription}decode: ${decode}, name: '${camel(
            field.name
          )}' }`
        } else {
          const decodeName = 'decode' + upperCaseFirst(field.type)
          config = `{ type: 'message', ${repeatedDescription}decode: ${decodeName}, name: '${camel(
            field.name
          )}' }`
        }
        return `[${tag}, ${config}],`
      }

      const files = this.#getAndCompileDependenciesDecode(type.fieldsArray)

      files.map(({ file, typeName }) => {
        currentFile.addImport({
          absolutePath: file.fileAbsolutePath,
          member: typeName,
        })
      })

      result.content = formatTypescript(
        `export const ${name} = defineMessage<${typeName}>(
          new Map([
            ${type.fieldsArray.map((field) => genFieldDecode(field)).join('\n')}
          ])
        )`
      )
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
