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

## buildx

### 一、完整操作步骤

**第 1 步：检查环境**

```bash
# 确认 Docker 版本（buildx 在 Docker Desktop 中已内置）
docker version
docker buildx version

# 确认当前可用的 builder 和平台支持
docker buildx ls
```

Docker Desktop for Mac 自带 buildx，不需要单独安装。如果你看到的 `docker buildx` 输出正常，即可继续。

**第 2 步：创建专用 builder**

```bash
docker buildx create \
  --name mybuilder \
  --driver docker-container \
  --driver-opt network=host \
  --use \
  --bootstrap
```

`--bootstrap` 会立即启动 builder 容器并拉取 buildkit 镜像，确保创建成功后立即可用。

**第 3 步：构建 AMD64 镜像并推送**

```bash
docker buildx build \
  --platform linux/amd64 \
  --tag your-registry/your-image:latest \
  --push \
  .
```

`--push` 会直接将构建产物推送到仓库，因为多平台构建的结果无法直接加载到本地 Docker（除非只构建单一平台并用 `--load`）。

**第 4 步（可选）：验证远程镜像**

```bash
# 在 AMD64 服务器上拉取并测试
docker pull your-registry/your-image:latest
docker run --rm -it your-registry/your-image:latest

# 或在本地用模拟运行测试
docker run --rm -it --platform linux/amd64 your-registry/your-image:latest
```

---

### 二、docker buildx create 选项详解

```
docker buildx create [OPTIONS] [CONTEXT|ENDPOINT]
```

| 选项           | 含义                                                                                             | 常用值                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `--name`       | 指定 builder 实例的名称，后续可用 `docker buildx use <name>` 切换                                | 任意合法名称，如 `mybuilder`                                                            |
| `--driver`     | 构建驱动类型。`docker` 用本地 Docker 守护进程，`docker-container` 用独立 BuildKit 容器，能力更强 | `docker`、`docker-container`、`kubernetes`、`remote`                                    |
| `--driver-opt` | 驱动选项，以 `key=value` 形式传递                                                                | `network=host`、`image=moby/buildkit:latest`、`env.BUILDKIT_STEP_LOG_MAX_SIZE=10485760` |
| `--platform`   | 为此 builder 预定义支持的平台集合，用于 `--append` 场景                                          | `linux/amd64,linux/arm64`                                                               |
| `--bootstrap`  | 创建后立即启动并验证 builder，确保就绪                                                           | 无参数，仅作为一个 flag                                                                 |
| `--use`        | 创建后将此 builder 设为默认，后续 `docker buildx build` 自动使用                                 | 无参数，仅作为一个 flag                                                                 |
| `--append`     | 向已存在的 builder 追加新节点，适用于多节点分布式构建                                            | 需指定节点上下文                                                                        |
| `--node`       | 为节点指定自定义名称                                                                             | 任意字符串，如 `node-amd64`                                                             |

**常见组合示例：**

```bash
# 最常用：独立容器 builder，支持所有平台
docker buildx create \
  --name mybuilder \
  --driver docker-container \
  --driver-opt network=host \
  --use \
  --bootstrap

# 多节点：将一台 AMD64 物理机加入 builder 集群
docker buildx create \
  --name multi-node \
  --append \
  --platform linux/amd64 \
  ssh://user@amd64-server
```

选择 `docker-container` 驱动的核心原因：它使用独立的 BuildKit 容器，支持 QEMU 模拟、多平台并行构建、缓存导出等高级特性，而 `docker` 驱动只能构建当前平台。

---

### 三、单架构 vs 多架构构建

#### 单一 AMD64 架构（含本地测试）

```bash
# 方法 A：构建并推送到仓库
docker buildx build \
  --platform linux/amd64 \
  --tag your-registry/your-image:latest \
  --push \
  .

# 方法 B：仅构建到本地 Docker（只能用 --load，不能用 --push）
docker buildx build \
  --platform linux/amd64 \
  --tag your-image:amd64-test \
  --load \
  .

# 本地运行验证
docker run --rm -it --platform linux/amd64 your-image:amd64-test
```

关键点：`--load` 只支持单一平台。同一命令里同时用 `--load` 和多平台会报错，需要用 `--push` 代替。

#### 多架构镜像（AMD64 + ARM64）

```bash
# 构建并推送多架构清单
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag your-registry/your-image:latest \
  --push \
  .
```

推送后，Docker 会自动创建 manifest list。用户在不同架构的机器上 `docker pull` 时会自动获取匹配的版本。

**查看远程 manifest list：**

```bash
docker buildx imagetools inspect your-registry/your-image:latest
```

输出中会显示各平台的 digest 和架构信息。

---

### 四、Dockerfile 中适配多架构

当 Dockerfile 需要下载外部二进制文件（如 Go 编译产物、预编译工具）时，用 `ARG TARGETARCH` 自动匹配目标架构。

#### 示例 A：下载不同架构的二进制

