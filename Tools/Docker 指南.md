## 一、Docker 基础知识

### 什么是 Docker

Docker 是一种容器化平台，允许开发者将应用程序及其依赖打包到一个轻量级、可移植的容器中。Docker 让开发、部署和运行应用程序变得更加简单高效。

### Docker 配置

Docker 的配置文件位于 `/etc/docker/daemon.json`，可以配置镜像加速器等：

```json
{
  "registry-mirrors": [
    "https://<your-mirror-url>"
  ]
}
```

### 常用 Docker 命令

#### 镜像管理

- `docker images` - 列出本地镜像
  - `-a, --all` - 列出所有镜像文件（包括临时文件）
  - `-f, --filter=[]` - 过滤列出的镜像
  - `--format="TEMPLATE"` - 控制输出格式
  - `-q, --quiet` - 仅输出 ID 信息

- `docker rmi` / `docker image rm` - 删除镜像
  - `-f, --force` - 强制删除
  - `-no-prune` - 不清理未带标签的父镜像

- `docker image prune` - 清理镜像
  - `-a, --all` - 删除所有无用镜像
  - `-filter` - 只清理符合过滤器的镜像
  - `-f, --force` - 强制删除镜像

- `docker search` - 搜索镜像
  - `-f, --filter` - 过滤输出内容
  - `--limit` - 限制输出个数，默认 25

- `docker pull` - 拉取镜像
  ```bash
  docker pull ubuntu:20.04
  ```

- `docker tag` - 给镜像添加标签
  ```bash
  docker tag ubuntu:latest myubt:latest
  ```

#### 容器管理

- `docker run` - 从镜像创建并启动容器
  - `-i, --interactive` - 控制台交互
  - `-t, --tty` - 分配一个伪终端
  - `-d, --detach` - 后台启动
  - `--rm` - 容器退出时自动删除
  - `-p, --publish` - 端口映射
  - `-e, --env` - 设置环境变量
  - `-v, --volume` - 挂载本地目录到容器
  - `--name` - 给容器命名
  - `--restart` - 指定容器停止后的重启策略
  - `--gpus` - 指定显卡

  ```bash
  docker run -it ubuntu:latest /bin/bash
  docker run -it -d --name my_container alpine:latest
  docker run -v /path/on/host:/path/in/container <image>
  docker run --gpus '"device=0,1"'  # 使用 GPU 0 和 1
  ```

- `docker ps` - 查看运行中的容器
  - `-a` - 列出所有容器（运行或停止）
  - `-q` - 仅显示容器 ID

- `docker start` - 启动容器
  ```bash
  docker start container_name_or_id
  ```

- `docker stop` - 优雅地关闭容器
  ```bash
  docker stop container_name_or_id
  ```

- `docker kill` - 强行关闭容器
  ```bash
  docker kill container_name_or_id
  ```

- `docker restart` - 重启容器
  ```bash
  docker restart container_name_or_id
  ```

- `docker pause` / `docker unpause` - 暂停/恢复容器
  ```bash
  docker pause container_name_or_id
  docker unpause container_name_or_id
  ```

- `docker rm` - 删除容器
  - `-v` - 删除容器时同时删除关联的数据卷

- `docker logs` - 查看容器日志
  - `-f` - 实时跟踪日志输出

- `docker exec` - 在运行的容器中执行命令
  ```bash
  docker exec -it <container_id> /bin/bash
  ```

- `docker attach` - 连接到运行中的容器（推荐使用 `docker exec`）

- `docker wait` - 等待容器停止并返回退出代码

- `docker port` - 显示容器的端口映射
  ```bash
  docker port <container_id>
  ```

#### 其他管理命令

- `docker commit` - 从指定容器创建镜像
  - `-a, --author` - 指定镜像的作者信息
  - `-m, --message` - 添加提交信息
  ```bash
  docker commit container_id new_image_name
  ```

- `docker inspect` - 获取容器或镜像的详细信息
  ```bash
  docker inspect <container_name/image_id>
  ```

- `docker diff` - 查看容器中哪些文件发生了变化
  ```bash
  docker diff <container_name/container_id>
  ```

- `docker history` - 显示镜像的历史记录
  ```bash
  docker history <image_id>
  ```

- `docker stats` - 实时显示容器的资源使用情况
  ```bash
  docker stats
  ```

