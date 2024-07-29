# 构建阶段，使用 node:latest 作为基础镜像，仅用于构建依赖
FROM node:latest AS build
WORKDIR /build-workspace
COPY . .
RUN npm i pnpm@9 -g
RUN bash bin/deploy.sh

# 运行阶段，使用轻量级的 node 镜像，仅包含运行时所需组件
# 使用 Node.js 22 版本作为基础镜像
FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 复制本地的 release 目录到镜像的 /app 目录
COPY --from=build /build-workspace/release .

# 暴露应用可能使用的端口（根据你的应用需求调整）
EXPOSE 50051

# 设置启动命令
# 注意：你可能需要根据你的项目结构调整这个启动命令
CMD ["node", "index.mjs"]