```dockerfile
FROM alpine:3.20

ARG TARGETARCH
# TARGETARCH 的值：amd64、arm64

RUN echo "Building for architecture: ${TARGETARCH}"

# 根据架构选择对应的二进制 URL
RUN case ${TARGETARCH} in \
      amd64)  BINARY_URL="https://example.com/tool-linux-amd64.tar.gz" ;; \
      arm64)  BINARY_URL="https://example.com/tool-linux-arm64.tar.gz" ;; \
      *)      echo "Unsupported: ${TARGETARCH}"; exit 1 ;; \
    esac && \
    wget -O /tmp/tool.tar.gz "$BINARY_URL" && \
    tar -xzf /tmp/tool.tar.gz -C /usr/local/bin && \
    rm /tmp/tool.tar.gz

ENTRYPOINT ["/usr/local/bin/tool"]
```

#### 示例 B：Go 程序交叉编译（推荐用多阶段构建 + --platform）

```dockerfile
# 构建阶段：在宿主机架构上编译目标架构
FROM --platform=$BUILDPLATFORM golang:1.22-alpine AS builder

ARG TARGETOS
ARG TARGETARCH

WORKDIR /app
COPY . .

RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o myapp .

# 运行阶段
FROM alpine:3.20
COPY --from=builder /app/myapp /usr/local/bin/myapp
ENTRYPOINT ["/usr/local/bin/myapp"]
```

这里的关键是 `FROM --platform=$BUILDPLATFORM` — 构建阶段始终在宿主机（ARM Mac）上以原生速度运行，通过 `GOOS` 和 `GOARCH` 环境变量完成交叉编译，然后产物复制到目标架构的运行镜像中。这比用 QEMU 模拟编译快得多。

#### 可用的 BuildKit 自动参数

| 参数             | 示例值             | 说明           |
| ---------------- | ------------------ | -------------- |
| `TARGETPLATFORM` | `linux/amd64`      | 目标平台       |
| `TARGETOS`       | `linux`            | 目标操作系统   |
| `TARGETARCH`     | `amd64`            | 目标架构       |
| `TARGETVARIANT`  | `v7`（ARM32 场景） | 目标变体       |
| `BUILDPLATFORM`  | `linux/arm64`      | 构建所在的平台 |

---

### 五、常见问题与解决方法

**1. 构建速度慢**

原因通常是 QEMU 模拟执行 `RUN` 指令效率低（比原生慢 5-10 倍）。

解决方法：

- 将耗时操作（编译、压缩等）从 `RUN` 移到多阶段构建的 builder 阶段，使用 `--platform=$BUILDPLATFORM` 以原生速度运行。
- 启用构建缓存：`docker buildx build --cache-to type=registry,ref=your-registry/cache --cache-from type=registry,ref=your-registry/cache ...`
- 尽量把 `RUN apt-get install` 这类操作放在 Dockerfile 末尾，减少缓存失效。

**2. `--load` 失败（ERROR: docker exporter does not support multi-platform）**

原因：`--load` 只能把单一平台的镜像加载到本地 Docker。

解决方法：

- 单平台：`--platform linux/amd64 --load`
- 多平台：只能 `--push` 到仓库，不能 `--load`
- 折中方案本地验证：用 `--push` 推到本地 registry：先 `docker run -d -p 5000:5000 registry:2`，然后 `--tag localhost:5000/image:latest --push`

**3. 模拟运行性能差**

`docker run --platform linux/amd64` 在 Mac 上通过 QEMU 模拟运行，性能明显低于原生 ARM 容器。

解决方法：

- 本地功能验证用 ARM 原生镜像（`docker buildx build --platform linux/arm64 --load`）。
- 集成/性能测试部署到 AMD64 服务器上执行。

**4. QEMU 未安装（exec format error 或 standard_init_linux.go 错误）**

```bash
# 安装 QEMU 模拟支持
docker run --privileged --rm tonistiigi/binfmt --install all

# 验证安装
ls /proc/sys/fs/binfmt_misc/qemu-*
```

Docker Desktop for Mac 通常已预装，不需要手动执行。但如果用 Colima 或其他 runtime，可能需要手动安装。

**5. builder 容器资源不足**

builder 容器（`buildx_buildkit_mybuilder0`）的内存和磁盘使用默认值可能在大型构建时不够。

解决方法：

```bash
docker buildx create \
  --driver-opt env.BUILDKIT_STEP_LOG_MAX_SIZE=10485760 \
  --driver-opt env.BUILDKIT_STEP_LOG_MAX_SPEED=10485760 \
  ...
```

如果构建过程中 builder 异常退出，可以检查日志：

```bash
docker logs buildx_buildkit_mybuilder0
```

同时定期清理 builder 缓存：

```bash
docker buildx prune --builder mybuilder --all --force
```

---

### 速查：日常使用模板

```bash
# 一次性完成：创建 builder + 构建 AMD64 + 推送
docker buildx create --name mybuilder --driver docker-container --use --bootstrap && \
docker buildx build \
  --platform linux/amd64 \
  --tag your-registry/your-image:$(date +%Y%m%d) \
  --tag your-registry/your-image:latest \
  --push \
  .
```

这份指南覆盖了你提到的 5 个方面。如果有某个环节遇到具体报错，可以把错误信息贴出来，我帮你定位。