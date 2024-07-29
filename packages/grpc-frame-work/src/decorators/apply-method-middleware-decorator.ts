import { Container } from "inversify";
import { Next } from "../frame/middleware";

// export type FaasMiddlewareNext = () => Promise<void>;
// export type FaasMiddlewareContext = any;
// export interface FaasMiddleware {
//   // 这里的 ctx 可能要与 koa 的 ctx 耦合
//   use: (_ctx: FaasMiddlewareContext, next: FaasMiddlewareNext) => any;
// }

export const methodMiddlewareDecorator = "builtin/decorator/method-middleware";

export type FunctionMiddleware = (
  ctx: any,
  next: any,
  requestContainer: Container,
) => any;

// 遇到了一个传参的问题，我可能没有想好中间件是否应该使用 class 的模式
// 还是先保持最简单的 function 函数吧
// type FaasMiddlewareConstruct = new (..._: any[]) => FaasMiddleware;

type Middleware = FunctionMiddleware;

type Description = {
  middlewares: Middleware[];
};

export const toDecorator = <i>(fn: (...args: i[]) => FunctionMiddleware) => {
  return (...args: i[]) => apply(fn(...args));
};

export const apply =
  (middleware: Middleware) =>
  (
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    const descriptions: Description = Reflect.getOwnMetadata(
      methodMiddlewareDecorator,
      target, // 这个 target 是装饰类的 prototype
      propertyKey,
    ) || {
      middlewares: [],
    };

    descriptions.middlewares.unshift(middleware);
    Reflect.defineMetadata(
      methodMiddlewareDecorator,
      descriptions,
      target,
      propertyKey,
    );
    return descriptor;
  };

const getMiddlewareDescription = (
  instance: Function,
  propertyKey: string | symbol,
): Description => {
  // method 是挂在 target.prototype 上的，这并不是一个 javascript 认可的标准，只是 ts 的实现
  return (
    Reflect.getOwnMetadata(
      methodMiddlewareDecorator,
      instance.prototype,
      propertyKey,
    ) ?? {
      middlewares: [],
    }
  );
};

/**
 * 用来组合或者具名一些 decorator，比如
 * const RequireLogin = apply(LogginMiddleware)
 */
export const composeMethodDecorator = (
  maybeArray: Middleware[] | Middleware,
) => {
  const middlewares = Array.isArray(maybeArray) ? maybeArray : [maybeArray];
  function decorator(
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) {
    for (let i = middlewares.length; i > 0; i--) {
      const middleware = middlewares[i - 1]!;
      apply(middleware)(target, propertyKey, descriptor);
    }
  }
  return decorator;
};

export const runAllMehtodMiddlewares = async (
  opts: {
    requestContainer: Container;
    target: Function;
    propertyKey: string | symbol;
  },
  ctx: any,
  next: Next,
) => {
  const { target, propertyKey } = opts;
  const { middlewares } = getMiddlewareDescription(target, propertyKey);

  const size = middlewares.length;
  const doNext = (index: number) => async () => {
    if (index === size) {
      await next();
      return;
    }
    const middleware = middlewares[index]!;
    await middleware(ctx, doNext(index + 1), opts.requestContainer);
    return;
  };
  await doNext(0)();
};
