import { encode } from '@protobuf-es/grpc-utils';
export function serializeResponse<T = any>(
  input: T,
  opts: {
    responseEncoder: (input: T) => Uint8Array;
    isJSON: boolean;
    isRPC: boolean;
  }
) {
  function createRPCRes() {
    return Buffer.from(encode(opts.responseEncoder(input)));
  }
  function createJSONRes() {
    return Buffer.from(JSON.stringify(input), 'utf-8');
  }
  const responsMessage = opts.isJSON ? createJSONRes() : createRPCRes();
  return responsMessage;
}
