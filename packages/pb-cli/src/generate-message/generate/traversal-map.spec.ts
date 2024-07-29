import { describe, expect, it } from 'vitest'
import { join } from 'path'
import { createContainer } from '../../container'
import { PBLoader } from '../../pb-loader/pb-loader'
import { ProjectInfo } from '../../project'
import { MessageGenerator } from '../generate-message'
import { TSFilesManager } from '../../files-manager/files-manager'

const root = join(__dirname, '../../../test-protos')

describe('traversal', () => {
  it('traversal map', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setBasepath('./src')
    const files = await pbLoader.loadByPath('map.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateAllCode(files)
    const filesManager = container.get(TSFilesManager)
    const content = filesManager
      .listAllFile()
      .map((file) => file.toString())
      .join('\n')

    expect(content).toMatchInlineSnapshot(`
      "// ./map.ts
      import {
        readInt32,
        defineMessage,
        TagHandler,
        EncoderWithoutTag,
        encodeInt32ToBuffer,
        defineMap,
        readString,
        ReaderLike,
        encodeMapToBuffer,
        encodeMessageToBuffer,
      } from '@protobuf-es/core'
      export interface Book {
        id?: number
      }

      export const decodeBook = defineMessage<Book>(
        new Map<number, TagHandler>([[1, { type: 'scalar', decode: readInt32, name: 'id' }]])
      )

      export const encodeBook: EncoderWithoutTag<Book> = ({ value, writer }) => {
        if (value['id'] !== undefined) {
          encodeInt32ToBuffer({
            value: value['id'],
            tag: 1,
            writer,
          })
        }
      }

      export interface Destination {
        ports?: Record<number, number>
        tags?: Record<string, string>
        books?: Record<string, Book>
      }

      export const decodeDestination = defineMessage<Destination>(
        new Map<number, TagHandler>([
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
                valueReader: (reader: ReaderLike) => decodeBook(reader),
                valueType: 'message',
              }),
              name: 'books',
              isMap: true,
            },
          ],
        ])
      )

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

      export interface Head {
        destination?: Destination
      }

      export const decodeHead = defineMessage<Head>(
        new Map<number, TagHandler>([
          [
            1,
            {
              type: 'message',
              decode: (reader: ReaderLike) => decodeDestination(reader),
              name: 'destination',
            },
          ],
        ])
      )

      export const encodeHead: EncoderWithoutTag<Head> = ({ value, writer }) => {
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
      "
    `)
  })
})
