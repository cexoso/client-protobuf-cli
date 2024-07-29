#! /bin/bash

# 报错即停止
set -e

cd `dirname $0` # 确保 CWD 是当前目录
cd ../ # 找到根目录

pnpm i

CHANGE_LINK_DIRECTORY=true pnpm run --filter=demo-server... build

rm -rf release
pnpm --filter=demo-server --prod deploy release

echo "已将你的项目构建到 release 目录下"
