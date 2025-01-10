# client protobuf cli

该仓库的目的在于让前端也能进行 protobuf 编解码，进而发起 RPC 请求。与市面上其它做 protobuf 编解码不同的是，这个库生成的代码体积非常的小，配合 tree shaking，可以做到只打包使用的接口，没使用的接口不会打包到最终的产物内。

经测试，即使前端使用 23 个接口，打包的体积在 gzip 后也仅为 4.36K，这个是目前市面上现有的方案无法做到的。

# 目录结构

- core，实现了 PB 编解码逻辑
- pb-cli，实现代码生成逻辑，pb-cli 会将 proto 生成调用包

# 安装

整仓使用 pnpm workspace 管理，使用 `pnpm i` 安装即可

# 贡献

core 和 pb-cli 均有测试用例，该仓库也使用"测试驱动开发"方式进行开发，只需要在对应的目录下运行 npm test 即可.

