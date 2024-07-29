import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { stub } from "sinon";
import { Middleware, applyMiddleware } from "./middleware";

describe("middlware", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it("can apply", async () => {
    const middlewares: Middleware[] = [
      async (ctx: any, _next) => {
        ctx.a = 1;
        return;
      },
      (ctx: any) => {
        ctx.a = 2; // 不会执行到
      },
    ];
    const ctx = {};
    const next = stub();
    await applyMiddleware(middlewares, ctx as any, next);
    expect(next.called).eq(false);
    expect(ctx).has.property("a", 1);
  });
  it("可以通过 next 将执行权传递给下一个", async () => {
    const middlewares: Middleware[] = [
      async (_ctx: any, next) => {
        await next();
      },
      (ctx: any, next) => {
        ctx.a = 1;
        next();
      },
    ];
    const ctx = {};
    const next = stub();
    await applyMiddleware(middlewares, ctx as any, next);
    expect(next.called).eq(true, "最后一个函数的 next 就是 nextStub");
    expect(ctx).has.property("a", 1);
  });
  it("执行顺序", async () => {
    const order: number[] = [];
    const middlewares: Middleware[] = [
      async (_ctx: any, next) => {
        order.push(1);
        await next();
        order.push(3);
      },
      (_ctx: any) => {
        order.push(2);
      },
    ];
    const ctx = {};
    const next = stub();
    await applyMiddleware(middlewares, ctx as any, next);
    expect(order).deep.eq([1, 2, 3]);
  });

  it("空中间件执行", async () => {
    const order: string[] = [];
    const middlewares: Middleware[] = [];
    const ctx = {};
    const next = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      order.push("next push");
    };
    applyMiddleware(middlewares, ctx as any, next).then(() => {
      order.push("after applyMiddleware");
    });
    await vi.runAllTimersAsync();
    expect(order).deep.eq(["next push", "after applyMiddleware"]);
  });
});
