import { Enum, Field, MapField, Type } from 'protobufjs'
import { isScalarType } from './scalar'
import { upperCaseFirst } from '../../prettier/string-format'
import { inject, injectable } from 'inversify'
import { TSFilesManager } from '../../files-manager/files-manager'
import { File } from '../../files-manager/file'
import { NameManager } from './name-conflict-manager'
import { InterfaceGenerater } from './g-interface1'
import { DecoderGenerater } from './g-decode1'
import { Generator } from './type'

@injectable()
export class Traversal {
  #nameManager = new NameManager()
  constructor(
    @inject(TSFilesManager) private filesManager: TSFilesManager,
    @inject(DecoderGenerater) private decoderGenerater: Generator,
    @inject(InterfaceGenerater) private interfaceGenerater: Generator
  ) {}
  #messageMap = new Map<string, { file: File }>()
  // 处理 张量 类型 枚举
  #handleUnionType(type: string, resolvedType: Type | Enum | null) {
    if (isScalarType(type)) {
      this.#handleScalar(type)
    } else if (resolvedType instanceof Enum) {
      this.#handleEnum(resolvedType)
    } else if (resolvedType instanceof Type) {
      this.#handleType(resolvedType)
    }
  }

  #getAndCompileDependenciesEncode(fields: Field[]) {
    for (const field of fields) {
      if (field instanceof MapField) {
        // 处理 value
        this.#handleUnionType(field.type, field.resolvedType)
        // 处理 key, 我不确定 resolvedKeyType ReflectionObject 类型是否兼容，先 any
        this.#handleUnionType(field.keyType, field.resolvedKeyType as any)
      } else {
        // 正常的 field 类型
        this.#handleUnionType(field.type, field.resolvedType)
      }
    }
  }

  #generateTypeContent(type: Type) {
    const interfaceContent = this.interfaceGenerater.generateTypeContent(type)
    const decodeContent = this.decoderGenerater.generateTypeContent(type)
    return `${interfaceContent}\n${decodeContent}`
  }

  #generateContentIfNeed(
    unionType: Type | Field | MapField | Enum,
    callback: (file: File) => void
  ) {
    if (!this.#messageMap.has(unionType.fullName)) {
      const currentFile = this.filesManager.getTSFileByUnionType(unionType)
      this.#messageMap.set(unionType.fullName, {
        file: currentFile,
      })
      callback(currentFile)
    }
  }

  #handleScalar(_scalarType: string) {}

  #handleEnum(enumType: Enum) {
    this.#generateContentIfNeed(enumType, (file) => {
      const interfaceContent = this.interfaceGenerater.generateEnumContent(enumType)
      file.write(interfaceContent)
    })
  }

  #handleType(type: Type) {
    this.#generateContentIfNeed(type, (file) => {
      const content = this.#generateTypeContent(type)
      file.write(content)
      this.#getAndCompileDependenciesEncode(type.fieldsArray)
    })
  }

  generate(type: Type) {
    this.#handleType(type)
  }
  #getEncoderName(type: Type) {
    return 'encode' + upperCaseFirst(this.#nameManager.getUniqueName(type))
  }
  getEncoderByType(type: Type) {
    const name = this.#getEncoderName(type)
    return {
      memberName: name,
      ...this.#messageMap.get(name)!,
    }
  }
}
