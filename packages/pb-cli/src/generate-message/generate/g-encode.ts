import { Enum, Field, MapField, Type } from 'protobufjs'
import { isEnum, isScalarType, mapScalarToEncodeMethod } from './scalar'
import { upperCaseFirst } from '../../prettier/string-format'
import { formatTypescript } from '../../prettier'
import { inject, injectable } from 'inversify'
import { TSFilesManager } from '../../files-manager/files-manager'
import { getFilenameByType } from '../get-filename-by-type'
import dedent from 'ts-dedent'
import { NameManager } from './name-conflict-manager'
import { Generator } from './type'

@injectable()
export class EncoderGenerater implements Generator {
  #nameManager = new NameManager()
  constructor(@inject(TSFilesManager) private filesManager: TSFilesManager) {}
  generateEnumContent(_enumType: Enum): string {
    throw new Error('Method not implemented.')
  }
  #genRepeatFieldContent(type: Type, field: Field) {
    const file = this.filesManager.getTSFileByUnionType(type)
    const isScalar = isScalarType(field.type)
    if (!isScalar) {
      const encodeMethodName = 'encode' + upperCaseFirst(field.type)
      file.addImport({ absolutePath: '@protobuf-es/core', member: 'encodeRepeatToBuffer' })
      file.addImport({ absolutePath: '@protobuf-es/core', member: 'encodeMessageToBuffer' })
      return `encodeRepeatToBuffer(
        value["${field.name}"],
        ({ value, tag, writer }) => encodeMessageToBuffer({ value, tag, writer }, ${encodeMethodName}),
        ${field.id},
        writer
      )`
    }
    const method = mapScalarToEncodeMethod(field.type)
    // TODO: proto3 默认使用 packed 了, 我们目前仍使用 proto2
    // 但也应该尽量把这个逻辑补上，防止接受 Proto3 的时候出问题
    const packed = field?.options?.['packed'] ?? false
    const encodeName = packed ? 'encodePackedRepeatToBuffer' : 'encodeRepeatToBuffer'
    file.addImport({ absolutePath: '@protobuf-es/core', member: encodeName })
    const result = `${encodeName}(value["${field.name}"], ${method}, ${field.id}, writer)`
    return result
  }

  #mapTypeToEncodeMethod(type: string, resolvedType: Type | Enum | null) {
    if (isScalarType(type)) {
      return {
        typeName: mapScalarToEncodeMethod(type),
        file: '@protobuf-es/core',
      }
    }
    if (isEnum(resolvedType!)) {
      // enum
      return {
        typeName: 'encodeEnumToBuffer',
        file: '@protobuf-es/core',
      }
    }
    const name = this.#getEncoderName(resolvedType!)
    return {
      typeName: name,
    }
  }

  #genFieldContent(type: Type, field: Field) {
    const file = this.filesManager.getTSFileByUnionType(type)
    if (field.repeated) {
      return this.#genRepeatFieldContent(type, field)
    }

    if (field instanceof MapField) {
      file.addImport({
        absolutePath: '@protobuf-es/core',
        member: 'encodeMapToBuffer',
      })
      const keyType = field.keyType !== 'string' ? '\nisKeyNumber: true,' : ''
      return dedent`
        encodeMapToBuffer(value["${field.name}"], {
          tag: ${field.id},
          writer,${keyType}
          keyEncoderWithTag: ${
            this.#mapTypeToEncodeMethod(field.keyType, field.resolvedKeyType as any).typeName
          },
          valueEncoderWithTag: ${
            this.#mapTypeToEncodeMethod(field.type, field.resolvedType!).typeName
          },
        })
      `
    }
    if (isScalarType(field.type) || isEnum(field.resolvedType!)) {
      const { typeName: method } = this.#mapTypeToEncodeMethod(field.type, field.resolvedType)
      file.addImport({
        absolutePath: '@protobuf-es/core',
        member: method,
      })

      return `${method}({
        value: value["${field.name}"],
        tag: ${field.id},
        writer,
      })`
    }

    const encodeMethodName = this.#mapTypeToEncodeMethod(field.type, field.resolvedType).typeName

    file.addImport({
      absolutePath: this.filesManager.getTSFileByUnionType(field.resolvedType!),
      member: encodeMethodName,
    })

    file.addImport({
      absolutePath: '@protobuf-es/core',
      member: 'encodeMessageToBuffer',
    })

    return `encodeMessageToBuffer(
      {
        value: value["${field.name}"],
        tag: ${field.id},
        writer,
      },
      ${encodeMethodName}
    )`
  }

  generateTypeContent(type: Type): string {
    const currentFile = this.filesManager.getTSFileByProtoPath(getFilenameByType(type))
    const name = this.#getEncoderName(type)
    const isEmpty = type.fieldsArray.length === 0
    const paramsDefined = isEmpty ? `{ value: _value, writer: _writer }` : `{ value, writer }`
    const genFieldEncode = (field: Field) => {
      let content = this.#genFieldContent(type, field)
      if (field.optional) {
        content = `
          if (value["${field.name}"] !== undefined) {
            ${content}
          }
        `
      }
      return content
    }
    currentFile.addImport({
      absolutePath: '@protobuf-es/core',
      member: 'EncoderWithoutTag',
    })
    return formatTypescript(
      `export const ${name}: EncoderWithoutTag<${type.name}> = (${paramsDefined}) => {
        ${type.fieldsArray.map((field) => genFieldEncode(field)).join('\n')}
      }`
    )
  }
  #getEncoderName(type: Type | Field) {
    return 'encode' + upperCaseFirst(this.#nameManager.getUniqueName(type))
  }

  getMemberNameByType(type: Type): string {
    return this.#getEncoderName(type)
  }
}
