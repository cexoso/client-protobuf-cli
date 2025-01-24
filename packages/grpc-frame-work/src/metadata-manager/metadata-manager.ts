type ServiceName = string;
type MethodName = string;

interface Metadata<T = any> {
  // 类型在这里是不需要的，因为这是一个统一处理逻辑
  requestDecoder: (input: Uint8Array) => T;
  responseEncoder: (input: T) => Uint8Array;
}

export class MetadataManager {
  #serviceMap = new Map<ServiceName, Map<MethodName, Metadata>>();
  public constructor() {}

  public setMetaData(
    serviceName: ServiceName,
    methodName: MethodName,
    metadata: Metadata,
  ) {
    let methodMap = this.#serviceMap.get(serviceName);
    if (methodMap === undefined) {
      methodMap = new Map();
      this.#serviceMap.set(serviceName, methodMap);
    }
    methodMap.set(methodName, metadata);
  }
  public getMetadata<T>(
    serviceName: ServiceName,
    methodName: MethodName,
  ): Metadata<T> | undefined {
    const methodMap = this.#serviceMap.get(serviceName);
    return methodMap?.get(methodName);
  }
}
