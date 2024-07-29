import type { ClientHttp2Stream, IncomingHttpHeaders, IncomingHttpStatusHeader } from 'http2'

export interface ResponseType {
  data: Buffer
  trailers: {
    'grpc-message': string
    'grpc-status': string
  }
  headers: IncomingHttpHeaders & IncomingHttpStatusHeader
}
export const getResponse = async (req: ClientHttp2Stream) => {
  let data: Buffer[] = []
  let dataIsReceipted = false
  let trailers: Record<string, string> | null = null
  let headers: (IncomingHttpHeaders & IncomingHttpStatusHeader) | null = null

  function tryResolve(resolve: (response: ResponseType) => void) {
    if (trailers === null || !dataIsReceipted || headers === null) {
      return
    }

    const status = trailers['grpc-status']

    if (status === undefined || status === '') {
      // 状态码一定不能为空
      throw new Error('missing status')
    }
    // 但允许 message 为空
    const message = trailers['grpc-message'] || ''
    resolve({
      data: Buffer.concat(data),
      trailers: {
        // decodeURIComponent 的目的是，http2 header 上只能传输 http 友好的格式
        // 于服务器端约定了一定进行 encodeURIComponent
        'grpc-message': decodeURIComponent(message),
        // 这里并没有把 status 转成 number，是因为有人认为 status 用 string 传输也具有可读性, 例如 'OK' 'FAIL'
        'grpc-status': status,
      },
      headers,
    })
  }
  return new Promise<ResponseType>((resolve, reject) => {
    req.once('trailers', (headers) => {
      trailers = headers
      tryResolve(resolve)
    })
    req.on('data', (chunk) => data.push(chunk))
    req.once('end', () => {
      dataIsReceipted = true
      tryResolve(resolve)
    })
    req.on('error', (error) => reject(error))
    req.on('response', (header) => {
      headers = header
      tryResolve(resolve)
    })
  })
}
