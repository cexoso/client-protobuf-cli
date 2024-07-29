import { expect, describe, it } from 'vitest'
import { Field, Type } from 'protobufjs'
import { encodeSfixed64ToBuffer } from '../src/encode'
import { createWriter, toHexString } from '../src/writer'
import { Uint8ArrayToHexString, hexstringToReader } from './hexstring-to-reader.helper'
import { WireType } from '../src/wire-type'
import { readSfixed64, readTag } from '../src/reader'

const Sfixed64Message = new Type('Sfixed64Message').add(new Field('x', 1, 'sfixed64'))

describe('sfixed32', async () => {
  it('正数', async () => {
    const value = '123'
    const expectedBuffer = Sfixed64Message.encode({
      x: value,
    }).finish()

    const writer = createWriter()
    encodeSfixed64ToBuffer({
      writer,
      tag: 1,
      value,
    })
    const buffer = toHexString(writer)
    expect(buffer).eq(Uint8ArrayToHexString(expectedBuffer))
    const reader = hexstringToReader(buffer)
    expect(readTag(reader)).deep.eq([1, WireType.Bit64])
    expect(readSfixed64(reader)).eq(value)
  })
  it('负数', async () => {
    const value = '-123'
    const expectedBuffer = Sfixed64Message.encode({
      x: value,
    }).finish()

    const writer = createWriter()
    encodeSfixed64ToBuffer({
      writer,
      tag: 1,
      value,
    })
    const buffer = toHexString(writer)
    expect(buffer).eq(Uint8ArrayToHexString(expectedBuffer))
    const reader = hexstringToReader(buffer)
    readTag(reader)
    expect(readSfixed64(reader)).eq(value)
  })
})
