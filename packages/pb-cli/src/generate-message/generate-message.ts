import { inject, injectable } from 'inversify'
import { Root, Type } from 'protobufjs'
import { getAllMessages } from './get-all-type'
import { InterfaceGenerater } from './generate/g-interface'
import { EncoderGenerater } from './generate/g-encode'
import { DecoderGenerater } from './generate/g-decode'

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
  #doForType(files: Map<string, Root>, job: (_: Type) => any) {
    const data = this.getAllTypes(files)
    data.map((type) => {
      job(type)
    })
  }
  generateType(files: Map<string, Root>) {
    this.#doForType(files, (type) => this.interfaceGenerater.generateMessage(type))
  }
  generateDecode(files: Map<string, Root>) {
    this.#doForType(files, (type) => this.decoderGenerater.generateDecodeCode(type))
  }
  generateEncoder(files: Map<string, Root>) {
    this.#doForType(files, (type) => this.encoderGenerater.generateEncodeCode(type))
  }
  generateAllCode(files: Map<string, Root>) {
    this.generateType(files)
    this.generateEncoder(files)
    this.generateDecode(files)
  }
}
