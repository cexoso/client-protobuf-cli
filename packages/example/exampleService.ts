import {
  toUint8Array,
  createWriter,
  arrayBufferToReader,
  readInt32,
  readString,
  readFloat,
  readBool,
  defineMessage,
  readEnum,
  encodeInt64ToBuffer,
  encodeUint32ToBuffer,
  EncoderWithoutTag,
  encodeMessageToBuffer,
} from '@protobuf-es/core'
const serviceId = 0xb601
export interface Pagination {
  index: number
  pageSize?: number
}

export interface GetDataReq {
  uid: string
  pagination?: Pagination
}

export interface People {
  userId: number
  name?: string
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

const decodePeople = defineMessage<People>(
  new Map([
    [1, { type: 'scalar', decode: readInt32, name: 'userId' }],
    [2, { type: 'scalar', decode: readString, name: 'name' }],
  ])
)

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

const decodeData = defineMessage<Data>(
  new Map([[1, { type: 'message', isRepeat: true, decode: decodeBook, name: 'books' }]])
)

export const decodeGetDataRes = defineMessage<GetDataRes>(
  new Map([
    [1, { type: 'scalar', decode: readInt32, name: 'code' }],
    [2, { type: 'scalar', decode: readString, name: 'message' }],
    [3, { type: 'message', decode: decodeData, name: 'data' }],
  ])
)

export const getData = (getDataReq: GetDataReq) => {
  const methodId = 0x1
  const writer = createWriter()
  encodeGetDataReq({
    writer,
    value: getDataReq,
  })
  const buffer = toUint8Array(writer)
  return fetch('/api/example_service', {
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
