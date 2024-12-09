import { Field, Type } from 'protobufjs'

export function getFilenameByType(type: Type | Field) {
  const x = type.fullName.split('.')
  if (type.filename) {
    return type.filename
  }
  const pathFromPackage = x.slice(1, x.length - 1).join('/')
  if (pathFromPackage) {
    return `${pathFromPackage}.proto`
  }

  return 'builtin.proto'
}
