const routerDecorator = "builtin/decorator/router";

type Description = { method: string[] };

const route =
  (path?: string | string[]) =>
  (
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    const routePath =
      path !== undefined && path !== ""
        ? path
        : // 当不传递 path 时，使用方法名做 path，这个决策可能会存在问题
          // 这是一个隐式的约定，如果没有上层约束，研发修改名字时并不一定
          // 会知道，这是一个不向前兼容的修改
          String(propertyKey);

    const descriptions: Record<string, Description> =
      Reflect.getOwnMetadata(routerDecorator, target) || {};

    descriptions[String(propertyKey)] = {
      method: typeof routePath === "string" ? [routePath] : routePath,
    };

    Reflect.defineMetadata(routerDecorator, descriptions, target);
    return descriptor;
  };

export const GrpcMethod = (path?: string | string[]) => route(path);

export const getGrpcDescriptions = (target: any) => {
  // 参数装饰器是挂在 class 的原型上的，如果传进来的是 class，则自动往上找一下
  target = typeof target === "function" ? target.prototype : target;
  const result: Record<string, Description> | undefined =
    Reflect.getOwnMetadata(routerDecorator, target);
  // 没有装饰就是 undefined
  return result;
};

export const getRouterDescription = (target: any, method: string) => {
  const result = getGrpcDescriptions(target);
  return result?.[method];
};
