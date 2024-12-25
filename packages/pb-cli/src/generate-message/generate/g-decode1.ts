import { Enum, Field, MapField, Type } from 'protobufjs'
import { isScalarType, mapScalarToDecodeMethod, isEnum } from './scalar'
import { camel } from 'radash'
import { upperCaseFirst } from '../../prettier/string-format'
import { formatTypescript } from '../../prettier'
import { inject, injectable } from 'inversify'
import { TSFilesManager } from '../../files-manager/files-manager'
import { getFilenameByType } from '../get-filename-by-type'
import { NameManager } from './name-conflict-manager'
import { Generator } from './type'

@injectable()
export class DecoderGenerater implements Generator {
  constructor(
    @inject(TSFilesManager) private filesManager: TSFilesManager,
    @inject(NameManager) private nameManager: NameManager
  ) {}
  generateEnumContent(_enumType: Enum): string {
    throw new Error('Method not implemented.')
  }
  #addImport(field: Field | MapField, modulePath: string, member: string) {
    const file = this.filesManager.getTSFileByProtoPath(getFilenameByType(field))
    file.addImport({ absolutePath: modulePath, member })
  }
  #mapUnionTypeToDecodeMethod(type: string, unionType: Type | Enum | null) {
    if (isScalarType(type)) {
      return { typeName: mapScalarToDecodeMethod(type), file: '@protobuf-es/core' }
    }
    if (unionType instanceof Enum) {
      return { typeName: 'readEnum', file: '@protobuf-es/core' }
    }

    const typeName = this.#getDecoderName(unionType!)
    return {
      typeName,
      file: this.filesManager.getTSFileByUnionType(unionType!).finalTsAbsolutePath,
    }
  }

  #getTypeName(type: Type | Enum) {
    return upperCaseFirst(this.nameManager.getUniqueName(type))
  }
  #getDecoderName(type: Type | Enum) {
    const typeName = this.#getTypeName(type)
    const name = 'decode' + typeName
    return name
  }

  #transformMapType(field: MapField) {
    const keyReader = this.#mapUnionTypeToDecodeMethod(field.keyType, field.resolvedKeyType as any)
    const valueReader = this.#mapUnionTypeToDecodeMethod(field.type, field.resolvedType)
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

  #genFieldDecode(field: Field) {
    const tag = field.id
    let config = ''
    const repeatedDescription = field.repeated ? 'isRepeat: true, ' : ''
    const name = camel(field.name)
    if (field instanceof MapField) {
      const inLineDecoder = this.#transformMapType(field)
      config = `{ type: 'message', \ndecode: ${inLineDecoder}, \nname: '${name}', \nisMap: true }`
    } else if (isScalarType(field.type) || isEnum(field.resolvedType!)) {
      const method = this.#mapUnionTypeToDecodeMethod(field.type, field.resolvedType)
      const { typeName, file } = method
      this.#addImport(field, file, typeName)
      config = `{ type: 'scalar', ${repeatedDescription}decode: ${typeName}, name: '${name}' }`
    } else {
      const decodeName = this.#getDecoderName(field.resolvedType!)
      this.#addImport(
        field,
        this.filesManager.getTSFileByUnionType(field.resolvedType!).finalTsAbsolutePath,
        decodeName
      )
      config = `{ type: 'message', ${repeatedDescription}decode: ${decodeName}, name: '${name}' }`
    }
    return `[${tag}, ${config}],`
  }
  generateTypeContent(type: Type): string {
    const typeName = this.#getTypeName(type)
    const name = this.#getDecoderName(type)
    const body = `export const ${name} = defineMessage<${typeName}>(
      new Map([
        ${type.fieldsArray.map((field) => this.#genFieldDecode(field)).join('\n')}
      ])
    )`

    this.filesManager.getTSFileByUnionType(type).addImport({
      absolutePath: '@protobuf-es/core',
      member: 'defineMessage',
    })
    return formatTypescript(body)
  }
}
