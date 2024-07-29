import { Field, Type } from 'protobufjs'
import { isScalarType, mapScalarToDecodeMethod, isEnum } from './scalar'
import { camel } from 'radash'
import { upperCaseFirst } from '../prettier/string-format'
import { formatTypescript } from '../prettier'
import { ImportManager } from './imports-manager'

export class DecoderGenerater {
  #importManager = new ImportManager()
  #messageDecodeOrder: string[] = []
  #messageDecodeMap = new Map<string, string>()
  #mapTypeToDecodeMethod(field: Field) {
    if (isScalarType(field.type)) {
      return mapScalarToDecodeMethod(field)
    }
    return 'readEnum'
  }
  #generateMessageDecodeCodeIfNeed(type: Type) {
    let content = this.#messageDecodeMap.get(type.name)
    if (content === undefined) {
      this.#messageDecodeMap.set(type.name, '')
      const typeName = upperCaseFirst(type.name)
      const name = 'decode' + typeName
      const genFieldDecode = (field: Field) => {
        const tag = field.id
        let config = ''
        const repeatedDescription = field.repeated ? 'isRepeat: true, ' : ''
        if (isScalarType(field.type) || isEnum(field.resolvedType)) {
          const decode = this.#mapTypeToDecodeMethod(field)
          this.#importManager.addImportsIfNeed('protobuf-frontend', decode)
          config = `{ type: 'scalar', ${repeatedDescription}decode: ${decode}, name: '${camel(
            field.name
          )}' }`
        } else {
          const type = field.root.lookupTypeOrEnum(field.type)
          const decodeName = 'decode' + upperCaseFirst(field.type)
          this.#generateMessageDecodeCodeIfNeed(type)
          config = `{ type: 'message', ${repeatedDescription}decode: ${decodeName}, name: '${camel(
            field.name
          )}' }`
        }
        return `[${tag}, ${config}],`
      }

      content = formatTypescript(
        `const ${name} = defineMessage<${typeName}>(
          new Map([
            ${type.fieldsArray.map((field) => genFieldDecode(field)).join('\n')}
          ])
        )`
      )
      this.#importManager.addImportsIfNeed('protobuf-frontend', 'defineMessage')
      this.#messageDecodeOrder.push(type.name)
      this.#messageDecodeMap.set(type.name, content)
    }
    return content
  }

  generateDecodeCode(type: Type) {
    this.#generateMessageDecodeCodeIfNeed(type)
    return this.toFiles()
  }
  toFiles() {
    return {
      imports: this.#importManager,
      decodeMessageCodes: this.#messageDecodeOrder.map((name) => this.#messageDecodeMap.get(name)),
    }
  }
}
