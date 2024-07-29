import { expect, describe, it } from 'vitest'
import { Field, Type } from 'protobufjs'
import { encodeByteToBuffer } from '../src/encode'
import { createWriter, toHexString } from '../src/writer'
import { Uint8ArrayToHexString, hexstringToReader } from './hexstring-to-reader.helper'
import { readAsBytes, readTag } from '../src/reader'
const tag = 16
const message = new Type('XMessage').add(new Field('x', tag, 'bytes'))

describe('bytes', async () => {
  it('一段文本', async () => {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const expectedValue = encoder.encode('hello world')

    const obj = message.fromObject({
      x: expectedValue,
    })
    const writer = createWriter()
    expect(message.verify(obj)).eq(null, '通过校验')

    // 直接传递 uint8array
    encodeByteToBuffer({ value: expectedValue, tag, writer })

    const buffer = toHexString(writer)

    const expectedBuffer = message.encode(obj).finish()
    expect(buffer).deep.eq(Uint8ArrayToHexString(expectedBuffer))
    expect(message.decode(expectedBuffer).toJSON()).has.deep.property(
      'x',
      btoa('hello world'),
      'protobufjs 在反序列时默认使用 base 编码'
    )
    const reader = hexstringToReader(buffer)
    readTag(reader)
    const value = readAsBytes(reader)
    expect(value).deep.eq(expectedValue)
    expect(decoder.decode(value)).eq('hello world')
  })

  it('同时支持传入 base64', () => {
    const str = 'hello world'
    const base64Value = btoa(str)
    const encoder = new TextEncoder()
    const expectedValue = encoder.encode('hello world')
    const writer = createWriter()
    const obj = message.fromObject({
      x: expectedValue,
    })
    encodeByteToBuffer({ value: base64Value, tag, writer })
    const expectedBuffer = message.encode(obj).finish()

    const buffer = toHexString(writer)
    expect(buffer).deep.eq(Uint8ArrayToHexString(expectedBuffer))
  })

  it('empty', () => {
    const arrayBuffer = new Uint8Array()
    const writer = createWriter()
    const obj = message.fromObject({
      x: arrayBuffer,
    })
    encodeByteToBuffer({ value: arrayBuffer, tag, writer })
    const expectedBuffer = message.encode(obj).finish()

    const buffer = toHexString(writer)
    expect(buffer).deep.eq(Uint8ArrayToHexString(expectedBuffer))
  })
})
