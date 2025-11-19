Docker 是一种容器化平台，允许开发者将应用程序及其依赖打包到一个轻量级、可移植的容器中。以下是一些常用的 Docker 命令及其介绍，并附有示例。

1. docker run
介绍: 从镜像创建并启动一个新容器。

示例:

bash
复制
docker run hello-world
这个命令会从 hello-world 镜像创建一个容器并运行它。

2. docker ps
介绍: 列出正在运行的容器。

示例:

bash
复制
docker ps
列出所有正在运行的容器。如果要查看所有容器（包括已停止的），可以使用 -a 选项：

bash
复制
docker ps -a
3. docker images
介绍: 列出本地存储的镜像。

示例:

bash
复制
docker images
列出所有本地存储的 Docker 镜像。

4. docker pull
介绍: 从 Docker 仓库拉取镜像到本地。

示例:

bash
复制
docker pull ubuntu:20.04
从 Docker Hub 拉取 ubuntu 镜像的 20.04 版本。

5. docker build
介绍: 根据 Dockerfile 构建镜像。

示例:

bash
复制
docker build -t my-custom-image .
在当前目录下根据 Dockerfile 构建一个名为 my-custom-image 的镜像。

6. docker stop
介绍: 停止一个正在运行的容器。

示例:

bash
复制
docker stop <container_id>
停止指定 ID 的容器。

7. docker start
介绍: 启动一个已停止的容器。

示例:

bash
复制
docker start <container_id>
启动指定 ID 的容器。

8. docker rm
介绍: 删除一个或多个容器。

示例:

bash
复制
docker rm <container_id>
删除指定 ID 的容器。如果要删除所有已停止的容器，可以使用：

bash
复制
docker container prune
9. docker rmi
介绍: 删除一个或多个镜像。

示例:

bash
复制
docker rmi <image_id>
删除指定 ID 的镜像。

10. docker exec
介绍: 在正在运行的容器中执行命令。

示例:

bash
复制
docker exec -it <container_id> /bin/bash
在指定 ID 的容器中启动一个交互式 Bash shell。

11. docker logs
介绍: 查看容器的日志输出。

示例:

bash
复制
docker logs <container_id>
查看指定 ID 的容器的日志。可以使用 -f 选项来实时跟踪日志输出：

bash
复制
docker logs -f <container_id>
12. docker network
介绍: 管理 Docker 网络。

示例:

bash
复制
docker network ls
列出所有 Docker 网络。

13. docker volume
介绍: 管理 Docker 卷。

示例:

bash
复制
docker volume ls
列出所有 Docker 卷。

14. docker-compose up
介绍: 使用 docker-compose.yml 文件启动服务。

示例:

bash
复制
docker-compose up
根据 docker-compose.yml 文件启动所有定义的服务。可以使用 -d 选项在后台运行：

bash
复制
docker-compose up -d
15. docker-compose down
介绍: 停止并移除由 docker-compose up 启动的容器、网络和卷。

示例:

bash
复制
docker-compose down
停止并移除所有由 docker-compose up 启动的服务。

16. docker inspect
介绍: 获取容器或镜像的详细信息。

示例:

bash
复制
docker inspect <container_id>
获取指定 ID 的容器的详细信息。

17. docker cp
介绍: 在容器和本地文件系统之间复制文件。

示例:

bash
复制
docker cp <container_id>:/path/to/file /host/path/to/destination
从容器中复制文件到本地文件系统。

18. docker commit
介绍: 将容器的更改保存为新的镜像。

示例:

bash
复制
docker commit <container_id> my-new-image
将指定 ID 的容器的更改保存为名为 my-new-image 的新镜像。

19. docker login
介绍: 登录到 Docker 仓库。

示例:

bash
复制
docker login
登录到 Docker Hub 或其他 Docker 仓库。

20. docker logout
介绍: 从 Docker 仓库注销。

示例:

