import { Enum, Field, MapField, Type } from 'protobufjs'
import { isScalarType } from './scalar'
import { upperCaseFirst } from '../../prettier/string-format'
import { inject, injectable } from 'inversify'
import { TSFilesManager } from '../../files-manager/files-manager'
import { File } from '../../files-manager/file'
import { getFilenameByType } from '../get-filename-by-type'
import { NameManager } from './name-conflict-manager'
import { InterfaceGenerater } from './g-interface1'

@injectable()
export class Traversal {
  #nameManager = new NameManager()
  constructor(
    @inject(TSFilesManager) private filesManager: TSFilesManager,
    @inject(InterfaceGenerater) private interfaceGenerater: InterfaceGenerater
  ) {}
  #messageMap = new Map<string, { content: string; file: File }>()
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
      }
    }
  }

  #generateTypeContent(type: Type) {
    const interfaceContent = this.interfaceGenerater.generateTypeContent(type)
    return interfaceContent
  }

  #handleScalar(_scalarType: string) {}
  #handleEnum(_enumType: Enum) {}

  #handleType(type: Type) {
    let result = this.#messageMap.get(type.fullName)
    if (result === undefined) {
      const currentFile = this.filesManager.getTSFileByProtoPath(getFilenameByType(type))
      const content = this.#generateTypeContent(type)
      result = { content, file: currentFile }
      this.#messageMap.set(type.fullName, result)

      result.file.write(result.content)
      this.#getAndCompileDependenciesEncode(type.fieldsArray)
    }
    return result
  }

  generate(type: Type) {
    return this.#handleType(type)
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
