// 使用 FP 方式组织这块逻辑

import { int64FromString, varint32write, varint64write } from './google/varint'
import { assertInt32, assertInt64String, assertUInt32, assertUInt64String } from './private/assert'
import { decode, length } from './private/base64'
import { WireType } from './wire-type'

type Byte = number
export interface Writer {
  stackBytes: Byte[][]
}

export const createWriter = (): Writer => {
  return {
    stackBytes: [[]],
  }
}

const raw = (writer: Writer, bytes: Byte[] | Byte) => {
  const byteList = Array.isArray(bytes) ? bytes : [bytes]

  const currenctBytes = writer.stackBytes[writer.stackBytes.length - 1]!
  for (let i = 0; i < byteList.length; i++) {
    currenctBytes.push(byteList[i]!)
  }
}

const getCurrenctBytes = (writer: Writer) => writer.stackBytes[writer.stackBytes.length - 1]!

export const writeTag = (writer: Writer, tag: number, wireType: WireType) => {
  writeUint32(writer, ((tag << 3) | wireType) >>> 0)
}

export const toUint8Array = (writer: Writer) => {
  const bytes = getCurrenctBytes(writer)
  return new Uint8Array(bytes)
}

export const toBuffer = (writer: Writer) => {
  const bytes = getCurrenctBytes(writer)
  return Buffer.from(new Uint8Array(bytes))
}

export const writeInt64 = (writer: Writer, value: string) => {
  assertInt64String(value)
  const int64 = int64FromString(value)
  varint64write(int64.lo, int64.hi, getCurrenctBytes(writer))
}

export const writeSint64 = (writer: Writer, value: string) => {
  assertInt64String(value)
  const int64 = int64FromString(value)
  // zigzag encode
  const sign = int64.hi >> 31
  const lo = (int64.lo << 1) ^ sign
  const hi = ((int64.hi << 1) | (int64.lo >>> 31)) ^ sign
  varint64write(lo, hi, getCurrenctBytes(writer))
}

export const writeUint64 = (writer: Writer, value: string) => {
  assertUInt64String(value)
  const int64 = int64FromString(value)
  varint64write(int64.lo, int64.hi, getCurrenctBytes(writer))
}

export const writeDouble = (writer: Writer, value: number) => {
  let chunk = new Uint8Array(8)
  const dataView = new DataView(chunk.buffer)
  dataView.setFloat64(0, value, true)
  writeDataView(writer, dataView)
}

export const writeFloat = (writer: Writer, value: number) => {
  let chunk = new Uint8Array(4)
  const dataView = new DataView(chunk.buffer)
  dataView.setFloat32(0, value, true)
  writeDataView(writer, dataView)
}

export const toHexString = (writerOrBuffer: Writer | Uint8Array) => {
  if (writerOrBuffer instanceof Uint8Array) {
    const buffer = writerOrBuffer
    return Buffer.from(buffer).toString('hex')
  }
  return Buffer.from(getCurrenctBytes(writerOrBuffer)).toString('hex')
}

export const writeInt32 = (writer: Writer, value: number) => {
  assertInt32(value)
  varint32write(value, getCurrenctBytes(writer))
}

const base64ToUint8Array = (base64: string) => {
  const len = length(base64)
  const uint8Array = new Uint8Array(len)
  decode(base64, uint8Array, 0)
  return uint8Array
}

export const writeBytes = (writer: Writer, value: Uint8Array | string) => {
  const uint8Array = typeof value === 'string' ? base64ToUint8Array(value) : value

  writeUint32(writer, uint8Array.length)

  // 本来底层想不使用 uint8Araay 的目的就是想兼容老旧浏览器
  // 结果需要在 node 上使用，又得重新考虑 uint8Array
  // 需要再思考一下要怎么处理这两者的矛盾
  for (let index = 0; index < uint8Array.length; index++) {
    const byte = uint8Array[index]!
    raw(writer, byte)
  }
}

export const writeUint32 = (writer: Writer, value: number) => {
  assertUInt32(value)
  // write value as varint 32, inlined for speed
  while (value > 0x7f) {
    raw(writer, (value & 0x7f) | 0x80)
    value = value >>> 7
  }
  raw(writer, value)
}

export const writeFixed32 = (writer: Writer, value: number) => {
  assertUInt32(value)

  let chunk = new Uint8Array(4)
  const dataView = new DataView(chunk.buffer)
  dataView.setUint32(0, value, true)
  writeDataView(writer, dataView)
}

const writeAsInt46 = (writer: Writer, value: string) => {
  const { lo, hi } = int64FromString(value)
  let chunk = new Uint8Array(8)
  const dataView = new DataView(chunk.buffer)
  dataView.setInt32(0, lo, true)
  dataView.setInt32(4, hi, true)
  writeDataView(writer, dataView)
}

export const writeFixed64 = (writer: Writer, value: string) => {
  assertUInt64String(value)
  writeAsInt46(writer, value)
}

export const writeSfixed64 = (writer: Writer, value: string) => {
  assertInt64String(value)
  writeAsInt46(writer, value)
}

export const writeSfixed32 = (writer: Writer, value: number) => {
  assertInt32(value)

  let chunk = new Uint8Array(4)
  const dataView = new DataView(chunk.buffer)
  dataView.setInt32(0, value, true)
  writeDataView(writer, dataView)
}

const writeDataView = (writer: Writer, dataView: DataView) => {
  const bytes = getCurrenctBytes(writer)
  for (let i = 0; i < dataView.byteLength; i++) {
    // TODO: 直接使用 uint8Array 做数据结构，而不要使用 number, 来减少不必要的转换
    // 现在的 ArrayBuffer 兼容性已经很高了
    bytes.push(dataView.getUint8(i))
  }
}

export const writeSint32 = (writer: Writer, value: number) => {
  assertInt32(value)

  // zigzag encode
  value = ((value << 1) ^ (value >> 31)) >>> 0
  varint32write(value, getCurrenctBytes(writer))
}

export const writeBool = (writer: Writer, value: boolean) => {
  raw(writer, value ? 1 : 0)
  return this
}

export const writeString = (writer: Writer, value: string) => {
  const encoder = new TextEncoder()
  const result = encoder.encode(value)

  writeUint32(writer, result.length)

  for (let i = 0; i < result.length; i++) {
    const byte = result[i]!
    raw(writer, byte)
  }
}

export const forkWriter = (writer: Writer) => {
  writer.stackBytes.push([])
}

export const joinWriter = (writer: Writer) => {
  let prev = writer.stackBytes.pop()
  if (!prev) throw new Error('invalid state, fork stack empty')
  writeUint32(writer, prev.length)
  raw(writer, prev)
}
