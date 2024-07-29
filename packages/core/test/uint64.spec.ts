import { expect, describe, it } from 'vitest'
import { Field, Type } from 'protobufjs'
import { encodeUint64ToBuffer } from '../src/encode'
import bignumber from 'bignumber.js'
import { createWriter, toHexString } from '../src/writer'
import { arrayBufferToReader, readTag, readUint64 } from '../src/reader'
import { Uint8ArrayToHexString } from './hexstring-to-reader.helper'

const message = new Type('XMessage').add(new Field('x', 1, 'uint64'))

describe('uint64', async () => {
  function encodeInt64WithFN(value: string, tag: number) {
    const writer = createWriter()
    encodeUint64ToBuffer({
      value,
      tag,
      writer,
    })
    return toHexString(writer)
  }
  it('小的数字', async () => {
    const value = '2'
    const buffer = message.encode({ x: value }).finish()
    const reader = arrayBufferToReader(buffer)
    expect(encodeInt64WithFN(value, 1)).eq(Uint8ArrayToHexString(buffer))
    readTag(reader)
    expect(readUint64(reader)).eq(value)
  })
  it('大的数字', async () => {
    const n = bignumber('0' + '1'.repeat(63), 2)
    const value = n.toString()
    const buffer = message.encode({ x: value }).finish()
    const reader = arrayBufferToReader(buffer)
    expect(encodeInt64WithFN(value, 1)).eq(Uint8ArrayToHexString(buffer))
    readTag(reader)
    expect(readUint64(reader)).eq(value)
  })
})
