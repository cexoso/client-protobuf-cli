import { Enum, Type } from 'protobufjs'
export interface Generator {
  generateTypeContent(type: Type): string
  generateEnumContent(enumType: Enum): string
  getMemberNameByType(type: Type): string
}
