import { describe, it, expect, vi, afterEach } from "vitest";
import { stub } from "sinon";
import {
  apply,
  composeMethodDecorator,
  FunctionMiddleware,
} from "./apply-method-middleware-decorator";
import { Controller, Service } from "./class-decoratos";
import { grpcApp } from "../frame/module/grpc-module";
import { MetadataManager } from "../metadata-manager/metadata-manager";

const TestMiddleware2: FunctionMiddleware = async (_ctx, next) => {
  _ctx.order = _ctx.order || [];
  _ctx.order.push("TestMiddleware2");
  _ctx.a = _ctx.a || 0;
  _ctx.a += 1;
  await next();
};

const TestMiddleware: FunctionMiddleware = async (_ctx, next) => {
  _ctx.order = _ctx.order || [];
  _ctx.order.push("TestMiddleware");
  _ctx.a = _ctx.a || 0;
  _ctx.a += 1;
  await next();
};

@Controller("")
class FooController {
  @apply(TestMiddleware)
  @apply(TestMiddleware2)
  indexMethod() {}

  async render() {
    return "x";
  }
}

/**
 * 这约等于
 * @apply(TestMiddleware)
 * @apply(TestMiddleware2)
 */
const composedDecorator = composeMethodDecorator([
  TestMiddleware,
  TestMiddleware2,
]);

@Controller("")
class BarController {
  @composedDecorator
  indexMethod() {}
}

describe("middlware", () => {
  afterEach(() => {
    vi.useRealTimers();
  });
  it("can apply", async () => {
    const ctx = {};
    const next = stub();
    const appDescription = grpcApp({
      injectables: [FooController],
      metadataManager: new MetadataManager(),
    });
    const app = appDescription.createApp();
    const request = app.createRequestContainer();
    app.applyMethodMiddllware(
      {
        requestContainer: request,
        target: FooController,
        propertyKey: "indexMethod",
      },
      ctx,
      next,
    );
    const doubleCtx = ctx as any;

    expect(doubleCtx.a).eq(2);
    expect(doubleCtx.order).deep.eq(["TestMiddleware", "TestMiddleware2"]);
  });
  it("空中件间效果", async () => {
    vi.useFakeTimers();
    const ctx = {};
    const order: string[] = [];
    const next = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      order.push("next push");
    };
    const appDescription = grpcApp({
      injectables: [FooController],
      metadataManager: new MetadataManager(),
    });
    const app = appDescription.createApp();
    const request = app.createRequestContainer();
    app
      .applyMethodMiddllware(
        {
          requestContainer: request,
          target: FooController,
          propertyKey: "indexMethod",
        },
        ctx,
        next,
      )
      .then(() => {
        order.push("after applyMethodMiddllware");
      });
    await vi.runAllTimersAsync();
    expect(order).deep.eq(["next push", "after applyMethodMiddllware"]);
  });
  it("测试 compose", async () => {
    const ctx = {};
    const next = stub();
    const appDescription = grpcApp({
      injectables: [BarController],
      metadataManager: new MetadataManager(),
    });
    const app = appDescription.createApp();
    const request = app.createRequestContainer();

    app.applyMethodMiddllware(
      {
        requestContainer: request,
        target: BarController,
        propertyKey: "indexMethod",
      },
      ctx,
      next,
    );
    const doubleCtx = ctx as any;

    expect(doubleCtx.a).eq(2);
    expect(doubleCtx.order).deep.eq(["TestMiddleware", "TestMiddleware2"]);
    expect(next.called).eq(true, "next 被调用意味着中间件释放了控制权");
  });

  it("中间件依赖 service 的用例", async () => {
    const ctx = {};
    const next = stub();

    @Service("App")
    class AppService {
      getName() {
        return "app";
      }
    }

    @Service("Request")
    class RequestService {
      getName() {
        return "request";
      }
    }

    const MiddleA: FunctionMiddleware = async (_ctx, _next, container) => {
      const appService = container.get<AppService>(AppService);
      const requestService = container.get<RequestService>(RequestService);
      _ctx.app = appService.getName();
      _ctx.request = requestService.getName();
      // await next()
    };

    @Controller("")
    class InnerController {
      @apply(MiddleA)
      indexMethod() {}
    }
    const appDescription = grpcApp({
      injectables: [InnerController, AppService, RequestService],
      metadataManager: new MetadataManager(),
    });
    const app = appDescription.createApp();
    const request = app.createRequestContainer();

    app.applyMethodMiddllware(
      {
        requestContainer: request,
        target: InnerController,
        propertyKey: "indexMethod",
      },
      ctx,
      next,
    );
    const doubleCtx = ctx as any;

    expect(doubleCtx.app).eq("app");
    expect(doubleCtx.request).eq("request");
    expect(next.called).eq(false, "这个用例里，next 没有被调用");
  });
});
