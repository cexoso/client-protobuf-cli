import { forkReader, ReaderLike, readTag, readUint32, skip } from './reader'
import { WireType } from './wire-type'

export interface TagHandler {
  decode: (...o: any) => any
  type: 'scalar' | 'message'
  isRepeat?: boolean
  // map 是特殊的 repeat, map 和 repeat 是互斥的
  isMap?: boolean
  name: string
  isPacked?: boolean
}

function decodeRepeated(opts: {
  handler: TagHandler
  reader: ReaderLike
  result: Record<string, any>
}) {
  const { handler, reader, result } = opts
  // Packed 只在 repeat 上有用，并且只对 scalar 除(STRING BYTES) 有用
  // 在 proto3 默认开启，proto2 默认关闭
  if (handler.isPacked) {
    const len = readUint32(reader)
    for (let i = 0; i < len; i++) {
      result[handler.name] = result[handler.name] || []
      result[handler.name].push(handler.decode(reader))
    }
    return
  }
  result[handler.name] = result[handler.name] || []
  result[handler.name].push(handler.decode(reader))
}

function decodeAsScalar(opts: {
  handler: TagHandler
  reader: ReaderLike
  result: Record<string, any>
}) {
  const { handler, reader, result } = opts
  if (handler.isRepeat) {
    decodeRepeated({
      handler,
      reader,
      result,
    })
  } else {
    result[handler.name] = handler.decode(reader)
  }
}

function decodeAsMessage(opts: {
  handler: TagHandler
  reader: ReaderLike
  wireType: WireType
  result: Record<string, any>
}) {
  const { handler, reader, result } = opts

  const len = readUint32(reader)
  const newReader = forkReader(reader, {
    len,
  })

  const { isMap, isRepeat } = handler
  const isArrayEncoding = isRepeat || isMap

  if (isArrayEncoding) {
    // 这里已经可以使用 ES6 的 map 来实现了，但是目前仍使用字面量对象来实现
    // 目的是为了跟 protobuf.js 的实现对齐
    result[handler.name] = result[handler.name] || (isMap ? {} : [])
    const x = handler.decode(newReader)
    if (isMap) {
      const { mapKey, mapValue } = x
      result[handler.name][mapKey] = mapValue
    } else {
      result[handler.name].push(x)
    }
  } else {
    result[handler.name] = handler.decode(newReader)
  }
  reader.pos = newReader.pos
}

export const decodeMessage = <T>(opts: { tagMap: Map<number, TagHandler>; reader: ReaderLike }) => {
  const { reader, tagMap } = opts

  const result: Record<string, any> = {}
  while (reader.pos < reader.len) {
    const [tag, wireType] = readTag(reader)
    const handler = tagMap.get(tag)
    if (!handler) {
      // 兼容不认识的 tag，直接跳过
      skip(reader, { wireType, fieldNo: tag })
      continue
    }

    if (handler.type === 'scalar') {
      decodeAsScalar({ handler, reader, result })
      continue
    }

    if (handler.type === 'message') {
      decodeAsMessage({ handler, reader, result, wireType })
      continue
    }
  }
  return result as unknown as T
}

export const defineMessage =
  <T>(tagMap: Map<number, TagHandler>) =>
  (reader: ReaderLike) =>
    decodeMessage<T>({
      tagMap,
      reader,
    })

export const defineMap = <T>(opts: {
  keyReader: any
  valueReader: any
  valueType: 'message' | 'scalar'
}) => {
  const { keyReader, valueReader } = opts
  const tagMap: Map<number, TagHandler> = new Map([
    [1, { type: 'scalar', decode: keyReader, name: 'mapKey' }],
    [2, { type: opts.valueType, decode: valueReader, name: 'mapValue' }],
  ])
  return (reader: ReaderLike) => {
    const result = decodeMessage<T>({
      tagMap,
      reader,
    })
    return result
  }
}
