import { Field, Type, MapField } from 'protobufjs'
import { isScalarType, scalarToTypescript, isEnum } from './scalar'
import { formatTypescript } from '../../prettier'
import { inject, injectable } from 'inversify'
import { TSFilesManager } from '../../files-manager/files-manager'
import { File } from '../../files-manager/file'
import { getFilenameByType } from '../get-filename-by-type'
import { getTypeName } from '../get-type-name'

@injectable()
export class InterfaceGenerater {
  constructor(@inject(TSFilesManager) private filesManager: TSFilesManager) {}
  #interfaces: Map<string, { file: File; declareContent: string }> = new Map()
  // 存的是 type
  #interfaceOrderList: string[] = []
  #getType(field: Field) {
    if (field instanceof MapField) {
      return `Record<${this.#pbTypeToTsType(field.keyType)}, ${this.#pbTypeToTsType(field.type)}>`
    }
    return this.#pbTypeToTsType(field.type)
  }
  #pbTypeToTsType(type: string) {
    if (isScalarType(type)) {
      return scalarToTypescript(type)
    }
    return type
  }
  #generateFieldDescription(field: Field) {
    const optionalTag = field.optional ? '?' : ''
    let type = this.#getType(field)
    const content = `"${field.name}"${optionalTag}: ${type}${field.repeated ? '[]' : ''}`
    return content
  }

  #getAndCompileDependenciesType(fields: Field[]) {
    if (fields.length === 0) {
      return []
    }
    const root = fields[0].root
    return (
      fields
        //这里不需要考虑 mapField 的 keyType 因为 keyType 不存在复杂类型需要从另一个文件 import
        .map((field) => field.type)
        .filter((type) => !isScalarType(type))
        .map((typeString) => {
          const typeOrEnum = root.lookupTypeOrEnum(typeString)
          return {
            typeName: getTypeName(typeOrEnum),
            file: this.#generateMessageInterfaceIfNeed(typeOrEnum).file,
          }
        })
    )
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
