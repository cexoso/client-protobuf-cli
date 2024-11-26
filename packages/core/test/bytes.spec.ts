import { expect, describe, it } from 'vitest'
import { Field, Type } from 'protobufjs'
import { encodeByteToBuffer } from '../src/encode'
import { createWriter, toHexString } from '../src/writer'
import { Uint8ArrayToHexString, hexstringToReader } from './hexstring-to-reader.helper'
import { readAsBytes, readTag } from '../src/reader'

const message = new Type('XMessage').add(new Field('x', 1, 'bytes'))

describe('bytes', async () => {
  it.only('一段文本', async () => {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    // decode
    // new Buffer('hello world')
    const value = encoder.encode('hello world')

    const obj = message.fromObject({
      x: value,
    })
    const writer = createWriter()
    expect(message.verify(obj)).eq(null, '通过校验')

    // 直接传递 uint8array
    encodeByteToBuffer({ value, tag: 1, writer })

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
    expect(readAsBytes(reader)).deep.eq(value)
  })
})
