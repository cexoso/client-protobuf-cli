import { join } from 'path'
import { Plugin, Context } from '../command/command'
import dedent from 'ts-dedent'
import { dash, camel } from 'radash'
import { lowerCaseFirst } from '../prettier/string-format'
import { Service } from 'protobufjs'

const messagePath = './messages'

const notUpdateTips = dedent`
/**
 ****************************************
 * 命令行生成的文件，不要直接修改该文件 * 
 ****************************************
 */
`

export const GrpcServerFramework = (): Plugin => {
  function getServiceName(service: Service) {
    const serviceName = service.fullName.replace(/^\./, '')
    const fileFullName = camel(serviceName)
    return { grpcServiceName: serviceName, className: serviceName.split('.').at(-1)!, fileFullName }
  }

  function generateIndex(ctx: Context) {
    ctx.updateBasepath((originpath) => originpath)
    const { filesManager, messageGenerator, getAllService } = ctx

    const services = getAllService()
    const index = filesManager.getTSFileByProtoPath(join(messagePath, 'index.ts'))
    index.addImport({
      absolutePath: '@protobuf-es/grpc-frame-work',
      member: 'MetadataManager',
    })
    index.write('export const metadataManager = new MetadataManager()')
    for (const service of services) {
      const { grpcServiceName: serviceName } = getServiceName(service)
      service.methodsArray.forEach((method) => {
        const req = messageGenerator.getAllMemberByType(method.resolvedRequestType!)
        const res = messageGenerator.getAllMemberByType(method.resolvedResponseType!)
        index.addImport({ absolutePath: req.file, member: req.decoderMember })
        index.addImport({ absolutePath: res.file, member: res.encoderMember })
        index.addImport({ absolutePath: '@protobuf-es/core', member: 'wrapDecode' })
        index.addImport({ absolutePath: '@protobuf-es/core', member: 'wrapEncode' })

        index.write(
          dedent`
              metadataManager.setMetaData("${serviceName}", "${method.name}", {
                requestDecoder: wrapDecode(${req.decoderMember}),
                responseEncoder: wrapEncode(${res.encoderMember}),
              });
            `
        )
      })
    }
    index.write(
      `export const getMetadata:MetadataManager['getMetadata']  = metadataManager.getMetadata.bind(metadataManager)`
    )
    return {
      file: index,
    }
  }
  function generateBusiness(ctx: Context) {
    ctx.updateBasepath((originpath) => join(originpath, 'business'))
    const { filesManager, messageGenerator, getAllService } = ctx
    const services = getAllService()
    const index = filesManager.getTSFileByProtoPath('index.ts')
    index.write(notUpdateTips)
    index.addImport({
      absolutePath: '@protobuf-es/grpc-frame-work',
      member: 'createModule',
    })
    index.write(
      dedent`
        export const microservicesModule = createModule(() => {
          return {
            injectables: [
      `
    )

    for (const service of services) {
      const [_empty, ...other] = service.fullName.split('.')
      const filename = other.map((i) => dash(i)).join('/')
      const controllerFile = filesManager.getTSFileByProtoPath(filename + '.ts')
      const interfaceFile = filesManager.getTSFileByProtoPath(filename + '-interface.ts')
      interfaceFile.write(notUpdateTips)
      const { grpcServiceName: serviceName, className, fileFullName } = getServiceName(service)
      const interfaceName = className + 'Interface'
      interfaceFile.write(`export interface ${interfaceName} {`)

      controllerFile.addImport({
        absolutePath: '@protobuf-es/grpc-frame-work',
        member: 'Controller',
      })

      controllerFile.addImport({
        absolutePath: interfaceFile,
        member: interfaceName,
      })

      controllerFile.write(dedent`
        @Controller("${serviceName}")
        export class ${className} implements ${interfaceName} {
      `)

      service.methodsArray.forEach((method) => {
        const req = messageGenerator.getAllMemberByType(method.resolvedRequestType!)
        const res = messageGenerator.getAllMemberByType(method.resolvedResponseType!)
        interfaceFile.addImport({ absolutePath: req.file, member: req.interfaceMember })
        interfaceFile.addImport({ absolutePath: res.file, member: res.interfaceMember })
        const originMethodName = method.name
        const methodName = lowerCaseFirst(method.name)

        interfaceFile.write(
          `${methodName}: (input: ${req.interfaceMember}) => Promise<${res.interfaceMember}>`
        )

        controllerFile.addImport({
          absolutePath: '@protobuf-es/grpc-frame-work',
          member: 'GrpcMethod',
        })

        controllerFile.addImport({ absolutePath: req.file, member: req.interfaceMember })
        controllerFile.addImport({ absolutePath: res.file, member: res.interfaceMember })

        controllerFile.write(dedent`
          @GrpcMethod("${originMethodName}")
          public async ${methodName}(_input: ${req.interfaceMember}): Promise<${res.interfaceMember}> {
            throw new Error("TO IMPLEMENTS")
          }
        `)
      })
      controllerFile.write(`}`)
      interfaceFile.write(`}`)
      index.addImport({
        absolutePath: controllerFile,
        member: `${className} as ${fileFullName}`,
      })
      index.write(`${fileFullName},`)
    }
    index.write(
      dedent`
            ],
          };
        });
      `
    )
  }
  return {
    beforeGenerate(ctx) {
      ctx.updateBasepath((originpath) => join(originpath, messagePath))
    },
    afterGenerate(ctx) {
      generateIndex(ctx)
      generateBusiness(ctx)
    },
  }
}
