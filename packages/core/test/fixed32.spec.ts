import { expect, describe, it } from 'vitest'
import { Field, Type } from 'protobufjs'
import { encodeFixed32ToBuffer } from '../src/encode'
import { createWriter, toHexString } from '../src/writer'
import { Uint8ArrayToHexString, hexstringToReader } from './hexstring-to-reader.helper'
import { WireType } from '../src/wire-type'
import { readFixed32, readTag } from '../src/reader'

const Fixed32Message = new Type('Fixed32Message').add(new Field('x', 1, 'fixed32'))

describe('fixed32', async () => {
  it('正数', async () => {
    const value = 123
    const expectedBuffer = Fixed32Message.encode({
      x: value,
    }).finish()

    const writer = createWriter()
    encodeFixed32ToBuffer({
      writer,
      tag: 1,
      value,
    })
    const buffer = toHexString(writer)
    expect(buffer).eq(Uint8ArrayToHexString(expectedBuffer))
    const reader = hexstringToReader(buffer)
    expect(readTag(reader)).deep.eq([1, WireType.Bit32])
    expect(readFixed32(reader)).eq(value)
  })
})
