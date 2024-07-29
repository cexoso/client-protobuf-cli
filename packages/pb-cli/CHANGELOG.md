# @protobuf-es/cli

## 0.0.25

### Patch Changes

- ce7a8fc: 生成到 messages 目录
- dc73e42: 修正类型生成，应该是返回 Promise 而非直接返回值
- 77e2589: fix typo

## 0.0.24

### Patch Changes

- 70e05af: update main

## 0.0.23

### Patch Changes

- 05d0c3c: 支持 grpc framework 的生成逻辑
- 8754568: add grpc server framework code generate plugin

## 0.0.22

### Patch Changes

- 7ab2056: 生成器现在会标 decode 的类型，以减少编译类型报错的问题

## 0.0.21

### Patch Changes

- 2cd1ce9: 修复循环嵌套导致的依赖未定义变量的问题

## 0.0.20

### Patch Changes

- a32858e: 支持多实例

## 0.0.19

### Patch Changes

- c711da3: 支持打包到 ESM 和 CommonJS 都支持的形式

## 0.0.18

### Patch Changes

- 395810c: add getAllService method

## 0.0.17

### Patch Changes

- a6ffd7a: 修复了 pb load 加载 预设 Protobufs 失败的问题

## 0.0.16

### Patch Changes

- 950108c: 修复加载 google proto 失败问题

## 0.0.15

### Patch Changes

- c2d88c4: 重构了生成逻辑，修复了嵌套重名问题

## 0.0.14

### Patch Changes

- 383cf6a: 解决嵌套消息重名的问题

## 0.0.13

### Patch Changes

- f5535d1: 解决生成的 map 没有添加依赖的问题

## 0.0.12

### Patch Changes

- 0bd596a: 为了测试，返回所有的文件

## 0.0.11

### Patch Changes

- 添加 prettier 为依赖，修复在某些情况下 prettier/sync 的包不对的问题

## 0.0.10

### Patch Changes

- fad350b: 导出内部成员，提供获取服务方法

## 0.0.9

### Patch Changes

- 99122b4: 替换成 gulp 打包

## 0.0.8

### Patch Changes

- 929deff: pb-cli 递归创建输出目录
- 切换为 tsup 打包, 只支持 cjs 格式，mjs 格式坑巨多
  接入严格的 ts 检查

## 0.0.7

### Patch Changes

- 完成了生成请求类
- fad9476: 应该使用 dedent 而非 ts dedent

## 0.0.6

### Patch Changes

- 修复 map 的编解码问题，以及脚架添加对 map 编解码的支持
- Updated dependencies
- Updated dependencies [202a29e]
  - @protobuf-es/core@0.0.7

## 0.0.5

### Patch Changes

- 修复 tag 大于15时写入值错误的问题
- Updated dependencies
  - @protobuf-es/core@0.0.3

## 0.0.4

### Patch Changes

- 添加类型支持

## 0.0.3

### Patch Changes

- e316be9: 添加 api 调用方式

## 0.0.2

### Patch Changes

- 7647fb1: core 支持 byte 编码
  cli 支持过滤 type 和 proto 生成制品
- Updated dependencies [7647fb1]
  - @protobuf-es/core@0.0.2
