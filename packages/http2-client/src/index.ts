import { ClientHttp2Session, connect } from 'http2'
import { getResponse } from './get-response'
import { decode, encode } from '@protobuf-es/grpc-utils'

export async function callRPC<I = any, O = any>(opts: {
  client: ClientHttp2Session
  path: string
  isJSON?: boolean
  encodeReq: (value: I) => Uint8Array
  decodeRes: (input: Uint8Array) => O
  data: I
}) {
  const { client, isJSON, path, data } = opts

  const req = client.request({
    ':path': path,
    // 这个表示希望接收的数据是原始数据，不要经过 gzip 压缩
    'accept-encoding': 'identity',
    'content-type': isJSON ? 'application/json' : 'application/grpc',
    ':method': 'POST',
    te: 'trailers',
  })

  // TODO: 对于大数据量的场景来说，这里需要判断是否发送成功，如果不成功，需要等待 drain 事件再发送
  req.write(isJSON ? JSON.stringify(data) : encode(new Uint8Array(opts.encodeReq(data))))
  req.end()

  const response = await getResponse(req)

  const isSuccess = response.trailers['grpc-status'] === '0' || response.trailers['grpc-status'] === 'OK'

  const responseData: O = isJSON
    ? JSON.parse(response.data.toString())
    : // 对于 rpc 回包来说，必须在成功的情况下才能解包，否则数据对不上？
      isSuccess
      ? opts.decodeRes(decode(new Uint8Array(response.data)))
      : response.data

  return {
    // 回包数据
    data: responseData,
    trailer: response.trailers,
    headers: response.headers,
  }
}

export const createClient = (opts: { host: string; port: number; rejectUnauthorized?: boolean }) =>
  connect(`https://${opts.host}:${opts.port}`, {
    rejectUnauthorized: opts.rejectUnauthorized ?? true,
  })
