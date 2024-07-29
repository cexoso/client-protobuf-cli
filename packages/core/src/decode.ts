import { forkReader, ReaderLike, readTag, readUint32, skip } from './reader'
import { WireType } from './wire-type'

interface TagHandler {
  decode: (...o: any) => any
  type: 'scalar' | 'message'
  isRepeat?: boolean
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

  if (handler.isRepeat) {
    result[handler.name] = result[handler.name] || []
    result[handler.name].push(handler.decode(newReader))
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
