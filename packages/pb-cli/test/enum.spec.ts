import { describe, it, expect } from 'vitest'
import { join } from 'path'
import { loadPBfromLocalPath } from '../src/pb-loader/pb-loader'
import { ServiceCodeGenerater } from '../src/generate-service-code/generate-service-code'
import { getList } from './helper'
import dedent from 'ts-dedent'
import { generatePackage } from '../src/generate-services'

describe('generatePackage IPO', () => {
  it('normal', async () => {
    const file = await generatePackage({
      absolutePath: join(__dirname, '../test-protos/example.proto'),
      serviceName: 'stock_placement',
      out: join(__dirname, '../../ipo'),
      // 下面改成 false，会真实的生成文件
      // 用于集成测试
      dryRun: true,
    })
  })
})
describe('generatePackage', () => {
  it('requestType', async () => {
    const result = await loadPBfromLocalPath({
      absolutePath: join(__dirname, '../test-protos/example.proto'),
    })
    const serviceName = 'ExampleService'
    expect(result).has.deep.property('services', [serviceName])
    const methods = result.getMethodsByServiceName(serviceName)
    const getData = methods.find((method) => method.name === 'GetData')

    const responseType = result.getResponseType(getData)
    const serviceCodeGenerater = new ServiceCodeGenerater()
    const { interfaces } = serviceCodeGenerater.generateMessageInterface(responseType)
    expect(getList(interfaces, -1).trim()).eq(
      dedent(
        `export interface GetDataRes {
          code: number
          message: string
          data?: Data
        }`
      )
    )

    expect(getList(interfaces, -2).trim()).eq(
      dedent(
        `export interface Data {
          books?: Book[]
        }`
      )
    )

    expect(getList(interfaces, -3).trim()).eq(
      dedent(
        `export interface Book {
          bookId: number
          bookName: string
          price: number
          isFavorite?: boolean
          author: People
          status: Status
        }`
      )
    )

    expect(getList(interfaces, -4).trim()).eq(
      dedent(
        `export enum Status {
          on_sale = 1,
          discontinued = 2,
        }`
      )
    )

    expect(getList(interfaces, -5).trim()).eq(
      dedent(
        `export interface People {
          userId: number
          name?: string
        }`
      )
    )
  })
})
