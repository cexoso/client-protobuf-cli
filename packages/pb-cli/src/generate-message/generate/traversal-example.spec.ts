import { describe, expect, it } from 'vitest'
import { join } from 'path'
import { createContainer } from '../../container'
import { PBLoader } from '../../pb-loader/pb-loader'
import { ProjectInfo } from '../../project'
import { MessageGenerator } from '../generate-message'
import { TSFilesManager } from '../../files-manager/files-manager'

const root = join(__dirname, '../../../test-protos')

describe('traversal', () => {
  it('example', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('example.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateAllCode(files)
    const filesManager = container.get(TSFilesManager)
    const content = filesManager.listAllFile()
    expect(content).lengthOf(2)

    expect(content[0]?.toString()).toMatchInlineSnapshot(`
      "// ./example.ts
      import {
        readUint32,
        defineMessage,
        TagHandler,
        EncoderWithoutTag,
        encodeUint32ToBuffer,
        readInt64,
        ReaderLike,
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
        new Map<number, TagHandler>([
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
        new Map<number, TagHandler>([
          [1, { type: 'scalar', decode: readInt64, name: 'uid' }],
          [
            2,
            {
              type: 'message',
              decode: (reader: ReaderLike) => decodePagination(reader),
              name: 'pagination',
            },
          ],
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
        new Map<number, TagHandler>([
          [1, { type: 'scalar', decode: readInt32, name: 'bookId' }],
          [2, { type: 'scalar', decode: readString, name: 'bookName' }],
          [3, { type: 'scalar', decode: readFloat, name: 'price' }],
          [4, { type: 'scalar', decode: readBool, name: 'isFavorite' }],
          [5, { type: 'message', decode: (reader: ReaderLike) => decodePeople(reader), name: 'author' }],
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
        new Map<number, TagHandler>([
          [
            1,
            {
              type: 'message',
              isRepeat: true,
              decode: (reader: ReaderLike) => decodeBook(reader),
              name: 'books',
            },
          ],
        ])
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
        new Map<number, TagHandler>([
          [1, { type: 'scalar', decode: readInt32, name: 'code' }],
          [2, { type: 'scalar', decode: readString, name: 'message' }],
          [3, { type: 'message', decode: (reader: ReaderLike) => decodeData(reader), name: 'data' }],
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
      "
    `)
    expect(content[1]?.toString()).toMatchInlineSnapshot(`
      "// ./people.ts
      import {
        readInt32,
        readString,
        defineMessage,
        TagHandler,
        EncoderWithoutTag,
        encodeInt32ToBuffer,
        encodeStringToBuffer,
      } from '@protobuf-es/core'
      export interface People {
        userId: number
        name?: string
      }

      export const decodePeople = defineMessage<People>(
        new Map<number, TagHandler>([
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
      "
    `)
  })
})
