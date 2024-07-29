import { int64ToString, varint32read, varint64read, uInt64ToString } from './google/varint'
import { WireType } from './wire-type'

// 使用 FP 方式组织这块逻辑

// google/varint 定义的结构，为了减少桥接代码，我也使用该结构。
// 这会导致部分代码实现有奇怪
export interface ReaderLike {
  buf: Uint8Array
  pos: number
  len: number
  assertBounds(): void
  dataView: DataView
}

export const createReader = (uint8Array: Uint8Array): ReaderLike => {
  const len = uint8Array.length
  const pos = 0
  return {
    buf: uint8Array,
    pos,
    len,
    dataView: new DataView(uint8Array.buffer, pos, len),
    assertBounds() {
      if (this.pos > this.len) throw new RangeError('premature EOF')
    },
  }
}

export const readTag = (reader: ReaderLike) => {
  let tag = readUint32(reader),
    fieldNo = tag >>> 3,
    wireType = tag & 7
  if (fieldNo <= 0 || wireType < 0 || wireType > 5) {
    throw new Error('illegal tag: field no ' + fieldNo + ' wire type ' + wireType)
  }
  return [fieldNo, wireType] as [number, WireType]
}

export const readUint32 = (reader: ReaderLike) => varint32read.apply(reader)

export const readInt32 = (reader: ReaderLike): number => readUint32(reader) | 0

// enum 底层的本质就是 int32
export const readEnum = readInt32

export const readSint32 = (reader: ReaderLike): number => {
  const zze = readUint32(reader)
  // decode zigzag
  return (zze >>> 1) ^ -(zze & 1)
}

export const readSint64 = (reader: ReaderLike): string => {
  let [lo, hi] = readAsVarint64(reader)
  // decode zig zag
  let s = -(lo & 1)
  lo = ((lo >>> 1) | ((hi & 1) << 31)) ^ s
  hi = (hi >>> 1) ^ s
  return int64ToString(lo, hi)
}

const readAsVarint64 = (reader: ReaderLike) => varint64read.apply(reader)

export const readInt64 = (reader: ReaderLike): string =>
  int64ToString.apply(null, readAsVarint64(reader))

export const readUint64 = (reader: ReaderLike): string =>
  uInt64ToString.apply(null, readAsVarint64(reader))

export const readBool = (reader: ReaderLike): boolean => {
  const [lo, hi] = readAsVarint64(reader)
  return lo !== 0 || hi !== 0
}

export const readAsBytes = (reader: ReaderLike): Uint8Array => {
  let len = readUint32(reader)
  const start = reader.pos
  reader.pos += len
  reader.assertBounds()
  return reader.buf.subarray(start, start + len)
}

export const readString = (reader: ReaderLike) => {
  const bytes = readAsBytes(reader)
  const decoder = new TextDecoder()
  return decoder.decode(bytes)
}

export const readDouble = (reader: ReaderLike) => {
  const value = reader.dataView.getFloat64(reader.pos, true)
  reader.pos += 8 // 读 8 个 byte(64 位)
  return value
}

export const readFloat = (reader: ReaderLike) => {
  const value = reader.dataView.getFloat32(reader.pos, true)
  reader.pos += 4
  return value
}

export const readFixed32 = (reader: ReaderLike) => {
  const value = reader.dataView.getUint32(reader.pos, true)
  reader.pos += 4
  return value
}

export const readFixed64 = (reader: ReaderLike) => {
  const lo = readFixed32(reader)
  const hi = readFixed32(reader)
  return uInt64ToString(lo, hi)
}

export const readSfixed32 = (reader: ReaderLike) => {
  const value = reader.dataView.getInt32(reader.pos, true)
  reader.pos += 4
  return value
}

export const readSfixed64 = (reader: ReaderLike) => {
  const lo = readFixed32(reader)
  const hi = readFixed32(reader)
  return int64ToString(lo, hi)
}

export const forkReader = (
  reader: ReaderLike,
  opts: {
    len: number
  }
) => Object.assign({}, reader, { len: reader.pos + opts.len })

export const skip = (
  reader: ReaderLike,
  {
    wireType,
    fieldNo,
  }: {
    wireType: WireType
    fieldNo?: number
  }
): Uint8Array => {
  let start = reader.pos
  switch (wireType) {
    case WireType.Varint:
      while (reader.buf[reader.pos++]! & 0x80) {
        // ignore
      }
      break
    case WireType.Bit64:
      reader.pos += 8
      break
    case WireType.Bit32:
      reader.pos += 4
      break
    case WireType.LengthDelimited:
      let len = readUint32(reader)
      reader.pos += len
      break
    // 这段是不需要的，protobuf 现在不再支持 StartGroup 和 EndGroup 了
    // 留在这浪费代码
    case WireType.StartGroup:
      for (;;) {
        const [fn, wt] = readTag(reader)
        if (wt === WireType.EndGroup) {
          if (fieldNo !== undefined && fn !== fieldNo) {
            throw new Error('invalid end group tag')
          }
          break
        }
        skip(reader, {
          wireType: wt,
          fieldNo: fn,
        })
      }
      break
    default:
      throw new Error('cant skip wire type ' + wireType)
  }
  reader.assertBounds()
  return reader.buf.subarray(start, reader.pos)
}

export const arrayBufferToReader = (arrayBuffer: ArrayBuffer) =>
  createReader(new Uint8Array(arrayBuffer))
