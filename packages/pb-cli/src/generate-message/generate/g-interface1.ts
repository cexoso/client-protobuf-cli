import { Field, Type, MapField, Enum } from 'protobufjs'
import { isScalarType, scalarToTypescript, isEnum } from './scalar'
import { formatTypescript } from '../../prettier'
import { inject, injectable } from 'inversify'
import { TSFilesManager } from '../../files-manager/files-manager'
import { File } from '../../files-manager/file'
import { getFilenameByType } from '../get-filename-by-type'
import { getTypeName } from '../get-type-name'
import { NameManager } from './name-conflict-manager'
import { Generator } from './type'

@injectable()
export class InterfaceGenerater implements Generator {
  #nameManager = new NameManager()
  constructor(@inject(TSFilesManager) private filesManager: TSFilesManager) {}
  #interfaces: Map<string, { file: File; declareContent: string }> = new Map()
  // 存的是 type
  #interfaceOrderList: string[] = []
  #getType(field: Field) {
    if (field instanceof MapField) {
      return `Record<${this.#getMapKeyType(field)}, ${this.#getMapValueType(field)}>`
    }
    return this.#pbTypeToTsType(field)
  }
  #getMapValueType(field: MapField) {
    if (isScalarType(field.type)) {
      return scalarToTypescript(field.type)
    }
    return this.#nameManager.getUniqueName(field.resolvedType as Type)
  }
  #getMapKeyType(field: MapField) {
    if (isScalarType(field.keyType)) {
      return scalarToTypescript(field.keyType)
    }
    return this.#nameManager.getUniqueName(field.resolvedKeyType as Type)
  }
  #pbTypeToTsType(field: Field) {
    const typeShortName = field.type

    if (isScalarType(typeShortName)) {
      return scalarToTypescript(typeShortName)
    }
    return this.#nameManager.getUniqueName(field.resolvedType as Type)
  }
  #generateFieldDescription(field: Field) {
    const optionalTag = field.optional ? '?' : ''
    let type = this.#getType(field)
    this.#nameManager.getUniqueName(field)
    const content = `"${field.name}"${optionalTag}: ${type}${field.repeated ? '[]' : ''}`
    return content
  }

  #getAndCompileDependenciesType(fields: Field[]) {
    if (fields.length === 0) {
      return []
    }
    const root = fields[0]!.root
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
  generateEnumContent(enumType: Enum) {
    const name = this.#nameManager.getUniqueName(enumType)
    const content = `export enum ${name} {
      ${Object.keys(enumType.values)
        .map((key) => `${key}=${enumType.values[key]},`)
        .join('\n')}
    }`
    return formatTypescript(content)
  }
  generateTypeContent(type: Type) {
    const content = `export interface ${this.#nameManager.getUniqueName(type)} {
      ${type.fieldsArray.map((field) => this.#generateFieldDescription(field)).join('\n')}
    }`
    return formatTypescript(content)
  }

  #generateMessageInterfaceIfNeed(type: Type) {
    let result = this.#interfaces.get(type.fullName)
    if (result === undefined) {
      const currentFile = this.filesManager.getTSFileByProtoPath(getFilenameByType(type))
      result = {
        declareContent: '',
        file: currentFile,
      }

      // 如果不存在声明, 也先填充一个空的，这是为了防止类型循环依赖无限生成
      this.#interfaces.set(type.fullName, result)
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
            absolutePath: file,
            member: typeName,
          })
        })
        result.declareContent = formatTypescript(
          `export interface ${this.#nameManager.getUniqueName(type)} {
            ${type.fieldsArray.map((field) => this.#generateFieldDescription(field)).join('\n')}
          }`
        )
      }

      currentFile.write(result.declareContent)

      this.#interfaceOrderList.push(type.name)
      this.#interfaces.set(type.fullName, {
        file: currentFile,
        declareContent: result.declareContent,
      })
    }
    return result
  }

  getInterfaceByType(type: Type) {
    return {
      memberName: this.#nameManager.getUniqueName(type),
      ...this.#interfaces.get(type.name),
    }
  }
  generateMessage(type: Type) {
    return this.#generateMessageInterfaceIfNeed(type)
  }
}
