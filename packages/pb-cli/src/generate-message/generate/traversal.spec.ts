import { describe, expect, it } from 'vitest'
import { join } from 'path'
import { createContainer } from '../../container'
import { PBLoader } from '../../pb-loader/pb-loader'
import { ProjectInfo } from '../../project'
import { MessageGenerator } from '../generate-message'
import { TSFilesManager } from '../../files-manager/files-manager'

const root = join(__dirname, '../../../test-protos')

describe('traversal', () => {
  it('encode color', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('**/color.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateAllCode(files)
    const filesManager = container.get(TSFilesManager)
    const fileContent = filesManager.listAllFile().map((file) => file.toString())
    expect(fileContent.join('\n')).toMatchInlineSnapshot(`
      "// ./google/protobuf.ts
      import {
        readDouble,
        defineMessage,
        EncoderWithoutTag,
        encodeDoubleToBuffer,
        readFloat,
        encodeFloatToBuffer,
        readInt64,
        encodeInt64ToBuffer,
        readUint64,
        encodeUint64ToBuffer,
        readInt32,
        encodeInt32ToBuffer,
        readUint32,
        encodeUint32ToBuffer,
        readBool,
        encodeBoolToBuffer,
        readString,
        encodeStringToBuffer,
        readAsBytes,
        encodeByteToBuffer,
      } from '@protobuf-es/core'
      export interface DoubleValue {
        value?: number
      }

      export const decodeDoubleValue = defineMessage<DoubleValue>(
        new Map([[1, { type: 'scalar', decode: readDouble, name: 'value' }]])
      )

      export const encodeDoubleValue: EncoderWithoutTag<DoubleValue> = ({ value, writer }) => {
        if (value['value'] !== undefined) {
          encodeDoubleToBuffer({
            value: value['value'],
            tag: 1,
            writer,
          })
        }
      }

      export interface FloatValue {
        value?: number
      }

      export const decodeFloatValue = defineMessage<FloatValue>(
        new Map([[1, { type: 'scalar', decode: readFloat, name: 'value' }]])
      )

      export const encodeFloatValue: EncoderWithoutTag<FloatValue> = ({ value, writer }) => {
        if (value['value'] !== undefined) {
          encodeFloatToBuffer({
            value: value['value'],
            tag: 1,
            writer,
          })
        }
      }

      export interface Int64Value {
        value?: string
      }

      export const decodeInt64Value = defineMessage<Int64Value>(
        new Map([[1, { type: 'scalar', decode: readInt64, name: 'value' }]])
      )

      export const encodeInt64Value: EncoderWithoutTag<Int64Value> = ({ value, writer }) => {
        if (value['value'] !== undefined) {
          encodeInt64ToBuffer({
            value: value['value'],
            tag: 1,
            writer,
          })
        }
      }

      export interface UInt64Value {
        value?: string
      }

      export const decodeUInt64Value = defineMessage<UInt64Value>(
        new Map([[1, { type: 'scalar', decode: readUint64, name: 'value' }]])
      )

      export const encodeUInt64Value: EncoderWithoutTag<UInt64Value> = ({ value, writer }) => {
        if (value['value'] !== undefined) {
          encodeUint64ToBuffer({
            value: value['value'],
            tag: 1,
            writer,
          })
        }
      }

      export interface Int32Value {
        value?: number
      }

      export const decodeInt32Value = defineMessage<Int32Value>(
        new Map([[1, { type: 'scalar', decode: readInt32, name: 'value' }]])
      )

      export const encodeInt32Value: EncoderWithoutTag<Int32Value> = ({ value, writer }) => {
        if (value['value'] !== undefined) {
          encodeInt32ToBuffer({
            value: value['value'],
            tag: 1,
            writer,
          })
        }
      }

      export interface UInt32Value {
        value?: number
      }

      export const decodeUInt32Value = defineMessage<UInt32Value>(
        new Map([[1, { type: 'scalar', decode: readUint32, name: 'value' }]])
      )

      export const encodeUInt32Value: EncoderWithoutTag<UInt32Value> = ({ value, writer }) => {
        if (value['value'] !== undefined) {
          encodeUint32ToBuffer({
            value: value['value'],
            tag: 1,
            writer,
          })
        }
      }

      export interface BoolValue {
        value?: boolean
      }

      export const decodeBoolValue = defineMessage<BoolValue>(
        new Map([[1, { type: 'scalar', decode: readBool, name: 'value' }]])
      )

      export const encodeBoolValue: EncoderWithoutTag<BoolValue> = ({ value, writer }) => {
        if (value['value'] !== undefined) {
          encodeBoolToBuffer({
            value: value['value'],
            tag: 1,
            writer,
          })
        }
      }

      export interface StringValue {
        value?: string
      }

      export const decodeStringValue = defineMessage<StringValue>(
        new Map([[1, { type: 'scalar', decode: readString, name: 'value' }]])
      )

      export const encodeStringValue: EncoderWithoutTag<StringValue> = ({ value, writer }) => {
        if (value['value'] !== undefined) {
          encodeStringToBuffer({
            value: value['value'],
            tag: 1,
            writer,
          })
        }
      }

      export interface BytesValue {
        value?: Uint8Array
      }

      export const decodeBytesValue = defineMessage<BytesValue>(
        new Map([[1, { type: 'scalar', decode: readAsBytes, name: 'value' }]])
      )

      export const encodeBytesValue: EncoderWithoutTag<BytesValue> = ({ value, writer }) => {
        if (value['value'] !== undefined) {
          encodeByteToBuffer({
            value: value['value'],
            tag: 1,
            writer,
          })
        }
      }

      // ./google/type/color.ts
      import { FloatValue, decodeFloatValue, encodeFloatValue } from '../protobuf'
      import {
        readFloat,
        defineMessage,
        EncoderWithoutTag,
        encodeFloatToBuffer,
        encodeMessageToBuffer,
      } from '@protobuf-es/core'
      export interface Color {
        red?: number
        green?: number
        blue?: number
        alpha?: FloatValue
      }

      export const decodeColor = defineMessage<Color>(
        new Map([
          [1, { type: 'scalar', decode: readFloat, name: 'red' }],
          [2, { type: 'scalar', decode: readFloat, name: 'green' }],
          [3, { type: 'scalar', decode: readFloat, name: 'blue' }],
          [4, { type: 'message', decode: decodeFloatValue, name: 'alpha' }],
        ])
      )

      export const encodeColor: EncoderWithoutTag<Color> = ({ value, writer }) => {
        if (value['red'] !== undefined) {
          encodeFloatToBuffer({
            value: value['red'],
            tag: 1,
            writer,
          })
        }

        if (value['green'] !== undefined) {
          encodeFloatToBuffer({
            value: value['green'],
            tag: 2,
            writer,
          })
        }

        if (value['blue'] !== undefined) {
          encodeFloatToBuffer({
            value: value['blue'],
            tag: 3,
            writer,
          })
        }

        if (value['alpha'] !== undefined) {
          encodeMessageToBuffer(
            {
              value: value['alpha'],
              tag: 4,
              writer,
            },
            encodeFloatValue
          )
        }
      }
      "
    `)
    expect(fileContent.length).eq(2)
  })

  it('嵌套且名字重复的消息', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('nestle-duplicate-message.proto')
    const [_, pbRoot] = [...files.entries()][0]!
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateAllCode(files)

    const reqType = pbRoot.lookupType('nestle_service.GetDataReq.Reponse')
    const resType = pbRoot.lookupType('nestle_service.GetDataRes.Reponse')
    const reqTypeMember = messageGenerator.getAllMemberByType(reqType)
    const resTypeMember = messageGenerator.getAllMemberByType(resType)
    expect(reqTypeMember.interfaceMember).eq('Reponse')
    expect(resTypeMember.interfaceMember).eq('NestleServiceGetDataResReponse')

    expect(reqTypeMember.encoderMember).eq('encodeReponse')
    expect(resTypeMember.encoderMember).eq('encodeNestleServiceGetDataResReponse')

    expect(reqTypeMember.decoderMember).eq('decodeReponse')
    expect(resTypeMember.decoderMember).eq('decodeNestleServiceGetDataResReponse')
  })
})
