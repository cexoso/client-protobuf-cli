import { inject, injectable } from 'inversify'
import { Root, Type } from 'protobufjs'
import { getAllMessages } from './get-all-type'
import { InterfaceGenerater } from './generate/g-interface'
import { EncoderGenerater } from './generate/g-encode'
import { DecoderGenerater } from './generate/g-decode'

interface Opts {
  typeFullnameRegExp?: RegExp | string
}

@injectable()
export class MessageGenerator {
  constructor(
    @inject(InterfaceGenerater) private interfaceGenerater: InterfaceGenerater,
    @inject(EncoderGenerater) private encoderGenerater: EncoderGenerater,
    @inject(DecoderGenerater) private decoderGenerater: DecoderGenerater
  ) {}
  getAllTypes(files: Map<string, Root>) {
    const entries = files.entries()
    const dedupeMap = new Set<string>()
    const data = [...entries].flatMap(([_, root]) => getAllMessages(root))
    return data.filter((type) => {
      if (dedupeMap.has(type.fullName)) {
        return false
      }
      dedupeMap.add(type.fullName)
      return true
    })
  }
  #doForType(files: Map<string, Root>, job: (_: Type) => any, opts?: Opts) {
    const data = this.getAllTypes(files)
    data.map((type) => {
      if (opts?.typeFullnameRegExp && !type.fullName.match(opts.typeFullnameRegExp)) {
        return
      }
      job(type)
    })
  }
  generateType(files: Map<string, Root>, opts?: Opts) {
    this.#doForType(files, (type) => this.interfaceGenerater.generateMessage(type), opts)
  }
  generateDecode(files: Map<string, Root>, opts?: Opts) {
    this.#doForType(files, (type) => this.decoderGenerater.generateDecodeCode(type), opts)
  }
  generateEncoder(files: Map<string, Root>, opts?: Opts) {
    this.#doForType(files, (type) => this.encoderGenerater.generateEncodeCode(type), opts)
  }
  generateAllCode(files: Map<string, Root>, opts?: Opts) {
    this.generateType(files, opts)
    this.generateEncoder(files, opts)
    this.generateDecode(files, opts)
  }
}
