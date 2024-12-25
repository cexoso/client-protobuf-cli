import { Field, Type, MapField, Enum } from 'protobufjs'
import { isScalarType, scalarToTypescript } from './scalar'
import { formatTypescript } from '../../prettier'
import { NameManager } from './name-conflict-manager'
import { Generator } from './type'
import { inject, injectable } from 'inversify'

@injectable()
export class InterfaceGenerater implements Generator {
  constructor(@inject(NameManager) private nameManager: NameManager) {}
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
    return this.nameManager.getUniqueName(field.resolvedType as Type)
  }
  #getMapKeyType(field: MapField) {
    if (isScalarType(field.keyType)) {
      return scalarToTypescript(field.keyType)
    }
    return this.nameManager.getUniqueName(field.resolvedKeyType as Type)
  }
  #pbTypeToTsType(field: Field) {
    const typeShortName = field.type

    if (isScalarType(typeShortName)) {
      return scalarToTypescript(typeShortName)
    }
    return this.nameManager.getUniqueName(field.resolvedType as Type)
  }
  #generateFieldDescription(field: Field) {
    const optionalTag = field.optional ? '?' : ''
    const type = this.#getType(field)
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
}
