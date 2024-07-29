import { Http2Server } from 'http2'
import { getReqParams } from './body-parser'
import { response200, response404 } from './response'
import { getCallTypeByContentType } from './handle-content-type'
import { getApply, getHandlerMetadata } from './get-handler-metadata'
import { serializeResponse } from './serialize-response'
import { errorHandler } from './error-handler'

interface HandleRequestOpts {
  http2server: Http2Server
  getApply: getApply
}

export const handleRequest = (opts: HandleRequestOpts) => {
  const { http2server: server, getApply } = opts

  server.on('stream', async (stream, headers) => {
    const { isApiCall, isJSON, isRPC } = getCallTypeByContentType(headers['content-type'])

    if (!isApiCall) {
      response404(stream)
      return
    }

    const handleData = getHandlerMetadata(headers[':path'], getApply)
    if (handleData === undefined) {
      response404(stream)
      return
    }

    const { responseEncoder, requestDecoder } = handleData

    const reqData = await getReqParams(stream, { isJSON, isRPC, requestDecoder })
    try {
      response200(stream, isJSON ? 'application/json' : 'application/grpc+proto')
      const response = await handleData.apply(reqData)
      const responsMessage = serializeResponse(response, { isJSON, isRPC, responseEncoder })
      stream.write(responsMessage, (error) => {
        if (!error) {
          stream.end()
          stream.once('wantTrailers', () => {
            stream.sendTrailers({
              'grpc-message': 'OK',
              'grpc-status': 0,
            })
          })
        }
      })
    } catch (error: unknown) {
      // 这里转换错误信息
      errorHandler(error, stream)
    }
  })
}
