import { Field, Type } from 'protobufjs'
import { isScalarType, scalarToTypescript, isEnum } from './scalar'
import { formatTypescript } from '../../prettier'
import { inject, injectable } from 'inversify'
import { FilesManager } from '../../files-manager/files-manager'
import { File } from '../../files-manager/file'
import { getFilenameByType } from '../get-filename-by-type'
import { getTypeName } from '../get-type-name'

@injectable()
export class InterfaceGenerater {
  constructor(@inject(FilesManager) private filesManager: FilesManager) {}
  #interfaces: Map<string, { file: File; declareContent: string }> = new Map()
  // 存的是 type
  #interfaceOrderList: string[] = []

  #getType(field: Field) {
    if (isScalarType(field.type)) {
      return scalarToTypescript(field.type)
    }
    this.#generateMessageInterfaceIfNeed(field.root.lookupTypeOrEnum(field.type))
    return field.type
  }
  #generateFieldDescription(field: Field) {
    const optionalTag = field.optional ? '?' : ''
    let type = this.#getType(field)
    const content = `"${field.name}"${optionalTag}: ${type}${field.repeated ? '[]' : ''}`
    return content
  }

  #getAndCompileDependenciesType(fields: Field[]) {
    return fields
      .filter((field) => !isScalarType(field.type))
      .map((field) => {
        return {
          typeName: getTypeName(field),
          file: this.#generateMessageInterfaceIfNeed(field.root.lookupTypeOrEnum(field.type)).file,
        }
      })
  }

  #generateMessageInterfaceIfNeed(type: Type) {
    let result = this.#interfaces.get(type.name)
    if (result === undefined) {
      const currentFile = this.filesManager.getFileByPath(getFilenameByType(type))
      result = {
        declareContent: '',
        file: currentFile,
      }

      // 如果不存在声明, 也先填充一个空的，这是为了防止类型循环依赖无限生成
      this.#interfaces.set(type.name, result)
      if (isEnum(type)) {
        // 采用 const string 作为 enum 的值，目的是为了可读，以及兼容 javascript
        result.declareContent = formatTypescript(
          `export enum ${type.name} {
            ${Object.keys(type.values)
              .map((key) => `${key}=${type.values[key]},`)
              .join('\n')}
          }`
        )
      } else {
        const files = this.#getAndCompileDependenciesType(type.fieldsArray)
        files.map(({ file, typeName }) => {
          currentFile.addImport({
            absolutePath: file.fileAbsolutePath,
            member: typeName,
          })
        })
        result.declareContent = formatTypescript(
          `export interface ${type.name} {
            ${type.fieldsArray.map((field) => this.#generateFieldDescription(field)).join('\n')}
          }`
        )
      }

      currentFile.write(result.declareContent)

      this.#interfaceOrderList.push(type.name)
      this.#interfaces.set(type.name, {
        file: currentFile,
        declareContent: result.declareContent,
      })
    }

    return result
  }

  generateMessage(type: Type) {
    return this.#generateMessageInterfaceIfNeed(type)
  }
}
