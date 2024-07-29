import { Method, Type } from 'protobufjs'
import { InterfaceGenerater } from './interface-generater'
import { EncoderGenerater } from './encode-generater'
import { DecoderGenerater } from './decode-generater'
import { RequestorGenerater } from './requestor-generater'

export class ServiceCodeGenerater {
  #interfaceGenerater = new InterfaceGenerater()
  #encoderGenerater = new EncoderGenerater()
  #decoderGenerater = new DecoderGenerater()
  #requestorGenerater = new RequestorGenerater()
  generateMessageInterface(type: Type) {
    return this.#interfaceGenerater.generateMessage(type)
  }

  generateEncodeCode(type: Type) {
    return this.#encoderGenerater.generateEncodeCode(type)
  }
  generateDecodeCode(type: Type) {
    return this.#decoderGenerater.generateDecodeCode(type)
  }
  generateRequestor(method: Method, opts: { fnsServiceName: string }) {
    return this.#requestorGenerater.generateRequestor(method, opts)
  }
  toFiles() {
    const { imports: decodeMessageImports, decodeMessageCodes } = this.#decoderGenerater.toFiles()
    const { imports: encodeMessageIMports, encodeMessageCodes } = this.#encoderGenerater.toFiles()
    const { interfaces } = this.#interfaceGenerater.toFiles()
    const { imports: requestorImports, requestors } = this.#requestorGenerater.toFiles()
    return {
      decodeMessageImports,
      encodeMessageIMports,
      requestorImports,
      interfaces,
      encodeMessageCodes,
      decodeMessageCodes,
      requestors,
    }
  }
}
