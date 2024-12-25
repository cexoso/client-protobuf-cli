import { Field, MapField, Type } from 'protobufjs'
import { isScalarType, mapScalarToDecodeMethod, isEnum } from './scalar'
import { camel } from 'radash'
import { upperCaseFirst } from '../../prettier/string-format'
import { formatTypescript } from '../../prettier'
import { inject, injectable } from 'inversify'
import { TSFilesManager } from '../../files-manager/files-manager'
import { File } from '../../files-manager/file'
import { getFilenameByType } from '../get-filename-by-type'
import { NameManager } from './name-conflict-manager'

@injectable()
export class DecoderGenerater {
  #nameManager = new NameManager()
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
  #mapScalarAndEnumToDecodeMethod(type: string) {
    if (isScalarType(type)) {
      return { typeName: mapScalarToDecodeMethod(type), file: '@protobuf-es/core' }
    }
    return { typeName: 'readEnum', file: '@protobuf-es/core' }
  }
  #mapTypeToDecodeMethod(resolvedType: Type) {
    const decodeName = this.#getDecoderName(resolvedType)
    return {
      typeName: decodeName,
      file: this.#generateMessageDecodeCodeIfNeed(resolvedType).file.finalTsAbsolutePath,
    }
  }
  #getAndCompileDependenciesDecode(fields: Field[]) {
    if (fields.length === 0) {
      return []
    }
    return fields
      .filter((field) => !Boolean(field instanceof MapField))
      .map((field) => {
        if (isScalarType(field.type) || isEnum(field.resolvedType!)) {
          return this.#mapScalarAndEnumToDecodeMethod(field.type)
        }
        return this.#mapTypeToDecodeMethod(field.resolvedType!)
      })
  }
  #mapValueTypeToDecodeMethod(field: MapField) {
    if (isScalarType(field.type) || isEnum(field.resolvedType as any)) {
      return this.#mapScalarAndEnumToDecodeMethod(field.type)
    }
    return this.#mapTypeToDecodeMethod(field.resolvedType as any)
  }
  #mapKeyTypeToDecodeMethod(field: MapField) {
    if (isScalarType(field.keyType) || isEnum(field.resolvedKeyType as any)) {
      return this.#mapScalarAndEnumToDecodeMethod(field.keyType)
    }
    return this.#mapTypeToDecodeMethod(field.resolvedKeyType as any)
  }

  #transformMapType(field: MapField) {
    const keyReader = this.#mapKeyTypeToDecodeMethod(field)
    const valueReader = this.#mapValueTypeToDecodeMethod(field)
    const valueType = isScalarType(field.type) ? 'scalar' : 'message'

    this.#addImport(field, '@protobuf-es/core', 'defineMap')

    this.#addImport(field, keyReader.file, keyReader.typeName)
    this.#addImport(field, valueReader.file, valueReader.typeName)
    const inlineDecoder = `defineMap({
      keyReader: ${keyReader.typeName},
      valueReader: ${valueReader.typeName},
      valueType: '${valueType}',
    })`
    return inlineDecoder
  }

  #generateMessageDecodeCodeIfNeed(type: Type) {
    let result = this.#messageDecodeMap.get(type.fullName)
    if (result === undefined) {
      const currentFile = this.filesManager.getTSFileByProtoPath(getFilenameByType(type))
      let preContext = ''
      result = {
        content: '',
        file: currentFile,
      }
      this.#messageDecodeMap.set(type.fullName, result)

      const typeName = this.#getTypeName(type)
      const name = this.#getDecoderName(type)
      const genFieldDecode = (field: Field) => {
        const tag = field.id
        let config = ''
        const repeatedDescription = field.repeated ? 'isRepeat: true, ' : ''
        const name = camel(field.name)
        if (field instanceof MapField) {
          const inLineDecoder = this.#transformMapType(field)
          config = `{ type: 'message', \ndecode: ${inLineDecoder}, \nname: '${name}', \nisMap: true }`
        } else if (isScalarType(field.type) || isEnum(field.resolvedType!)) {
          const decode = this.#mapScalarAndEnumToDecodeMethod(field.type).typeName
          config = `{ type: 'scalar', ${repeatedDescription}decode: ${decode}, name: '${name}' }`
        } else {
          const decodeName = this.#getDecoderName(field.resolvedType!)
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
      this.#messageDecodeMap.set(type.fullName, result)
    }
    return result
  }

  #getTypeName(type: Type) {
    return upperCaseFirst(this.#nameManager.getUniqueName(type))
  }
  #getDecoderName(type: Type) {
    const typeName = this.#getTypeName(type)
    const name = 'decode' + typeName
    return name
  }
  generateDecodeCode(type: Type) {
    this.#generateMessageDecodeCodeIfNeed(type)
  }
  getDecoderByType(type: Type) {
    return {
      memberName: this.#getDecoderName(type),
      ...this.#messageDecodeMap.get(type.fullName)!,
    }
  }
}