bash
复制
docker logout
从 Docker Hub 或其他 Docker 仓库注销。

21. docker tag
介绍: 为镜像打标签。

示例:

bash
复制
docker tag <image_id> my-repo/my-image:1.0
为指定 ID 的镜像打上 my-repo/my-image:1.0 的标签。

22. docker push
介绍: 将镜像推送到 Docker 仓库。

示例:

bash
复制
docker push my-repo/my-image:1.0
将 my-repo/my-image:1.0 镜像推送到 Docker 仓库。

23. docker system prune
介绍: 清理未使用的 Docker 对象（如镜像、容器、网络和卷）。

示例:

bash
复制
docker system prune
清理所有未使用的 Docker 对象。可以使用 -a 选项清理所有未使用的镜像：

bash
复制
docker system prune -a
24. docker stats
介绍: 实时显示容器的资源使用情况。

示例:

bash
复制
docker stats
实时显示所有运行中容器的 CPU、内存、网络 I/O 等资源使用情况。

25. docker top
介绍: 显示容器中运行的进程。

示例:

bash
复制
docker top <container_id>
显示指定 ID 的容器中运行的进程。

26. docker attach
介绍: 连接到正在运行的容器。

示例:

bash
复制
docker attach <container_id>
连接到指定 ID 的容器的标准输入、输出和错误流。

27. docker port
介绍: 显示容器的端口映射。

示例:

bash
复制
docker port <container_id>
显示指定 ID 的容器的端口映射。

28. docker history
介绍: 显示镜像的历史记录。

示例:

bash
复制
docker history <image_id>
显示指定 ID 的镜像的历史记录。

29. docker save
介绍: 将镜像保存为 tar 文件。

示例:

bash
复制
docker save -o my-image.tar <image_id>
将指定 ID 的镜像保存为 my-image.tar 文件。

30. docker load
介绍: 从 tar 文件加载镜像。

示例:

bash
复制
docker load -i my-image.tar
从 my-image.tar 文件加载镜像。

31. docker export
介绍: 将容器的文件系统导出为 tar 文件。

示例:

bash
复制
docker export -o my-container.tar <container_id>
将指定 ID 的容器的文件系统导出为 my-container.tar 文件。

32. docker import
介绍: 从 tar 文件导入文件系统并创建镜像。

示例:

bash
复制
docker import my-container.tar my-new-image
从 my-container.tar 文件导入文件系统并创建名为 my-new-image 的镜像。

33. docker info
介绍: 显示 Docker 系统信息。

示例:

bash
复制
docker info
显示 Docker 系统的详细信息，如容器数量、镜像数量、存储驱动等。

34. docker version
介绍: 显示 Docker 版本信息。

示例:

bash
复制
docker version
显示 Docker 客户端和服务器的版本信息。

35. docker events
介绍: 实时显示 Docker 事件。

示例:

bash
复制
docker events
实时显示 Docker 的事件流，如容器启动、停止等。

36. docker pause
介绍: 暂停容器中的所有进程。

示例:

bash
复制
docker pause <container_id>
暂停指定 ID 的容器中的所有进程。

37. docker unpause
介绍: 恢复容器中的所有进程。

示例:

bash
复制
docker unpause <container_id>
恢复指定 ID 的容器中的所有进程。

38. docker rename
介绍: 重命名容器。

示例:

bash
复制
docker rename <old_name> <new_name>
将容器的名称从 <old_name> 改为 <new_name>。

39. docker diff
介绍: 显示容器文件系统的更改。

示例:

bash
复制
docker diff <container_id>
显示指定 ID 的容器文件系统的更改。

40. docker wait
介绍: 等待容器停止并返回退出代码。

示例:

bash
复制
docker wait <container_id>
等待指定 ID 的容器停止并返回退出代码。

41. docker kill
介绍: 强制停止容器。

示例:

bash
复制
docker kill <container_id>
强制停止指定 ID 的容器。

42. docker restart
介绍: 重启容器。

