import { Type } from 'protobufjs'
export interface Generator {
  generateTypeContent(type: Type): string
}
