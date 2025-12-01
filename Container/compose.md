Docker Compose 是一个用于定义和运行多容器 Docker 应用的工具，它通过一个 YAML 文件来配置应用的服务、网络和卷，使得管理复杂的应用变得更加简单
## 核心功能
- 简化多容器应用程序的管理：允许使用 YAML 文件定义整个应用的环境（服务、网络、卷等）
- 一键启停所有服务
- 定义服务间依赖关系：支持定义服务间依赖，确保正确顺序启动
- 隔离环境
- 快速迭代开发
## 开发环境
- 代码热重载配置：通过将本地目录挂载到容器内，开在不重新构建镜像的情况下查看代码效果
- 端口映射与访问：明确的端口预设，避免端口冲突，多服务端口管理
- 环境变量管理：.env 文件或 docker-compose.yml 内部，保留默认值
- 简化日志输出
- 不使用守护进程模式
- 保留开发工具
## 环境一致性
- 使用相同基础镜像
- 复制生产配置
- 数据一致性：尽量使用生产数据的子集进行测试，确保测试数据的代表性
## 概念
Compose有2个重要的概念：
### 项目（Project）
由一组关联的应用容器组成的一个完整业务单元，在 docker-compose.yml 文件中定义。
### 服务（Service）
一个应用的容器，实际上可以包括若干运行相同镜像的容器实例。
### 选项（Options）
* `-f, --file FILE` 指定使用的 Compose 模板文件，默认为 docker-compose.yml，可以多次指定。
* `-p, --project-name NAME` 指定项目名称，默认将使用所在目录名称作为项目名。
* `-networking` 使用 Docker 的可拔插网络后端特性
* `-network-driver DRIVER` 指定网络后端的驱动，默认为 bridge
* `-verbose` 输出更多调试信息。
* `-v, --version` 打印版本并退出。
* `-d` 在后台运行容器服务
## docker-compose.yml
### version
指定`docker-compose.yml` 文件版本
### services
定义应用程序的服务。每个服务都是一个容器
- `image` 指定容器使用镜像
- `ports` 将容器的端口映射到宿主的端口`主机端口:容器端口`
- `environment` 设置容器的环境变量
- `volumes` 将宿主主机的目录或卷挂载到容器中`主机路径:容器路径` `卷名:容器路径`
- `networks` 将容器连接到指定的网络
- `build` 没有现成镜像，或者需要自定义镜像的构建过程，可以使用 `build` 选项，可以指定 `dockerfile` 的路径，也可以进一步配置构建上下文等信息
```yaml
services:
	app:
		build:
			context: ./app # 指定构建上下文的路径
			dockerfile: dockerfile.dev
```
- `depends_on` 定义服务之间的依赖关系，确保在启动某服务之前，其依赖的服务已经启动
- `command` 覆盖容器启动时默认执行的命令
- `healthcheck` 检查健康，为容器配置健康检查，用于检测容器的运行状态
```yaml
# 配置一个每 1 分 30 秒检查一次的健康，超时时间 10 秒，最多重试 3 次
services:
	web:
		image: nginx:latest
		healthcheck:
			test: ["CMD", "cur", "-f", "http://localhost"]
			interval: 1m30s
			timeout: 10s
			retries: 3
```
- `deploy` 资源限制
```yaml
# app 服务最多使用 0.5 个 CPU 核心和 512MB 内存
services:
	app:
	image: nginx:latest
	deploy:
		resourdes:
			limits:
				cpus: '0.50'
				memory: 512M
```
- `restart` 指定容器重启策略
	- no 默认值，不会自动重启容器
	- always 总是重启容器，无论退出状态如何
	- on-failure 仅当容器以非零退出代码停止时才重启
	- unless-stopped 总是重启容器，除非容器被手动停止或 docker 服务被停止
### networks
定义应用程序使用的网络
### volumes
定义应用程序使用的卷，用于持久化数据, 可以指定卷的名称、驱动等信息。

```yaml
version: '3'
volumes:
	db-data: # 定义一个名为 db-data 的本地卷，可以通过 volumes 选项挂载这些卷
		driver:local
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
## docker-compose
### up 根据 `docker-compose.yml` 文件创建并启动所有服务
- `-d` 后台运行服务
`docker-compose up -d`
- --build
### down 停止并删除所有由 `docker-compose up` 创建的容器、网络和卷
`docker-compose down`
### ps 查看 `docker-compose` 管理的容器状态
`docker-compose ps`
### logs 查看服务日志
- `-f` 实时跟踪日志输出
`docker-compose logs -f web`
### build 构建或重新构建服务的镜像
`dcoker-compose build web`
### restart 重启服务
`docker-compose restart web`

## env
`.env` 文件在使用 `docker-compose` 时非常常见，用于集中管理环境变量，让配置更灵活、更易维护。

---

### 📌 `.env` 文件作用

`.env` 文件中的变量可以在 `docker-compose.yml` 文件中使用，通常用于：

* 设置端口、用户名、密码等
* 避免将敏感信息硬编码进配置文件
* 方便在不同环境下使用不同配置（如开发、测试、生产）

---

### ✅ `.env` 文件示例

```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret123
POSTGRES_DB=mydatabase
APP_PORT=5000
```

---

### ✅ `docker-compose.yml` 中的引用方式

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

---

### 📁 文件结构示例

```
my-project/
├── docker-compose.yml
├── .env
└── app/
```

---

### 📝 注意事项

* `.env` 文件 **默认自动加载**，只要它与 `docker-compose.yml` 位于同一目录下。
* 变量 **只能在 `docker-compose.yml` 顶层使用**，不能在 `Dockerfile` 里生效（那要用 `ARG` 或 `ENV`）。
* 使用 Git 时，推荐将 `.env` 文件加入 `.gitignore`，防止敏感信息泄露。

---

如你需要我帮你创建一个 `.env` 文件和对应的 `docker-compose.yml`，请告诉我你的项目需求。
