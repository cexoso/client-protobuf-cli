import { describe, it, expect } from 'vitest'
import { Field, Type } from 'protobufjs'
import { createWriter, toHexString } from '../src/writer'
import { encodeFloatToBuffer } from '../src/encode'
import { Uint8ArrayToHexString, hexstringToReader } from './hexstring-to-reader.helper'
import { readFloat, readTag } from '../src/reader'
import { WireType } from '../src/wire-type'

const FloatMessage = new Type('FloatMessage').add(new Field('x', 1, 'float'))

describe('float', async () => {
  it('小的数字', async () => {
    // 32 float 很容易导致精度问题
    const value = 0.5

    const expectedBuffer = FloatMessage.encode({
      x: value,
    }).finish()

    const writer = createWriter()
    encodeFloatToBuffer({
      writer,
      tag: 1,
      value,
    })
    const buffer = toHexString(writer)
    const reader = hexstringToReader(buffer)
    expect(buffer).eq(Uint8ArrayToHexString(expectedBuffer))
    expect(readTag(reader)).deep.eq([1, WireType.Bit32])
    expect(readFloat(reader)).eq(value)
  })
})
