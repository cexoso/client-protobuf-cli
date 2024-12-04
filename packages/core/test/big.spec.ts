import { describe, it } from 'vitest'
import { Buffer } from 'buffer'
import { encodeInt32ToBuffer } from '../src/encode'
import { createWriter, toUint8Array } from '../src/writer'

describe('耗时', async () => {
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
