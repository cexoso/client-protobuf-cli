import { describe, expect, it } from 'vitest'
import { createContainer } from '../container'
import { MessageGenerator } from './generate-message'
import { join } from 'path'
import { PBLoader } from '../pb-loader/pb-loader'
import { ProjectInfo } from '../project'
import { FilesManager } from '../files-manager/files-manager'
import { dedent } from 'ts-dedent'

const root = join(__dirname, '../../test-protos')

describe('generate', () => {
  it('类型', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('example.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateType(files)
    const filesManager = container.get(FilesManager)
    const fileContent = filesManager.listAllFile().map((file) => file.toString())
    expect(fileContent).lengthOf(2)
    expect(fileContent[0]).deep.eq(dedent`
      // ./example.proto
      import { People } from './people.proto'
      export interface Pagination {
        index: number
        pageSize?: number
      }

      export interface GetDataReq {
        uid: string
        pagination?: Pagination
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

      export interface Data {
        books?: Book[]
      }

      export interface GetDataRes {
        code: number
        message: string
        data?: Data
      }

    `)
    expect(fileContent[1]).deep.eq(dedent`
      // ./people.proto

      export interface People {
        userId: number
        name?: string
      }
      
    `)
  })

  it('encode', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('example.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateEncoder(files)
    const filesManager = container.get(FilesManager)
    const fileContent = filesManager.listAllFile().map((file) => file.toString())
    expect(fileContent).lengthOf(2)
    expect(fileContent[0]).deep.eq(dedent`
      // ./example.proto
      import { encodeUint32ToBuffer, EncoderWithoutTag, encodeInt64ToBuffer, encodeMessageToBuffer, encodeInt32ToBuffer, encodeStringToBuffer, encodeFloatToBuffer, encodeBoolToBuffer, encodeEnumToBuffer, encodeRepeatToBuffer } from 'protobuf-frontend'
      import { encodePeople } from './people.proto'
      const encodePagination: EncoderWithoutTag<Pagination> = ({ value, writer }) => {
        encodeUint32ToBuffer({
          value: value.index,
          tag: 1,
          writer,
        })

        if (value.pageSize !== undefined) {
          encodeUint32ToBuffer({
            value: value.pageSize,
            tag: 10,
            writer,
          })
        }
      }

      const encodeGetDataReq: EncoderWithoutTag<GetDataReq> = ({ value, writer }) => {
        encodeInt64ToBuffer({
          value: value.uid,
          tag: 1,
          writer,
        })

        if (value.pagination !== undefined) {
          encodeMessageToBuffer(
            {
              value: value.pagination,
              tag: 2,
              writer,
            },
            encodePagination
          )
        }
      }

      const encodeBook: EncoderWithoutTag<Book> = ({ value, writer }) => {
        encodeInt32ToBuffer({
          value: value.bookId,
          tag: 1,
          writer,
        })
        encodeStringToBuffer({
          value: value.bookName,
          tag: 2,
          writer,
        })
        encodeFloatToBuffer({
          value: value.price,
          tag: 3,
          writer,
        })

        if (value.isFavorite !== undefined) {
          encodeBoolToBuffer({
            value: value.isFavorite,
            tag: 4,
            writer,
          })
        }

        encodeMessageToBuffer(
          {
            value: value.author,
            tag: 5,
            writer,
          },
          encodePeople
        )
        encodeEnumToBuffer({
          value: value.status,
          tag: 6,
          writer,
        })
      }

      const encodeData: EncoderWithoutTag<Data> = ({ value, writer }) => {
        if (value.books !== undefined) {
          encodeRepeatToBuffer(
            value.books,
            ({ value, tag, writer }) => encodeMessageToBuffer({ value, tag, writer }, encodeBook),
            1,
            writer
          )
        }
      }

      const encodeGetDataRes: EncoderWithoutTag<GetDataRes> = ({ value, writer }) => {
        encodeInt32ToBuffer({
          value: value.code,
          tag: 1,
          writer,
        })
        encodeStringToBuffer({
          value: value.message,
          tag: 2,
          writer,
        })

        if (value.data !== undefined) {
          encodeMessageToBuffer(
            {
              value: value.data,
              tag: 3,
              writer,
            },
            encodeData
          )
        }
      }
      
    `)

    expect(fileContent[1]).deep.eq(dedent`
      // ./people.proto
      import { encodeInt32ToBuffer, encodeStringToBuffer, EncoderWithoutTag } from 'protobuf-frontend'
      const encodePeople: EncoderWithoutTag<People> = ({ value, writer }) => {
        encodeInt32ToBuffer({
          value: value.userId,
          tag: 1,
          writer,
        })

        if (value.name !== undefined) {
          encodeStringToBuffer({
            value: value.name,
            tag: 2,
            writer,
          })
        }
      }
      
    `)
  })
})