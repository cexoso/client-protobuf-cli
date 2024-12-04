import { describe, expect, it } from 'vitest'
import { createContainer } from '../container'
import { MessageGenerator } from './generate-message'
import { join } from 'path'
import { PBLoader } from '../pb-loader/pb-loader'
import { ProjectInfo } from '../project'
import { FilesManager } from '../files-manager/files-manager'
import { dedent } from 'ts-dedent'

const root = join(__dirname, '../../test-protos')

describe('pbloader', () => {
  it('load 类型', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('example.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateType(files)
    const filesManager = container.get(FilesManager)
    const fileContent = filesManager.listAllFile().map((file) => file.toString())
    expect(fileContent).lengthOf(2)
    expect(fileContent[0]).deep.eq(dedent`
      // ./example.proto
      import { Pagination, Status, Book, Data } from './example.proto'
      import { People } from './people.proto'
      export interface Pagination {
        index: number
        pageSize?: number
      }

      export interface GetDataReq {
        uid: string
        pagination?: Pagination
      }

      export enum Status {
        on_sale = 1,
        discontinued = 2,
      }

      export interface Book {
        bookId: number
        bookName: string
        price: number
        isFavorite?: boolean
        author: People
        status: Status
      }

      export interface Data {
        books?: Book[]
      }

      export interface GetDataRes {
        code: number
        message: string
        data?: Data
      }

    `)
    expect(fileContent[1]).deep.eq(dedent`
      // ./people.proto

      export interface People {
        userId: number
        name?: string
      }
      
    `)
  })
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    projectInfo.setProjectRoot('./src')
    const files = await pbLoader.loadByPath('example.proto')
    const messageGenerator = container.get(MessageGenerator)
    messageGenerator.generateMessageCode(files)
    const filesManager = container.get(FilesManager)
    const fileContent = filesManager.listAllFile().map((file) => file.toString())
    expect(fileContent).lengthOf(2)
  })
})
