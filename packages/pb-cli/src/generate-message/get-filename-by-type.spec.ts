import { describe, expect, it } from 'vitest'
import { loadSync } from 'protobufjs'
import { join } from 'path'
import { getFilenameByType } from '../generate-message/get-filename-by-type'
import { createContainer } from '../container'
import { PBLoader } from '../pb-loader/pb-loader'
import { ProjectInfo } from '../project'

const testProtos = join(__dirname, '../../test-protos')
const people = loadSync(join(__dirname, '../../test-protos/people.proto'))
const root = join(__dirname, '../../test-protos')

describe('get-filename-by-type', async () => {
  it('在没有 package 时，使用 filename', () => {
    const peopleType = people.lookupType('People')
    expect(getFilenameByType(peopleType)).eq(join(testProtos, 'people.proto'))
  })

  it('使用 package', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    const files = await pbLoader.loadByPath('srpc.proto')
    const item = [...files].find(([name]) => {
      return name.match(/srpc.proto/)
    })
    const srpc = item![1]
    const fileDescriptorProto = srpc.lookupType('FileDescriptorProto')
    expect(getFilenameByType(fileDescriptorProto)).eq('google/protobuf/descriptor.proto')
  })

  it('奇怪的 package，我还没想好', async () => {
    const container = createContainer()
    const pbLoader = container.get(PBLoader)
    const projectInfo = container.get(ProjectInfo)
    projectInfo.setPbRootPath(root)
    const files = await pbLoader.loadByPath('web.proto')
    const item = [...files].find(([name]) => {
      return name.match(/web.proto/)
    })
    const srpc = item![1]
    const x = srpc.lookupType('google.protobuf.ServiceOptions')
    expect(getFilenameByType(x.fields['.web.sortType']!)).eq('web.proto')
  })
})
