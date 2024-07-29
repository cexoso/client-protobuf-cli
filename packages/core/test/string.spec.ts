import { expect, describe, it } from 'vitest'
import { Field, Type } from 'protobufjs'
import { encodeStringToBuffer } from '../src/encode'
import { createWriter, toHexString } from '../src/writer'
import { readTag, readString, arrayBufferToReader } from '../src/reader'
import { Uint8ArrayToHexString } from './hexstring-to-reader.helper'

const message = new Type('XMessage').add(new Field('x', 1, 'string'))

describe('uint32', async () => {
  function encodeWithFN(value: string, tag: number) {
    const writer = createWriter()
    encodeStringToBuffer({
      value,
      tag,
      writer,
    })
    return toHexString(writer)
  }
  it('case', async () => {
    const value = 'hello'
    const buffer = message.encode({ x: value }).finish()
    expect(encodeWithFN(value, 1)).eq(Uint8ArrayToHexString(buffer))
    const reader = arrayBufferToReader(buffer)
    readTag(reader)
    expect(readString(reader)).eq(value)
  })
})
