import { describe, it, expect, afterEach } from "vitest";
import { createSandbox } from "sinon";
import { grpcApp } from "../src";
import {
  AppService,
  builtinModule,
  MockController,
  RequestService,
} from "./test-utils";

describe("faas module", () => {
  it("create no error", async () => {
    const app = grpcApp({
      injectables: [MockController, RequestService, AppService],
    });

    const appContainer = app.createApp({});
    expect(appContainer.getHandlerClass("mock-controller")).eq(
      MockController,
      "中划线方式命名",
    );
    const request = appContainer.createRequestContainer();
    const mockController = request.get(MockController);
    expect(mockController.getCount()).eq(1);
  });

  it("生命周期", async () => {
    const app = grpcApp({
      injectables: [MockController, RequestService, AppService],
    });

    const appContainer = app.createApp({});
    const request1 = appContainer.createRequestContainer();
    const request2 = appContainer.createRequestContainer();

    expect(request1.get(RequestService)).eq(
      request1.get(RequestService),
      "请求内单实例",
    );

    expect(request1.get(RequestService)).not.eq(
      request2.get(RequestService),
      "请求内单实例",
    );

    expect(request1.get(AppService)).eq(
      request2.get(AppService),
      "应用内单实例",
    );
    expect(app.createApp({}).createRequestContainer().get(AppService)).not.eq(
      request1.get(AppService),
      "不同的应用之间隔离",
    );
  });
});

describe("modules", () => {
  const sandbox = createSandbox();
  afterEach(() => {
    sandbox.restore();
  });
  it("importModules", async () => {
    const module = builtinModule;

    const app = grpcApp({
      importModules: [module],
    });

    const appContainer = app.createApp({});
    const request1 = appContainer.createRequestContainer();
    expect(request1.get("config")).deep.eq({ a: 1 });
    expect(request1.get(RequestService)).eq(request1.get(RequestService));

    const request2 = appContainer.createRequestContainer();
    expect(request2.get(AppService)).eq(request1.get(AppService));
    expect(request2.get(RequestService)).not.eq(request1.get(RequestService));
  });

  it("builtinModule", async () => {
    const module = builtinModule;

    const app = grpcApp({});

    const appContainer = app.createApp({
      importModules: [module],
    });
    const request1 = appContainer.createRequestContainer();
    expect(request1.get("config")).deep.eq({ a: 1 });
    expect(request1.get(RequestService)).eq(request1.get(RequestService));

    const request2 = appContainer.createRequestContainer();
    expect(request2.get(AppService)).eq(request1.get(AppService));
    expect(request2.get(RequestService)).not.eq(request1.get(RequestService));
  });

  it("module 冲突的处理", async () => {
    const logStub = sandbox.stub(console, "log");
    const module = builtinModule;

    const app = grpcApp({
      importModules: [module],
    });

    const appContainer = app.createApp({
      importModules: [module],
    });
    const request1 = appContainer.createRequestContainer();
    expect(request1.get("config")).deep.eq({ a: 1 });
    expect(request1.get(RequestService)).eq(request1.get(RequestService));

    const request2 = appContainer.createRequestContainer();
    expect(request2.get(AppService)).eq(request1.get(AppService));
    expect(request2.get(RequestService)).not.eq(request1.get(RequestService));
    expect(logStub.args).deep.eq([
      ["warning: AppService already bound"],
      ["warning: config already bound"],
      ["warning: RequestService already bound"],
      ["warning: RequestService already bound"],
    ]);
  });

  it("override modules", async () => {
    const module = builtinModule;

    const app = grpcApp({
      importModules: [module],
    });

    const appContainer = app.createApp();
    const request1 = appContainer.createRequestContainer();
    expect(request1.get("config")).deep.eq({ a: 1 });
    const request2 = appContainer.createRequestContainer({
      override: {
        constantsValues: [{ identifier: "config", value: { a: 2 } }],
      },
    });
    expect(request2.get("config")).deep.eq({ a: 2 });
  });
});
