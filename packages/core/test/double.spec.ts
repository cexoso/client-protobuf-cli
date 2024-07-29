import { describe, it, expect } from 'vitest'
import { Field, Type } from 'protobufjs'
import { createWriter, toHexString } from '../src/writer'
import { encodeDoubleToBuffer } from '../src/encode'
import { Uint8ArrayToHexString, hexstringToReader } from './hexstring-to-reader.helper'
import { readDouble, readTag } from '../src/reader'
import { WireType } from '../src/wire-type'

const DoubleMessage = new Type('DoubleMessage').add(new Field('x', 1, 'double'))

describe('double', async () => {
  it('小的数字', async () => {
    const value = 1.12345

    const expectedBuffer = DoubleMessage.encode({
      x: value,
    }).finish()

    const writer = createWriter()
    encodeDoubleToBuffer({
      writer,
      tag: 1,
      value,
    })
    const buffer = toHexString(writer)
    const reader = hexstringToReader(buffer)
    expect(buffer).eq(Uint8ArrayToHexString(expectedBuffer))
    expect(readTag(reader)).deep.eq([1, WireType.Bit64])
    expect(readDouble(reader)).eq(value)
  })
})
