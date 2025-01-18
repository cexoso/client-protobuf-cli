import { Plugin } from '../command/command'
import dedent from 'ts-dedent'

export const GrpcServerFramework = (): Plugin => {
  return {
    afterGenerate(ctx) {
      const { filesManager, messageGenerator, getAllService } = ctx

      const services = getAllService()
      const index = filesManager.getTSFileByProtoPath('index.ts')
      index.addImport({
        absolutePath: '@protobuf-es/grpc-frame-work',
        member: 'MetaDataManager',
      })
      index.write('export const metadataManager = new MetaDataManager()')
      for (const service of services) {
        const serviceName = service.fullName.replace(/^\./, '')
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
    },
  }
}
