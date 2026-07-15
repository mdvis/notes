目前（基于 Colima 官方文档和最新公开信息），**colima model** 子命令**没有内置的删除/移除单个模型的命令**（如 `colima model rm`、`delete`、`remove`、`unload`、`prune` 等都不存在）。

`colima model` 目前只支持：
- `colima model run <model>`
- `colima model serve <model>`

没有 list、pull、remove 等管理命令。

### 如何实际删除/清理模型

Colima 的 AI 模型功能依赖 `--vm-type krunkit` + Docker（或 ramalama）运行时，模型本质上是**作为容器镜像或 volume 存储在 Colima VM 内部**。

删除方式有以下几种，按推荐顺序：

1. **最彻底且推荐的方式：删除整个 profile（包含所有模型）**  
   ```bash
   colima delete --data --force
   # 或指定 profile
   colima delete ai-profile --data --force
   ```
   - `--data` 会同时删除所有容器数据（包括下载的模型镜像/文件）。
   - 之后再 `colima start --vm-type krunkit ...` 就相当于全新环境，模型全没了。
   - 适合：你只跑过几个模型，不想留任何残留。

2. **只想删模型、不删其他容器数据**  
   进入 VM 内部手动清理（因为目前没有 CLI 封装）：

   ```bash
   colima start   # 确保 VM 运行（用 krunkit 的 profile）
   colima ssh
   ```

   在 VM 里面执行（根据你用的 runner）：

   - 如果用默认 **docker runner**：
     ```bash
     docker images | grep ai    # 看有哪些 AI 相关的镜像
     docker rmi <image-id 或 image:tag>   # 逐个删除
     # 或者强制清理所有未使用的
     docker system prune -a --volumes --force
     ```

   - 如果用 **--runner ramalama**：
     Ramalama 通常把模型存在特定目录或作为容器 volume，常见路径：
     ```bash
     sudo du -sh /var/lib/ramalama   # 或 ~/.local/share/ramalama（视配置）
     # 删除方式示例（小心操作）
     rm -rf /path/to/specific/model
     # 或直接 prune ramalama（如果有命令）
     ramalama prune   # （如果 ramalama 支持，视版本）
     ```

   退出 VM 后：
   ```bash
   exit
   ```

3. **极简暴力清理（不推荐日常用，但有效）**  
   直接删 Colima 的磁盘文件（模型数据都在磁盘里）：
   ```bash
   colima stop
   rm -rf ~/.colima/<profile>/disks/*
   # 然后 colima start 会重建磁盘（数据丢失）
   ```
   - 注意：这会丢失**所有**容器数据，包括普通 Docker 镜像/volume。

### 小结与建议

| 目标                     | 推荐命令/方法                              | 会不会删其他数据 | 麻烦程度 |
|--------------------------|--------------------------------------------|------------------|----------|
| 删所有模型 + 其他数据    | `colima delete --data`                     | 是               | 低       |
| 只删模型，保留普通容器   | `colima ssh` → `docker system prune -a` 或手动 rm ramalama 文件 | 否（小心操作）   | 中       |
| 快速重置一切             | `colima delete --data && colima start ...` | 是               | 低       |

目前 Colima 的 AI 模型管理还比较原始（功能刚出不久），后续版本可能会加 `colima model rm/list/pull` 等命令。  
如果你经常用 AI 模型，建议关注 GitHub 项目：https://github.com/abiosoft/colima ，或在 issue 里搜/提 “model remove” 相关需求。

需要我帮你写具体的清理脚本，或者解释某个步骤更详细，随时说！