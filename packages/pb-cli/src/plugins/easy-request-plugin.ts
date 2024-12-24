import { Plugin, Context } from '../command/command'
import dedent from 'ts-dedent'
import { Method, Type } from 'protobufjs'
import { getAllService } from 'src/generate-message/get-all-type'

interface Option {
  service: string
}
export const easyRequestPlugin: (opts?: Option) => Plugin = () => {
  function getHelperFileByType(ctx: Context, type: Type) {
    const file = ctx.filesManager.getTSFileByProtoPath(type.filename!)
    return ctx.filesManager.getNewFileByRelativePathWithCurrentFile(
      file,
      `${file.getFileName(true)}Helper.ts`
    )
  }

  const memberMap = new WeakMap<
    Type,
    { interface: string; decoderName: string; encoderName: string }
  >()

  function getMembersByMethod(ctx: Context, method: Method) {
    const resolvedResponseType = method.resolvedResponseType!
    const resolvedRequestType = method.resolvedRequestType!

    const responseFile = getHelperFileByType(ctx, resolvedResponseType)
    const requestFile = getHelperFileByType(ctx, resolvedRequestType)
    return {
      requestMembers: memberMap.get(resolvedRequestType)!,
      responseMember: memberMap.get(resolvedResponseType)!,
      responseFile,
      requestFile,
    }
  }

  return {
    afterGenerate(ctx) {
      const { filesManager, messageGenerator, files } = ctx

      messageGenerator.doForType(files, (t) => {
        const result = messageGenerator.getAllMemberByType(t)

        const { decoder, encoder, tsInterface } = result

        const wrapFile = getHelperFileByType(ctx, t)

        wrapFile.addImport({ absolutePath: '@protobuf-es/core', member: 'wrapDecode' })
        wrapFile.addImport({ absolutePath: '@protobuf-es/core', member: 'wrapEncode' })

        const toInnerName = (name: string) => `${name} as _${name}`

        wrapFile.addImport({ absolutePath: decoder.file, member: toInnerName(decoder.memberName) })

        wrapFile.addImport({ absolutePath: encoder.file, member: toInnerName(encoder.memberName) })

        wrapFile.addImport({
          absolutePath: decoder.file,
          member: toInnerName(tsInterface.memberName),
        })

        wrapFile.write(
          dedent`
            export const ${encoder.memberName} = wrapEncode(_${encoder.memberName});
            export const ${decoder.memberName} = wrapDecode(_${decoder.memberName});
            export type ${tsInterface.memberName} = _${tsInterface.memberName};
          `
        )

        memberMap.set(t, {
          interface: tsInterface.memberName,
          decoderName: decoder.memberName,
          encoderName: encoder.memberName,
        })
      })

      for (let [_, root] of files) {
        const services = getAllService(root)
        const service = services[0]
        if (service === undefined) {
          continue
        }

        const index = filesManager.getTSFileByProtoPath('index.ts')
        index.addImport({ absolutePath: '@futu/rpc-request', member: 'request' })
        const hexServiceId = '0x' + service.getOption('(srpc.service_option_id)').toString(16)
        // 更好的是直接从 fns 依赖，但是我不想去依赖 fns 库
        index.write(`type FnsCallee = Parameters<typeof request>[0]['fnsCallee'];`)
        index.write(`const serviceId = ${hexServiceId}`)

        service.methodsArray.forEach((method) => {
          const hexMethodId = '0x' + method.getOption('(srpc.method_option_id)').toString(16)
          const { requestMembers, responseMember, responseFile, requestFile } = getMembersByMethod(
            ctx,
            method
          )

          index.addImport({ absolutePath: responseFile, member: requestMembers.decoderName })
          index.addImport({ absolutePath: requestFile, member: responseMember.encoderName })

          const methodBody = dedent`
          export const ${method.name}= async (opts: { fnsCallee: FnsCallee; input: ${requestMembers.interface}}) => {
            const { header, body } = await request({
              input: opts.input,
              reqEncoder: ${requestMembers.encoderName},
              resDecoder: ${responseMember.decoderName},
              fnsCallee: opts.fnsCallee,
              srpcHeader: {
                serviceId,
                methodId: ${hexMethodId},
              },
            });
            return {
              header,
              body,
            };
          };
        `
          index.write(methodBody)
        })
      }
    },
  }
}
