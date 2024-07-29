import { expect, describe, it } from 'vitest'
import { Field, Type } from 'protobufjs'
import { encodeSfixed32ToBuffer } from '../src/encode'
import { createWriter, toHexString } from '../src/writer'
import { Uint8ArrayToHexString, hexstringToReader } from './hexstring-to-reader.helper'
import { WireType } from '../src/wire-type'
import { readSfixed32, readTag } from '../src/reader'

const Sfixed32Message = new Type('Sfixed32Message').add(new Field('x', 1, 'sfixed32'))

describe('sfixed32', async () => {
  it('正数', async () => {
    const value = 123
    const expectedBuffer = Sfixed32Message.encode({
      x: value,
    }).finish()

    const writer = createWriter()
    encodeSfixed32ToBuffer({
      writer,
      tag: 1,
      value,
    })
    const buffer = toHexString(writer)
    expect(buffer).eq(Uint8ArrayToHexString(expectedBuffer))
    const reader = hexstringToReader(buffer)
    expect(readTag(reader)).deep.eq([1, WireType.Bit32])
    expect(readSfixed32(reader)).eq(value)
  })
  it('负数', async () => {
    const value = -123
    const expectedBuffer = Sfixed32Message.encode({
      x: value,
    }).finish()

    const writer = createWriter()
    encodeSfixed32ToBuffer({
      writer,
      tag: 1,
      value,
    })
    const buffer = toHexString(writer)
    expect(buffer).eq(Uint8ArrayToHexString(expectedBuffer))
    const reader = hexstringToReader(buffer)
    expect(readTag(reader)).deep.eq([1, WireType.Bit32])
    expect(readSfixed32(reader)).eq(value)
  })
})
