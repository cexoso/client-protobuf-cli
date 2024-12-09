import { Field, Type } from 'protobufjs'
import { isScalarType } from './generate/scalar'

export function getTypeName(type: Type | Field) {
  if (type instanceof Field) {
    if (isScalarType(type.type)) {
      return type.name
    }
    return type.root.lookupTypeOrEnum(type.type).name
  }
  return type.name
}
