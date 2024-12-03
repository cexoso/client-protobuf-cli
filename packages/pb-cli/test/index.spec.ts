import { describe, it, expect } from 'vitest'
import { join } from 'path'
import { loadPBfromLocalPath } from '../src/pb-loader/pb-loader'
import { ServiceCodeGenerater } from '../src/generate-service-code/generate-service-code'
import dedent from 'ts-dedent'
import { getList } from './helper'

describe.skip('loadPBfromLocalPath', () => {
  it('requestType', async () => {
    const result = await loadPBfromLocalPath({
      absolutePath: join(__dirname, '../test-protos/example.proto'),
    })
    const serviceName = 'ExampleService'
    const methods = result.getMethodsByServiceName(serviceName)
    const getData = methods.find((method) => method.name === 'GetData')
    const requesType = result.getRequestType(getData)
    const serviceCodeGenerater = new ServiceCodeGenerater()
    const { interfaces } = serviceCodeGenerater.generateMessageInterface(requesType)
    expect(getList(interfaces, -1).trim()).eq(
      dedent(`
        export interface GetDataReq {
          uid: string
          pagination?: Pagination
        }
      `)
    )

    expect(getList(interfaces, -2).trim()).eq(
      dedent(`
        export interface Pagination {
          index: number
          pageSize?: number
        }
      `)
    )

    const { encodeMessageCodes } = serviceCodeGenerater.generateEncodeCode(requesType)
    expect(getList(encodeMessageCodes, -1).trim()).eq(
      dedent(`
        const encodeGetDataReq: EncoderWithoutTag<GetDataReq> = ({ value, writer }) => {
          encodeInt64ToBuffer({
            value: value.uid,
            tag: 1,
            writer,
          })

          if (value.pagination !== undefined) {
            encodeMessageToBuffer(
              {
                value: value.pagination,
                tag: 2,
                writer,
              },
              encodePagination
            )
          }
        }
      `)
    )
    expect(getList(encodeMessageCodes, -2).trim()).eq(
      dedent(`
        const encodePagination: EncoderWithoutTag<Pagination> = ({ value, writer }) => {
          encodeUint32ToBuffer({
            value: value.index,
            tag: 1,
            writer,
          })

          if (value.pageSize !== undefined) {
            encodeUint32ToBuffer({
              value: value.pageSize,
              tag: 10,
              writer,
            })
          }
        }
      `)
    )
  })

  it('responseType', async () => {
    const result = await loadPBfromLocalPath({
      absolutePath: join(__dirname, '../test-protos/example.proto'),
    })
    const methods = result.getMethodsByServiceName('ExampleService')
    const getData = methods.find((method) => method.name === 'GetData')
    const responseType = result.getResponseType(getData)
    const serviceCodeGenerater = new ServiceCodeGenerater()
    const { interfaces } = serviceCodeGenerater.generateMessageInterface(responseType)
    expect(getList(interfaces, -1).trim()).eq(
      dedent(`
        export interface GetDataRes {
          code: number
          message: string
          data?: Data
        }
      `)
    )

    expect(getList(interfaces, -2).trim()).eq(
      dedent(`
        export interface Data {
          books?: Book[]
        }
      `)
    )

    expect(getList(interfaces, -3).trim()).eq(
      dedent(`
        export interface Book {
          bookId: number
          bookName: string
          price: number
          isFavorite?: boolean
          author: People
          status: Status
        }
      `)
    )

    expect(getList(interfaces, -4).trim()).eq(
      dedent(`
        export enum Status {
          on_sale = 1,
          discontinued = 2,
        }
      `)
    )

    const { decodeMessageCodes, imports } = serviceCodeGenerater.generateDecodeCode(responseType)

    expect(getList(decodeMessageCodes, -1).trim()).eq(
      dedent(`
        const decodeGetDataRes = defineMessage<GetDataRes>(
          new Map([
            [1, { type: 'scalar', decode: readInt32, name: 'code' }],
            [2, { type: 'scalar', decode: readString, name: 'message' }],
            [3, { type: 'message', decode: decodeData, name: 'data' }],
          ])
        )
      `)
    )

    expect(getList(decodeMessageCodes, -2).trim()).eq(
      dedent(`
        const decodeData = defineMessage<Data>(
          new Map([[1, { type: 'message', isRepeat: true, decode: decodeBook, name: 'books' }]])
        )
      `)
    )

    expect(getList(decodeMessageCodes, -3).trim()).eq(
      dedent(`
        const decodeBook = defineMessage<Book>(
          new Map([
            [1, { type: 'scalar', decode: readInt32, name: 'bookId' }],
            [2, { type: 'scalar', decode: readString, name: 'bookName' }],
            [3, { type: 'scalar', decode: readFloat, name: 'price' }],
            [4, { type: 'scalar', decode: readBool, name: 'isFavorite' }],
            [5, { type: 'message', decode: decodePeople, name: 'author' }],
            [6, { type: 'scalar', decode: readEnum, name: 'status' }],
          ])
        )
      `)
    )

    expect(getList(decodeMessageCodes, -4).trim()).eq(
      dedent(`
        const decodePeople = defineMessage<People>(
          new Map([
            [1, { type: 'scalar', decode: readInt32, name: 'userId' }],
            [2, { type: 'scalar', decode: readString, name: 'name' }],
          ])
        )
      `)
    )

    expect(imports.toImportsDeclare()).has.deep.property(
      '0',
      `import { readInt32, readString, readFloat, readBool, defineMessage, readEnum } from 'protobuf-frontend'`
    )
  })

  it('requestor', async () => {
    const result = await loadPBfromLocalPath({
      absolutePath: join(__dirname, '../test-protos/example.proto'),
    })

    const methods = result.getMethodsByServiceName('ExampleService')
    const getData = methods.find((method) => method.name === 'GetData')

    const serviceCodeGenerater = new ServiceCodeGenerater()

    const { requestors } = serviceCodeGenerater.generateRequestor(getData, {
      fnsServiceName: 'ExampleService',
    })

    expect(requestors[0].trim()).eq(
      dedent(`
        export const getData = (getDataReq: GetDataReq) => {
          const methodId = 0x1
          const writer = createWriter()
          encodeGetDataReq({
            writer,
            value: getDataReq,
          })
          const buffer = toUint8Array(writer)
          return fetch('/api/ExampleService', {
            method: 'POST',
            headers: {
              'service-id': String(serviceId),
              'method-id': String(methodId),
            },
            body: buffer,
          })
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => arrayBufferToReader(arrayBuffer))
            .then(decodeGetDataRes)
        }
    `)
    )
  })

  it('getServicesViewModel', async () => {
    const result = await loadPBfromLocalPath({
      absolutePath: join(__dirname, '../test-protos/example.proto'),
    })
    const viewModel = result.getServicesViewModel()

    expect(viewModel).has.nested.property('0.serviceName', 'ExampleService')
    expect(viewModel[0].methods[0]).has.property('methodId')
    expect(viewModel[0].methods[0]).has.property('requestType')
    expect(viewModel[0].methods[0]).has.property('responseType')
  })
})
