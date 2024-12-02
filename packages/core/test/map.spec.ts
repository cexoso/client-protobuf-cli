import { describe, expect, it } from 'vitest'
import { parse } from 'protobufjs'
import { encodeInt32ToBuffer, encodeMapToBuffer } from '../src/encode'
import { createWriter, toHexString } from '../src/writer'
import { defineMap, defineMessage } from '../src/decode'
import { arrayBufferToReader } from '../src/reader'
import { Uint8ArrayToHexString } from './hexstring-to-reader.helper'

const pbContent = `
message A {
  // map 是不可以 repeated 的
  map<int32, int32> a = 1;
}
`
const { root } = parse(pbContent)
const message = root.lookupType('A')

describe('map', async () => {
  function encodeMap(value: Record<string, Record<string, number>>) {
    const writer = createWriter()
    if (value.a) {
      encodeMapToBuffer(value.a, {
        tag: 1,
        writer,
        keyType: Number,
        keyEncoderWithTag: encodeInt32ToBuffer,
        valueEncoderWithTag: encodeInt32ToBuffer,
      })
    }
    return writer
  }
  const decodeMap = defineMessage(
    new Map([
      [
        1,
        {
          type: 'message',
          decode: defineMap({ keyType: Number, valueType: Number }),
          name: 'a',
        },
      ],
    ])
  )
  it.only('map 编解码', async () => {
    const object = {
      a: {
        1: 1,
      },
    }
    expect(message.verify(object)).eq(null)
    const buffer = message.encode(object).finish()
    const writer = encodeMap(object)
    const reader = arrayBufferToReader(buffer)
    const expectedBuffer = Uint8ArrayToHexString(buffer)
    expect(toHexString(writer)).eq(expectedBuffer)
  })
})
