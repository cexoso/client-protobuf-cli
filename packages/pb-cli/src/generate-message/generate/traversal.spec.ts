import { describe, expect, it } from 'vitest'
import { join } from 'path'
import { createContainer } from '../../container'
import { PBLoader } from '../../pb-loader/pb-loader'
import { ProjectInfo } from '../../project'
import { MessageGenerator } from '../generate-message'
import { TSFilesManager } from '../../files-manager/files-manager'
import dedent from 'ts-dedent'

const root = join(__dirname, '../../../test-protos')

describe('tranversal', () => {
  it.only('map', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('map.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateAllCode1(files)
    const filesManager = container.get(TSFilesManager)
    const content = filesManager
      .listAllFile()
      .map((file) => file.toString())
      .join('\n')
    console.log(content)
  })
  it.only('example', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('example.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateAllCode1(files)
    const filesManager = container.get(TSFilesManager)
    filesManager.catAllFile()
  })
  it.skip('encode', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('**/color.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateAllCode1(files)
    const filesManager = container.get(TSFilesManager)
    filesManager.catAllFile()
    // expect(fileContent.map((file) => file.toString()).join('\n'))
    // expect(fileContent.length).eq(2)
  })

  it.skip('map interface', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('map.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateAllCode(files, {
      typeFullnameRegExp: 'CRpcHead',
    })
    const filesManager = container.get(TSFilesManager)
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

  it.skip('map encode', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('map.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateAllCode(files, {
      typeFullnameRegExp: 'CRpcHead',
    })
    const filesManager = container.get(TSFilesManager)
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

  it.skip('map decode', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('map.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateAllCode(files, {
      typeFullnameRegExp: 'CRpcHead',
    })
    const filesManager = container.get(TSFilesManager)
    expect(filesManager.listAllFile().at(0)?.toString()).eq(dedent`
      // ./map.ts
      import { defineMap, readInt32, readString, defineMessage } from '@protobuf-es/core'
      export const decodeBook = defineMessage<Book>(
        new Map([[1, { type: 'scalar', decode: readInt32, name: 'id' }]])
      )

      export const decodeDestination = defineMessage<Destination>(
        new Map([
          [
            1,
            {
              type: 'message',
              decode: defineMap({
                keyReader: readInt32,
                valueReader: readInt32,
                valueType: 'scalar',
              }),
              name: 'ports',
              isMap: true,
            },
          ],
          [
            2,
            {
              type: 'message',
              decode: defineMap({
                keyReader: readString,
                valueReader: readString,
                valueType: 'scalar',
              }),
              name: 'tags',
              isMap: true,
            },
          ],
          [
            3,
            {
              type: 'message',
              decode: defineMap({
                keyReader: readString,
                valueReader: decodeBook,
                valueType: 'message',
              }),
              name: 'books',
              isMap: true,
            },
          ],
        ])
      )

      export const decodeCRpcHead = defineMessage<CRpcHead>(
        new Map([[1, { type: 'message', decode: decodeDestination, name: 'destination' }]])
      )
      
    `)
  })

  it.skip('嵌套且名字重复的消息', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('nestle-duplicate-message.proto')
    const [_, pbRoot] = [...files.entries()][0]!
    const messageGenerator = container.get(MessageGenerator)
    const filesManager = container.get(TSFilesManager)
    messageGenerator.generateAllCode1(files)
    filesManager.catAllFile()
    // const reqType = pbRoot.lookupType('nestle_service.GetDataReq.Reponse')
    // const resType = pbRoot.lookupType('nestle_service.GetDataRes.Reponse')
    // const reqTypeMember = messageGenerator.getAllMemberByType(reqType)
    // const resTypeMember = messageGenerator.getAllMemberByType(resType)
    // expect(reqTypeMember.tsInterface.memberName).eq('Reponse')
    // expect(resTypeMember.tsInterface.memberName).eq('NestleServiceGetDataResReponse')
    //
    // expect(reqTypeMember.encoder.memberName).eq('encodeReponse')
    // expect(resTypeMember.encoder.memberName).eq('encodeNestleServiceGetDataResReponse')
    //
    // expect(reqTypeMember.decoder.memberName).eq('decodeReponse')
    // expect(resTypeMember.decoder.memberName).eq('decodeNestleServiceGetDataResReponse')
  })
})
