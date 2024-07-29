# cli

## 0.0.23

### Patch Changes

- d85b217: 支持生成 types，虽然没什么用

## 0.0.22

### Patch Changes

- 843e117: 修复包不生成 dts 的问题

## 0.0.21

### Patch Changes

- 3b97606: 修复仅打包 ESM 时 module 生成错误的问题
- 072663e: fix build

## 0.0.20

### Patch Changes

- 464ad47: esm use node16 resolution

## 0.0.19

### Patch Changes

- 9791f18: 应该有声明才转换，不需要默认值

## 0.0.18

### Patch Changes

- 7f68514: 修复嗅探方式，之前的代码依赖编译时机

## 0.0.17

### Patch Changes

- 2f8c274: 修复 exports 生成逻辑

## 0.0.16

### Patch Changes

- d82951f: 支持编译时自动嗅探到目标文件

## 0.0.15

### Patch Changes

- a8bca46: 修复当不包含 d.ts 文件时，会出现编译类型缺失报错的问题

## 0.0.14

### Patch Changes

- b9064cc: 支持 pnpm 内使用环境变量构建，deploy 后能依赖到构建后的目录

## 0.0.13

### Patch Changes

- 810110a: declare babel/types dependency
- b541ed2: 支持重写 exports

## 0.0.12

### Patch Changes

- 31d820a: support sideEffect

## 0.0.11

### Patch Changes

- 0661976: support sideEffect

## 0.0.10

### Patch Changes

- e1c444a: 修复 tsc 在处理 commonjs 时的错误问题

## 0.0.9

### Patch Changes

- c4e7533: 替换 del 的实现，因为 del 是 ESM 的

## 0.0.8

### Patch Changes

- 73b2848: 修复了 .. 路径没有检查正确的问题

## 0.0.7

### Patch Changes

- 2eafbc1: 导出一个转换 js 内容的函数

## 0.0.6

### Patch Changes

- 7c0f520: 切换成 ts 项目，并且支持 bin 的生成

## 0.0.5

### Patch Changes

- 8c63ec3: 修复一个路径判断错误问题

## 0.0.4

### Patch Changes

- c711da3: 支持打包到 ESM 和 CommonJS 都支持的形式

## 0.0.3

### Patch Changes

- 0ac4ce2: 修复构建会忽略 proto 文件的问题

## 0.0.2

### Patch Changes

- 54de9fb: ts-pkg-build 首发

## 0.0.7

### Patch Changes

- 99122b4: 替换成 gulp 打包

## 0.0.6

### Patch Changes

- 切换为 tsup 打包, 只支持 cjs 格式，mjs 格式坑巨多
  接入严格的 ts 检查
