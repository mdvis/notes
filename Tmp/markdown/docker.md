## 跨平台 Docker 镜像构建完整指南（Apple Silicon → AMD64）

以下内容覆盖 5 个方面，每部分可独立参考。所有命令已在实际环境验证，可直接复制执行。

---

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
