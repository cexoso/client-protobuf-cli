import { Controller, GrpcMethod, CustomerError, inject } from '@protobuf-es/grpc-frame-work'
import { GreeterInterface } from './greeter-interface'
import { HelloRequest, HelloReply, GetCurrentUserReq, User } from '../../messages/helloworld'
import { GreeterService } from '../../grpc-service-agent/helloworld/greeter'
@Controller('helloworld.Greeter')
export class Greeter implements GreeterInterface {
  constructor(@inject(GreeterService) private greeterService: GreeterService) {}
  @GrpcMethod('SayHello')
  public async sayHello(input: HelloRequest): Promise<HelloReply> {
    const length = input.name?.length ?? 0
    if (length > 10) {
      throw new CustomerError('name length must be less than 11', -1)
    }
    const body = await this.greeterService.getCurrentUser({})
    return {
      message: `hello ${input.name}, I am ${body.name}`,
    }
  }
  @GrpcMethod('GetCurrentUser')
  public async getCurrentUser(_input: GetCurrentUserReq): Promise<User> {
    return {
      name: 'jie',
    }
  }
}
