import { describe, expect, it } from 'vitest'
import { loadSync } from 'protobufjs'
import { join } from 'path'
import { getFilenameByType } from '../generate-message/get-filename-by-type'

const testProtos = join(__dirname, '../../test-protos')
const people = loadSync(join(__dirname, '../../test-protos/people.proto'))
const srpc = loadSync(join(__dirname, '../../test-protos/srpc.proto'))
const any = loadSync(join(__dirname, '../../test-protos/google/protobuf/any.proto'))
const root = join(__dirname, '../../test-protos')

describe('get-filename-by-type', async () => {
  it('在没有 package 时，使用 filename', () => {
    const peopleType = people.lookupType('People')
    expect(getFilenameByType(peopleType)).eq(join(testProtos, 'people.proto'))
  })
  it('使用 package', () => {
    const fileDescriptor = srpc.lookupType('FileDescriptorProto')
    const anyType = any.lookupType('Any')

    expect(getFilenameByType(fileDescriptor)).eq(join(root, 'google/protobuf/descriptor.proto'))
    expect(getFilenameByType(anyType)).eq('google/protobuf.proto')
  })
})
