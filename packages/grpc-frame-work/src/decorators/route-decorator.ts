// 用于装饰方法的装饰器
import "reflect-metadata";

const routerDecorator = "builtin/decorator/router";

export type Method = "GET" | "POST";

type Description =
  // 表示路由
  { method: Method; path: string[] };

const route =
  (method: Method, path?: string | string[]) =>
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
      method,
      path: typeof routePath === "string" ? [routePath] : routePath,
    };

    Reflect.defineMetadata(routerDecorator, descriptions, target);
    return descriptor;
  };

export const GET = (path?: string | string[]) => route("GET", path);
export const POST = (path?: string | string[]) => route("POST", path);
