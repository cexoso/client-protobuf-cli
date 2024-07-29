import { describe, it, expect } from 'vitest'
import { loadSync } from 'protobufjs'
import { join } from 'path'
import { mockJsonData } from '../../example/fake'
import { decodeGetDataRes } from '../../example/index'
import { Buffer } from 'buffer'
import { createGzip } from 'zlib'
import { arrayBufferToReader } from '../src/reader'
import { encodeInt32ToBuffer } from '../src/encode'
import { createWriter, toUint8Array } from '../src/writer'

const pb = loadSync(join(__dirname, '../../example/example.proto'))
const doGzip = (inputBuffer: Buffer) => {
  return new Promise<Buffer>((resolve, reject) => {
    // 创建 Gzip 压缩器
    const gzip = createGzip()

    let compressedBuffer: any
    gzip.on('data', (chunk) => {
      if (!compressedBuffer) {
        compressedBuffer = chunk
      } else {
        compressedBuffer = Buffer.concat([compressedBuffer, chunk])
      }
    })

    gzip.on('end', () => {
      resolve(compressedBuffer)
    })

    gzip.on('error', (err) => {
      reject(err)
    })

    // 开始压缩
    gzip.write(inputBuffer)
    gzip.end()
  })
}

describe('耗时', async () => {
  it('数据大小', async () => {
    const getDataRes = pb.lookupType('GetDataRes')

    const buffer = getDataRes.encode(mockJsonData).finish()
    const json = JSON.stringify(mockJsonData)
    const transformDataOnNetwork = Buffer.from(json, 'utf8')
    console.log('通过 PB 编码的长度是', buffer.length)
    console.log('通过 JSON 编码的长度是', transformDataOnNetwork.length)
    const bufferGzip = await doGzip(Buffer.from(buffer))
    const transformDataOnNetworkGzip = await doGzip(Buffer.from(transformDataOnNetwork))
    console.log('GZIP 后的 PB 编码的长度是', bufferGzip.length)
    console.log('GZIP 后的 JSON 编码的长度是', transformDataOnNetworkGzip.length)
  })

  it.only('解码速度', () => {
    const json = JSON.stringify(mockJsonData)

    const getDataRes = pb.lookupType('GetDataRes')
    const buffer = getDataRes.encode(mockJsonData).finish()
    let googleProtobufStartTime = new Date()
    let count = 100

    let jsonDecodeStart = new Date()
    for (let i = 0; i < count; i++) {
      JSON.parse(json)
    }
    console.log('JSON 原生解码时间耗时', new Date().getTime() - jsonDecodeStart.getTime())

    for (let i = 0; i < count; i++) {
      getDataRes.decode(buffer).toJSON()
    }

    console.log(
      'google protobuf.js 解码时间耗时',
      new Date().getTime() - googleProtobufStartTime.getTime()
    )

    let startTime = new Date()
    for (let i = 0; i < count; i++) {
      decodeGetDataRes(arrayBufferToReader(buffer))
    }
    console.log('我们自己实现的解码时间耗时', new Date().getTime() - startTime.getTime())
  })

  it('数字编码', () => {
    const age = 18
    const JSONObject = JSON.stringify({ age })
    console.log('JSONObject is', JSONObject)
    const encodeWithJSON = Buffer.from(JSONObject, 'utf8')
    console.log('采用JSON 编码在网络中传输的数据', encodeWithJSON, encodeWithJSON.length)
    const writer = createWriter()
    encodeInt32ToBuffer({
      tag: 1,
      value: age,
      writer,
    })
    const encodeWithPB = Buffer.from(toUint8Array(writer))
    console.log('采用PB 编码在网络中传输的数据', encodeWithPB, encodeWithPB.length)
  })
})
