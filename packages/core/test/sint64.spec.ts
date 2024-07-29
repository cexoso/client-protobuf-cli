import { expect, describe, it } from 'vitest'
import { Field, Type } from 'protobufjs'
import { encodeSint64ToBuffer } from '../src/encode'
import { createWriter, toHexString } from '../src/writer'
import { Uint8ArrayToHexString, hexstringToReader } from './hexstring-to-reader.helper'
import { WireType } from '../src/wire-type'
import { readSint64, readTag } from '../src/reader'
import BigNumber from 'bignumber.js'

const SintMessage = new Type('SintMessage').add(new Field('x', 1, 'sint64'))

describe('sint64', async () => {
  it('正数', async () => {
    const value = new BigNumber('1'.repeat(33), 2).toString()
    const expectedBuffer = SintMessage.encode({
      x: value,
    }).finish()

    const writer = createWriter()
    encodeSint64ToBuffer({
      writer,
      tag: 1,
      value,
    })
    const buffer = toHexString(writer)
    expect(buffer).eq(Uint8ArrayToHexString(expectedBuffer))
    const reader = hexstringToReader(buffer)
    expect(readTag(reader)).deep.eq([1, WireType.Varint])
    expect(readSint64(reader)).eq(value)
  })

  it('负数', async () => {
    const value = new BigNumber('1'.repeat(33), 2).negated().toString()
    const expectedBuffer = SintMessage.encode({
      x: value,
    }).finish()

    const writer = createWriter()
    encodeSint64ToBuffer({
      writer,
      tag: 1,
      value,
    })
    const buffer = toHexString(writer)
    expect(buffer).eq(Uint8ArrayToHexString(expectedBuffer))
    const reader = hexstringToReader(buffer)
    expect(readTag(reader)).deep.eq([1, WireType.Varint])
    expect(readSint64(reader)).eq(value)
  })
})
