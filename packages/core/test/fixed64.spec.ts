import { expect, describe, it } from 'vitest'
import { Field, Type } from 'protobufjs'
import { encodeFixed64ToBuffer } from '../src/encode'
import { createWriter, toHexString } from '../src/writer'
import { Uint8ArrayToHexString, hexstringToReader } from './hexstring-to-reader.helper'
import { WireType } from '../src/wire-type'
import { readFixed64, readTag } from '../src/reader'
import BigNumber from 'bignumber.js'

const Fixed64Message = new Type('Fixed64Message').add(new Field('x', 1, 'fixed64'))

describe('fixed64', async () => {
  it('正数', async () => {
    const value = new BigNumber('1'.repeat(63), 2).toString()
    const expectedBuffer = Fixed64Message.encode({
      x: value,
    }).finish()

    const writer = createWriter()
    encodeFixed64ToBuffer({
      writer,
      tag: 1,
      value,
    })
    const buffer = toHexString(writer)
    expect(buffer).eq(Uint8ArrayToHexString(expectedBuffer))
    const reader = hexstringToReader(buffer)
    expect(readTag(reader)).deep.eq([1, WireType.Bit64])
    expect(readFixed64(reader)).eq(value)
  })
})
