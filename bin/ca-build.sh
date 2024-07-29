#! /bin/bash
set -e
cd `dirname $0` # 确保 CWD 是当前目录

# ###当你需要使用同一个 root 证书多次签发 server 证书时，可以将下列的代码注释掉 Start HERE
openssl genrsa --out root.key 2048
openssl req --new -key root.key -out root.csr -subj "/C=CN/ST=ZJ/L=HZ/O=xiongjie.org/OU=xiongjie.org/CN=xiongjie"

# extfile ca.ext 中声明了当前生成的证书可以用于签发新的证书，这个模式对于代理服务器很有用，像本地代理服务器 whistle 可以签发
# 这个类型的证书，当需要代理新域名请求时，whilstle 可以签发对应的证书来实现监听 https 的效果。
openssl x509 -req -in root.csr -signkey root.key -out root.crt -extfile ca.ext -sha256 -days 3650
# ###Start HERE

openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr -subj "/C=CN/ST=ZJ/L=HZ/O=xiongjie.org/OU=xiongjie.org/CN=xiongjie"
openssl x509 -req -in server.csr -CA root.crt -CAkey root.key -CAcreateserial -out server.crt -days 365 -sha256

rm root.csr server.csr 2> /dev/null

echo "自签名证书已生成："
echo "Root 私钥: root.key"
echo "Root 证书: root.crt"
echo "server 私钥: server.key"
echo "server 证书: server.crt"

echo "root.srl 文件用于多次签发时记录序列号使用，如果你生成的 root 证书给 whistle 使用，可以忽略该文件"

echo "你可以直接使用 root，也可以使用 server，root 是为了代理服务器需求生成的"
