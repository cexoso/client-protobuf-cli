import { describe, expect, it } from 'vitest'
import { createContainer } from '../container'
import { MessageGenerator } from './generate-message'
import { isAbsolute, join, relative } from 'path'
import { PBLoader } from '../pb-loader/pb-loader'
import { ProjectInfo } from '../project'
import { TSFilesManager } from '../files-manager/files-manager'
import { dedent } from 'ts-dedent'
import {
  createProgram,
  createSourceFile,
  createCompilerHost,
  getPreEmitDiagnostics,
} from 'typescript'

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
    const filesManager = container.get(TSFilesManager)
    const fileContent = filesManager.listAllFile().map((file) => file.toString())
    expect(fileContent).lengthOf(2)
    expect(fileContent[0]).deep.eq(dedent`
      // ./example.ts
      import { People } from './people'
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
      // ./people.ts

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
    const filesManager = container.get(TSFilesManager)
    const fileContent = filesManager.listAllFile().map((file) => file.toString())
    expect(fileContent).lengthOf(2)
    expect(fileContent[0]).deep.eq(dedent`
      // ./example.ts
      import { encodeUint32ToBuffer, EncoderWithoutTag, encodeInt64ToBuffer, encodeMessageToBuffer, encodeInt32ToBuffer, encodeStringToBuffer, encodeFloatToBuffer, encodeBoolToBuffer, encodeEnumToBuffer, encodeRepeatToBuffer } from '@protobuf-es/core'
      import { encodePeople } from './people'
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
      
    `)

    expect(fileContent[1]).deep.eq(dedent`
      // ./people.ts
      import { encodeInt32ToBuffer, encodeStringToBuffer, EncoderWithoutTag } from '@protobuf-es/core'
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
      
    `)
  })

  it('decode', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('example.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateDecode(files)
    const filesManager = container.get(TSFilesManager)
    const fileContent = filesManager.listAllFile().map((file) => file.toString())
    expect(fileContent).lengthOf(2)
    expect(fileContent[0]).deep.eq(dedent`
      // ./example.ts
      import { readUint32, defineMessage, readInt64, readInt32, readString, readFloat, readBool, readEnum } from '@protobuf-es/core'
      import { decodePeople } from './people'
      export const decodePagination = defineMessage<Pagination>(
        new Map([
          [1, { type: 'scalar', decode: readUint32, name: 'index' }],
          [10, { type: 'scalar', decode: readUint32, name: 'pageSize' }],
        ])
      )

      export const decodeGetDataReq = defineMessage<GetDataReq>(
        new Map([
          [1, { type: 'scalar', decode: readInt64, name: 'uid' }],
          [2, { type: 'message', decode: decodePagination, name: 'pagination' }],
        ])
      )

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

      export const decodeData = defineMessage<Data>(
        new Map([[1, { type: 'message', isRepeat: true, decode: decodeBook, name: 'books' }]])
      )

      export const decodeGetDataRes = defineMessage<GetDataRes>(
        new Map([
          [1, { type: 'scalar', decode: readInt32, name: 'code' }],
          [2, { type: 'scalar', decode: readString, name: 'message' }],
          [3, { type: 'message', decode: decodeData, name: 'data' }],
        ])
      )
      
    `)
    expect(fileContent[1]).deep.eq(dedent`
      // ./people.ts
      import { readInt32, readString, defineMessage } from '@protobuf-es/core'
      export const decodePeople = defineMessage<People>(
        new Map([
          [1, { type: 'scalar', decode: readInt32, name: 'userId' }],
          [2, { type: 'scalar', decode: readString, name: 'name' }],
        ])
      )
      
    `)
  })

  it('所有内容生成', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('example.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateAllCode(files)
    const filesManager = container.get(TSFilesManager)
    const fileContent = filesManager.listAllFile()
    expect(fileContent).lengthOf(2)

    const toProjectRelativePath = (p: string) => {
      if (isAbsolute(p)) {
        return relative(process.cwd(), p)
      }
      return p
    }
    const fileNames = fileContent.map((file) => {
      return file.fileNameWithProject
    })

    const compiler = createCompilerHost({})
    const originGetSourceFile = compiler.getSourceFile
    compiler.getSourceFile = (fileName, languageVersion) => {
      const file = filesManager.getFileByTs(toProjectRelativePath(fileName))
      if (file) {
        return createSourceFile(fileName, file.body, languageVersion)
      }
      return originGetSourceFile(fileName, languageVersion)
    }
    const fileExists = compiler.fileExists
    compiler.fileExists = (fileName: string) => {
      const x = toProjectRelativePath(fileName)
      const file = filesManager.getFileByTs(x)
      if (file) {
        return true
      }
      return fileExists(fileName)
    }
    const originReadFile = compiler.readFile
    compiler.readFile = (fileName: string) => {
      const file = filesManager.getFileByTs(toProjectRelativePath(fileName))
      if (file) {
        return file.body
      }
      return originReadFile(fileName)
    }
    const program = createProgram(fileNames, {}, compiler)

    const diagnostics = getPreEmitDiagnostics(program)
    expect(diagnostics).lengthOf(0)
  })
})
