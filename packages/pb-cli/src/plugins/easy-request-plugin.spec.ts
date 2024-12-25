import { describe, expect, it } from 'vitest'
import { createContainer } from '../container'
import { join } from 'path'
import { Command } from '../command/command'
import { TSFilesManager } from '../files-manager/files-manager'
import { easyRequestPlugin } from './easy-request-plugin'

const root = join(__dirname, '../../test-protos')
const dist = join(__dirname, '../../dist')

describe('插件', () => {
  it('插件', async () => {
    // 现在全量生成还有部分问题没有解决
    const container = createContainer()
    const cmd = container.get(Command)
    const tSFilesManager = container.get(TSFilesManager)
    cmd.addPlugin(easyRequestPlugin())
    await cmd.compileProtos({
      protoDir: root,
      outDir: dist,
      verbose: false,
      protoGlob: 'example.proto',
      autoClean: true,
      withPrettier: true,
      // 把这个改成 false, 会真实的在 dist 目录输出文件
      dryRun: true,
    })

    const allFile = tSFilesManager.listAllFile()
    expect(allFile).lengthOf(5)
    expect(allFile.map((file) => file.toString()).join('\n')).toMatchInlineSnapshot(`
      "// ./example.ts
      import {
        readUint32,
        defineMessage,
        EncoderWithoutTag,
        encodeUint32ToBuffer,
        readInt64,
        encodeInt64ToBuffer,
        encodeMessageToBuffer,
        readInt32,
        readString,
        readFloat,
        readBool,
        readEnum,
        encodeInt32ToBuffer,
        encodeStringToBuffer,
        encodeFloatToBuffer,
        encodeBoolToBuffer,
        encodeEnumToBuffer,
        encodeRepeatToBuffer,
      } from '@protobuf-es/core'
      import { People, decodePeople, encodePeople } from './people'
      export interface Pagination {
        index: number
        pageSize?: number
      }

      export const decodePagination = defineMessage<Pagination>(
        new Map([
          [1, { type: 'scalar', decode: readUint32, name: 'index' }],
          [10, { type: 'scalar', decode: readUint32, name: 'pageSize' }],
        ])
      )

      export const encodePagination: EncoderWithoutTag<Pagination> = ({ value, writer }) => {
        encodeUint32ToBuffer({
          value: value['index'],
          tag: 1,
          writer,
        })

        if (value['pageSize'] !== undefined) {
          encodeUint32ToBuffer({
            value: value['pageSize'],
            tag: 10,
            writer,
          })
        }
      }

      export interface GetDataReq {
        uid: string
        pagination?: Pagination
      }

      export const decodeGetDataReq = defineMessage<GetDataReq>(
        new Map([
          [1, { type: 'scalar', decode: readInt64, name: 'uid' }],
          [2, { type: 'message', decode: decodePagination, name: 'pagination' }],
        ])
      )

      export const encodeGetDataReq: EncoderWithoutTag<GetDataReq> = ({ value, writer }) => {
        encodeInt64ToBuffer({
          value: value['uid'],
          tag: 1,
          writer,
        })

        if (value['pagination'] !== undefined) {
          encodeMessageToBuffer(
            {
              value: value['pagination'],
              tag: 2,
              writer,
            },
            encodePagination
          )
        }
      }

      export enum Status {
        on_sale = 1,
        discontinued = 2,
      }

      export interface Book {
        bookId: number
        bookName: string
        price: number
        isFavorite?: boolean
        author: People
        status: Status
      }

      export const decodeBook = defineMessage<Book>(
        new Map([
          [1, { type: 'scalar', decode: readInt32, name: 'bookId' }],
          [2, { type: 'scalar', decode: readString, name: 'bookName' }],
          [3, { type: 'scalar', decode: readFloat, name: 'price' }],
          [4, { type: 'scalar', decode: readBool, name: 'isFavorite' }],
          [5, { type: 'message', decode: decodePeople, name: 'author' }],
          [6, { type: 'scalar', decode: readEnum, name: 'status' }],
        ])
      )

      export const encodeBook: EncoderWithoutTag<Book> = ({ value, writer }) => {
        encodeInt32ToBuffer({
          value: value['bookId'],
          tag: 1,
          writer,
        })
        encodeStringToBuffer({
          value: value['bookName'],
          tag: 2,
          writer,
        })
        encodeFloatToBuffer({
          value: value['price'],
          tag: 3,
          writer,
        })

        if (value['isFavorite'] !== undefined) {
          encodeBoolToBuffer({
            value: value['isFavorite'],
            tag: 4,
            writer,
          })
        }

        encodeMessageToBuffer(
          {
            value: value['author'],
            tag: 5,
            writer,
          },
          encodePeople
        )
        encodeEnumToBuffer({
          value: value['status'],
          tag: 6,
          writer,
        })
      }

      export interface Data {
        books?: Book[]
      }

      export const decodeData = defineMessage<Data>(
        new Map([[1, { type: 'message', isRepeat: true, decode: decodeBook, name: 'books' }]])
      )

      export const encodeData: EncoderWithoutTag<Data> = ({ value, writer }) => {
        if (value['books'] !== undefined) {
          encodeRepeatToBuffer(
            value['books'],
            ({ value, tag, writer }) => encodeMessageToBuffer({ value, tag, writer }, encodeBook),
            1,
            writer
          )
        }
      }

      export interface GetDataRes {
        code: number
        message: string
        data?: Data
      }

      export const decodeGetDataRes = defineMessage<GetDataRes>(
        new Map([
          [1, { type: 'scalar', decode: readInt32, name: 'code' }],
          [2, { type: 'scalar', decode: readString, name: 'message' }],
          [3, { type: 'message', decode: decodeData, name: 'data' }],
        ])
      )

      export const encodeGetDataRes: EncoderWithoutTag<GetDataRes> = ({ value, writer }) => {
        encodeInt32ToBuffer({
          value: value['code'],
          tag: 1,
          writer,
        })
        encodeStringToBuffer({
          value: value['message'],
          tag: 2,
          writer,
        })

        if (value['data'] !== undefined) {
          encodeMessageToBuffer(
            {
              value: value['data'],
              tag: 3,
              writer,
            },
            encodeData
          )
        }
      }

      // ./people.ts
      import {
        readInt32,
        readString,
        defineMessage,
        EncoderWithoutTag,
        encodeInt32ToBuffer,
        encodeStringToBuffer,
      } from '@protobuf-es/core'
      export interface People {
        userId: number
        name?: string
      }

      export const decodePeople = defineMessage<People>(
        new Map([
          [1, { type: 'scalar', decode: readInt32, name: 'userId' }],
          [2, { type: 'scalar', decode: readString, name: 'name' }],
        ])
      )

      export const encodePeople: EncoderWithoutTag<People> = ({ value, writer }) => {
        encodeInt32ToBuffer({
          value: value['userId'],
          tag: 1,
          writer,
        })

        if (value['name'] !== undefined) {
          encodeStringToBuffer({
            value: value['name'],
            tag: 2,
            writer,
          })
        }
      }

      // ./exampleHelper.ts
      import { wrapDecode, wrapEncode } from '@protobuf-es/core'
      import {
        decodeGetDataReq as _decodeGetDataReq,
        encodeGetDataReq as _encodeGetDataReq,
        GetDataReq as _GetDataReq,
        decodePagination as _decodePagination,
        encodePagination as _encodePagination,
        Pagination as _Pagination,
        decodeBook as _decodeBook,
        encodeBook as _encodeBook,
        Book as _Book,
        decodeData as _decodeData,
        encodeData as _encodeData,
        Data as _Data,
        decodeGetDataRes as _decodeGetDataRes,
        encodeGetDataRes as _encodeGetDataRes,
        GetDataRes as _GetDataRes,
      } from './example'
      export const encodeGetDataReq = wrapEncode(_encodeGetDataReq)
      export const decodeGetDataReq = wrapDecode(_decodeGetDataReq)
      export type GetDataReq = _GetDataReq
      export const encodePagination = wrapEncode(_encodePagination)
      export const decodePagination = wrapDecode(_decodePagination)
      export type Pagination = _Pagination
      export const encodeBook = wrapEncode(_encodeBook)
      export const decodeBook = wrapDecode(_decodeBook)
      export type Book = _Book
      export const encodeData = wrapEncode(_encodeData)
      export const decodeData = wrapDecode(_decodeData)
      export type Data = _Data
      export const encodeGetDataRes = wrapEncode(_encodeGetDataRes)
      export const decodeGetDataRes = wrapDecode(_decodeGetDataRes)
      export type GetDataRes = _GetDataRes

      // ./peopleHelper.ts
      import { wrapDecode, wrapEncode } from '@protobuf-es/core'
      import {
        decodePeople as _decodePeople,
        encodePeople as _encodePeople,
        People as _People,
      } from './people'
      export const encodePeople = wrapEncode(_encodePeople)
      export const decodePeople = wrapDecode(_decodePeople)
      export type People = _People

      // ./index.ts
      import { request } from '@futu/rpc-request'
      import { decodeGetDataRes, encodeGetDataReq, GetDataReq } from './exampleHelper'
      type FnsCallee = Parameters<typeof request>[0]['fnsCallee']
      const serviceId = 0xb601
      export const GetData = async (opts: { fnsCallee: FnsCallee; input: GetDataReq }) => {
        const { header, body } = await request({
          input: opts.input,
          reqEncoder: encodeGetDataReq,
          resDecoder: decodeGetDataRes,
          fnsCallee: opts.fnsCallee,
          srpcHeader: {
            serviceId,
            methodId: 0x1,
          },
        })
        return {
          header,
          body,
        }
      }
      "
    `)
  })
})
