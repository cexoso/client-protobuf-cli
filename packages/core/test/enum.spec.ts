import { expect, describe, it } from 'vitest'
import { Field, Type, Enum, Root } from 'protobufjs'
import { encodeEnumToBuffer, encodePackedRepeatToBuffer, encodeRepeatToBuffer } from '../src/encode'
import { createWriter, toHexString } from '../src/writer'
import { Uint8ArrayToHexString, hexstringToReader } from './hexstring-to-reader.helper'
import { defineMessage } from '../src/decode'
import { arrayBufferToReader, readEnum } from '../src/reader'

const StatusEnum = new Enum('Status')
StatusEnum.add('start', 1)
StatusEnum.add('pending', 2)
StatusEnum.add('end', 3)

const EnumMessage = new Type('EnumMessage').add(new Field('x', 1, 'Status'))

const RepeatedEnumMessageUnpacked = new Type('RepeatedEnumMessageUnpacked').add(
  new Field('x', 1, 'Status', 'repeated', undefined, { packed: false })
)
const RepeatedEnumMessagePacked = new Type('RepeatedEnumMessagePacked').add(
  new Field('x', 1, 'Status', 'repeated', undefined, { packed: true })
)

const oldRoot = new Root()
oldRoot.add(StatusEnum)
oldRoot.add(EnumMessage)
oldRoot.add(RepeatedEnumMessageUnpacked)
oldRoot.add(RepeatedEnumMessagePacked)

const StatusEnumNew = new Enum('Status')
StatusEnumNew.add('start', 1)
StatusEnumNew.add('pending', 2)
StatusEnumNew.add('end', 3)
StatusEnumNew.add('newStatus', 4)
const EnumMessageNew = new Type('EnumMessage').add(new Field('x', 1, 'Status'))
const newRoot = new Root()
newRoot.add(StatusEnumNew)
newRoot.add(EnumMessageNew)

describe('enum', async () => {
  it('protobuf.js', async () => {
    const value = {
      x: 'pending',
    }

    // protobuf  对 enum 的编解码底层仍然使用 int32 传输。
    // 在上层做了 int 到 string 的映射。
    const buffer = EnumMessage.encode(EnumMessage.fromObject(value)).finish()
    const protobufjsDecode = EnumMessage.decode(buffer).toJSON()
    expect(protobufjsDecode).deep.eq(value)
  })

  it('protobufjs 如何处理不兼容的', () => {
    const value = {
      x: 'newStatus',
    }
    // 用新的消息编码
    const buffer = EnumMessageNew.encode(EnumMessage.fromObject(value)).finish()

    // 用旧的消息解码
    const protobufjsDecode = EnumMessage.decode(buffer)
    const protobufjsDecodeValue = protobufjsDecode.toJSON()

    // protobuf.js 解码出来的值是空的
    expect(protobufjsDecode).is.empty
    expect(protobufjsDecodeValue).is.empty
  })
  describe('enum from pb 如何处理不兼容的', () => {
    it('enum from pb 如何处理不兼容的', () => {
      // 使用新的消息编码
      const buffer = EnumMessageNew.encode(EnumMessageNew.fromObject({ x: 'newStatus' })).finish()

      const resultBuffer = EnumMessage.decode(buffer)
      // 使用旧的消息解码
      expect(resultBuffer.toJSON()).deep.eq({
        // enum 会保留, 但不会转 key
        x: 4,
      })
    })
    it('两者都有的字段', () => {
      // 使用新的消息编码
      const buffer = EnumMessageNew.encode(EnumMessageNew.fromObject({ x: 'start' })).finish()

      const resultBuffer = EnumMessage.decode(buffer)
      // 使用旧的消息解码
      expect(resultBuffer.toJSON()).deep.eq({
        // 旧的消息也能正常的序列化成 key
        x: 'start',
      })
    })
  })

  it('自己写的 enum', async () => {
    const value = {
      x: 'pending',
    }
    const writer = createWriter()
    encodeEnumToBuffer({
      value: 2,
      tag: 1,
      writer,
    })
    const buffer = EnumMessage.encode(EnumMessage.fromObject(value)).finish()
    const hexstring = toHexString(writer)

    expect(Uint8ArrayToHexString(buffer)).deep.eq(hexstring)
    const reader = hexstringToReader(hexstring)

    // 由 pb-cli 生成 key value 映射
    const decodeMessage = defineMessage(
      new Map([
        [
          1,
          {
            decode: readEnum,
            type: 'scalar',
            name: 'x',
          },
        ],
      ])
    )

    const result = decodeMessage(reader)
    expect(result).deep.eq({
      x: 2,
    })

    // 向前兼容
    const newBuffer = EnumMessageNew.encode(
      EnumMessageNew.fromObject({
        x: 'newStatus',
      })
    ).finish()

    const newResult = decodeMessage(arrayBufferToReader(newBuffer))

    expect(newResult).deep.eq({
      // 保留
      x: 4,
    })
  })

  it('自己写的 enum repeated', () => {
    const x = ['start', 'end']

    // 使用新的消息编码
    const resultUnpacked = RepeatedEnumMessageUnpacked.encode(
      RepeatedEnumMessageUnpacked.fromObject({
        x,
      })
    ).finish()
    const writer = createWriter()

    const values = RepeatedEnumMessageUnpacked.fromObject({
      x,
    })

    // @ts-ignore
    const marketValues = values['x']
    encodeRepeatToBuffer(marketValues, encodeEnumToBuffer, 1, writer)
    const hexstring = toHexString(writer)
    expect(Uint8ArrayToHexString(resultUnpacked)).eq(hexstring)
    const decodeMessage = defineMessage<any>(
      new Map([
        [
          1,
          {
            decode: readEnum,
            type: 'scalar',
            name: 'market',
            isRepeat: true,
          },
        ],
      ])
    )
    const reader = hexstringToReader(hexstring)
    const result = decodeMessage(reader)
    expect(result.market).deep.eq(marketValues)
  })
  it('自己写的 enum repeated packed', () => {
    const x = ['start', 'end']

    // 使用新的消息编码
    const resultUnpacked = RepeatedEnumMessagePacked.encode(
      RepeatedEnumMessagePacked.fromObject({
        x,
      })
    ).finish()
    const writer = createWriter()

    const values = RepeatedEnumMessagePacked.fromObject({
      x,
    })

    // @ts-ignore
    const marketValues = values['x']
    encodePackedRepeatToBuffer(marketValues, encodeEnumToBuffer, 1, writer)
    const hexstring = toHexString(writer)
    expect(Uint8ArrayToHexString(resultUnpacked)).eq(hexstring)
    const decodeMessage = defineMessage<any>(
      new Map([
        [
          1,
          {
            decode: readEnum,
            type: 'scalar',
            name: 'market',
            isRepeat: true,
            isPacked: true,
          },
        ],
      ])
    )

    const reader = hexstringToReader(hexstring)
    const result = decodeMessage(reader)
    expect(result.market).deep.eq(marketValues)
  })
})
