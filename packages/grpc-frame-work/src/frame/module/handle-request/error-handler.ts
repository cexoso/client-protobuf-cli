import { ServerHttp2Stream } from 'http2'
import { CustomerError } from '../../../errors'

const getMessageAndCode = (
  error: unknown
): {
  message: string
  status: number
} => {
  if (error instanceof CustomerError) {
    const status = error.status
    return {
      message: error.message,
      status: status,
    }
  }
  console.log(error)
  return {
    status: 503,
    message: 'inter_server_error',
  }
}

export function errorHandler(error: unknown, stream: ServerHttp2Stream) {
  const { message, status } = getMessageAndCode(error)
  stream.end()
  stream.once('wantTrailers', () => {
    stream.sendTrailers({
      // 这里不能传输中文字符
      'grpc-message': encodeURIComponent(message),
      'grpc-status': status,
    })
  })
}