- `docker top` - 显示容器中运行的进程
  ```bash
  docker top <container_id>
  ```

- `docker events` - 实时显示 Docker 事件
  ```bash
  docker events
  ```

- `docker rename` - 重命名容器
  ```bash
  docker rename <old_name> <new_name>
  ```

- `docker cp` - 在容器和本地文件系统之间复制文件
  ```bash
  docker cp <container_id>:/path/in/container /path/on/host
  ```

- `docker login/logout` - 登录/登出 Docker 仓库

#### 系统管理

- `docker system prune` - 清理未使用的 Docker 对象
  - `-a` - 清理所有未使用的镜像
  - `--volumes` - 同时删除未使用的卷

- `docker volume prune` - 清理未使用的卷
- `docker container prune` - 清理已停止的容器

#### 网络管理

- `docker network ls` - 列出所有 Docker 网络
- `docker network create` - 创建网络
- `docker network rm` - 删除网络

#### 卷管理

- `docker volume ls` - 列出所有卷
- `docker volume create` - 创建卷
- `docker volume rm` - 删除卷

#### 镜像导入导出

- `docker save` - 将镜像保存为 tar 文件
  ```bash
  docker save -o my-image.tar <image_id>
  ```

- `docker load` - 从 tar 文件加载镜像
  ```bash
  docker load -i my-image.tar
  ```

- `docker export` - 将容器的文件系统导出为 tar 文件
  ```bash
  docker export -o my-container.tar <container_id>
  ```

- `docker import` - 从 tar 文件导入文件系统并创建镜像
  ```bash
  docker import my-container.tar my-new-image
  ```

## 二、Dockerfile 指令详解

Dockerfile 是一个文本文件，包含一系列指令，用于定义镜像的构建过程。

### 基础指令

- `FROM` - 设置容器的基础镜像
  ```dockerfile
  FROM ubuntu:22.04
  ```

- `MAINTAINER` - 显示创建镜像作者的信息（已弃用，建议使用 LABEL）
  ```dockerfile
  MAINTAINER info@ostechnix.com
  ```

- `LABEL` - 添加元数据键值对
  ```dockerfile
  LABEL ENV="DEVELOPMENT"
  ```

- `RUN` - 在基础镜像中执行指令并创建一个新层
  ```dockerfile
  RUN apt-get update && apt-get install -y package_name
  RUN ["apt-get", "update"]  # 执行形式，不通过 shell
  ```

- `CMD` - 设置启动时执行的默认命令及其参数
  ```dockerfile
  CMD ["java", "-jar", "app.jar"]
  ```

- `ENTRYPOINT` - 设置启动时执行的固定命令
  ```dockerfile
  ENTRYPOINT ["java", "-jar", "app.jar"]
  ```

### 文件操作指令

- `COPY` - 拷贝本地文件至容器中
  ```dockerfile
  COPY /target/devops.jar devops.jar
  COPY --chown=user:group /target/devops.jar devops.jar
  ```

- `ADD` - 与 COPY 类似，但可以提取本地的 tar 文件或 URL 文件
  ```dockerfile
  ADD devops.tar.xz / .
  ADD http://example.com/abc.git /usr/local/devops/
  ```

### 环境配置指令

- `ENV` - 设置环境变量的键值对
  ```dockerfile
  ENV DB_NAME="MySQL"
  ENV DB_VERSION="8.0"
  ```

- `ARG` - 定义构建时变量
  ```dockerfile
  ARG VERSION=1.0
  ```
  构建时可通过 `--build-arg` 传入：
  ```bash
  docker build --build-arg VERSION=2.0 -t myimage .
  ```

- `WORKDIR` - 设置工作目录
  ```dockerfile
  WORKDIR /var/lib/
  ```

- `USER` - 设置运行镜像并使用的用户名称以及用户组
  ```dockerfile
  USER dhruv
  ```

### 端口与卷指令

- `EXPOSE` - 设置用于访问容器的端口
  ```dockerfile
  EXPOSE 8080
  EXPOSE 80 443
  ```

- `VOLUME` - 用来创建指定位置的挂载点
  ```dockerfile
  VOLUME /app/devops
  ```

### 构建优化指令

- `ONBUILD` - 为镜像添加触发器，当此镜像被作为基础镜像时触发指定指令
  ```dockerfile
  ONBUILD RUN echo "Building on top of this image"
  ```

