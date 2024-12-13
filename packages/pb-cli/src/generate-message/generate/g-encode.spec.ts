import { describe, expect, it } from 'vitest'
import { join } from 'path'
import { createContainer } from '../../container'
import { PBLoader } from '../../pb-loader/pb-loader'
import { ProjectInfo } from '../../project'
import { MessageGenerator } from '../generate-message'
import { FilesManager } from '../../files-manager/files-manager'
import dedent from 'ts-dedent'

const root = join(__dirname, '../../../test-protos')

describe('encode', () => {
  it('encode', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('**/color.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateType(files)
    const filesManager = container.get(FilesManager)
    const fileContent = filesManager.listAllFile().map((file) => file.toString())
    expect(fileContent.map((file) => file.toString()).join('\n')).deep.eq(dedent`
      // ./google/protobuf.ts

      export interface DoubleValue {
        value?: number
      }

      export interface FloatValue {
        value?: number
      }

      export interface Int64Value {
        value?: string
      }

      export interface UInt64Value {
        value?: string
      }

      export interface Int32Value {
        value?: number
      }

      export interface UInt32Value {
        value?: number
      }

      export interface BoolValue {
        value?: boolean
      }

      export interface StringValue {
        value?: string
      }

      export interface BytesValue {
        value?: Uint8Array
      }

      // ./google/type/color.ts
      import { FloatValue } from '../protobuf'
      export interface Color {
        red?: number
        green?: number
        blue?: number
        alpha?: google.protobuf.FloatValue
      }
      
    `)
    expect(fileContent.length).eq(2)
  })

  it('map interface', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('map.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateType(files, {
      typeFullnameRegExp: 'CRpcHead',
    })
    const filesManager = container.get(FilesManager)
    expect(filesManager.listAllFile().at(0)?.getBody({ formatWithCurrentPrettier: true }))
      .eq(dedent`
        export interface Book {
          id?: number
        }

        export interface Destination {
          ports?: Record<number, number>
          tags?: Record<string, string>
          books?: Record<string, Book>
        }

        export interface CRpcHead {
          destination?: Destination
        }
        
      `)
  })

  it('map encode', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('map.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateEncoder(files, {
      typeFullnameRegExp: 'CRpcHead',
    })
    const filesManager = container.get(FilesManager)
    expect(filesManager.listAllFile().at(0)?.toString()).eq(dedent`
      // ./map.ts
      import { encodeInt32ToBuffer, EncoderWithoutTag, encodeStringToBuffer, encodeMapToBuffer, encodeMessageToBuffer } from '@protobuf-es/core'
      export const encodeBook: EncoderWithoutTag<Book> = ({ value, writer }) => {
        if (value['id'] !== undefined) {
          encodeInt32ToBuffer({
            value: value['id'],
            tag: 1,
            writer,
          })
        }
      }

      export const encodeDestination: EncoderWithoutTag<Destination> = ({ value, writer }) => {
        if (value['ports'] !== undefined) {
          encodeMapToBuffer(value['ports'], {
            tag: 1,
            writer,
            isKeyNumber: true,
            keyEncoderWithTag: encodeInt32ToBuffer,
            valueEncoderWithTag: encodeInt32ToBuffer,
          })
        }

        if (value['tags'] !== undefined) {
          encodeMapToBuffer(value['tags'], {
            tag: 2,
            writer,
            keyEncoderWithTag: encodeStringToBuffer,
            valueEncoderWithTag: encodeStringToBuffer,
          })
        }

        if (value['books'] !== undefined) {
          encodeMapToBuffer(value['books'], {
            tag: 3,
            writer,
            keyEncoderWithTag: encodeStringToBuffer,
            valueEncoderWithTag: encodeBook,
          })
        }
      }

      export const encodeCRpcHead: EncoderWithoutTag<CRpcHead> = ({ value, writer }) => {
        if (value['destination'] !== undefined) {
          encodeMessageToBuffer(
            {
              value: value['destination'],
              tag: 1,
              writer,
            },
            encodeDestination
          )
        }
      }
      
    `)
  })

  it('map decode', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('map.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateDecode(files, {
      typeFullnameRegExp: 'CRpcHead',
    })
    const filesManager = container.get(FilesManager)
    filesManager.catAllFile()
  })
})
