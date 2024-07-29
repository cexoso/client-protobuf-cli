# protobufs

这是一个关于从 protobuf 开始建设的仓库。

# 1. 一开始为了应用在浏览器上的 rpc 请求

一开始，我的目的是希望前端也能进行 rpc 请求（这里的 rpc 指的是经过 protobuf 编解码的 rpc 请求，不是 json rpc 这类）。与市面上现在方案不同的是，我为了包体积尽可能的小，从底层编解码开始实现，成果是 rpc 生成制品库 treeshaking 友好，生产环境只会打包真正用到的接口。经测试，即使前端使用 23 个接口，打包的体积在 gzip 后也仅为 4.36K。

## 我实现了什么?

到这一步，我实现了 esmodule 友好的 protobuf 编解码，目录在 packages/core 下。以及我实现了一个用于生成制品库的生成器，目录在 packages/pb-cli。
packages/pb-cli 的作用在于将 protobuf 文件中的 message，生成对应的编码函数、解码函数以及对应的 typescript 类型。另一个特点是 packages/pb-cli 支持插件系统，允许研发自定义插件来生成更贴近框架的代码，这类代码只需要组合 message 的编解码函数和类型即可。

# 2. 接着，我实现了 Nodejs 版本的 grpc 框架

后来，我在学习 grpc，以及根据我在工作上遇到的问题，在 grpc 设计上求解。我想，我从零实现了 protobuf 的编解码，为什么不能再实现一个 grpc 的框架呢，于是我开发了 nodejs 版本的 grpc 框架。

根据上文我提到的 pb-cli，我基于插件实现了应用于 grpc 代码生成的逻辑，生成的层包括接入的 stub 和 service-agent，前者用于接收一个 grpc 调用并将对应的参数转换成函数的调用，后者用于在代码中将一次函数调用转换成对应 grpc 调用的协议。对于业务开发者而言，只需要通过 protos 文件生成基础结构后，在生成的函数中填写对应的代码即可，无须关注 grpc 协议细节。

这个框架风格上很像 nestjs，不过与其说我参考了 nestjs 的，我更认为自己是从 angular 处借鉴的更多。在框架特性上，我关注质量和开发比较多，所以框架的设计使用 DIP 方案做成可测试的，提供 TDD 开发环境。

## 到这一步我实现了什么?

我写了一个 example，存放于 examples 目录下，其中包含 server 和 client 以及另一个 proto-manager 目录。

- proto-manager 的作用是管理具体的 protos 文件，以及一个用于生成对应代码的脚本。
- client 和 server 分别对应微服务上的主调和被调。

在 server 的基础演示中，分别演示了接收一个 grpc 请求，以及调用一个 grpc 请求（示例中是 server 使用 grpc 自己调用自己）。

另一个设计亮点是，我实现了单端口上同时提供两种接口协议—— JSON 和 rpc+proto，这个框架是天然支持双接口的，即能提供 grpc，也能直接提供 JSON。

其中我还抽象了 server 构架部分，在 grpc-frame-work，http2 传输客户端 http2-client。

# 安装

整仓使用 pnpm workspace 管理，使用 `pnpm i` 安装即可

# 贡献

core 和 pb-cli 均有测试用例，该仓库也使用"测试驱动开发"方式进行开发，只需要在对应的目录下运行 npm test 即可.
