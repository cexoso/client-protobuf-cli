import { Buffer } from "buffer";
import { decode } from "@protobuf-es/grpc-utils";
import { ServerHttp2Stream } from "http2";

function getBody(stream: ServerHttp2Stream) {
  return new Promise<Buffer>((resolve, reject) => {
    let data: Buffer[] = [];
    stream.on("data", (buffer: Buffer) => {
      data.push(buffer);
    });
    stream.on("end", () => {
      resolve(Buffer.concat(data));
    });
    stream.on("error", (error) => {
      reject(error);
    });
  });
}

export async function getReqParams<T>(
  stream: ServerHttp2Stream,
  opts: {
    isJSON: boolean;
    isRPC: boolean;
    requestDecoder: (input: Uint8Array) => T;
  },
) {
  const body = await getBody(stream);
  if (opts.isJSON) {
    return JSON.parse(body.toString());
  }
  // 到这里只有 RPC 请求
  return opts.requestDecoder(decode(new Uint8Array(body)));
}
