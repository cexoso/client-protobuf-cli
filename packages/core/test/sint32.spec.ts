import { expect, describe, it } from 'vitest'
import { Field, Type } from 'protobufjs'
import { encodeSint32ToBuffer } from '../src/encode'
import { createWriter, toHexString } from '../src/writer'
import { Uint8ArrayToHexString, hexstringToReader } from './hexstring-to-reader.helper'
import { WireType } from '../src/wire-type'
import { readSint32, readTag } from '../src/reader'

const SintMessage = new Type('SintMessage').add(new Field('x', 1, 'sint32'))

describe('sint32', async () => {
  it('正数', async () => {
    const value = 2
    const expectedBuffer = SintMessage.encode({
      x: value,
    }).finish()

    const writer = createWriter()
    encodeSint32ToBuffer({
      writer,
      tag: 1,
      value,
    })
    const buffer = toHexString(writer)
    expect(buffer).eq(Uint8ArrayToHexString(expectedBuffer))
    const reader = hexstringToReader(buffer)
    expect(readTag(reader)).deep.eq([1, WireType.Varint])
    expect(readSint32(reader)).eq(value)
  })
  it('负数', async () => {
    const value = -2
    const expectedBuffer = SintMessage.encode({
      x: value,
    }).finish()

    const writer = createWriter()
    encodeSint32ToBuffer({
      writer,
      tag: 1,
      value,
    })
    const buffer = toHexString(writer)
    expect(buffer).eq(Uint8ArrayToHexString(expectedBuffer))
    const reader = hexstringToReader(buffer)
    readTag(reader)
    expect(readSint32(reader)).eq(value)
  })
})
