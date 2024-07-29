import { expect, describe, it } from 'vitest'
import { Field, Type } from 'protobufjs'
import { encodeInt32ToBuffer } from '../src/encode'
import { createWriter, toHexString } from '../src/writer'
import { Uint8ArrayToHexString } from './hexstring-to-reader.helper'
import { arrayBufferToReader, readInt32, readTag } from '../src/reader'
import { WireType } from '../src/wire-type'

const message = new Type('XMessage').add(new Field('x', 1, 'int32'))

describe('int32', async () => {
  function encodeInt32WithFN(value: number, tag: number) {
    const writer = createWriter()
    encodeInt32ToBuffer({
      value,
      tag,
      writer,
    })
    return toHexString(writer)
  }
  describe('encode', () => {
    it('小的数字', async () => {
      const value = 2
      const buffer = message.encode({ x: value }).finish()
      expect(encodeInt32WithFN(value, 1)).eq(Uint8ArrayToHexString(buffer))
    })
  })
  describe('decode', () => {
    it('小的数字', async () => {
      const value = 2
      const buffer = message.encode({ x: value }).finish()
      const reader = arrayBufferToReader(buffer)
      const [tag, wireType] = readTag(reader)
      expect(tag).eq(1, '能获取到 tag')
      expect(wireType).eq(WireType.Varint, '能获取到编码类型')
      expect(readInt32(reader)).eq(2, '能解码出值')
    })
    it('支持负数', async () => {
      const value = -2
      const buffer = message.encode({ x: value }).finish()
      const reader = arrayBufferToReader(buffer)
      readTag(reader)
      expect(readInt32(reader)).eq(-2)
    })
  })
})
