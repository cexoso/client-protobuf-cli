import { createReader, ReaderLike } from '../reader'

export type Decoder<T> = (reader: ReaderLike) => T
export type OutputType<T> = T extends Decoder<infer O> ? O : never

export const wrapDecode = <T extends Decoder<any>>(
  decoder: T
): ((input: Uint8Array) => OutputType<T>) => {
  return (input) => decoder(createReader(input))
}
