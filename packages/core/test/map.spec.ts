import { describe, expect, it } from 'vitest'
import { parse } from 'protobufjs'
import {
  encodeInt32ToBuffer,
  encodeMapToBuffer,
  encodeMessageToBuffer,
  EncoderWithTag,
  encodeStringToBuffer,
} from '../src/encode'
import { createWriter, toHexString } from '../src/writer'
import { defineMap, defineMessage } from '../src/decode'
import { arrayBufferToReader, readInt32, readString } from '../src/reader'
import { Uint8ArrayToHexString } from './hexstring-to-reader.helper'

describe('map', async () => {
  describe('map 标量', () => {
    const pbContent = `
      message A {
        // map 是不可以 repeated 的
        map<int32, int32> a = 1;
      }
    `
    const { root } = parse(pbContent)
    const message = root.lookupType('A')
    function encodeMap(value: Record<string, Record<string, number>>) {
      const writer = createWriter()
      if (value['a']) {
        encodeMapToBuffer(value['a'], {
          tag: 1,
          writer,
          isKeyNumber: true,
          keyEncoderWithTag: encodeInt32ToBuffer,
          valueEncoderWithTag: encodeInt32ToBuffer,
        })
      }
      return writer
    }

    const decodeMap = defineMap({
      keyReader: readInt32,
      valueReader: readInt32,
      valueType: 'scalar',
    })

    const decodeMessage = defineMessage(
      new Map([
        [
          1,
          {
            type: 'message',
            decode: decodeMap,
            name: 'a',
            isMap: true,
          },
        ],
      ])
    )
    it('map 编解码标量', async () => {
      const object = {
        a: {
          1: 1,
          2: 2,
        },
      }
      expect(message.verify(object)).eq(null)
      const buffer = message.encode(object).finish()
      const writer = encodeMap(object)
      const reader = arrayBufferToReader(buffer)
      const expectedBuffer = Uint8ArrayToHexString(buffer)
      expect(toHexString(writer)).eq(expectedBuffer)
      const x = decodeMessage(reader)
      expect(x).deep.eq(object)
    })
  })
  describe('message', () => {
    const pbContent = `
      message People {
        optional string name = 1;
        optional int32 age = 2;
      }
      message A {
        // map 是不可以 repeated 的
        map<string, People> a = 1;
      }
    `
    const { root } = parse(pbContent)
    const message = root.lookupType('A')
    const encodePeople: EncoderWithTag<{ age?: number; name?: string }> = ({
      value,
      writer,
      tag,
    }) => {
      encodeMessageToBuffer(
        {
          tag,
          writer,
          value,
        },
        ({ value, writer }) => {
          if (value.name) {
            encodeStringToBuffer({
              value: value.name,
              tag: 1,
              writer,
            })
          }
          if (value.age) {
            encodeInt32ToBuffer({
              value: value.age,
              tag: 2,
              writer,
            })
          }
        }
      )
    }

    function encodeMap(value: Record<string, Record<string, any>>) {
      const writer = createWriter()
      if (value['a']) {
        encodeMapToBuffer(value['a'], {
          tag: 1,
          writer,
          keyEncoderWithTag: encodeStringToBuffer,
          valueEncoderWithTag: encodePeople,
        })
      }
      return writer
    }

    const decodePeople = defineMessage(
      new Map([
        [1, { decode: readString, type: 'scalar', name: 'name' }],
        [2, { decode: readInt32, type: 'scalar', name: 'age' }],
      ])
    )

    const decodeMap = defineMap({
      keyReader: readString,
      valueReader: decodePeople,
      valueType: 'message',
    })

    const decodeMessage = defineMessage(
      new Map([
        [
          1,
          {
            type: 'message',
            decode: decodeMap,
            name: 'a',
            isMap: true,
          },
        ],
      ])
    )

    it('map 编解 message', async () => {
      const object = {
        a: {
          x: {
            age: 1,
            name: 'xiaohong',
          },
          xiaozhange: {
            age: 20,
            name: 'xiaozhange',
          },
        },
      }

      expect(message.verify(object)).eq(null)
      const buffer = message.encode(object).finish()

      const writer2 = encodeMap(object)
      const reader = arrayBufferToReader(buffer)
      const expectedBuffer = Uint8ArrayToHexString(buffer)
      expect(toHexString(writer2)).eq(expectedBuffer)
      const x = decodeMessage(reader)
      expect(x).deep.eq(object)
    })
  })
})