示例:

bash
复制
docker restart <container_id>
重启指定 ID 的容器。

43. docker update
介绍: 更新容器的配置。

示例:

bash
复制
docker update --memory="512m" <container_id>
更新指定 ID 的容器的内存限制为 512MB。

44. docker swarm
介绍: 管理 Docker Swarm 集群。

示例:

bash
复制
docker swarm init
初始化一个新的 Swarm 集群。

45. docker service
介绍: 管理 Swarm 服务。

示例:

bash
复制
docker service create --name my-service nginx
在 Swarm 集群中创建一个名为 my-service 的 Nginx 服务。

46. docker node
介绍: 管理 Swarm 节点。

示例:

bash
复制
docker node ls
列出 Swarm 集群中的所有节点。

47. docker stack
介绍: 管理 Swarm 堆栈。

示例:

bash
复制
docker stack deploy -c docker-compose.yml my-stack
使用 docker-compose.yml 文件部署一个名为 my-stack 的堆栈。

48. docker config
介绍: 管理 Docker 配置。

示例:

bash
复制
docker config create my-config config-file.txt
创建一个名为 my-config 的 Docker 配置。

49. docker secret
介绍: 管理 Docker 密钥。

示例:

bash
复制
docker secret create my-secret secret-file.txt
创建一个名为 my-secret 的 Docker 密钥。

50. docker plugin
介绍: 管理 Docker 插件。

示例:

bash
复制
docker plugin ls
列出所有 Docker 插件。

这些命令涵盖了 Docker 的常见操作，帮助你有效地管理和使用 Docker 容器和镜像。

如何制作docker镜像
制作 Docker 镜像通常是通过编写 Dockerfile 来完成的。Dockerfile 是一个文本文件，包含了一系列指令，用于定义如何构建镜像。以下是制作 Docker 镜像的详细步骤：

1. 编写 Dockerfile
Dockerfile 是构建镜像的核心文件。以下是一个简单的 Dockerfile 示例：

Dockerfile
复制
# 使用官方的 Python 3.9 镜像作为基础镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 将当前目录下的所有文件复制到容器的 /app 目录
COPY . /app

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 暴露端口
EXPOSE 80

# 设置环境变量
ENV NAME World

# 运行应用程序
CMD ["python", "app.py"]
2. 准备应用程序文件
假设你有一个简单的 Python 应用程序，包含以下文件：

app.py: 应用程序的主文件。

requirements.txt: 应用程序的依赖文件。

app.py:

python
复制
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, Docker!'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
requirements.txt:

复制
Flask==2.0.1
3. 构建 Docker 镜像
在包含 Dockerfile 和应用程序文件的目录中，运行以下命令来构建镜像：

bash
复制
docker build -t my-python-app .
-t my-python-app: 为镜像指定一个标签（名称）。

.: 表示当前目录是构建上下文。

4. 运行 Docker 容器
构建完成后，你可以使用以下命令运行容器：

bash
复制
docker run -p 4000:80 my-python-app
-p 4000:80: 将主机的 4000 端口映射到容器的 80 端口。

my-python-app: 指定要运行的镜像。

5. 访问应用程序
在浏览器中访问 http://localhost:4000，你应该会看到 "Hello, Docker!" 的消息。

6. 推送镜像到 Docker Hub（可选）
如果你想将镜像推送到 Docker Hub，可以按照以下步骤操作：

登录 Docker Hub:

bash
复制
docker login
为镜像打标签:

bash
复制
docker tag my-python-app your-dockerhub-username/my-python-app:1.0
推送镜像:

bash
复制
docker push your-dockerhub-username/my-python-app:1.0
7. 其他常用 Dockerfile 指令
FROM: 指定基础镜像。

RUN: 执行命令并创建新的镜像层。

COPY: 复制文件或目录到容器中。

ADD: 类似于 COPY，但支持自动解压 tar 文件和 URL。

