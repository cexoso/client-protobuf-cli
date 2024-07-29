export { defineMessage, defineMap, TagHandler } from './decode'
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
  readAsBytes,
} from './reader'
export type { EncoderWithoutTag } from './encode'
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
  encodeMapToBuffer,
  encodeFixed32ToBuffer,
  encodeSfixed32ToBuffer,
  encodeFixed64ToBuffer,
  encodePackedRepeatToBuffer,
  encodeSfixed64ToBuffer,
  encodeEnumToBuffer,
  encodeByteToBuffer,
} from './encode'
export { toUint8Array, createWriter } from './writer'
export type { ReaderLike } from './reader'
export { wrapDecode } from './helper/wrap-decode'
export { wrapEncode } from './helper/wrap-encode'
