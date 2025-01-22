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

    expect(files[0]?.fileNameWithProject).eq('./helloworld.ts')
    expect(allFile).lengthOf(5)
    expect(allFile.at(1)?.toString()).toMatchInlineSnapshot(`
      "// ./messages/index.ts
      import { MetadataManager } from '@protobuf-es/grpc-frame-work'
      import { decodeHelloRequest, encodeHelloReply } from './helloworld'
      import { wrapDecode, wrapEncode } from '@protobuf-es/core'
      export const metadataManager = new MetadataManager()
      metadataManager.setMetaData('helloworld.Greeter', 'SayHello', {
        requestDecoder: wrapDecode(decodeHelloRequest),
        responseEncoder: wrapEncode(encodeHelloReply),
      })
      export const getMetadata: MetadataManager['getMetadata'] =
        metadataManager.getMetadata.bind(metadataManager)
      "
    `)
    expect(allFile.at(2)?.toString()).toMatchInlineSnapshot(`
      "// ./index.ts
      import { createModule } from '@protobuf-es/grpc-frame-work'
      import { Greeter as helloworldGreeter } from './helloworld/greeter'
      /**
       ****************************************
       * 命令行生成的文件，不要直接修改该文件 *
       ****************************************
       */
      export const microservicesModule = createModule(() => {
        return {
          injectables: [helloworldGreeter],
        }
      })
      "
    `)
    expect(allFile.at(3)?.toString()).toMatchInlineSnapshot(`
      "// ./helloworld/greeter.ts
      import { Controller, GrpcMethod } from '@protobuf-es/grpc-frame-work'
      import { GreeterInterface } from './greeter-interface'
      import { HelloRequest, HelloReply } from '../../messages/helloworld'
      @Controller('helloworld.Greeter')
      export class Greeter implements GreeterInterface {
        @GrpcMethod('SayHello')
        public async sayHello(_input: HelloRequest): Promise<HelloReply> {
          throw new Error('TO IMPLEMENTS')
        }
      }
      "
    `)
    expect(allFile.at(4)?.toString()).toMatchInlineSnapshot(`
      "// ./helloworld/greeter-interface.ts
      import { HelloRequest, HelloReply } from '../../messages/helloworld'
      /**
       ****************************************
       * 命令行生成的文件，不要直接修改该文件 *
       ****************************************
       */
      export interface GreeterInterface {
        sayHello: (input: HelloRequest) => Promise<HelloReply>
      }
      "
    `)
  })
})