CMD: 指定容器启动时运行的命令。

ENTRYPOINT: 配置容器启动时执行的命令，与 CMD 类似但更灵活。

ENV: 设置环境变量。

ARG: 定义构建时的变量。

VOLUME: 创建挂载点。

EXPOSE: 声明容器运行时监听的端口。

WORKDIR: 设置工作目录。

USER: 指定运行命令的用户。

LABEL: 添加元数据到镜像。

8. 多阶段构建（可选）
对于复杂的应用程序，可以使用多阶段构建来减小最终镜像的大小。以下是一个多阶段构建的示例：

Dockerfile
复制
# 第一阶段：构建应用程序
FROM python:3.9-slim as builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --user -r requirements.txt

COPY . .

# 第二阶段：生成最终镜像
FROM python:3.9-slim

WORKDIR /app

# 从构建阶段复制已安装的依赖
COPY --from=builder /root/.local /root/.local
COPY --from=builder /app /app

# 确保脚本可执行
RUN chmod +x /app/run.sh

# 确保在 PATH 中包含用户安装的二进制文件
ENV PATH=/root/.local/bin:$PATH

EXPOSE 80

CMD ["./run.sh"]
总结
通过编写 Dockerfile 并使用 docker build 命令，你可以轻松地创建自定义的 Docker 镜像。镜像可以包含应用程序及其所有依赖项，从而确保在不同环境中的一致性。

load 使用的 tar 包如何制作
要制作用于 docker load 的 tar 包，通常需要将一个或多个 Docker 镜像保存为 tar 文件。以下是详细的步骤：

1. 使用 docker save 命令保存镜像为 tar 文件
docker save 命令可以将一个或多个 Docker 镜像保存为 tar 文件。这个 tar 文件可以用于后续的 docker load 操作。

语法:

bash
复制
docker save -o <output_file.tar> <image_name>
示例:
假设你有一个名为 my-python-app 的镜像，你可以使用以下命令将其保存为 tar 文件：

bash
复制
docker save -o my-python-app.tar my-python-app
2. 保存多个镜像到一个 tar 文件
你也可以将多个镜像保存到一个 tar 文件中。只需在命令中列出所有镜像名称即可。

示例:

bash
复制
docker save -o my-images.tar my-python-app my-nginx-app
3. 使用 docker load 加载 tar 文件
保存的 tar 文件可以通过 docker load 命令加载到 Docker 中。

语法:

bash
复制
docker load -i <input_file.tar>
示例:

bash
复制
docker load -i my-python-app.tar
4. 验证加载的镜像
加载完成后，你可以使用 docker images 命令来验证镜像是否已成功加载。

示例:

bash
复制
docker images
5. 使用 docker export 和 docker import 导出和导入容器文件系统（可选）
如果你需要导出容器的文件系统而不是镜像，可以使用 docker export 和 docker import 命令。

导出容器文件系统:

bash
复制
docker export -o my-container.tar <container_id>
导入容器文件系统并创建镜像:

bash
复制
docker import my-container.tar my-new-image
6. 使用 docker commit 创建镜像并保存（可选）
如果你有一个正在运行的容器，并且希望将其状态保存为镜像，可以使用 docker commit 命令。

创建镜像:

bash
复制
docker commit <container_id> my-new-image
保存镜像为 tar 文件:

bash
复制
docker save -o my-new-image.tar my-new-image
7. 使用 docker-compose 保存多个镜像（可选）
如果你使用 docker-compose 管理多个服务，可以使用以下命令将所有相关镜像保存为 tar 文件。

示例:

bash
复制
docker-compose pull
docker-compose build
docker-compose save -o my-compose-images.tar
总结
通过 docker save 命令，你可以轻松地将 Docker 镜像保存为 tar 文件，并在需要时使用 docker load 命令加载这些镜像。这种方法非常适合在不同环境之间迁移 Docker 镜像，或者在没有网络连接的环境中部署 Docker 镜像。