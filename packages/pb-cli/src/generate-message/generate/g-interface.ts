import { Field, Type, MapField, Enum } from 'protobufjs'
import { isScalarType, scalarToTypescript } from './scalar'
import { formatTypescript } from '../../prettier'
import { NameManager } from './name-conflict-manager'
import { Generator } from './type'
import { inject, injectable } from 'inversify'
import { TSFilesManager } from '../../files-manager/files-manager'

@injectable()
export class InterfaceGenerater implements Generator {
  constructor(
    @inject(NameManager) private nameManager: NameManager,
    @inject(TSFilesManager) private tsFilesManager: TSFilesManager
  ) {}
  #generateType(field: Field) {
    if (field instanceof MapField) {
      return `Record<${this.#generateMapKeyType(field)}, ${this.#generateMapValueType(field)}>`
    }
    return this.#genrateType(field)
  }
  #generateMapValueType(field: MapField) {
    if (isScalarType(field.type)) {
      return scalarToTypescript(field.type)
    }

    const resolvedType = field.resolvedType!

    const type = this.nameManager.getUniqueName(resolvedType)
    this.tsFilesManager.getTSFileByUnionType(field).addImport({
      absolutePath: this.tsFilesManager.getTSFileByUnionType(field.resolvedType!),
      member: type,
    })
    return type
  }
  #generateMapKeyType(field: MapField) {
    if (isScalarType(field.keyType)) {
      return scalarToTypescript(field.keyType)
    }
    const resolvedKeyType = field.resolvedKeyType!
    const type = this.nameManager.getUniqueName(resolvedKeyType as Type)
    this.tsFilesManager.getTSFileByUnionType(field).addImport({
      absolutePath: this.tsFilesManager.getTSFileByUnionType(resolvedKeyType as any),
      member: type,
    })
    return type
  }
  #genrateType(field: Field) {
    const typeShortName = field.type

    if (isScalarType(typeShortName)) {
      return scalarToTypescript(typeShortName)
    }

    const resolvedType = field.resolvedType!
    const type = this.nameManager.getUniqueName(resolvedType)
    this.tsFilesManager.getTSFileByUnionType(field).addImport({
      absolutePath: this.tsFilesManager.getTSFileByUnionType(field.resolvedType!),
      member: type,
    })
    return type
  }
  #generateFieldDescription(field: Field) {
    const optionalTag = field.optional ? '?' : ''
    const type = this.#generateType(field)
    const content = `"${field.name}"${optionalTag}: ${type}${field.repeated ? '[]' : ''}`
    return content
  }

  generateEnumContent(enumType: Enum) {
    const name = this.nameManager.getUniqueName(enumType)
    const content = `export enum ${name} {
      ${Object.keys(enumType.values)
        .map((key) => `${key}=${enumType.values[key]},`)
        .join('\n')}
    }`
    return formatTypescript(content)
  }
  generateTypeContent(type: Type) {
    const content = `export interface ${this.nameManager.getUniqueName(type)} {
      ${type.fieldsArray.map((field) => this.#generateFieldDescription(field)).join('\n')}
    }`
    return formatTypescript(content)
  }
  getMemberNameByType(type: Type): string {
    return this.nameManager.getUniqueName(type)
  }
}