- `HEALTHCHECK` - 检查容器的健康状况
  ```dockerfile
  HEALTHCHECK --interval=30s CMD curl -f http://localhost/ || exit 1
  ```

- `SHELL` - 指定在 RUN 指令中使用的默认 shell
  ```dockerfile
  SHELL ["/bin/bash", "-c"]
  ```

- `STOPSIGNAL` - 定义容器停止时发送的系统调用信号
  ```dockerfile
  STOPSIGNAL SIGTERM
  ```

### 多阶段构建

使用 `AS` 关键字可以实现多阶段构建：

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

### Dockerfile 示例

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
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
 CMD curl -f http://localhost:8080/ || exit 1

# 指定用户
USER node

# 添加文件
ADD app.js /var/www/app.js

# 启动应用
CMD ["npm", "start"]
```

## 三、Docker Compose

Docker Compose 是一个用于定义和运行多容器 Docker 应用的工具，它通过一个 YAML 文件来配置应用的服务、网络和卷，使得管理复杂的应用变得更加简单。

### 核心功能

- 简化多容器应用程序的管理：允许使用 YAML 文件定义整个应用的环境（服务、网络、卷等）
- 一键启停所有服务
- 定义服务间依赖关系：支持定义服务间依赖，确保正确顺序启动
- 隔离环境
- 快速迭代开发

### 开发环境配置

- 代码热重载配置：通过将本地目录挂载到容器内，可以在不重新构建镜像的情况下查看代码效果
- 端口映射与访问：明确的端口预设，避免端口冲突，多服务端口管理
- 环境变量管理：.env 文件或 docker-compose.yml 内部，保留默认值
- 简化日志输出
- 不使用守护进程模式
- 保留开发工具

### 环境一致性

- 使用相同基础镜像
- 复制生产配置
- 数据一致性：尽量使用生产数据的子集进行测试，确保测试数据的代表性

### 概念

#### 项目（Project）

由一组关联的应用容器组成的一个完整业务单元，在 docker-compose.yml 文件中定义。

#### 服务（Service）

一个应用的容器，实际上可以包括若干运行相同镜像的容器实例。

### docker-compose.yml 配置

#### version

指定 `docker-compose.yml` 文件版本

#### services

定义应用程序的服务。每个服务都是一个容器

- `image` - 指定容器使用镜像
- `ports` - 将容器的端口映射到宿主的端口 `主机端口:容器端口`
- `environment` - 设置容器的环境变量
- `volumes` - 将宿主主机的目录或卷挂载到容器中 `主机路径:容器路径` `卷名:容器路径`
- `networks` - 将容器连接到指定的网络
- `build` - 没有现成镜像，或者需要自定义镜像的构建过程，可以使用 `build` 选项，可以指定 `dockerfile` 的路径，也可以进一步配置构建上下文等信息

```yaml
services:
  app:
    build:
      context: ./app # 指定构建上下文的路径
      dockerfile: dockerfile.dev
```

- `depends_on` - 定义服务之间的依赖关系，确保在启动某服务之前，其依赖的服务已经启动
- `command` - 覆盖容器启动时默认执行的命令
- `healthcheck` - 检查健康，为容器配置健康检查，用于检测容器的运行状态

```yaml
# 配置一个每 1 分 30 秒检查一次的健康，超时时间 10 秒，最多重试 3 次
services:
  web:
    image: nginx:latest
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 1m30s
      timeout: 10s
      retries: 3
```

- `deploy` - 资源限制

```yaml
# app 服务最多使用 0.5 个 CPU 核心和 512MB 内存
services:
  app:
    image: nginx:latest
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
```

- `restart` - 指定容器重启策略
  - `no` - 默认值，不会自动重启容器
  - `always` - 总是重启容器，无论退出状态如何
  - `on-failure` - 仅当容器以非零退出代码停止时才重启
  - `unless-stopped` - 总是重启容器，除非容器被手动停止或 docker 服务被停止

#### networks

定义应用程序使用的网络

#### volumes

定义应用程序使用的卷，用于持久化数据，可以指定卷的名称、驱动等信息。

```yaml
version: '3'
volumes:
  db-data: # 定义一个名为 db-data 的本地卷，可以通过 volumes 选项挂载这些卷
    driver: local
