import { expect, describe, it } from 'vitest'
import { Field, Type } from 'protobufjs'
import { encodeUint32ToBuffer } from '../src/encode'
import { createWriter, toHexString } from '../src/writer'
import { arrayBufferToReader, readTag, readUint32 } from '../src/reader'
import { Uint8ArrayToHexString } from './hexstring-to-reader.helper'

const message = new Type('XMessage').add(new Field('x', 1, 'uint32'))

describe('uint32', async () => {
  function encodeWithFN(value: number, tag: number) {
    const writer = createWriter()
    encodeUint32ToBuffer({ value, tag, writer })
    return toHexString(writer)
  }
  it('小的数字', async () => {
    const value = 2
    const buffer = message.encode({ x: value }).finish()
    expect(encodeWithFN(value, 1)).eq(Uint8ArrayToHexString(buffer))
    const reader = arrayBufferToReader(buffer)
    readTag(reader)
    expect(readUint32(reader)).eq(value)
  })
})
