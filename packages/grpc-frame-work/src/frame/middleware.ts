export interface Context {
  url: string;
}
export type Next = () => Promise<any>;
// Middleware 还没有想好要不要与框架解耦，如果不解耦意味着开发环境无法在浏览器中使用
// 如果解耦，Context 的内容要定成什么样还没想, 先反转到上层决定
export type Middleware = (ctx: Context, next: Next) => any;

export const applyMiddleware = async (
  middlewares: Middleware[],
  ctx: Context,
  next: Next,
) => {
  const size = middlewares.length;
  const doNext = (index: number) => async () => {
    if (index === size) {
      await next();
      return;
    }
    const middleware = middlewares[index]!;
    await middleware(ctx, doNext(index + 1));
    return;
  };
  await doNext(0)();
};
