import { expect, describe, it } from 'vitest'
import { Field, Type } from 'protobufjs'
import { encodeBoolToBuffer } from '../src/encode'
import { readTag, readBool, arrayBufferToReader } from '../src/reader'
import { createWriter, toHexString } from '../src/writer'
import { Uint8ArrayToHexString } from './hexstring-to-reader.helper'

const message = new Type('XMessage').add(new Field('x', 1, 'bool'))

describe('bool', async () => {
  function encodeWithFN(value: boolean, tag: number) {
    const writer = createWriter()
    encodeBoolToBuffer({ value, tag, writer })
    return toHexString(writer)
  }
  it('true', async () => {
    const value = true
    const buffer = message.encode({ x: value }).finish()
    expect(encodeWithFN(value, 1)).eq(Uint8ArrayToHexString(buffer))
    const reader = arrayBufferToReader(buffer)
    readTag(reader)
    expect(readBool(reader)).eq(value)
  })
  it('false', async () => {
    const value = false
    const buffer = message.encode({ x: value }).finish()
    expect(encodeWithFN(value, 1)).eq(Uint8ArrayToHexString(buffer))
    const reader = arrayBufferToReader(buffer)
    readTag(reader)
    expect(readBool(reader)).eq(value)
  })
})
