import { Plugin } from '../command/command'
export const easyRequestPlugin: Plugin = {
  afterGenerate(ctx) {
    for (let [protoPath, _root] of ctx.files) {
      const file = ctx.getTSFileByProtoPath(protoPath)
      console.log('debugger 🐛 file', file.getBody)
    }
  },
}
