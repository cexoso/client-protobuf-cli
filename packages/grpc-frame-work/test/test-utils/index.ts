import { inject } from "inversify";
import { Controller, Service } from "../../src/decorators";
import { createModule } from "../../src/frame/module/modules";

@Service("Request")
export class RequestService {
  #count = 0;
  getCount() {
    this.#count += 1;
    return this.#count;
  }
}

@Service("App")
export class AppService {}

@Controller()
export class MockController {
  constructor(@inject(RequestService) private requestService: RequestService) {}
  getCount() {
    return this.requestService.getCount();
  }
}

export const builtinModule = createModule(() => {
  return {
    injectables: [AppService, RequestService],
    constantsValues: [
      {
        identifier: "config",
        value: {
          a: 1,
        },
      },
    ],
  };
});
