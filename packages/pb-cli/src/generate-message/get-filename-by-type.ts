import { Field, Type } from 'protobufjs'

// 函数用于递归获取所有 message 定义
export function getFilenameByType(type: Type | Field) {
  // protobuf 自己有一些内置模块，这些模块的加载 type 是没有 filename 的
  // 我认为这是一个 bug，但我不想深入去处理了，所以所有没有办法确定文件名的
  // 模块，统统放到 builtin 文件中
  return type.filename || 'builtin.proto'
}
