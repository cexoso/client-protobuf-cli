import { WireType } from './wire-type'
import {
  forkWriter,
  joinWriter,
  writeBool,
  writeDouble,
  writeFixed32,
  writeFixed64,
  writeFloat,
  writeInt32,
  writeInt64,
  Writer,
  writeSfixed32,
  writeSfixed64,
  writeSint32,
  writeSint64,
  writeString,
  writeTag,
  writeUint32,
  writeUint64,
} from './writer'

interface EncodeParam<T> {
  value: T
  writer: Writer
  tag: number
}

export type EncoderWithTag<T> = (o: EncodeParam<T>) => void
export type EncoderWithoutTag<T> = (o: Omit<EncodeParam<T>, 'tag'>) => void
// 张量类型在数组进行 repeated 编码的时候，有可能采用 packed 方式编码
// 在 packed 方式下，tag 不会进行编码
export type ScalarEncoder<T> = (o: Omit<EncodeParam<T>, 'tag'> & { tag?: number }) => void

export const encodeInt64ToBuffer: ScalarEncoder<string> = ({ value, writer, tag }) => {
  if (tag) {
    writeTag(writer, tag, WireType.Varint)
  }
  writeInt64(writer, value)
}

export const encodeUint64ToBuffer: ScalarEncoder<string> = ({ value, writer, tag }) => {
  if (tag) {
    writeTag(writer, tag, WireType.Varint)
  }
  writeUint64(writer, value)
}

export const encodeInt32ToBuffer: ScalarEncoder<number> = ({ value, tag, writer }) => {
  if (tag) {
    writeTag(writer, tag, WireType.Varint)
  }
  writeInt32(writer, value)
}

// enum 底层的本质就是 int32
export const encodeEnumToBuffer: ScalarEncoder<number> = encodeInt32ToBuffer

export const encodeUint32ToBuffer: ScalarEncoder<number> = ({ value, tag, writer }) => {
  if (tag) {
    writeTag(writer, tag, WireType.Varint)
  }
  writeUint32(writer, value)
}

export const encodeSint64ToBuffer: ScalarEncoder<string> = ({ value, tag, writer }) => {
  if (tag) {
    writeTag(writer, tag, WireType.Varint)
  }
  writeSint64(writer, value)
}

export const encodeFixed32ToBuffer: ScalarEncoder<number> = ({ value, tag, writer }) => {
  if (tag) {
    writeTag(writer, tag, WireType.Bit32)
  }
  writeFixed32(writer, value)
}

export const encodeFixed64ToBuffer: ScalarEncoder<string> = ({ value, tag, writer }) => {
  if (tag) {
    writeTag(writer, tag, WireType.Bit64)
  }
  writeFixed64(writer, value)
}

export const encodeSfixed32ToBuffer: ScalarEncoder<number> = ({ value, tag, writer }) => {
  if (tag) {
    writeTag(writer, tag, WireType.Bit32)
  }
  writeSfixed32(writer, value)
}

export const encodeSfixed64ToBuffer: ScalarEncoder<string> = ({ value, tag, writer }) => {
  if (tag) {
    writeTag(writer, tag, WireType.Bit64)
  }
  writeSfixed64(writer, value)
}

export const encodeSint32ToBuffer: ScalarEncoder<number> = ({ value, tag, writer }) => {
  if (tag) {
    writeTag(writer, tag, WireType.Varint)
  }
  writeSint32(writer, value)
}

export const encodeBoolToBuffer: ScalarEncoder<boolean> = ({ value, tag, writer }) => {
  if (tag) {
    writeTag(writer, tag, WireType.Varint)
  }
  writeBool(writer, value)
}

export const encodeStringToBuffer: ScalarEncoder<string> = ({ value, tag, writer }) => {
  if (tag) {
    writeTag(writer, tag, WireType.LengthDelimited)
  }
  writeString(writer, value)
}

export const encodeDoubleToBuffer: ScalarEncoder<number> = ({ value, tag, writer }) => {
  if (tag) {
    writeTag(writer, tag, WireType.Bit64)
  }
  writeDouble(writer, value)
}

export const encodeFloatToBuffer: ScalarEncoder<number> = ({ value, tag, writer }) => {
  if (tag) {
    writeTag(writer, tag, WireType.Bit32)
  }
  writeFloat(writer, value)
}

export const encodeRepeatToBuffer = <T>(
  values: T[],
  encodeToBuffer: EncoderWithTag<T>,
  tag: number,
  writer: Writer
) => {
  for (let i = 0; i < values.length; i++) {
    const value = values[i] as any
    encodeToBuffer({
      value,
      tag,
      writer,
    })
  }
}

export const encodePackedRepeatToBuffer = <T>(
  values: T[],
  encodeToBuffer: EncoderWithTag<T>,
  tag: number,
  writer: Writer
) => {
  writeTag(writer, tag, WireType.LengthDelimited)
  forkWriter(writer)
  for (let i = 0; i < values.length; i++) {
    const value = values[i]
    // @ts-ignore
    encodeToBuffer({ value, writer })
  }

  joinWriter(writer)
}

export const encodeMessageToBuffer: <T>(
  opts: EncodeParam<T>,
  predicate: EncoderWithoutTag<T>
) => void = ({ value, tag, writer }, encodeToBuffer) => {
  writeTag(writer, tag, WireType.LengthDelimited)
  forkWriter(writer)
  encodeToBuffer({
    value,
    writer,
  })
  joinWriter(writer)
}
