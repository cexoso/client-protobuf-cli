import { Enum, Field, MapField, Type } from 'protobufjs'
import { isScalarType, mapScalarToDecodeMethod, isEnum } from './scalar'
import { camel } from 'radash'
import { upperCaseFirst } from '../../prettier/string-format'
import { formatTypescript } from '../../prettier'
import { inject, injectable } from 'inversify'
import { TSFilesManager } from '../../files-manager/files-manager'
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

  #mapUnionTypeToDecodeMethod(
    type: string,
    unionType: Type | Enum | null
  ): {
    typeName: string
    imports?: { absolutePath: string; member: string }[]
  } {
    if (isScalarType(type)) {
      const typeName = mapScalarToDecodeMethod(type)
      return {
        typeName,
        imports: [{ absolutePath: '@protobuf-es/core', member: typeName }],
      }
    }
    if (unionType instanceof Enum) {
      return {
        typeName: 'readEnum',
        imports: [{ absolutePath: '@protobuf-es/core', member: 'readEnum' }],
      }
    }

    const typeName = this.#getDecoderName(unionType!)
    const wrapResult = this.#wrapAsFunction(typeName)
    return {
      typeName: wrapResult.typeName,
      imports: [
        ...(wrapResult.imports ?? []),
        {
          absolutePath: this.filesManager.getTSFileByUnionType(unionType!).finalTsAbsolutePath,
          member: typeName,
        },
      ],
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

  #wrapAsFunction(decodeName: string): {
    typeName: string
    imports?: { absolutePath: string; member: string }[]
  } {
    const wrapAsFunction = `(reader: ReaderLike) => ${decodeName}(reader)`
    return {
      typeName: wrapAsFunction,
      imports: [{ absolutePath: '@protobuf-es/core', member: 'ReaderLike' }],
    }
  }

  #transformMapType(type: Type, field: MapField) {
    const originFile = this.filesManager.getTSFileByUnionType(type)
    const keyReader = this.#mapUnionTypeToDecodeMethod(field.keyType, field.resolvedKeyType as any)
    const valueReader = this.#mapUnionTypeToDecodeMethod(field.type, field.resolvedType)
    const valueType = isScalarType(field.type) ? 'scalar' : 'message'

    originFile.addImport({ absolutePath: '@protobuf-es/core', member: 'defineMap' })
    keyReader.imports?.forEach((importItem) => {
      originFile.addImport(importItem)
    })
    valueReader.imports?.forEach((importItem) => {
      originFile.addImport(importItem)
    })
    const inlineDecoder = `defineMap({
      keyReader: ${keyReader.typeName},
      valueReader: ${valueReader.typeName},
      valueType: '${valueType}',
    })`
    return inlineDecoder
  }

  #genFieldDecode(type: Type, field: Field) {
    const tag = field.id
    const originFile = this.filesManager.getTSFileByUnionType(type)
    let config = ''
    const repeatedDescription = field.repeated ? 'isRepeat: true, ' : ''
    const name = camel(field.name)
    if (field instanceof MapField) {
      const inLineDecoder = this.#transformMapType(type, field)
      config = `{ type: 'message', \ndecode: ${inLineDecoder}, \nname: '${name}', \nisMap: true }`
    } else if (isScalarType(field.type) || isEnum(field.resolvedType!)) {
      const method = this.#mapUnionTypeToDecodeMethod(field.type, field.resolvedType)
      const { typeName } = method
      method.imports?.forEach((importItem) => {
        originFile.addImport(importItem)
      })
      config = `{ type: 'scalar', ${repeatedDescription}decode: ${typeName}, name: '${name}' }`
    } else {
      const decodeName = this.#getDecoderName(field.resolvedType!)
      originFile.addImport({
        absolutePath: this.filesManager.getTSFileByUnionType(field.resolvedType!),
        member: decodeName,
      })
      const wrapResult = this.#wrapAsFunction(decodeName)
      wrapResult.imports?.forEach((importItem) => {
        originFile.addImport(importItem)
      })
      config = `{ type: 'message', ${repeatedDescription}decode: ${wrapResult.typeName}, name: '${name}' }`
    }
    return `[${tag}, ${config}],`
  }
  generateTypeContent(type: Type): string {
    const typeName = this.#getTypeName(type)
    const name = this.#getDecoderName(type)
    const body = `export const ${name} = defineMessage<${typeName}>(
      new Map<number, TagHandler>([
        ${type.fieldsArray.map((field) => this.#genFieldDecode(type, field)).join('\n')}
      ])
    )`

    this.filesManager.getTSFileByUnionType(type).addImport({
      absolutePath: '@protobuf-es/core',
      member: 'defineMessage',
    })
    this.filesManager.getTSFileByUnionType(type).addImport({
      absolutePath: '@protobuf-es/core',
      member: 'TagHandler',
    })
    return formatTypescript(body)
  }

  getMemberNameByType(type: Type): string {
    return this.#getDecoderName(type)
  }
}
