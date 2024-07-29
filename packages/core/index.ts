export { defineMessage } from './src/decode'
export {
  readInt32,
  createReader,
  arrayBufferToReader,
  readString,
  readUint32,
  readBool,
  readUint64,
  readDouble,
  readFloat,
  readSint32,
  readSint64,
  readInt64,
  readFixed32,
  readSfixed32,
  readFixed64,
  readSfixed64,
  readEnum,
} from './src/reader'
export type { EncoderWithoutTag } from './src/encode'
export {
  encodeStringToBuffer,
  encodeUint32ToBuffer,
  encodeInt64ToBuffer,
  encodeInt32ToBuffer,
  encodeBoolToBuffer,
  encodeDoubleToBuffer,
  encodeRepeatToBuffer,
  encodeMessageToBuffer,
  encodeUint64ToBuffer,
  encodeFloatToBuffer,
  encodeSint32ToBuffer,
  encodeSint64ToBuffer,
  encodeFixed32ToBuffer,
  encodeSfixed32ToBuffer,
  encodeFixed64ToBuffer,
  encodePackedRepeatToBuffer,
  encodeSfixed64ToBuffer,
  encodeEnumToBuffer,
} from './src/encode'
export { toUint8Array, createWriter } from './src/writer'
export type { ReaderLike } from './src/reader'
