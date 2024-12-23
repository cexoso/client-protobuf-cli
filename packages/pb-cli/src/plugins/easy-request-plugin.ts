import { Plugin } from '../command/command'
import dedent from 'ts-dedent'
interface Option {}
export const easyRequestPlugin: (opts: Option) => Plugin = (opts) => ({
  afterGenerate(ctx) {
    const { filesManager, messageGenerator, files } = ctx
    messageGenerator.doForType(files, (t) => {
      const file = filesManager.getTSFileByProtoPath(t.filename!)

      const result = messageGenerator.getAllMemberByType(t)

      const { decoder, encoder } = result

      const wrapFile = filesManager.getNewFileByRelativePathWithCurrentFile(
        file,
        `${file.getFileName(true)}Helper.ts`
      )

      wrapFile.addImport({ absolutePath: '@protobuf-es/core', member: 'wrapDecode' })
      wrapFile.addImport({ absolutePath: '@protobuf-es/core', member: 'wrapEncode' })

      const toInnerName = (name: string) => `${name} as _${name}`

      wrapFile.addImport({
        absolutePath: decoder.file,
        member: toInnerName(decoder.memberName),
      })

      wrapFile.addImport({
        absolutePath: encoder.file,
        member: toInnerName(encoder.memberName),
      })

      wrapFile.write(
        dedent`
          export const ${encoder.memberName} = wrapEncode(_${encoder.memberName});
          export const ${decoder.memberName} = wrapDecode(_${decoder.memberName});
        `
      )
    })
  },
})
