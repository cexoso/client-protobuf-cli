import { Service } from '@protobuf-es/grpc-frame-work'
import {
  HelloRequest,
  HelloReply,
  GetCurrentUserReq,
  User,
  encodeHelloRequest,
  decodeHelloReply,
  encodeGetCurrentUserReq,
  decodeUser,
} from '../../messages/helloworld'
import { createClient, callRPC } from '@protobuf-es/http2-client'
import { wrapDecode, wrapEncode } from '@protobuf-es/core'

@Service('Request')
export class GreeterService {
  #createClient = () => {
    const client = createClient({
      host: 'localhost',
      port: 50051,
      rejectUnauthorized: false,
    })
    return client
  }

  public async sayHello(input: HelloRequest): Promise<HelloReply> {
    const client = this.#createClient()
    const response = await callRPC({
      encodeReq: wrapEncode(encodeHelloRequest),
      decodeRes: wrapDecode(decodeHelloReply),
      data: input,
      client,
      path: '/helloworld.Greeter/SayHello',
    }).finally(() => client.close())
    return response.data
  }

  public async getCurrentUser(input: GetCurrentUserReq): Promise<User> {
    const client = this.#createClient()
    const response = await callRPC({
      encodeReq: wrapEncode(encodeGetCurrentUserReq),
      decodeRes: wrapDecode(decodeUser),
      data: input,
      client,
      path: '/helloworld.Greeter/GetCurrentUser',
    }).finally(() => client.close())
    return response.data
  }
}
