import { Method } from 'protobufjs'
import { camel } from 'radash'
import { upperCaseFirst } from '../prettier/string-format'
import { formatTypescript } from '../prettier'
import dedent from 'ts-dedent'
import { ImportManager } from './imports-manager'

export class RequestorGenerater {
  #importManager = new ImportManager()
  #messageDecodeOrder: string[] = []
  #messageDecodeMap = new Map<string, string>()

  generateRequestor(
    method: Method,
    {
      fnsServiceName,
    }: {
      fnsServiceName: string
    }
  ) {
    const { name } = method
    const methodId = `0x${method.options['(srpc.method_option_id)'].toString(16)}`
    const requestType = upperCaseFirst(method.requestType)
    const responseType = upperCaseFirst(method.responseType)
    const paramName = camel(requestType)
    const methodName = camel(name)
    const result = formatTypescript(
      dedent(`
      export const ${methodName} = (${paramName}: ${requestType}) => {
        const methodId = ${methodId}
        const writer = createWriter()
        encode${requestType}({
          writer,
          value: ${paramName},
        })
        const buffer = toUint8Array(writer)
        return fetch('/api/${fnsServiceName}', {
          method: 'POST',
          headers: {
            'service-id': String(serviceId),
            'method-id': String(methodId),
          },
          body: buffer,
        })
          .then((response) => response.arrayBuffer())
          .then((arrayBuffer) => arrayBufferToReader(arrayBuffer))
          .then(decode${responseType})
      }
    `)
    )

    this.#importManager.addImportsIfNeed('protobuf-frontend', 'toUint8Array')
    this.#importManager.addImportsIfNeed('protobuf-frontend', 'createWriter')
    this.#importManager.addImportsIfNeed('protobuf-frontend', 'arrayBufferToReader')

    this.#messageDecodeOrder.unshift(methodName)
    this.#messageDecodeMap.set(methodName, result)
    return this.toFiles()
  }
  toFiles() {
    return {
      requestors: this.#messageDecodeOrder.map((name) => {
        return this.#messageDecodeMap.get(name)!
      }),
      imports: this.#importManager,
    }
  }
}
