import { encodeHelloRequest, decodeHelloReply } from './messages/helloworld'
import { wrapEncode, wrapDecode } from '@protobuf-es/core'
import { createClient, callRPC } from '@protobuf-es/http2-client'

async function callExample(opts: { name: string; isJSON: boolean }) {
  const client = createClient({
    host: 'localhost',
    port: 50051,
    rejectUnauthorized: false,
  })

  const response = await callRPC({
    encodeReq: wrapEncode(encodeHelloRequest),
    decodeRes: wrapDecode(decodeHelloReply),
    data: { name: opts.name },
    isJSON: opts.isJSON,
    client,
    path: '/helloworld.Greeter/SayHello',
  }).finally(() => client.close())

  console.log('debugger 🐛 response', response)

  return response
}

async function main() {
  callExample({ name: 'world', isJSON: false })
  callExample({ name: 'world', isJSON: true })
  callExample({ name: '传一个超长的名称以触发服务器端抛业务异常', isJSON: false })
}

main()
