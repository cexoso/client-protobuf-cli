// 用于装饰方法的装饰器
import "reflect-metadata";

type BypassMethod = (...o: any) => Promise<{
  code: number;
  message: string;
  data: any;
}>;

export function template() {
  return function (
    _target: any,
    _propertyName: string,
    descriptor: TypedPropertyDescriptor<BypassMethod>,
  ) {
    const originalFn = descriptor.value!;
    descriptor.value = function () {
      return originalFn.apply(this);
    };
    return descriptor;
  };
}
