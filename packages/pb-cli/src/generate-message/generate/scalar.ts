import { Type, Enum } from 'protobufjs'

const enum ScalarTypes {
  string = 'string',
  double = 'double',
  float = 'float',
  int32 = 'int32',
  uint32 = 'uint32',
  sint32 = 'sint32',
  fixed32 = 'fixed32',
  sfixed32 = 'sfixed32',
  fixed64 = 'fixed64',
  sfixed64 = 'sfixed64',
  int64 = 'int64',
  uint64 = 'uint64',
  sint64 = 'sint64',
  bool = 'bool',
  bytes = 'bytes',
}

// 判断是否张量类型
export const isScalarType = (type: string): type is ScalarTypes => {
  const scalarTypes = [
    ScalarTypes.string,
    ScalarTypes.double,
    ScalarTypes.float,
    ScalarTypes.int32,
    ScalarTypes.uint32,
    ScalarTypes.sint32,
    ScalarTypes.fixed32,
    ScalarTypes.sfixed32,
    ScalarTypes.sfixed32,
    ScalarTypes.sint64,
    ScalarTypes.fixed64,
    ScalarTypes.sfixed64,
    ScalarTypes.int64,
    ScalarTypes.uint64,
    ScalarTypes.bool,
    ScalarTypes.bytes,
  ]
  return scalarTypes.includes(type as ScalarTypes)
}

export const scalarToTypescript = (scalarType: ScalarTypes) => {
  const scalarToTypescriptMap = new Map<ScalarTypes, string>([
    [ScalarTypes.string, 'string'],
    [ScalarTypes.double, 'number'],
    [ScalarTypes.float, 'number'],
    [ScalarTypes.int32, 'number'],
    [ScalarTypes.uint32, 'number'],
    [ScalarTypes.sint32, 'number'],
    [ScalarTypes.fixed32, 'number'],
    [ScalarTypes.sfixed32, 'number'],
    [ScalarTypes.fixed64, 'string'],
    [ScalarTypes.sfixed64, 'string'],
    [ScalarTypes.int64, 'string'],
    [ScalarTypes.uint64, 'string'],
    [ScalarTypes.bool, 'boolean'],
    [ScalarTypes.bytes, 'Uint8Array'],
  ])
  return scalarToTypescriptMap.get(scalarType)!
}

export const mapScalarToEncodeMethod = (type: string) => {
  const scalarToEncodeMethodMap = new Map<ScalarTypes, string>([
    [ScalarTypes.string, 'encodeStringToBuffer'],
    [ScalarTypes.double, 'encodeDoubleToBuffer'],
    [ScalarTypes.float, 'encodeFloatToBuffer'],
    [ScalarTypes.int32, 'encodeInt32ToBuffer'],
    [ScalarTypes.uint32, 'encodeUint32ToBuffer'],
    [ScalarTypes.sint32, 'encodeSint32ToBuffer'],
    [ScalarTypes.sint64, 'encodeSint64ToBuffer'],
    [ScalarTypes.fixed32, 'encodeFixed32ToBuffer'],
    [ScalarTypes.sfixed32, 'encodeSfixed32ToBuffer'],
    [ScalarTypes.sfixed64, 'encodeSfixed64ToBuffer'],
    [ScalarTypes.fixed64, 'encodeFixed64ToBuffer'],
    [ScalarTypes.int64, 'encodeInt64ToBuffer'],
    [ScalarTypes.uint64, 'encodeUint64ToBuffer'],
    [ScalarTypes.bool, 'encodeBoolToBuffer'],
    [ScalarTypes.bytes, 'encodeByteToBuffer'],
  ])
  const encodeType = scalarToEncodeMethodMap.get(type as ScalarTypes)
  if (!encodeType) {
    throw new Error(`目前不支持的 ${type} 类型`)
  }
  return encodeType
}

export const mapScalarToDecodeMethod = (type: string) => {
  const scalarToEncodeMethodMap = new Map<ScalarTypes, string>([
    [ScalarTypes.string, 'readString'],
    [ScalarTypes.double, 'readDouble'],
    [ScalarTypes.float, 'readFloat'],
    [ScalarTypes.int32, 'readInt32'],
    [ScalarTypes.uint32, 'readUint32'],
    [ScalarTypes.sint32, 'readSint32'],
    [ScalarTypes.sint64, 'readSint64'],
    [ScalarTypes.fixed32, 'readFixed32'],
    [ScalarTypes.sfixed32, 'readSfixed32'],
    [ScalarTypes.sfixed64, 'readSfixed64'],
    [ScalarTypes.fixed64, 'readFixed64'],
    [ScalarTypes.int64, 'readInt64'],
    [ScalarTypes.uint64, 'readUint64'],
    [ScalarTypes.bool, 'readBool'],
    [ScalarTypes.bytes, 'readAsBytes'],
  ])
  const decodeMethod = scalarToEncodeMethodMap.get(type as ScalarTypes)
  if (!decodeMethod) {
    throw new Error(`目前不支持 ${decodeMethod} 类型`)
  }
  return decodeMethod
}

export function isEnum(type: Type | Enum): type is Enum {
  return type instanceof Enum
}
