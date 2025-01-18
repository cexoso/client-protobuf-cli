import { describe, expect, it } from 'vitest'
import { join } from 'path'
import { GrpcServerFramework } from './grpc-server-framework'
import { createContainer } from '../container'
import { Command } from '../command/command'

const root = join(__dirname, '../../test-protos')
const dist = join(__dirname, '../../dist')

describe('grpc server framework, 为自己写的 grpc 框架生成代码', () => {
  it('helloworld', async () => {
    const container = createContainer()
    const cmd = container.get(Command)

    cmd.addPlugin(GrpcServerFramework())
    const files = await cmd.compileProtos({
      protoDir: root,
      outDir: dist,
      verbose: false,
      protoGlob: 'helloworld.proto',
      autoClean: true,
      withPrettier: true,
      // 把这个改成 false, 会真实的在 dist 目录输出文件
      dryRun: true,
    })

    const allFile = files.map((file) => file.toString())
    expect(allFile).lengthOf(2)
    expect(allFile.join('\n')).toMatchInlineSnapshot(`
      "// ./helloworld.ts
      import {
        readString,
        defineMessage,
        TagHandler,
        EncoderWithoutTag,
        encodeStringToBuffer,
      } from '@protobuf-es/core'
      export interface HelloRequest {
        name?: string
      }

      export const decodeHelloRequest = defineMessage<HelloRequest>(
        new Map<number, TagHandler>([[1, { type: 'scalar', decode: readString, name: 'name' }]])
      )

      export const encodeHelloRequest: EncoderWithoutTag<HelloRequest> = ({ value, writer }) => {
        if (value['name'] !== undefined) {
          encodeStringToBuffer({
            value: value['name'],
            tag: 1,
            writer,
          })
        }
      }

      export interface HelloReply {
        message?: string
      }

      export const decodeHelloReply = defineMessage<HelloReply>(
        new Map<number, TagHandler>([[1, { type: 'scalar', decode: readString, name: 'message' }]])
      )

      export const encodeHelloReply: EncoderWithoutTag<HelloReply> = ({ value, writer }) => {
        if (value['message'] !== undefined) {
          encodeStringToBuffer({
            value: value['message'],
            tag: 1,
            writer,
          })
        }
      }

      // ./index.ts
      import { MetaDataManager } from '@protobuf-es/grpc-frame-work'
      import { decodeHelloRequest, encodeHelloReply } from './helloworld'
      import { wrapDecode, wrapEncode } from '@protobuf-es/core'
      export const metadataManager = new MetaDataManager()
      metadataManager.setMetaData('helloworld.Greeter', 'SayHello', {
        requestDecoder: wrapDecode(decodeHelloRequest),
        responseEncoder: wrapEncode(encodeHelloReply),
      })
      export const getMetadata: MetadataManager['getMetadata'] =
        metadataManager.getMetadata.bind(metadataManager)
      "
    `)
  })
})
