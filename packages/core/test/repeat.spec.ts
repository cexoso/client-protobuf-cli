import { expect, describe, it } from 'vitest'
import { Field, Root, Type } from 'protobufjs'
import { Buffer } from 'buffer'
import {
  encodeRepeatToBuffer,
  encodeInt64ToBuffer,
  encodeInt32ToBuffer,
  encodeMessageToBuffer,
  EncoderWithoutTag,
  encodeStringToBuffer,
  encodePackedRepeatToBuffer,
} from '../src/encode'
import { createWriter, toHexString } from '../src/writer'
import { Uint8ArrayToHexString, hexstringToReader } from './hexstring-to-reader.helper'
import { decodeMessage, defineMessage } from '../src/decode'
import {
  arrayBufferToReader as arrayBufferToReader,
  readBool,
  ReaderLike,
  readInt32,
  readInt64,
  readString,
  readUint32,
} from '../src/reader'
import { loadSync } from 'protobufjs'
import { join } from 'path'

describe('repeat encode', async () => {
  describe('packed', () => {
    const messagePacked = new Type('RepeatedMessagePacked')
    // 表示 repeated int64 i64 = 1 [packed=true];
    messagePacked.add(new Field('i64', 1, 'int64', 'repeated', undefined, { packed: true }))
    it('i64', async () => {
      const value = ['1', '2', '3']
      const writer = createWriter()
      encodePackedRepeatToBuffer(value, encodeInt64ToBuffer, 1, writer)

      const buffer = messagePacked.encode({ i64: value }).finish()
      expect(toHexString(writer)).eq(Uint8ArrayToHexString(buffer))
      const reader = arrayBufferToReader(buffer)

      const result = decodeMessage({
        tagMap: new Map([
          [1, { type: 'scalar', isRepeat: true, decode: readInt64, name: 'i64', isPacked: true }],
        ]),
        reader,
      })
      expect(result).has.deep.property('i64', ['1', '2', '3'])
    })
  })
  describe('unpacked', () => {
    const messageUnpacked = new Type('RepeatedMessageUnpacked')
    // 表示 repeated int64 i64 = 1 [packed=false];
    messageUnpacked.add(new Field('i64', 1, 'int64', 'repeated', undefined, { packed: false }))
    it('i64', async () => {
      const value = ['1', '2', '3']
      const writer = createWriter()
      encodeRepeatToBuffer(value, encodeInt64ToBuffer, 1, writer)
      const buffer = messageUnpacked.encode({ i64: value }).finish()
      const reader = arrayBufferToReader(buffer)

      expect(toHexString(writer)).eq(Uint8ArrayToHexString(buffer))
      const result = decodeMessage({
        tagMap: new Map([
          [1, { type: 'scalar', isRepeat: true, decode: readInt64, name: 'i64', isPacked: false }],
        ]),
        reader,
      })
      expect(result).has.deep.property('i64', ['1', '2', '3'])
    })

    it('repeat string', async () => {
      const message = new Type('RepeatedString')
      message.add(new Field('x', 1, 'string', 'repeated'))
      const value = {
        x: ['a', 'b', 'c'],
      }
      const writer = createWriter()
      const decodeRepeatedString = defineMessage(
        new Map([[1, { type: 'scalar', isRepeat: true, decode: readString, name: 'x' }]])
      )
      encodeRepeatToBuffer(value.x, encodeStringToBuffer, 1, writer)

      const buffer = message.encode(value).finish()
      const hexString = Buffer.from(buffer).toString('hex')
      expect(toHexString(writer)).eq(hexString)

      const reader = arrayBufferToReader(buffer)
      const result = decodeRepeatedString(reader)

      expect(result).has.deep.property('x', ['a', 'b', 'c'])
    })

    const root = new Root()
    const message = new Type('ComplexMessage')
    message.add(new Field('i64', 1, 'int64'))
    message.add(new Field('i32', 2, 'int32'))
    message.add(new Field('u32', 3, 'uint32'))
    message.add(new Field('b', 4, 'bool'))
    message.add(new Field('str', 5, 'string'))
    const repeatedComplexMessage = new Type('RepeatedComplexMessage')
    repeatedComplexMessage.add(new Field('messages', 1, 'ComplexMessage', 'repeated'))
    root.add(message)
    root.add(repeatedComplexMessage)

    it('repeat message', () => {
      const encodeMessage: EncoderWithoutTag<Record<string, any>> = ({ value, writer }) => {
        if (value['i64']) {
          encodeInt64ToBuffer({
            value: value['i64'],
            tag: 1,
            writer,
          })
        }
        if (value['i32']) {
          encodeInt32ToBuffer({
            value: value['i32'],
            tag: 2,
            writer,
          })
        }
      }
      const value = {
        messages: [
          {
            i64: '1',
          },
          {
            i64: '2',
            i32: 3,
          },
        ],
      }
      const buffer = repeatedComplexMessage.encode(value).finish()
      const expected = Buffer.from(buffer).toString('hex')

      const writer = createWriter()
      encodeRepeatToBuffer(
        value.messages,
        ({ value, tag, writer }) => encodeMessageToBuffer({ value, tag, writer }, encodeMessage),
        1,
        writer
      )

      expect(toHexString(writer)).eq(expected)
      const reader = hexstringToReader(expected)

      const decodeComplexMessage = (reader: ReaderLike) =>
        decodeMessage({
          tagMap: new Map([
            [
              1,
              {
                type: 'scalar',
                decode: readInt64,
                name: 'i64',
              },
            ],
            [
              2,
              {
                type: 'scalar',
                decode: readInt32,
                name: 'i32',
              },
            ],
            [
              3,
              {
                type: 'scalar',
                decode: readUint32,
                name: 'u32',
              },
            ],
            [
              4,
              {
                type: 'scalar',
                decode: readBool,
                name: 'b',
              },
            ],
            [
              5,
              {
                type: 'scalar',
                decode: readString,
                name: 'str',
              },
            ],
          ]),
          reader,
        })

      const result = decodeMessage({
        tagMap: new Map([
          [1, { type: 'message', isRepeat: true, decode: decodeComplexMessage, name: 'messages' }],
        ]),
        reader,
      })
      expect(result).deep.eq(value)
    })
    it('支持向前兼容，不认识的 tag 会跳过', () => {
      const encodeMessage: EncoderWithoutTag<Record<string, any>> = ({ value, writer }) => {
        if (value['i64']) {
          encodeInt64ToBuffer({
            value: value['i64'],
            tag: 1,
            writer,
          })
        }
        if (value['i32']) {
          encodeInt32ToBuffer({
            value: value['i32'],
            tag: 2,
            writer,
          })
        }
      }
      const value = {
        messages: [
          {
            i64: '1',
          },
          {
            i64: '2',
            i32: 3,
          },
        ],
      }
      const buffer = repeatedComplexMessage
        .encode(repeatedComplexMessage.fromObject(value))
        .finish()
      const expected = Buffer.from(buffer).toString('hex')

      const writer = createWriter()
      encodeRepeatToBuffer(
        value.messages,
        ({ value, tag, writer }) => encodeMessageToBuffer({ value, tag, writer }, encodeMessage),
        1,
        writer
      )

      expect(toHexString(writer)).eq(expected)
      const reader = hexstringToReader(expected)

      const decodeComplexMessage = (reader: ReaderLike) =>
        decodeMessage({
          tagMap: new Map([
            [
              1,
              {
                // 模拟只能识别 tag 1
                type: 'scalar',
                decode: readInt64,
                name: 'i64',
              },
            ],
          ]),
          reader,
        })

      const result = decodeMessage({
        tagMap: new Map([
          [1, { type: 'message', isRepeat: true, decode: decodeComplexMessage, name: 'messages' }],
        ]),
        reader,
      })
      expect(result).deep.eq({
        messages: value.messages.map((item) => ({
          i64: item.i64, // 只能识别 i64
        })),
      })
    })
  })
})

describe('oneof', async () => {
  it('normal', () => {
    const root = loadSync(join(__dirname, './oneof.proto'))
    const log = root.lookupType('Log')
    const data = {
      bankCard: {
        a: '1',
      },
      logProof: {
        b: 1,
      },
    }
    console.log('调用校验时，有校验不通过:', log.verify(data)) // 校验通过的会返回 null
    const buffer = log.encode(data).finish()
    console.log('不符合预期的数据依然可以正常编码, buffer:', buffer)
    const result = log.decode(buffer).toJSON()
    console.log('不符合预期的 Buffer 仍然可以正常解码: decode result', result)
  })
})
