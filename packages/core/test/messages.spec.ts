import { describe, expect, it } from 'vitest'
import { Field, Root, Type } from 'protobufjs'
import {
  encodeBoolToBuffer,
  encodeInt32ToBuffer,
  encodeInt64ToBuffer,
  encodeMessageToBuffer,
  EncoderWithoutTag,
  encodeStringToBuffer,
  encodeUint32ToBuffer,
} from '../src/encode'
import { createWriter, toHexString } from '../src/writer'
import { defineMessage } from '../src/decode'
import {
  arrayBufferToReader,
  readBool,
  readInt32,
  readInt64,
  readString,
  readUint32,
} from '../src/reader'
import { Uint8ArrayToHexString } from './hexstring-to-reader.helper'

const root = new Root()
const message = new Type('ComplexMessage')
message.add(new Field('i64', 1, 'int64'))
message.add(new Field('i32', 2, 'int32'))
message.add(new Field('u32', 3, 'uint32'))
message.add(new Field('b', 4, 'bool'))
message.add(new Field('str', 5, 'string'))

const nestMessage = new Type('NestMessage')
nestMessage.add(new Field('i64', 1, 'int64'))
nestMessage.add(new Field('message', 2, 'ComplexMessage'))
root.add(message)
root.add(nestMessage)

describe('message encode', async () => {
  const encodeMessage: EncoderWithoutTag<any> = ({ value, writer }) => {
    encodeInt64ToBuffer({
      value: value.i64,
      tag: 1,
      writer,
    })
    if (value.i32) {
      encodeInt32ToBuffer({
        value: value.i32,
        tag: 2,
        writer,
      })
    }
    encodeUint32ToBuffer({
      value: value.u32,
      tag: 3,
      writer,
    })
    encodeBoolToBuffer({ value: value.b, tag: 4, writer })
    encodeStringToBuffer({
      value: value.str,
      tag: 5,
      writer,
    })
  }
  function encodeWithFN(value: Record<string, any>) {
    const writer = createWriter()
    encodeMessage({
      value,
      writer,
    })
    return toHexString(writer)
  }

  it('全传', async () => {
    const value = {
      i64: '3',
      i32: 2,
      u32: 3,
      b: true,
      str: 'hello',
    }
    const buffer = message.encode(value).finish()
    expect(encodeWithFN(value)).eq(Uint8ArrayToHexString(buffer))
  })

  function encodeWithNested(values: Record<string, any>) {
    const writer = createWriter()
    encodeInt64ToBuffer({
      value: values.i64,
      tag: 1,
      writer,
    })
    encodeMessageToBuffer(
      {
        value: values.message,
        tag: 2,
        writer,
      },
      encodeMessage
    )
    return toHexString(writer)
  }

  it('嵌套的情况', async () => {
    const value = {
      i64: '9',
      message: {
        i64: '3',
        i32: 2,
        u32: 3,
        b: true,
        str: 'hello',
      },
    }

    const buffer = nestMessage.encode(value).finish()

    expect(encodeWithNested(value)).eq(Uint8ArrayToHexString(buffer))
    const decodeComplexMessage = defineMessage(
      new Map([
        [1, { type: 'scalar', decode: readInt64, name: 'i64' }],
        [2, { type: 'scalar', decode: readInt32, name: 'i32' }],
        [3, { type: 'scalar', decode: readUint32, name: 'u32' }],
        [4, { type: 'scalar', decode: readBool, name: 'b' }],
        [5, { type: 'scalar', decode: readString, name: 'str' }],
      ])
    )
    const decodeNestMessage = defineMessage(
      new Map([
        [1, { type: 'scalar', decode: readInt64, name: 'i64' }],
        [2, { type: 'message', decode: decodeComplexMessage, name: 'message' }],
      ])
    )
    const reader = arrayBufferToReader(buffer)
    const result = decodeNestMessage(reader)
    expect(result).deep.eq(value)
  })
})