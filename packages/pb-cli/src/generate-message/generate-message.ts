import { inject, injectable } from 'inversify'
import { Root } from 'protobufjs'
import { getAllMessages } from './get-all-type'
import { group } from 'radash'
import { InterfaceGenerater } from './generate/g-interface'
import { EncoderGenerater } from './generate/g-encode'

@injectable()
export class MessageGenerator {
  constructor(
    @inject(InterfaceGenerater) private interfaceGenerater: InterfaceGenerater,
    @inject(EncoderGenerater) private encoderGenerater: EncoderGenerater
  ) {}
  #getGroupTypesByFileName(files: Map<string, Root>) {
    const entries = files.entries()
    const data = group(
      [...entries].flatMap(([_, root]) => getAllMessages(root)),
      (i) => i.filename
    )
    return data
  }
  generateType(files: Map<string, Root>) {
    const data = this.#getGroupTypesByFileName(files)
    Object.keys(data)
      .flatMap((fileName) => data[fileName])
      .map((type) => this.interfaceGenerater.generateMessage(type))
  }
  generateEncoderAndDecoder(files: Map<string, Root>) {
    const data = this.#getGroupTypesByFileName(files)
    Object.keys(data)
      .flatMap((fileName) => data[fileName])
      .map((type) => this.encoderGenerater.generateEncodeCode(type))
  }
  generateMessageCode(files: Map<string, Root>) {}
}
