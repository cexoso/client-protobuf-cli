type ServiceName = string;
type MethodName = string;
export type getApply = <T = unknown>(
  serviceName: ServiceName,
  methodName: MethodName,
) =>
  | {
      apply: (input: Uint8Array) => T;
      requestDecoder: (input: Uint8Array) => T;
      responseEncoder: (input: T) => Uint8Array;
    }
  | undefined;

export function getHandlerMetadata(
  path: string | undefined,
  getApply: getApply,
) {
  if (path === undefined) {
    return undefined;
  }
  const paths = path.split("/");
  const serviceName = paths[1]!;
  const methodName = paths[2]!;

  const handleData = getApply(serviceName, methodName);
  return handleData;
}
