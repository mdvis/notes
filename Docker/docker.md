docker 配置文件 `/etc/docker/daemon.json`
```
{
  "registry-mirrors": [
    "https://<your-mirror-url>"
  ]
}
```
- `--registry-mirror=PROXY\_URL`
## info
## images
```sh
docker images
docker images --format="{{.ID}}{{.Repository}}"
docker images -f dangling=true
```
* `-a, --all=true|false` 列出所有镜像文件（包括临时文件），默认否
* `--digests=ture|false` 列出镜像的数字摘要值，默认为否
* `-f, --filter=\[\]` 过滤列出的镜像，如 dangling=true 只显示没有被使用的镜像；也可指定带有特定标注的镜像等
* `--format="TEMPLATE"` 控制输出格式，如 .ID 代表 ID 信息，.Repository 代表仓库信息等
* `--no-trunc=true|false` 对输出结果太长的部分是否截断，如 ID，默认是
* `-q, --quiet=true|false` 仅输出 ID 信息，默认否
## rmi
使用 `id` 删除镜像
```
docker rmi ce5aa74a48f1
```
* `-f, -force` 强制删除
* `-no-prune` 不清理未带标签的父镜像
## image
### rm
使用 `id` 删除镜像
```
docker image rm ce5aa74a48f1
```
* `-f, -force` 强制删除
* `-no-prune` 不清理未带标签的父镜像
### prune
清理镜像
* `-a, -all` 删除所有无用镜像，不只是临时
* `-filter` 只清理符合过滤器的镜像
* `-f, -force` 强制删除镜像，无提示
## container
### prune
可以把所有停止的容器一次性删掉
```
docker container prune
```
## search
```sh
docker search alpine
```
* `-f, --filter` 过滤输出内容
* `--format` 格式化输出
* `--limit` 限制输出个数，默认 25
* `--no-trunc` 不截断输出结果
## pull
```sh
docker pull ubuntu:20.04
```
## run
```bash
docker run -t -i ubuntu:latest /bin/bash
docker run -it ubuntu:latest /bin/bash
docker run -it 20fffa419e3a /bin/bash
docker run -it -d alpine:latest
docker run -it --rm debian:latest
docker run -it -d --name ostechnix_alpine alpine:latest
docker run -v /path/on/host:path/in/container <image>
docker run --gpus '"device=0"'  # 仅使用 GPU 0
docker run --gpus '"device=1,2"'  # 使用 GPU 1 和 2
```
- `--name` 给容器命名
- `--add-host`
* `--init` 在容器内运行 init 来转发信号并获取进程
* `-h，--hostname` 设置新主机名
* `-i，--interactive` 控制台交互,通过从容器获取一个标准输入（STDIN）,创建可交互连接。
* `-t, --tty` 分配一个伪终端，允许没有控制台的情况下运行交互程序 bash 等
* `--rm` 当容器退出时，容器和相关的文件系统会被一并删掉
* `-d, --detach` 后台启动，并进入守护模式（`<c-p><c-q>`）
* `-p, --publish` 将容器端口映射到主机上`<host_port>`:`<container_port>`,可以有多个 `-p`
* `-e, --env` 设置容器的环境变量`docker run -e NAME=NM image`​
* `-v, --volume` 挂在本地目录到容器 `<host_path`:`container_path>`
* `--restart` 指定容器停止后的重启策略 
	* `no` 不重启 
	* `on-failure` 容器故障退出时重启
	* `always` 容器退出时总是重启
* `--dns` 指定容器 DNS 服务器
* `-u, --user` 指定容器的用户
* `--attach`
* `-w, --workdir` 指定容器工作的目录
* `--sig-proxy` 代理接收到进程的信号
* `--gpus`  指定显卡
## ps
查看运行中的容器
- `-a` 列出所有可用的（运行或者停止）容器
- `-q`
- `-f`
```sh
docker ps
docker ps -a
```
## attach
连接进运行中的镜像(只适用于运行时设置了`-i`选项的镜像)
优先使用`docker exec -it <image_id> /bin/bash`
```
docker attach d74f2ceb5f3a
```
## logs
查看容器的日志输出
- `-f`
```
docker logs -f 10615254bb45
```
## start
启动和重启
```
docker start modest_cray
docker start 10615254bb45
docker start 24b5ee8c3d3a 56faac6d20ad d74f2ceb5f3a
```
## pause
暂停容器中的所有进程
```
docker pause 10615254bb45
```
## unpause
恢复容器中的所有进程
```
docker unpause 10615254bb45
```
## wait
等待容器停止并返回退出代码
```
docker wait 10615254bb45
```
## stop
优雅的关闭容器
```
docker stop 10615254bb45
docker stop 35b5ee8c3d3a 10615254bb45
```
## kill
强行关闭容器
```
docker kill 10615254bb45
```
## commit
从指定容器创建镜像 `docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]`
> `CONTAINER`：需要提交的容器名称或 ID。
> `REPOSITORY[:TAG ]`：新镜像的名称和标签（可选）。如果未指定标签，默认为 `latest`。

