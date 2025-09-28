## `AS` 
阶段名
```dockerfile
# 阶段 1：构建前端
FROM node:18 AS frontend-builder
WORKDIR /app
COPY frontend/ .
RUN npm install && npm run build

# 阶段 2：构建后端
FROM golang:1.21 AS backend-builder
WORKDIR /app
COPY backend/ .
RUN go build -o server

# 最终阶段
FROM alpine:3.18
COPY --from=frontend-builder /app/dist /var/www/html
COPY --from=backend-builder /app/server /usr/local/bin/
CMD ["server"]
```
## `ARG` 
定义构建时变量
- --build-arg 在构建时传递构建参数
```dockerfile
ARG VERSION=1.0
```
```bash
docker build --build-arg VERSION=2.0 -t myimage .
```
## `FROM` 
设置容器的基础镜像
```dockerfile
# 设置基础镜像，默认最新版本
FROM ubuntu:22.04
```
## `LABEL` 
添加元数据键值对
```dockerfile
LABEL ENV=“DEVELOPMENT”
```
## `RUN` 
在基础镜像中执行指令并创建一个新层
- --mount 在构建时使用缓存或临时文件系统
```dockerfile
RUN apt-get update
RUN apt-get install tomcat
RUN ["apt-get", "update"] // 这种形式不通过 shell 运行，不受环境变量等影响

RUN --mount=type=cache,target=/root/.cache \
	--mount=type=tmpfs,target=/tmp \
	pip install -r requirements.txt
```
## `CMD` 
设置启动时执行的默认命令及其参数
如果在运行容器时未提供其他命令或参数，`CMD` 中指定的命令将被执行。 如果在运行容器时提供了命令或参数，`CMD` 中的内容将被这些命令或参数覆盖。
```dockerfile
CMD ["java", "-jar", "app.jar"]
```
## `EXPOSE` 
设置用于访问容器的端口
- --protocol 指定协议类型
```dockerfile
EXPOSE 8080
EXPOSE 80 443
```
## `MAINTAINER` 
显示创建镜像作者的信息
```dockerfile
MAINTAINER info@ostechnix.com
```
## `ENV` 
设置环境变量的键值对
```dockerfile
ENV DB_NAME=”MySQL”
ENV DB_VERSION=”8.0”
```
## `COPY` 
拷贝本地文件至容器中
- --from 指定阶段名，从其中复制文件
- --chown  用于在复制文件或目录时设置目标文件的所有者和用户组
```dockerfile
COPY /target/devops.jar devops.jar
COPY --chown user:group /target/devops.jar devops.jar
```
## `ADD` 
与拷贝相同，但可以提取本地的 tar 文件或 URL 文件
- --from 指定阶段名，从其中复制文件
- --chown  用于在复制文件或目录时设置目标文件的所有者和用户组
```dockerfile
ADD devops.tar.xz / .
ADD http://example.com/abc.git /usr/local/devops/
```
## `ENTRYPOINT` 
设置启动时执行的固定命令，无论是否提供其他命令或参数
`ENTRYPOINT` 中指定的命令都会被执行。 如果在运行容器时提供了命令或参数，这些内容将作为 `ENTRYPOINT` 指定命令的参数传递。
```dockerfile
ENTRYPOINT ["java", "-jar", "app.jar"]
```
## `VOLUME` 
用来创建指定位置的挂载点
```dockerfile
VOLUME /app/devops
```
## `USER` 
设置运行镜像并使用的用户名称以及用户组
```dockerfile
USER dhruv
USER admin
```
## `WORKDIR` 
设置工作目录。目录不存在，则创建
```dockerfile
WORKDIR /var/lib/
```
## `ONBUILD` 
为镜像添加触发器，当此镜像被作为基础镜像时触发指定指令
```dockerfile
ONBUILD RUN echo "Building on top of this image"
```    
## `STOPSIGNAL` 
定义容器停止时发送的系统调用信号
```
STOPSIGNAL SIGTERM
```
## `HEALTHCHECK` 
检查容器的健康状况，并定义检查失败的动作
```dockerfile
HEALTHCHECK --interval=30s CMD curl -f http://localhost/ || exit 1
```
## `SHELL` 
指定在 `RUN` 指令中使用的默认 shell
```dockerfile
SHELL ["/bin/bash", "-c"]
```
## 示例
```dockerfile
# 基础镜像 
FROM node:14 
# 维护者信息 
LABEL maintainer="yourname@example.com" 
MAINTAINER Senthilkumar Palani "info@ostechnix.com"
# 设置环境变量
ENV NODE_ENV=production 
# 设置工作目录
WORKDIR /usr/src/app 
# 复制 package.json 和 package-lock.json
COPY package*.json ./ 
# 安装依赖 
RUN echo "deb http://us.archive.ubuntu.com/ubuntu/ jammy universe" >> /etc/apt/sources.list
RUN apt-get install -y nodejs
RUN npm install 
RUN mkdir /var/www
# 复制应用代码 
COPY . . 
# 暴露端口 
EXPOSE 8080 
# 健康检查 
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \ CMD curl -f http://localhost:8080/ || exit 1 
# 指定用户 
USER node 
ADD app.js /var/www/app.js
# 启动应用 
CMD ["npm", "start"]
CMD ["/usr/bin/node", "/var/www/app.js"]
```