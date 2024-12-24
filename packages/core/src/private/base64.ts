// 该代码摘抄自 @protobufjs/base64 A minimal base64 implementation for number arrays.
// 我还没时间去思考是否可以用更现代的方式来解决 base64 和 uint8Array 之间的转换问题
// 所以先让代码能跑起来
/**
 * Calculates the byte length of a base64 encoded string.
 * @param {string} string Base64 encoded string
 * @returns {number} Byte length
 */
export const length = (string: string): number => {
  var p = string.length
  if (!p) return 0
  var n = 0
  while (--p % 4 > 1 && string.charAt(p) === '=') ++n
  return Math.ceil(string.length * 3) / 4 - n
}

// Base64 encoding table
const b64 = new Array(64)

// Base64 decoding table
const s64 = new Array(123)

// 65..90, 97..122, 48..57, 43, 47
for (let i = 0; i < 64; )
  s64[(b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : (i - 59) | 43)] = i++

/**
 * Encodes a buffer to a base64 encoded string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} Base64 encoded string
 */
export const encode = (buffer: Uint8Array, start: number, end: number): string => {
  let parts: any = null
  let chunk = []
  let i = 0, // output index
    j = 0 // goto index
  let t: any // temporary
  while (start < end) {
    var b = buffer[start++]!
    switch (j) {
      case 0:
        chunk[i++] = b64[b >> 2]
        t = (b & 3) << 4
        j = 1
        break
      case 1:
        chunk[i++] = b64[t | (b >> 4)]
        t = (b & 15) << 2
        j = 2
        break
      case 2:
        chunk[i++] = b64[t | (b >> 6)]
        chunk[i++] = b64[b & 63]
        j = 0
        break
    }
    if (i > 8191) {
      ;(parts || (parts = [])).push(String.fromCharCode.apply(String, chunk))
      i = 0
    }
  }
  if (j) {
    chunk[i++] = b64[t]
    chunk[i++] = 61
    if (j === 1) chunk[i++] = 61
  }
  if (parts) {
    if (i) parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)))
    return parts.join('')
  }
  return String.fromCharCode.apply(String, chunk.slice(0, i))
}

const invalidEncoding = 'invalid encoding'

/**
 * Decodes a base64 encoded string to a buffer.
 * @param {string} string Source string
 * @param {Uint8Array} buffer Destination buffer
 * @param {number} offset Destination offset
 * @returns {number} Number of bytes written
 * @throws {Error} If encoding is invalid
 */
export const decode = (string: string, buffer: Uint8Array, offset: number): number => {
  let start = offset
  let j = 0 // goto index
  let t: any // temporary
  for (var i = 0; i < string.length; ) {
    var c = string.charCodeAt(i++)
    if (c === 61 && j > 1) break
    if ((c = s64[c]) === undefined) throw Error(invalidEncoding)
    switch (j) {
      case 0:
        t = c
        j = 1
        break
      case 1:
        buffer[offset++] = (t << 2) | ((c & 48) >> 4)
        t = c
        j = 2
        break
      case 2:
        buffer[offset++] = ((t & 15) << 4) | ((c & 60) >> 2)
        t = c
        j = 3
        break
      case 3:
        buffer[offset++] = ((t & 3) << 6) | c
        j = 0
        break
    }
  }
  if (j === 1) throw Error(invalidEncoding)
  return offset - start
}

/**
 * Tests if the specified string appears to be base64 encoded.
 * @param {string} string String to test
 * @returns {boolean} `true` if probably base64 encoded, otherwise false
 */
export const test = (string: string): boolean => {
  return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string)
}
