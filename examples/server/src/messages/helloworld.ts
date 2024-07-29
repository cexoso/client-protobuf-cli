import {
  readString,
  defineMessage,
  TagHandler,
  EncoderWithoutTag,
  encodeStringToBuffer,
  readInt32,
  encodeInt32ToBuffer,
} from '@protobuf-es/core'
export interface HelloRequest {
  name?: string
}

export const decodeHelloRequest = defineMessage<HelloRequest>(
  new Map<number, TagHandler>([[1, { type: 'scalar', decode: readString, name: 'name' }]])
)

export const encodeHelloRequest: EncoderWithoutTag<HelloRequest> = ({ value, writer }) => {
  if (value['name'] !== undefined) {
    encodeStringToBuffer({
      value: value['name'],
      tag: 1,
      writer,
    })
  }
}

export interface GetCurrentUserReq {
  uid?: number
}

export const decodeGetCurrentUserReq = defineMessage<GetCurrentUserReq>(
  new Map<number, TagHandler>([[1, { type: 'scalar', decode: readInt32, name: 'uid' }]])
)

export const encodeGetCurrentUserReq: EncoderWithoutTag<GetCurrentUserReq> = ({ value, writer }) => {
  if (value['uid'] !== undefined) {
    encodeInt32ToBuffer({
      value: value['uid'],
      tag: 1,
      writer,
    })
  }
}

export interface User {
  name?: string
}

export const decodeUser = defineMessage<User>(
  new Map<number, TagHandler>([[1, { type: 'scalar', decode: readString, name: 'name' }]])
)

export const encodeUser: EncoderWithoutTag<User> = ({ value, writer }) => {
  if (value['name'] !== undefined) {
    encodeStringToBuffer({
      value: value['name'],
      tag: 1,
      writer,
    })
  }
}

export interface HelloReply {
  message?: string
}

export const decodeHelloReply = defineMessage<HelloReply>(
  new Map<number, TagHandler>([[1, { type: 'scalar', decode: readString, name: 'message' }]])
)

export const encodeHelloReply: EncoderWithoutTag<HelloReply> = ({ value, writer }) => {
  if (value['message'] !== undefined) {
    encodeStringToBuffer({
      value: value['message'],
      tag: 1,
      writer,
    })
  }
}