- `-a` 或 `--author`：指定镜像的作者信息。
- `-m` 或 `--message`：添加提交信息，类似于 Git 的 commit message。
- `-p` 或 `--pause`：在提交时暂停容器（默认行为）。可以使用 `--pause=false` 禁用。

```
docker commit 377e6d77ebb5 ostechnix/ubuntu_apache
```
## rm
- `-v` 当数据卷已经没有和任何容器关联时，都会一律删除
```
docker rm 377e6d77ebb5
```
## system
### prune
- `-a`  清理未使用的 Docker 对象（如镜像、容器、网络和卷）。使用这个命令的时候要注意，它会删掉所有没有使用的容器、网络、镜像（包括 挂起dangling和未使用unreferenced 的）
- `--volumes` 删掉所有东西，包括分配的卷，默认情况下，即使当前没有容器在使用磁盘卷volumes，为防止重要数据被删除，磁盘卷也不会被删除。
```
docker system prune -a
docker system prune -a --volumes
```
## exec
在正在运行的容器中执行命令
```
docker exec -it <container_id> /bin/bash
```
## inspect
获取某个容器的更多信息
```
docker inspect <container_name/container_id>
```
## diff 
查看容器中那些文件发生变化
```
docker diff <container_name/container_id>
```
## history
显示镜像的历史记录
```
docker history <image_id>
```
## tag
可以给镜像任意添加标签，实际是同一个镜像的别名，两条记录 ID 相同 `docker tag SOURCE_IMAGE:[TAG] TARGET_IMAGE:[TAG]`

```
docker tag ubuntu:latest myubt:latest
```
## build
根据 Dockerfile 构建镜像
```
docker build [options] path | url | -
```
- `OPTIONS`：是一系列可选参数，用于定制构建过程。
- `PATH | URL | -`：指定 Docker 构建上下文的位置。`PATH` 是本地文件系统中的路径；`URL` 可以是一个 Git 仓库地址；`-` 表示从标准输入读取 Dockerfile。

- **`-t, --tag list`**：为构建的镜像指定名称和标签，格式为 `name:tag`。如果不指定标签，默认使用 `latest`。
- **`-f, --file string`**：指定 Dockerfile 的路径。如果不指定，默认使用当前目录下的 `Dockerfile`。
- **`--no-cache`**：构建镜像时不使用缓存，强制重新构建所有层。
- **`--rm`**：构建成功后删除中间容器，默认值为 `true`。
- **`--pull`**：总是尝试拉取基础镜像的最新版本。
## network
管理 Docker 网络
### ls
列出所有 Docker 网络
```
docker network ls
```
## volume
管理 Docker 卷
### ls
列出所有卷
```
docker volume ls
```
## docker-compose
### up
使用 `docker-compose.yml` 文件启动服务。
- `-d`
### down
### pull
### save
- `-o`
## cp
在容器和本地文件系统之间复制文件
## login
登录到 Docker 仓库
## logout
## stats
实时显示容器的资源使用情况
```
docker stats
```
## top
显示容器中运行的进程
```
docker top <container_id>
```
## port
显示容器的端口映射
```
docker port <container_id>
```
## secret
管理 Docker 密钥
## save
将镜像保存为 tar 文件
- `-o` `--output` 指定输出路径和名称
```
docker save -o my-image.tar <image_id>
```
## load
从 tar 文件加载镜像
- `-i` `--input` 要加载的文件
- `--quiet` 控制是否显示加载进度
```
docker load -i my-image.tar
```
## export
将容器的文件系统导出为 tar 文件
```
docker export -o my-container.tar <container_id>
```
## import
从 tar 文件导入文件系统并创建镜像
```
docker import my-container.tar my-new-image
```
## events
实时显示 Docker 事件
```
docker events
```
## rename
```
docker rename <old_name> <new_name>
```
## update
- `--restart`