services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"
    environment:
      MYSQL_ROOT_PASSWORD: example
      MYSQL_DATABASE: mydb
    volumes:
      - db-data:/var/lib/mysql
      - ./backup:/backup
    depends_on:
      - app
    command: ["python", "app.py"]
    networks:
      my-network:
        driver: bridge
  app:
    image: myapp:latest
```

### .env 文件

`.env` 文件在使用 `docker-compose` 时非常常见，用于集中管理环境变量，让配置更灵活、更易维护。

#### .env 文件作用

`.env` 文件中的变量可以在 `docker-compose.yml` 文件中使用，通常用于：

- 设置端口、用户名、密码等
- 避免将敏感信息硬编码进配置文件
- 方便在不同环境下使用不同配置（如开发、测试、生产）

#### .env 文件示例

```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret123
POSTGRES_DB=mydatabase
APP_PORT=5000
```

#### docker-compose.yml 中的引用方式

```yaml
version: '3.8'

services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - db-data:/var/lib/postgresql/data

  app:
    build: ./app
    ports:
      - "${APP_PORT}:5000"
    depends_on:
      - db

volumes:
  db-data:
```

#### 文件结构示例

```
my-project/
├── docker-compose.yml
├── .env
└── app/
```

#### 注意事项

- `.env` 文件 **默认自动加载**，只要它与 `docker-compose.yml` 位于同一目录下。
- 变量 **只能在 `docker-compose.yml` 顶层使用**，不能在 `Dockerfile` 里生效（那要用 `ARG` 或 `ENV`）。
- 使用 Git 时，推荐将 `.env` 文件加入 `.gitignore`，防止敏感信息泄露。

### Docker Compose 常用命令

- `docker-compose up` - 根据 `docker-compose.yml` 文件创建并启动所有服务
  - `-d` - 后台运行服务
  - `--build` - 构建镜像后再启动服务

- `docker-compose down` - 停止并删除所有由 `docker-compose up` 创建的容器、网络和卷

- `docker-compose ps` - 查看 `docker-compose` 管理的容器状态

- `docker-compose logs` - 查看服务日志
  - `-f` - 实时跟踪日志输出
  ```bash
  docker-compose logs -f web
  ```

- `docker-compose build` - 构建或重新构建服务的镜像
  ```bash
  docker-compose build web
  ```

- `docker-compose restart` - 重启服务
  ```bash
  docker-compose restart web
  ```

- `docker-compose stop` - 停止服务
  ```bash
  docker-compose stop web
  ```

- `docker-compose start` - 启动已停止的服务
  ```bash
  docker-compose start web
  ```

- `docker-compose pull` - 拉取服务所用的镜像
  ```bash
  docker-compose pull
  ```

- `docker-compose config` - 验证并查看 compose 文件配置
  ```bash
  docker-compose config
  ```

- `docker-compose exec` - 在运行的容器中执行命令
  ```bash
  docker-compose exec web sh
  ```

### 选项

- `-f, --file FILE` - 指定使用的 Compose 模板文件，默认为 docker-compose.yml，可以多次指定
- `-p, --project-name NAME` - 指定项目名称，默认将使用所在目录名称作为项目名
- `--verbose` - 输出更多调试信息
- `-v, --version` - 打印版本并退出
- `-d` - 在后台运行容器服务

## 四、最佳实践

### Dockerfile 最佳实践

1. 使用官方基础镜像
2. 减少镜像层数，合并相关指令
3. 使用 .dockerignore 文件排除不必要的文件
4. 合理安排指令顺序，利用构建缓存
5. 使用多阶段构建减少最终镜像大小
6. 避免安装不必要的包
7. 使用特定的标签而不是 latest
8. 设置 HEALTHCHECK 检查容器健康状态

### Docker Compose 最佳实践

1. 使用 .env 文件管理环境变量
2. 为服务设置合适的重启策略
3. 使用命名卷进行数据持久化
4. 合理配置资源限制
5. 使用网络隔离不同应用
6. 在开发环境中使用卷挂载实现热重载

### 安全最佳实践

1. 不要在镜像中存储敏感信息
2. 使用非 root 用户运行应用
3. 定期更新基础镜像
4. 扫描镜像漏洞
5. 限制容器权限
6. 使用安全的镜像来源

这个综合文档涵盖了 Docker 的基础知识、Dockerfile 指令详解以及 Docker Compose 的使用方法，包含了常用命令、配置选项和最佳实践，可以作为 Docker 学习和使用的参考手册。