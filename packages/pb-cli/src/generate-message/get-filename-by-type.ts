import { Enum, Field, MapField, Type } from 'protobufjs'

export function getFilenameByType(type: Type | Field | MapField | Enum) {
  if (type.filename) {
    return type.filename
  }

  const x = type.fullName.split('.')
  // 用于处理
  // google.protobuf.ServiceOptions..web.sortType 这样的类型
  // 我不正确这样做是否正确，这块我还不是很了解
  const lastEmpty = x.findLastIndex((item) => item === '')
  const pathFromPackage = x.slice(lastEmpty + 1, x.length - 1).join('/')
  if (pathFromPackage) {
    return `${pathFromPackage}.proto`
  }

  return 'builtin.proto'
}
