import { createReader } from '../src/reader'
export const hexstringToReader = (hexStr: string) => {
  return createReader(
    new Uint8Array(Buffer.from(chunk2(hexStr).map((byteStr) => Number.parseInt(byteStr, 16))))
  )
}

const chunk2 = (hexStr: string) => {
  let pos = 0
  const res: string[] = []
  while (hexStr.length > pos + 2) {
    res.push(hexStr.slice(pos, pos + 2))
    pos += 2
  }
  res.push(hexStr.slice(pos, hexStr.length))
  return res
}

export const Uint8ArrayToHexString = (uint8Array: Uint8Array) =>
  Buffer.from(uint8Array).toString('hex')
