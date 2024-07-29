#! /bin/bash
# 调用示例如下：
# bash bin/deploy-docker.sh x.cr.aliyuncs.com/group/name
# tag 会按照当前的日期生成

set -e
cd `dirname $0` # 确保 CWD 是当前目录
cd ../ # 找到根目录

image_name=$1
version=`date "+%Y%m%d%H%M%S"`
target=$image_name:$version
echo the img tag is $target
docker buildx build --platform=linux/amd64 --tag $target .
docker push $target
