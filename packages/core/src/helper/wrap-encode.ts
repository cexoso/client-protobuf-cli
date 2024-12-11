import { EncoderWithoutTag } from '../encode'
import { createWriter, toUint8Array } from '../writer'

export type inputType<T> = T extends EncoderWithoutTag<infer B> ? B : never
export const wrapEncode = <T extends EncoderWithoutTag<any>>(encoder: T) => {
  return (input: inputType<T>) => {
    const writer = createWriter()
    encoder({
      writer,
      value: input,
    })
    return toUint8Array(writer)
  }
}
