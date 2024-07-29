import { HelloRequest, HelloReply, GetCurrentUserReq, User } from '../../messages/helloworld'
/**
 ****************************************
 * 命令行生成的文件，不要直接修改该文件 *
 ****************************************
 */
export interface GreeterInterface {
  sayHello: (input: HelloRequest) => Promise<HelloReply>
  getCurrentUser: (input: GetCurrentUserReq) => Promise<User>
}
