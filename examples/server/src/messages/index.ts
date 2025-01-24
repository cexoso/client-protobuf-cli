import { MetadataManager } from '@protobuf-es/grpc-frame-work'
import { decodeHelloRequest, encodeHelloReply, decodeGetCurrentUserReq, encodeUser } from './helloworld'
import { wrapDecode, wrapEncode } from '@protobuf-es/core'
export const metadataManager = new MetadataManager()
metadataManager.setMetaData('helloworld.Greeter', 'SayHello', {
  requestDecoder: wrapDecode(decodeHelloRequest),
  responseEncoder: wrapEncode(encodeHelloReply),
})
metadataManager.setMetaData('helloworld.Greeter', 'GetCurrentUser', {
  requestDecoder: wrapDecode(decodeGetCurrentUserReq),
  responseEncoder: wrapEncode(encodeUser),
})
export const getMetadata: MetadataManager['getMetadata'] = metadataManager.getMetadata.bind(metadataManager)
