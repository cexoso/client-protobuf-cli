import { expect, describe, it } from 'vitest'
import { Field, Type } from 'protobufjs'
import { encodeInt64ToBuffer } from '../src/encode'
import bignumber from 'bignumber.js'
import { createWriter, toHexString } from '../src/writer'
import { arrayBufferToReader, readInt64, readTag } from '../src/reader'
import { Uint8ArrayToHexString } from './hexstring-to-reader.helper'

const message = new Type('XMessage').add(new Field('x', 1, 'int64'))

describe('int64', async () => {
  function encodeInt64WithFN(value: string, tag: number) {
    const writer = createWriter()
    encodeInt64ToBuffer({
      value,
      tag,
      writer,
    })
    return toHexString(writer)
  }
  it('小的数字', async () => {
    const value = '2'
    const buffer = message.encode({ x: value }).finish()
    expect(encodeInt64WithFN(value, 1)).eq(Uint8ArrayToHexString(buffer))
    const reader = arrayBufferToReader(buffer)
    readTag(reader)
    expect(readInt64(reader)).eq(value)
  })
  it('大的数字', async () => {
    const n = bignumber('0' + '1'.repeat(63), 2)
    const value = n.toString()
    const buffer = message.encode({ x: value }).finish()
    expect(encodeInt64WithFN(value, 1)).eq(Uint8ArrayToHexString(buffer))
    const reader = arrayBufferToReader(buffer)
    readTag(reader)
    expect(readInt64(reader)).eq(value)
  })
  it('负的数字', async () => {
    const n = bignumber('-123456789012345667')

    const value = n.toString()
    const buffer = message.encode({ x: value }).finish()
    expect(encodeInt64WithFN(value, 1)).eq(Uint8ArrayToHexString(buffer))

    const reader = arrayBufferToReader(buffer)
    readTag(reader)
    expect(readInt64(reader)).eq(value)
  })
})
