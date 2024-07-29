import { Container, interfaces } from "inversify";

/**
 * 这个函数用于返回 module（一组可注入的服务）
 */
export type ModulePredicate = () => Modules;

export interface Modules {
  // 应用容器创建勾子，不建议直接使用，
  onAppContainerCreated?: (appContainer: Container) => void;

  // 请求容器创建勾子，不建议直接使用
  onRequestContainerCreated?: (requestContainer: Container) => void;
  /**
   * controller/service，生命周期已经在 class 上标过了
   */
  injectables?: Function[];
  /**
   * 允许直接注入常量
   */
  constantsValues?: {
    identifier: interfaces.ServiceIdentifier;
    value: any;
  }[];
}

export function createModule(predicate: ModulePredicate) {
  return predicate();
}
