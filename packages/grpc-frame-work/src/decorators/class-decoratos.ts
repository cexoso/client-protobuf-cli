import "reflect-metadata";
import { decorate, injectable } from "inversify";

const classDescription = "builtin/decorator/class";
type ScopeType = "Request" | "App";

type Description =
  | {
      type: "Controller";
      serviceName: string;
    }
  | {
      type: "Service";
      scope: ScopeType;
    };

// 是否有必要
export const Controller = (serviceName: string) => (target: Function) => {
  decorate(injectable(), target);
  Reflect.defineMetadata(
    classDescription,
    { type: "Controller", serviceName } as Description,
    target,
  );
};

// 默认服务总是请求级，但是也保留用户希望注册应用级的服务
export const Service =
  (scope: ScopeType = "Request") =>
  (target: Function) => {
    decorate(injectable(), target);
    Reflect.defineMetadata(
      classDescription,
      { type: "Service", scope } as Description,
      target,
    );
  };

export const getClassDescription = (target: Function) => {
  const description = Reflect.getOwnMetadata(
    classDescription,
    target,
  ) as Description;
  return description;
};
