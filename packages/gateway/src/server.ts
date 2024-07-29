import Koa from 'koa'
import { Buffer } from 'node:buffer'
import { loadSync } from 'protobufjs'
import { join } from 'path'
import { mockJsonData } from '../../example/fake'

const pb = loadSync(join(__dirname, '../../example/example.proto'))

function startup() {
  const app = new Koa()
  const port = 8080
  app.use(async (context, next) => {
    const gatewayApiMatch = context.req.url!.match(/\/api\/([^/]*)/)
    if (!gatewayApiMatch) {
      await next()
      return
    }
    // 流量网关
    const fnsServiceName = gatewayApiMatch[1]

    // serviceName 查询 host port
    const { host, port } = await getAddressByNameService({ callee: fnsServiceName })

    // 前端请求带上来的  serviceId, methodId 这部分会由 protobuff 生成
    const serviceId = Number(context.req.headers['service-id'])
    const methodId = Number(context.req.headers['method-id'])

    const getBuffer = () => {
      let buffers: Buffer[] = []
      return new Promise<Buffer>((resolve, reject) => {
        context.req.on('data', (data) => {
          buffers.push(data)
        })
        context.req.on('end', () => {
          resolve(Buffer.concat(buffers))
        })
        context.req.on('error', (error) => {
          reject(error)
        })
      })
    }

    const buffer = await getBuffer()

    context.body = await remoteCall({
      serviceId,
      methodId,
      host,
      port,
      requestBodyBuffer: buffer,
    })
  })

  app.listen(port)
  console.log('listent at ', port)
}

const getAddressByNameService = async ({ callee }: { callee: string }) => {
  console.log('模拟服务发现，传递服务名: ', callee)
  return {
    // 假的地址
    host: '172.168.0.1',
    port: 8091,
  }
}

async function remoteCall({
  requestBodyBuffer,
}: {
  methodId: number
  serviceId: number
  host: string
  port: number
  requestBodyBuffer: Buffer
}) {
  const getDataReq = pb.lookupType('GetDataReq')
  console.log(
    '模拟微服务，网关实际上不会解码数据流\n解码出来的参数为:',
    getDataReq.decode(requestBodyBuffer).toJSON()
  )
  // 模拟在网关上进行流量转发，网关会将对应的请求流量打到查询到的对应服务上
  // 模拟返回请求，因为我们没有真实的后端微服务
  // 所以只能假设下面的数据来至于后端的微服务了
  const getDataRes = pb.lookupType('GetDataRes')
  return Buffer.from(getDataRes.encode(mockJsonData).finish())
}

startup()
