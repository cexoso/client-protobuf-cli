# @protobuf-es/core

## 0.0.13

### Patch Changes

- 31d820a: support sideEffect

## 0.0.12

### Patch Changes

- 0661976: support sideEffect

## 0.0.11

### Patch Changes

- c455db4: add TagHandler type export

## 0.0.10

### Patch Changes

- c711da3: 支持打包到 ESM 和 CommonJS 都支持的形式

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

- 修复 map 的编解码问题，以及脚架添加对 map 编解码的支持
- 202a29e: 将 map 相关的方法导出

## 0.0.6

### Patch Changes

- export wrapEncode wrapDecode

## 0.0.5

### Patch Changes

- b332f5c: 提供 wrapEncode wrapDecode 帮助函数

## 0.0.4

### Patch Changes

- 修复消息过长时编码错误问题

## 0.0.3

### Patch Changes

- 修复 tag 大于15时写入值错误的问题

## 0.0.2

### Patch Changes

- 7647fb1: core 支持 byte 编码
  cli 支持过滤 type 和 proto 生成制品
