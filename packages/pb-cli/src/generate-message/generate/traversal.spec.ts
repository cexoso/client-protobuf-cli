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
    const files = await pbLoader.loadByPath('**/srpc.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateAllCode(files)
    const filesManager = container.get(TSFilesManager)
    const fileContent = filesManager.listAllFile().map((file) => file.toString())
    expect(fileContent.join('\n')).toMatchInlineSnapshot(`
      "// ./srpc.ts
      import {
        readUint32,
        defineMap,
        readString,
        defineMessage,
        EncoderWithoutTag,
        encodeUint32ToBuffer,
        encodeMapToBuffer,
      } from '@protobuf-es/core'
      export interface CRpcHead {
        serverIp?: number
        customizedHeader?: Record<string, string>
      }

      export const decodeCRpcHead = defineMessage<CRpcHead>(
        new Map([
          [1, { type: 'scalar', decode: readUint32, name: 'serverIp' }],
          [
            2,
            {
              type: 'message',
              decode: defineMap({
                keyReader: readString,
                valueReader: readString,
                valueType: 'scalar',
              }),
              name: 'customizedHeader',
              isMap: true,
            },
          ],
        ])
      )

      export const encodeCRpcHead: EncoderWithoutTag<CRpcHead> = ({ value, writer }) => {
        if (value['serverIp'] !== undefined) {
          encodeUint32ToBuffer({
            value: value['serverIp'],
            tag: 1,
            writer,
          })
        }

        if (value['customizedHeader'] !== undefined) {
          encodeMapToBuffer(value['customizedHeader'], {
            tag: 2,
            writer,
            keyEncoderWithTag: encodeStringToBuffer,
            valueEncoderWithTag: encodeStringToBuffer,
          })
        }
      }

      // ./google/protobuf/descriptor.ts
      import {
        readString,
        readBool,
        defineMessage,
        EncoderWithoutTag,
        encodeStringToBuffer,
        encodeBoolToBuffer,
        readUint64,
        readInt64,
        readDouble,
        readAsBytes,
        encodeRepeatToBuffer,
        encodeMessageToBuffer,
        encodeUint64ToBuffer,
        encodeInt64ToBuffer,
        encodeDoubleToBuffer,
        encodeByteToBuffer,
        readEnum,
        encodeEnumToBuffer,
        readInt32,
        encodeInt32ToBuffer,
        readUint32,
        encodeUint32ToBuffer,
      } from '@protobuf-es/core'
      export enum Label {
        LABEL_OPTIONAL = 1,
        LABEL_REQUIRED = 2,
        LABEL_REPEATED = 3,
      }

      export enum Type {
        TYPE_DOUBLE = 1,
        TYPE_FLOAT = 2,
        TYPE_INT64 = 3,
        TYPE_UINT64 = 4,
        TYPE_INT32 = 5,
        TYPE_FIXED64 = 6,
        TYPE_FIXED32 = 7,
        TYPE_BOOL = 8,
        TYPE_STRING = 9,
        TYPE_GROUP = 10,
        TYPE_MESSAGE = 11,
        TYPE_BYTES = 12,
        TYPE_UINT32 = 13,
        TYPE_ENUM = 14,
        TYPE_SFIXED32 = 15,
        TYPE_SFIXED64 = 16,
        TYPE_SINT32 = 17,
        TYPE_SINT64 = 18,
      }

      export enum CType {
        STRING = 0,
        CORD = 1,
        STRING_PIECE = 2,
      }

      export enum JSType {
        JS_NORMAL = 0,
        JS_STRING = 1,
        JS_NUMBER = 2,
      }

      export interface NamePart {
        namePart: string
        isExtension: boolean
      }

      export const decodeNamePart = defineMessage<NamePart>(
        new Map([
          [1, { type: 'scalar', decode: readString, name: 'namePart' }],
          [2, { type: 'scalar', decode: readBool, name: 'isExtension' }],
        ])
      )

      export const encodeNamePart: EncoderWithoutTag<NamePart> = ({ value, writer }) => {
        encodeStringToBuffer({
          value: value['namePart'],
          tag: 1,
          writer,
        })
        encodeBoolToBuffer({
          value: value['isExtension'],
          tag: 2,
          writer,
        })
      }

      export interface UninterpretedOption {
        name?: NamePart[]
        identifierValue?: string
        positiveIntValue?: string
        negativeIntValue?: string
        doubleValue?: number
        stringValue?: Uint8Array
        aggregateValue?: string
      }

      export const decodeUninterpretedOption = defineMessage<UninterpretedOption>(
        new Map([
          [2, { type: 'message', isRepeat: true, decode: decodeNamePart, name: 'name' }],
          [3, { type: 'scalar', decode: readString, name: 'identifierValue' }],
          [4, { type: 'scalar', decode: readUint64, name: 'positiveIntValue' }],
          [5, { type: 'scalar', decode: readInt64, name: 'negativeIntValue' }],
          [6, { type: 'scalar', decode: readDouble, name: 'doubleValue' }],
          [7, { type: 'scalar', decode: readAsBytes, name: 'stringValue' }],
          [8, { type: 'scalar', decode: readString, name: 'aggregateValue' }],
        ])
      )

      export const encodeUninterpretedOption: EncoderWithoutTag<UninterpretedOption> = ({
        value,
        writer,
      }) => {
        if (value['name'] !== undefined) {
          encodeRepeatToBuffer(
            value['name'],
            ({ value, tag, writer }) => encodeMessageToBuffer({ value, tag, writer }, encodeNamePart),
            2,
            writer
          )
        }

        if (value['identifierValue'] !== undefined) {
          encodeStringToBuffer({
            value: value['identifierValue'],
            tag: 3,
            writer,
          })
        }

        if (value['positiveIntValue'] !== undefined) {
          encodeUint64ToBuffer({
            value: value['positiveIntValue'],
            tag: 4,
            writer,
          })
        }

        if (value['negativeIntValue'] !== undefined) {
          encodeInt64ToBuffer({
            value: value['negativeIntValue'],
            tag: 5,
            writer,
          })
        }

        if (value['doubleValue'] !== undefined) {
          encodeDoubleToBuffer({
            value: value['doubleValue'],
            tag: 6,
            writer,
          })
        }

        if (value['stringValue'] !== undefined) {
          encodeByteToBuffer({
            value: value['stringValue'],
            tag: 7,
            writer,
          })
        }

        if (value['aggregateValue'] !== undefined) {
          encodeStringToBuffer({
            value: value['aggregateValue'],
            tag: 8,
            writer,
          })
        }
      }

      export interface FieldOptions {
        ctype?: CType
        packed?: boolean
        jstype?: JSType
        lazy?: boolean
        deprecated?: boolean
        weak?: boolean
        uninterpretedOption?: UninterpretedOption[]
        '.xrpc.emitDefault'?: boolean
      }

      export const decodeFieldOptions = defineMessage<FieldOptions>(
        new Map([
          [1, { type: 'scalar', decode: readEnum, name: 'ctype' }],
          [2, { type: 'scalar', decode: readBool, name: 'packed' }],
          [6, { type: 'scalar', decode: readEnum, name: 'jstype' }],
          [5, { type: 'scalar', decode: readBool, name: 'lazy' }],
          [3, { type: 'scalar', decode: readBool, name: 'deprecated' }],
          [10, { type: 'scalar', decode: readBool, name: 'weak' }],
          [
            999,
            {
              type: 'message',
              isRepeat: true,
              decode: decodeUninterpretedOption,
              name: 'uninterpretedOption',
            },
          ],
          [10006, { type: 'scalar', decode: readBool, name: 'XrpcEmitDefault' }],
        ])
      )

      export const encodeFieldOptions: EncoderWithoutTag<FieldOptions> = ({ value, writer }) => {
        if (value['ctype'] !== undefined) {
          encodeEnumToBuffer({
            value: value['ctype'],
            tag: 1,
            writer,
          })
        }

        if (value['packed'] !== undefined) {
          encodeBoolToBuffer({
            value: value['packed'],
            tag: 2,
            writer,
          })
        }

        if (value['jstype'] !== undefined) {
          encodeEnumToBuffer({
            value: value['jstype'],
            tag: 6,
            writer,
          })
        }

        if (value['lazy'] !== undefined) {
          encodeBoolToBuffer({
            value: value['lazy'],
            tag: 5,
            writer,
          })
        }

        if (value['deprecated'] !== undefined) {
          encodeBoolToBuffer({
            value: value['deprecated'],
            tag: 3,
            writer,
          })
        }

        if (value['weak'] !== undefined) {
          encodeBoolToBuffer({
            value: value['weak'],
            tag: 10,
            writer,
          })
        }

        if (value['uninterpretedOption'] !== undefined) {
          encodeRepeatToBuffer(
            value['uninterpretedOption'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeUninterpretedOption),
            999,
            writer
          )
        }

        if (value['.xrpc.emitDefault'] !== undefined) {
          encodeBoolToBuffer({
            value: value['.xrpc.emitDefault'],
            tag: 10006,
            writer,
          })
        }
      }

      export interface FieldDescriptorProto {
        name?: string
        number?: number
        label?: Label
        type?: Type
        typeName?: string
        extendee?: string
        defaultValue?: string
        oneofIndex?: number
        jsonName?: string
        options?: FieldOptions
      }

      export const decodeFieldDescriptorProto = defineMessage<FieldDescriptorProto>(
        new Map([
          [1, { type: 'scalar', decode: readString, name: 'name' }],
          [3, { type: 'scalar', decode: readInt32, name: 'number' }],
          [4, { type: 'scalar', decode: readEnum, name: 'label' }],
          [5, { type: 'scalar', decode: readEnum, name: 'type' }],
          [6, { type: 'scalar', decode: readString, name: 'typeName' }],
          [2, { type: 'scalar', decode: readString, name: 'extendee' }],
          [7, { type: 'scalar', decode: readString, name: 'defaultValue' }],
          [9, { type: 'scalar', decode: readInt32, name: 'oneofIndex' }],
          [10, { type: 'scalar', decode: readString, name: 'jsonName' }],
          [8, { type: 'message', decode: decodeFieldOptions, name: 'options' }],
        ])
      )

      export const encodeFieldDescriptorProto: EncoderWithoutTag<FieldDescriptorProto> = ({
        value,
        writer,
      }) => {
        if (value['name'] !== undefined) {
          encodeStringToBuffer({
            value: value['name'],
            tag: 1,
            writer,
          })
        }

        if (value['number'] !== undefined) {
          encodeInt32ToBuffer({
            value: value['number'],
            tag: 3,
            writer,
          })
        }

        if (value['label'] !== undefined) {
          encodeEnumToBuffer({
            value: value['label'],
            tag: 4,
            writer,
          })
        }

        if (value['type'] !== undefined) {
          encodeEnumToBuffer({
            value: value['type'],
            tag: 5,
            writer,
          })
        }

        if (value['typeName'] !== undefined) {
          encodeStringToBuffer({
            value: value['typeName'],
            tag: 6,
            writer,
          })
        }

        if (value['extendee'] !== undefined) {
          encodeStringToBuffer({
            value: value['extendee'],
            tag: 2,
            writer,
          })
        }

        if (value['defaultValue'] !== undefined) {
          encodeStringToBuffer({
            value: value['defaultValue'],
            tag: 7,
            writer,
          })
        }

        if (value['oneofIndex'] !== undefined) {
          encodeInt32ToBuffer({
            value: value['oneofIndex'],
            tag: 9,
            writer,
          })
        }

        if (value['jsonName'] !== undefined) {
          encodeStringToBuffer({
            value: value['jsonName'],
            tag: 10,
            writer,
          })
        }

        if (value['options'] !== undefined) {
          encodeMessageToBuffer(
            {
              value: value['options'],
              tag: 8,
              writer,
            },
            encodeFieldOptions
          )
        }
      }

      export interface EnumValueOptions {
        deprecated?: boolean
        uninterpretedOption?: UninterpretedOption[]
      }

      export const decodeEnumValueOptions = defineMessage<EnumValueOptions>(
        new Map([
          [1, { type: 'scalar', decode: readBool, name: 'deprecated' }],
          [
            999,
            {
              type: 'message',
              isRepeat: true,
              decode: decodeUninterpretedOption,
              name: 'uninterpretedOption',
            },
          ],
        ])
      )

      export const encodeEnumValueOptions: EncoderWithoutTag<EnumValueOptions> = ({ value, writer }) => {
        if (value['deprecated'] !== undefined) {
          encodeBoolToBuffer({
            value: value['deprecated'],
            tag: 1,
            writer,
          })
        }

        if (value['uninterpretedOption'] !== undefined) {
          encodeRepeatToBuffer(
            value['uninterpretedOption'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeUninterpretedOption),
            999,
            writer
          )
        }
      }

      export interface EnumValueDescriptorProto {
        name?: string
        number?: number
        options?: EnumValueOptions
      }

      export const decodeEnumValueDescriptorProto = defineMessage<EnumValueDescriptorProto>(
        new Map([
          [1, { type: 'scalar', decode: readString, name: 'name' }],
          [2, { type: 'scalar', decode: readInt32, name: 'number' }],
          [3, { type: 'message', decode: decodeEnumValueOptions, name: 'options' }],
        ])
      )

      export const encodeEnumValueDescriptorProto: EncoderWithoutTag<EnumValueDescriptorProto> = ({
        value,
        writer,
      }) => {
        if (value['name'] !== undefined) {
          encodeStringToBuffer({
            value: value['name'],
            tag: 1,
            writer,
          })
        }

        if (value['number'] !== undefined) {
          encodeInt32ToBuffer({
            value: value['number'],
            tag: 2,
            writer,
          })
        }

        if (value['options'] !== undefined) {
          encodeMessageToBuffer(
            {
              value: value['options'],
              tag: 3,
              writer,
            },
            encodeEnumValueOptions
          )
        }
      }

      export interface EnumOptions {
        allowAlias?: boolean
        deprecated?: boolean
        uninterpretedOption?: UninterpretedOption[]
      }

      export const decodeEnumOptions = defineMessage<EnumOptions>(
        new Map([
          [2, { type: 'scalar', decode: readBool, name: 'allowAlias' }],
          [3, { type: 'scalar', decode: readBool, name: 'deprecated' }],
          [
            999,
            {
              type: 'message',
              isRepeat: true,
              decode: decodeUninterpretedOption,
              name: 'uninterpretedOption',
            },
          ],
        ])
      )

      export const encodeEnumOptions: EncoderWithoutTag<EnumOptions> = ({ value, writer }) => {
        if (value['allowAlias'] !== undefined) {
          encodeBoolToBuffer({
            value: value['allowAlias'],
            tag: 2,
            writer,
          })
        }

        if (value['deprecated'] !== undefined) {
          encodeBoolToBuffer({
            value: value['deprecated'],
            tag: 3,
            writer,
          })
        }

        if (value['uninterpretedOption'] !== undefined) {
          encodeRepeatToBuffer(
            value['uninterpretedOption'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeUninterpretedOption),
            999,
            writer
          )
        }
      }

      export interface EnumReservedRange {
        start?: number
        end?: number
      }

      export const decodeEnumReservedRange = defineMessage<EnumReservedRange>(
        new Map([
          [1, { type: 'scalar', decode: readInt32, name: 'start' }],
          [2, { type: 'scalar', decode: readInt32, name: 'end' }],
        ])
      )

      export const encodeEnumReservedRange: EncoderWithoutTag<EnumReservedRange> = ({
        value,
        writer,
      }) => {
        if (value['start'] !== undefined) {
          encodeInt32ToBuffer({
            value: value['start'],
            tag: 1,
            writer,
          })
        }

        if (value['end'] !== undefined) {
          encodeInt32ToBuffer({
            value: value['end'],
            tag: 2,
            writer,
          })
        }
      }

      export interface EnumDescriptorProto {
        name?: string
        value?: EnumValueDescriptorProto[]
        options?: EnumOptions
        reservedRange?: EnumReservedRange[]
        reservedName?: string[]
      }

      export const decodeEnumDescriptorProto = defineMessage<EnumDescriptorProto>(
        new Map([
          [1, { type: 'scalar', decode: readString, name: 'name' }],
          [2, { type: 'message', isRepeat: true, decode: decodeEnumValueDescriptorProto, name: 'value' }],
          [3, { type: 'message', decode: decodeEnumOptions, name: 'options' }],
          [
            4,
            { type: 'message', isRepeat: true, decode: decodeEnumReservedRange, name: 'reservedRange' },
          ],
          [5, { type: 'scalar', isRepeat: true, decode: readString, name: 'reservedName' }],
        ])
      )

      export const encodeEnumDescriptorProto: EncoderWithoutTag<EnumDescriptorProto> = ({
        value,
        writer,
      }) => {
        if (value['name'] !== undefined) {
          encodeStringToBuffer({
            value: value['name'],
            tag: 1,
            writer,
          })
        }

        if (value['value'] !== undefined) {
          encodeRepeatToBuffer(
            value['value'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeEnumValueDescriptorProto),
            2,
            writer
          )
        }

        if (value['options'] !== undefined) {
          encodeMessageToBuffer(
            {
              value: value['options'],
              tag: 3,
              writer,
            },
            encodeEnumOptions
          )
        }

        if (value['reservedRange'] !== undefined) {
          encodeRepeatToBuffer(
            value['reservedRange'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeEnumReservedRange),
            4,
            writer
          )
        }

        if (value['reservedName'] !== undefined) {
          encodeRepeatToBuffer(value['reservedName'], encodeStringToBuffer, 5, writer)
        }
      }

      export interface ExtensionRangeOptions {
        uninterpretedOption?: UninterpretedOption[]
      }

      export const decodeExtensionRangeOptions = defineMessage<ExtensionRangeOptions>(
        new Map([
          [
            999,
            {
              type: 'message',
              isRepeat: true,
              decode: decodeUninterpretedOption,
              name: 'uninterpretedOption',
            },
          ],
        ])
      )

      export const encodeExtensionRangeOptions: EncoderWithoutTag<ExtensionRangeOptions> = ({
        value,
        writer,
      }) => {
        if (value['uninterpretedOption'] !== undefined) {
          encodeRepeatToBuffer(
            value['uninterpretedOption'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeUninterpretedOption),
            999,
            writer
          )
        }
      }

      export interface ExtensionRange {
        start?: number
        end?: number
        options?: ExtensionRangeOptions
      }

      export const decodeExtensionRange = defineMessage<ExtensionRange>(
        new Map([
          [1, { type: 'scalar', decode: readInt32, name: 'start' }],
          [2, { type: 'scalar', decode: readInt32, name: 'end' }],
          [3, { type: 'message', decode: decodeExtensionRangeOptions, name: 'options' }],
        ])
      )

      export const encodeExtensionRange: EncoderWithoutTag<ExtensionRange> = ({ value, writer }) => {
        if (value['start'] !== undefined) {
          encodeInt32ToBuffer({
            value: value['start'],
            tag: 1,
            writer,
          })
        }

        if (value['end'] !== undefined) {
          encodeInt32ToBuffer({
            value: value['end'],
            tag: 2,
            writer,
          })
        }

        if (value['options'] !== undefined) {
          encodeMessageToBuffer(
            {
              value: value['options'],
              tag: 3,
              writer,
            },
            encodeExtensionRangeOptions
          )
        }
      }

      export interface OneofOptions {
        uninterpretedOption?: UninterpretedOption[]
      }

      export const decodeOneofOptions = defineMessage<OneofOptions>(
        new Map([
          [
            999,
            {
              type: 'message',
              isRepeat: true,
              decode: decodeUninterpretedOption,
              name: 'uninterpretedOption',
            },
          ],
        ])
      )

      export const encodeOneofOptions: EncoderWithoutTag<OneofOptions> = ({ value, writer }) => {
        if (value['uninterpretedOption'] !== undefined) {
          encodeRepeatToBuffer(
            value['uninterpretedOption'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeUninterpretedOption),
            999,
            writer
          )
        }
      }

      export interface OneofDescriptorProto {
        name?: string
        options?: OneofOptions
      }

      export const decodeOneofDescriptorProto = defineMessage<OneofDescriptorProto>(
        new Map([
          [1, { type: 'scalar', decode: readString, name: 'name' }],
          [2, { type: 'message', decode: decodeOneofOptions, name: 'options' }],
        ])
      )

      export const encodeOneofDescriptorProto: EncoderWithoutTag<OneofDescriptorProto> = ({
        value,
        writer,
      }) => {
        if (value['name'] !== undefined) {
          encodeStringToBuffer({
            value: value['name'],
            tag: 1,
            writer,
          })
        }

        if (value['options'] !== undefined) {
          encodeMessageToBuffer(
            {
              value: value['options'],
              tag: 2,
              writer,
            },
            encodeOneofOptions
          )
        }
      }

      export interface MessageOptions {
        messageSetWireFormat?: boolean
        noStandardDescriptorAccessor?: boolean
        deprecated?: boolean
        mapEntry?: boolean
        uninterpretedOption?: UninterpretedOption[]
        '.xrpc.isJsonArray'?: boolean
      }

      export const decodeMessageOptions = defineMessage<MessageOptions>(
        new Map([
          [1, { type: 'scalar', decode: readBool, name: 'messageSetWireFormat' }],
          [2, { type: 'scalar', decode: readBool, name: 'noStandardDescriptorAccessor' }],
          [3, { type: 'scalar', decode: readBool, name: 'deprecated' }],
          [7, { type: 'scalar', decode: readBool, name: 'mapEntry' }],
          [
            999,
            {
              type: 'message',
              isRepeat: true,
              decode: decodeUninterpretedOption,
              name: 'uninterpretedOption',
            },
          ],
          [10005, { type: 'scalar', decode: readBool, name: 'XrpcIsJsonArray' }],
        ])
      )

      export const encodeMessageOptions: EncoderWithoutTag<MessageOptions> = ({ value, writer }) => {
        if (value['messageSetWireFormat'] !== undefined) {
          encodeBoolToBuffer({
            value: value['messageSetWireFormat'],
            tag: 1,
            writer,
          })
        }

        if (value['noStandardDescriptorAccessor'] !== undefined) {
          encodeBoolToBuffer({
            value: value['noStandardDescriptorAccessor'],
            tag: 2,
            writer,
          })
        }

        if (value['deprecated'] !== undefined) {
          encodeBoolToBuffer({
            value: value['deprecated'],
            tag: 3,
            writer,
          })
        }

        if (value['mapEntry'] !== undefined) {
          encodeBoolToBuffer({
            value: value['mapEntry'],
            tag: 7,
            writer,
          })
        }

        if (value['uninterpretedOption'] !== undefined) {
          encodeRepeatToBuffer(
            value['uninterpretedOption'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeUninterpretedOption),
            999,
            writer
          )
        }

        if (value['.xrpc.isJsonArray'] !== undefined) {
          encodeBoolToBuffer({
            value: value['.xrpc.isJsonArray'],
            tag: 10005,
            writer,
          })
        }
      }

      export interface ReservedRange {
        start?: number
        end?: number
      }

      export const decodeReservedRange = defineMessage<ReservedRange>(
        new Map([
          [1, { type: 'scalar', decode: readInt32, name: 'start' }],
          [2, { type: 'scalar', decode: readInt32, name: 'end' }],
        ])
      )

      export const encodeReservedRange: EncoderWithoutTag<ReservedRange> = ({ value, writer }) => {
        if (value['start'] !== undefined) {
          encodeInt32ToBuffer({
            value: value['start'],
            tag: 1,
            writer,
          })
        }

        if (value['end'] !== undefined) {
          encodeInt32ToBuffer({
            value: value['end'],
            tag: 2,
            writer,
          })
        }
      }

      export interface DescriptorProto {
        name?: string
        field?: FieldDescriptorProto[]
        extension?: FieldDescriptorProto[]
        nestedType?: DescriptorProto[]
        enumType?: EnumDescriptorProto[]
        extensionRange?: ExtensionRange[]
        oneofDecl?: OneofDescriptorProto[]
        options?: MessageOptions
        reservedRange?: ReservedRange[]
        reservedName?: string[]
      }

      export const decodeDescriptorProto = defineMessage<DescriptorProto>(
        new Map([
          [1, { type: 'scalar', decode: readString, name: 'name' }],
          [2, { type: 'message', isRepeat: true, decode: decodeFieldDescriptorProto, name: 'field' }],
          [6, { type: 'message', isRepeat: true, decode: decodeFieldDescriptorProto, name: 'extension' }],
          [3, { type: 'message', isRepeat: true, decode: decodeDescriptorProto, name: 'nestedType' }],
          [4, { type: 'message', isRepeat: true, decode: decodeEnumDescriptorProto, name: 'enumType' }],
          [5, { type: 'message', isRepeat: true, decode: decodeExtensionRange, name: 'extensionRange' }],
          [8, { type: 'message', isRepeat: true, decode: decodeOneofDescriptorProto, name: 'oneofDecl' }],
          [7, { type: 'message', decode: decodeMessageOptions, name: 'options' }],
          [9, { type: 'message', isRepeat: true, decode: decodeReservedRange, name: 'reservedRange' }],
          [10, { type: 'scalar', isRepeat: true, decode: readString, name: 'reservedName' }],
        ])
      )

      export const encodeDescriptorProto: EncoderWithoutTag<DescriptorProto> = ({ value, writer }) => {
        if (value['name'] !== undefined) {
          encodeStringToBuffer({
            value: value['name'],
            tag: 1,
            writer,
          })
        }

        if (value['field'] !== undefined) {
          encodeRepeatToBuffer(
            value['field'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeFieldDescriptorProto),
            2,
            writer
          )
        }

        if (value['extension'] !== undefined) {
          encodeRepeatToBuffer(
            value['extension'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeFieldDescriptorProto),
            6,
            writer
          )
        }

        if (value['nestedType'] !== undefined) {
          encodeRepeatToBuffer(
            value['nestedType'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeDescriptorProto),
            3,
            writer
          )
        }

        if (value['enumType'] !== undefined) {
          encodeRepeatToBuffer(
            value['enumType'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeEnumDescriptorProto),
            4,
            writer
          )
        }

        if (value['extensionRange'] !== undefined) {
          encodeRepeatToBuffer(
            value['extensionRange'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeExtensionRange),
            5,
            writer
          )
        }

        if (value['oneofDecl'] !== undefined) {
          encodeRepeatToBuffer(
            value['oneofDecl'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeOneofDescriptorProto),
            8,
            writer
          )
        }

        if (value['options'] !== undefined) {
          encodeMessageToBuffer(
            {
              value: value['options'],
              tag: 7,
              writer,
            },
            encodeMessageOptions
          )
        }

        if (value['reservedRange'] !== undefined) {
          encodeRepeatToBuffer(
            value['reservedRange'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeReservedRange),
            9,
            writer
          )
        }

        if (value['reservedName'] !== undefined) {
          encodeRepeatToBuffer(value['reservedName'], encodeStringToBuffer, 10, writer)
        }
      }

      export enum IdempotencyLevel {
        IDEMPOTENCY_UNKNOWN = 0,
        NO_SIDE_EFFECTS = 1,
        IDEMPOTENT = 2,
      }

      export interface MethodOptions {
        deprecated?: boolean
        idempotencyLevel?: IdempotencyLevel
        uninterpretedOption?: UninterpretedOption[]
        '.xrpc.methodOptionId'?: number
        '.xrpc.methodOptionRetry'?: boolean
      }

      export const decodeMethodOptions = defineMessage<MethodOptions>(
        new Map([
          [33, { type: 'scalar', decode: readBool, name: 'deprecated' }],
          [34, { type: 'scalar', decode: readEnum, name: 'idempotencyLevel' }],
          [
            999,
            {
              type: 'message',
              isRepeat: true,
              decode: decodeUninterpretedOption,
              name: 'uninterpretedOption',
            },
          ],
          [10002, { type: 'scalar', decode: readUint32, name: 'XrpcMethodOptionId' }],
          [10004, { type: 'scalar', decode: readBool, name: 'XrpcMethodOptionRetry' }],
        ])
      )

      export const encodeMethodOptions: EncoderWithoutTag<MethodOptions> = ({ value, writer }) => {
        if (value['deprecated'] !== undefined) {
          encodeBoolToBuffer({
            value: value['deprecated'],
            tag: 33,
            writer,
          })
        }

        if (value['idempotencyLevel'] !== undefined) {
          encodeEnumToBuffer({
            value: value['idempotencyLevel'],
            tag: 34,
            writer,
          })
        }

        if (value['uninterpretedOption'] !== undefined) {
          encodeRepeatToBuffer(
            value['uninterpretedOption'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeUninterpretedOption),
            999,
            writer
          )
        }

        if (value['.xrpc.methodOptionId'] !== undefined) {
          encodeUint32ToBuffer({
            value: value['.xrpc.methodOptionId'],
            tag: 10002,
            writer,
          })
        }

        if (value['.xrpc.methodOptionRetry'] !== undefined) {
          encodeBoolToBuffer({
            value: value['.xrpc.methodOptionRetry'],
            tag: 10004,
            writer,
          })
        }
      }

      export interface MethodDescriptorProto {
        name?: string
        inputType?: string
        outputType?: string
        options?: MethodOptions
        clientStreaming?: boolean
        serverStreaming?: boolean
      }

      export const decodeMethodDescriptorProto = defineMessage<MethodDescriptorProto>(
        new Map([
          [1, { type: 'scalar', decode: readString, name: 'name' }],
          [2, { type: 'scalar', decode: readString, name: 'inputType' }],
          [3, { type: 'scalar', decode: readString, name: 'outputType' }],
          [4, { type: 'message', decode: decodeMethodOptions, name: 'options' }],
          [5, { type: 'scalar', decode: readBool, name: 'clientStreaming' }],
          [6, { type: 'scalar', decode: readBool, name: 'serverStreaming' }],
        ])
      )

      export const encodeMethodDescriptorProto: EncoderWithoutTag<MethodDescriptorProto> = ({
        value,
        writer,
      }) => {
        if (value['name'] !== undefined) {
          encodeStringToBuffer({
            value: value['name'],
            tag: 1,
            writer,
          })
        }

        if (value['inputType'] !== undefined) {
          encodeStringToBuffer({
            value: value['inputType'],
            tag: 2,
            writer,
          })
        }

        if (value['outputType'] !== undefined) {
          encodeStringToBuffer({
            value: value['outputType'],
            tag: 3,
            writer,
          })
        }

        if (value['options'] !== undefined) {
          encodeMessageToBuffer(
            {
              value: value['options'],
              tag: 4,
              writer,
            },
            encodeMethodOptions
          )
        }

        if (value['clientStreaming'] !== undefined) {
          encodeBoolToBuffer({
            value: value['clientStreaming'],
            tag: 5,
            writer,
          })
        }

        if (value['serverStreaming'] !== undefined) {
          encodeBoolToBuffer({
            value: value['serverStreaming'],
            tag: 6,
            writer,
          })
        }
      }

      export interface ServiceOptions {
        deprecated?: boolean
        uninterpretedOption?: UninterpretedOption[]
        '.xrpc.serviceOptionId'?: number
      }

      export const decodeServiceOptions = defineMessage<ServiceOptions>(
        new Map([
          [33, { type: 'scalar', decode: readBool, name: 'deprecated' }],
          [
            999,
            {
              type: 'message',
              isRepeat: true,
              decode: decodeUninterpretedOption,
              name: 'uninterpretedOption',
            },
          ],
          [10001, { type: 'scalar', decode: readUint32, name: 'XrpcServiceOptionId' }],
        ])
      )

      export const encodeServiceOptions: EncoderWithoutTag<ServiceOptions> = ({ value, writer }) => {
        if (value['deprecated'] !== undefined) {
          encodeBoolToBuffer({
            value: value['deprecated'],
            tag: 33,
            writer,
          })
        }

        if (value['uninterpretedOption'] !== undefined) {
          encodeRepeatToBuffer(
            value['uninterpretedOption'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeUninterpretedOption),
            999,
            writer
          )
        }

        if (value['.xrpc.serviceOptionId'] !== undefined) {
          encodeUint32ToBuffer({
            value: value['.xrpc.serviceOptionId'],
            tag: 10001,
            writer,
          })
        }
      }

      export interface ServiceDescriptorProto {
        name?: string
        method?: MethodDescriptorProto[]
        options?: ServiceOptions
      }

      export const decodeServiceDescriptorProto = defineMessage<ServiceDescriptorProto>(
        new Map([
          [1, { type: 'scalar', decode: readString, name: 'name' }],
          [2, { type: 'message', isRepeat: true, decode: decodeMethodDescriptorProto, name: 'method' }],
          [3, { type: 'message', decode: decodeServiceOptions, name: 'options' }],
        ])
      )

      export const encodeServiceDescriptorProto: EncoderWithoutTag<ServiceDescriptorProto> = ({
        value,
        writer,
      }) => {
        if (value['name'] !== undefined) {
          encodeStringToBuffer({
            value: value['name'],
            tag: 1,
            writer,
          })
        }

        if (value['method'] !== undefined) {
          encodeRepeatToBuffer(
            value['method'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeMethodDescriptorProto),
            2,
            writer
          )
        }

        if (value['options'] !== undefined) {
          encodeMessageToBuffer(
            {
              value: value['options'],
              tag: 3,
              writer,
            },
            encodeServiceOptions
          )
        }
      }

      export enum OptimizeMode {
        SPEED = 1,
        CODE_SIZE = 2,
        LITE_RUNTIME = 3,
      }

      export interface FileOptions {
        javaPackage?: string
        javaOuterClassname?: string
        javaMultipleFiles?: boolean
        javaGenerateEqualsAndHash?: boolean
        javaStringCheckUtf8?: boolean
        optimizeFor?: OptimizeMode
        goPackage?: string
        ccGenericServices?: boolean
        javaGenericServices?: boolean
        pyGenericServices?: boolean
        phpGenericServices?: boolean
        deprecated?: boolean
        ccEnableArenas?: boolean
        objcClassPrefix?: string
        csharpNamespace?: string
        swiftPrefix?: string
        phpClassPrefix?: string
        phpNamespace?: string
        phpMetadataNamespace?: string
        rubyPackage?: string
        uninterpretedOption?: UninterpretedOption[]
        '.xrpc.useGogo'?: boolean
      }

      export const decodeFileOptions = defineMessage<FileOptions>(
        new Map([
          [1, { type: 'scalar', decode: readString, name: 'javaPackage' }],
          [8, { type: 'scalar', decode: readString, name: 'javaOuterClassname' }],
          [10, { type: 'scalar', decode: readBool, name: 'javaMultipleFiles' }],
          [20, { type: 'scalar', decode: readBool, name: 'javaGenerateEqualsAndHash' }],
          [27, { type: 'scalar', decode: readBool, name: 'javaStringCheckUtf8' }],
          [9, { type: 'scalar', decode: readEnum, name: 'optimizeFor' }],
          [11, { type: 'scalar', decode: readString, name: 'goPackage' }],
          [16, { type: 'scalar', decode: readBool, name: 'ccGenericServices' }],
          [17, { type: 'scalar', decode: readBool, name: 'javaGenericServices' }],
          [18, { type: 'scalar', decode: readBool, name: 'pyGenericServices' }],
          [42, { type: 'scalar', decode: readBool, name: 'phpGenericServices' }],
          [23, { type: 'scalar', decode: readBool, name: 'deprecated' }],
          [31, { type: 'scalar', decode: readBool, name: 'ccEnableArenas' }],
          [36, { type: 'scalar', decode: readString, name: 'objcClassPrefix' }],
          [37, { type: 'scalar', decode: readString, name: 'csharpNamespace' }],
          [39, { type: 'scalar', decode: readString, name: 'swiftPrefix' }],
          [40, { type: 'scalar', decode: readString, name: 'phpClassPrefix' }],
          [41, { type: 'scalar', decode: readString, name: 'phpNamespace' }],
          [44, { type: 'scalar', decode: readString, name: 'phpMetadataNamespace' }],
          [45, { type: 'scalar', decode: readString, name: 'rubyPackage' }],
          [
            999,
            {
              type: 'message',
              isRepeat: true,
              decode: decodeUninterpretedOption,
              name: 'uninterpretedOption',
            },
          ],
          [10001, { type: 'scalar', decode: readBool, name: 'XrpcUseGogo' }],
        ])
      )

      export const encodeFileOptions: EncoderWithoutTag<FileOptions> = ({ value, writer }) => {
        if (value['javaPackage'] !== undefined) {
          encodeStringToBuffer({
            value: value['javaPackage'],
            tag: 1,
            writer,
          })
        }

        if (value['javaOuterClassname'] !== undefined) {
          encodeStringToBuffer({
            value: value['javaOuterClassname'],
            tag: 8,
            writer,
          })
        }

        if (value['javaMultipleFiles'] !== undefined) {
          encodeBoolToBuffer({
            value: value['javaMultipleFiles'],
            tag: 10,
            writer,
          })
        }

        if (value['javaGenerateEqualsAndHash'] !== undefined) {
          encodeBoolToBuffer({
            value: value['javaGenerateEqualsAndHash'],
            tag: 20,
            writer,
          })
        }

        if (value['javaStringCheckUtf8'] !== undefined) {
          encodeBoolToBuffer({
            value: value['javaStringCheckUtf8'],
            tag: 27,
            writer,
          })
        }

        if (value['optimizeFor'] !== undefined) {
          encodeEnumToBuffer({
            value: value['optimizeFor'],
            tag: 9,
            writer,
          })
        }

        if (value['goPackage'] !== undefined) {
          encodeStringToBuffer({
            value: value['goPackage'],
            tag: 11,
            writer,
          })
        }

        if (value['ccGenericServices'] !== undefined) {
          encodeBoolToBuffer({
            value: value['ccGenericServices'],
            tag: 16,
            writer,
          })
        }

        if (value['javaGenericServices'] !== undefined) {
          encodeBoolToBuffer({
            value: value['javaGenericServices'],
            tag: 17,
            writer,
          })
        }

        if (value['pyGenericServices'] !== undefined) {
          encodeBoolToBuffer({
            value: value['pyGenericServices'],
            tag: 18,
            writer,
          })
        }

        if (value['phpGenericServices'] !== undefined) {
          encodeBoolToBuffer({
            value: value['phpGenericServices'],
            tag: 42,
            writer,
          })
        }

        if (value['deprecated'] !== undefined) {
          encodeBoolToBuffer({
            value: value['deprecated'],
            tag: 23,
            writer,
          })
        }

        if (value['ccEnableArenas'] !== undefined) {
          encodeBoolToBuffer({
            value: value['ccEnableArenas'],
            tag: 31,
            writer,
          })
        }

        if (value['objcClassPrefix'] !== undefined) {
          encodeStringToBuffer({
            value: value['objcClassPrefix'],
            tag: 36,
            writer,
          })
        }

        if (value['csharpNamespace'] !== undefined) {
          encodeStringToBuffer({
            value: value['csharpNamespace'],
            tag: 37,
            writer,
          })
        }

        if (value['swiftPrefix'] !== undefined) {
          encodeStringToBuffer({
            value: value['swiftPrefix'],
            tag: 39,
            writer,
          })
        }

        if (value['phpClassPrefix'] !== undefined) {
          encodeStringToBuffer({
            value: value['phpClassPrefix'],
            tag: 40,
            writer,
          })
        }

        if (value['phpNamespace'] !== undefined) {
          encodeStringToBuffer({
            value: value['phpNamespace'],
            tag: 41,
            writer,
          })
        }

        if (value['phpMetadataNamespace'] !== undefined) {
          encodeStringToBuffer({
            value: value['phpMetadataNamespace'],
            tag: 44,
            writer,
          })
        }

        if (value['rubyPackage'] !== undefined) {
          encodeStringToBuffer({
            value: value['rubyPackage'],
            tag: 45,
            writer,
          })
        }

        if (value['uninterpretedOption'] !== undefined) {
          encodeRepeatToBuffer(
            value['uninterpretedOption'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeUninterpretedOption),
            999,
            writer
          )
        }

        if (value['.xrpc.useGogo'] !== undefined) {
          encodeBoolToBuffer({
            value: value['.xrpc.useGogo'],
            tag: 10001,
            writer,
          })
        }
      }

      export interface Location {
        path?: number[]
        span?: number[]
        leadingComments?: string
        trailingComments?: string
        leadingDetachedComments?: string[]
      }

      export const decodeLocation = defineMessage<Location>(
        new Map([
          [1, { type: 'scalar', isRepeat: true, decode: readInt32, name: 'path' }],
          [2, { type: 'scalar', isRepeat: true, decode: readInt32, name: 'span' }],
          [3, { type: 'scalar', decode: readString, name: 'leadingComments' }],
          [4, { type: 'scalar', decode: readString, name: 'trailingComments' }],
          [6, { type: 'scalar', isRepeat: true, decode: readString, name: 'leadingDetachedComments' }],
        ])
      )

      export const encodeLocation: EncoderWithoutTag<Location> = ({ value, writer }) => {
        if (value['path'] !== undefined) {
          encodeRepeatToBuffer(value['path'], encodeInt32ToBuffer, 1, writer)
        }

        if (value['span'] !== undefined) {
          encodeRepeatToBuffer(value['span'], encodeInt32ToBuffer, 2, writer)
        }

        if (value['leadingComments'] !== undefined) {
          encodeStringToBuffer({
            value: value['leadingComments'],
            tag: 3,
            writer,
          })
        }

        if (value['trailingComments'] !== undefined) {
          encodeStringToBuffer({
            value: value['trailingComments'],
            tag: 4,
            writer,
          })
        }

        if (value['leadingDetachedComments'] !== undefined) {
          encodeRepeatToBuffer(value['leadingDetachedComments'], encodeStringToBuffer, 6, writer)
        }
      }

      export interface SourceCodeInfo {
        location?: Location[]
      }

      export const decodeSourceCodeInfo = defineMessage<SourceCodeInfo>(
        new Map([[1, { type: 'message', isRepeat: true, decode: decodeLocation, name: 'location' }]])
      )

      export const encodeSourceCodeInfo: EncoderWithoutTag<SourceCodeInfo> = ({ value, writer }) => {
        if (value['location'] !== undefined) {
          encodeRepeatToBuffer(
            value['location'],
            ({ value, tag, writer }) => encodeMessageToBuffer({ value, tag, writer }, encodeLocation),
            1,
            writer
          )
        }
      }

      export interface FileDescriptorProto {
        name?: string
        package?: string
        dependency?: string[]
        publicDependency?: number[]
        weakDependency?: number[]
        messageType?: DescriptorProto[]
        enumType?: EnumDescriptorProto[]
        service?: ServiceDescriptorProto[]
        extension?: FieldDescriptorProto[]
        options?: FileOptions
        sourceCodeInfo?: SourceCodeInfo
        syntax?: string
      }

      export const decodeFileDescriptorProto = defineMessage<FileDescriptorProto>(
        new Map([
          [1, { type: 'scalar', decode: readString, name: 'name' }],
          [2, { type: 'scalar', decode: readString, name: 'package' }],
          [3, { type: 'scalar', isRepeat: true, decode: readString, name: 'dependency' }],
          [10, { type: 'scalar', isRepeat: true, decode: readInt32, name: 'publicDependency' }],
          [11, { type: 'scalar', isRepeat: true, decode: readInt32, name: 'weakDependency' }],
          [4, { type: 'message', isRepeat: true, decode: decodeDescriptorProto, name: 'messageType' }],
          [5, { type: 'message', isRepeat: true, decode: decodeEnumDescriptorProto, name: 'enumType' }],
          [6, { type: 'message', isRepeat: true, decode: decodeServiceDescriptorProto, name: 'service' }],
          [7, { type: 'message', isRepeat: true, decode: decodeFieldDescriptorProto, name: 'extension' }],
          [8, { type: 'message', decode: decodeFileOptions, name: 'options' }],
          [9, { type: 'message', decode: decodeSourceCodeInfo, name: 'sourceCodeInfo' }],
          [12, { type: 'scalar', decode: readString, name: 'syntax' }],
        ])
      )

      export const encodeFileDescriptorProto: EncoderWithoutTag<FileDescriptorProto> = ({
        value,
        writer,
      }) => {
        if (value['name'] !== undefined) {
          encodeStringToBuffer({
            value: value['name'],
            tag: 1,
            writer,
          })
        }

        if (value['package'] !== undefined) {
          encodeStringToBuffer({
            value: value['package'],
            tag: 2,
            writer,
          })
        }

        if (value['dependency'] !== undefined) {
          encodeRepeatToBuffer(value['dependency'], encodeStringToBuffer, 3, writer)
        }

        if (value['publicDependency'] !== undefined) {
          encodeRepeatToBuffer(value['publicDependency'], encodeInt32ToBuffer, 10, writer)
        }

        if (value['weakDependency'] !== undefined) {
          encodeRepeatToBuffer(value['weakDependency'], encodeInt32ToBuffer, 11, writer)
        }

        if (value['messageType'] !== undefined) {
          encodeRepeatToBuffer(
            value['messageType'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeDescriptorProto),
            4,
            writer
          )
        }

        if (value['enumType'] !== undefined) {
          encodeRepeatToBuffer(
            value['enumType'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeEnumDescriptorProto),
            5,
            writer
          )
        }

        if (value['service'] !== undefined) {
          encodeRepeatToBuffer(
            value['service'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeServiceDescriptorProto),
            6,
            writer
          )
        }

        if (value['extension'] !== undefined) {
          encodeRepeatToBuffer(
            value['extension'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeFieldDescriptorProto),
            7,
            writer
          )
        }

        if (value['options'] !== undefined) {
          encodeMessageToBuffer(
            {
              value: value['options'],
              tag: 8,
              writer,
            },
            encodeFileOptions
          )
        }

        if (value['sourceCodeInfo'] !== undefined) {
          encodeMessageToBuffer(
            {
              value: value['sourceCodeInfo'],
              tag: 9,
              writer,
            },
            encodeSourceCodeInfo
          )
        }

        if (value['syntax'] !== undefined) {
          encodeStringToBuffer({
            value: value['syntax'],
            tag: 12,
            writer,
          })
        }
      }

      export interface FileDescriptorSet {
        file?: FileDescriptorProto[]
      }

      export const decodeFileDescriptorSet = defineMessage<FileDescriptorSet>(
        new Map([
          [1, { type: 'message', isRepeat: true, decode: decodeFileDescriptorProto, name: 'file' }],
        ])
      )

      export const encodeFileDescriptorSet: EncoderWithoutTag<FileDescriptorSet> = ({
        value,
        writer,
      }) => {
        if (value['file'] !== undefined) {
          encodeRepeatToBuffer(
            value['file'],
            ({ value, tag, writer }) =>
              encodeMessageToBuffer({ value, tag, writer }, encodeFileDescriptorProto),
            1,
            writer
          )
        }
      }

      export interface Annotation {
        path?: number[]
        sourceFile?: string
        begin?: number
        end?: number
      }

      export const decodeAnnotation = defineMessage<Annotation>(
        new Map([
          [1, { type: 'scalar', isRepeat: true, decode: readInt32, name: 'path' }],
          [2, { type: 'scalar', decode: readString, name: 'sourceFile' }],
          [3, { type: 'scalar', decode: readInt32, name: 'begin' }],
          [4, { type: 'scalar', decode: readInt32, name: 'end' }],
        ])
      )

      export const encodeAnnotation: EncoderWithoutTag<Annotation> = ({ value, writer }) => {
        if (value['path'] !== undefined) {
          encodeRepeatToBuffer(value['path'], encodeInt32ToBuffer, 1, writer)
        }

        if (value['sourceFile'] !== undefined) {
          encodeStringToBuffer({
            value: value['sourceFile'],
            tag: 2,
            writer,
          })
        }

        if (value['begin'] !== undefined) {
          encodeInt32ToBuffer({
            value: value['begin'],
            tag: 3,
            writer,
          })
        }

        if (value['end'] !== undefined) {
          encodeInt32ToBuffer({
            value: value['end'],
            tag: 4,
            writer,
          })
        }
      }

      export interface GeneratedCodeInfo {
        annotation?: Annotation[]
      }

      export const decodeGeneratedCodeInfo = defineMessage<GeneratedCodeInfo>(
        new Map([[1, { type: 'message', isRepeat: true, decode: decodeAnnotation, name: 'annotation' }]])
      )

      export const encodeGeneratedCodeInfo: EncoderWithoutTag<GeneratedCodeInfo> = ({
        value,
        writer,
      }) => {
        if (value['annotation'] !== undefined) {
          encodeRepeatToBuffer(
            value['annotation'],
            ({ value, tag, writer }) => encodeMessageToBuffer({ value, tag, writer }, encodeAnnotation),
            1,
            writer
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
