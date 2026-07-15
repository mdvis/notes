包管理和项目管理工具，可替代`pip`、`virtualenv`、`pyenv`、`pipx` 等

## 核心命令

> 带 ⭐ 为常用核心命令

| 命令          | 说明                                    |
| ----------- | ------------------------------------- |
| ⭐ `init`    | 创建新项目（生成 pyproject.toml）              |
| ⭐ `add`     | 添加依赖                                  |
| ⭐ `remove`  | 移除依赖                                  |
| ⭐ `sync`    | 按 uv.lock 同步项目环境                      |
| ⭐ `lock`    | 更新 lockfile                           |
| ⭐ `run`     | 在项目环境中运行命令或脚本                         |
| ⭐ `export`  | 导出 lockfile 为其他格式（如 requirements.txt） |
| ⭐ `tree`    | 显示依赖树                                 |
| ⭐ `python`  | 管理 Python 版本与安装                       |
| ⭐ `venv`    | 创建虚拟环境                                |
| ⭐ `pip`     | pip 兼容接口                              |
| ⭐ `tool`    | 运行/安装 CLI 工具（替代 pipx）                 |
| `version`   | 读取或更新项目版本                             |
| `build`     | 构建源码分发包和 wheel                        |
| `publish`   | 上传分发包到索引                              |
| `format`    | 格式化项目代码                               |
| `check`     | 对项目运行检查                               |
| `audit`     | 审计项目依赖（安全漏洞）                          |
| `workspace` | 查看工作区信息                               |
| `auth`      | 管理认证                                  |
| `cache`     | 管理 uv 缓存                              |
| `self`      | 管理 uv 本身（更新等）                         |
| `help`      | 显示命令文档                                |

## 项目管理（推荐 workflow）

```sh
uv init my-project                # 创建新项目（生成 pyproject.toml）
cd my-project

uv python list
uv python install 3.12
uv python pin 3.12                # 固定版本到 .python-version

uv venv
uv venv --python 3.12
source .venv/bin/activate         # 可选，uv 会自动识别 .venv

uv add requests                   # 添加依赖
uv add "fastapi>=0.100"           # 指定版本
uv add --dev pytest               # 添加开发依赖
uv add --optional docs mkdocs     # 添加可选依赖

uv remove requests                # 移除依赖

uv sync                           # 根据 uv.lock 同步安装依赖（创建/激活 .venv）
uv lock                           # 仅更新 lockfile，不安装
uv tree                           # 查看依赖树

uv run python main.py             # 在项目环境中运行命令
uv run pytest                     # 运行测试
uv run test.py                    # 运行测试

uv tool install ruff              # 全局安装 cli 到隔离环境
uvx fuff check .                  # 临时运行，不安装
uv tool list
uv tool upgrade ruff
uv tool uninstall ruff

uv build
uv publish
```

pyproject.toml
```toml
[project]
name = "myproj"
version = "1.0.0"
dependencies = [ "requests" ]

[tool.uv]
dev-dependencies = [ "pytest", "ruff" ]
```

## 全局选项（各个命令通用）

- `-q, --quiet` 安静模式（可叠加 `-qq`）
- `-v, --verbose` 详细输出
- `--color <auto|always|never>` 控制颜色输出
- `--offline` 离线模式
- `--no-progress` 隐藏进度
- `--no-config` 不读取配置文件
- `--config-file <path>` 指定 `uv.toml`
- `--directory <path>` 切换到指定目录后执行（`UV_WORKING_DIR`）
- `--project <path>` 在指定目录中发现项目（`UV_PROJECT`，全局选项，未废弃）
- `-n, --no-cache` 不使用缓存
- `--cache-dir <path>` 指定缓存目录
- `-p, --python <ver>` 指定 Python 版本

## Python 版本管理

`uv python install`

- `-i, --install-dir <path>` — 指定安装目录
- `-r, --reinstall` — 已安装则重装
- `-f, --force` — 替换已存在的 Python 可执行文件
- `-U, --upgrade` — 升级到最新补丁版
- `--default` — 设为默认 Python 版本
- `--mirror <url>` — Python 下载镜像
- `--pypy-mirror <url>` — PyPy 下载镜像
- `--no-bin` — 不安装到 bin 目录
- `--no-registry` — 不注册到 Windows 注册表

`uv python list`

- `--only-installed` — 仅显示已安装
- `--only-downloads` — 仅显示可下载
- `--all-versions` — 含旧补丁版
- `--all-platforms` — 所有平台
- `--all-arches` — 所有架构
- `--show-urls` — 显示下载 URL
- `--output-format <text|json>` — 输出格式

`uv python pin`

- `--global` — 全局固定
- `--resolved` — 写入解析后的解释器路径
- `--rm` — 移除 pin
- `--no-project` — 不校验与项目兼容性

`uv python uninstall`

- `-i, --install-dir <path>` — 指定原安装目录
- `--all` — 卸载所有 uv 管理的 Python 版本

`uv python find`

- `--no-project` — 不发现项目/工作区
- `--system` — 仅查找系统 Python 解释器
- `--script <path>` — 查找脚本对应的解释器
- `--show-version` — 显示版本而非解释器路径
- `--resolve-links` — 解析输出路径中的符号链接

### 用法示例

```
# 基础用法
uv python install 3.12           # 安装 Python 3.12
uv python list                   # 列出可用版本
uv python pin 3.12               # 固定项目 Python 版本（写入 .python-version）
uv python find 3.12              # 查找已安装的 Python 路径
uv python uninstall 3.12         # 卸载

# 安装多个版本
uv python install 3.11 3.12 3.13

# 安装时设为默认并升级到最新补丁版
uv python install 3.12 --default --upgrade

# 重装指定版本到自定义目录
uv python install 3.12 --install-dir /opt/python -r

# 列出已安装版本（JSON 格式）
uv python list --only-installed --output-format json

# 查看所有可下载版本（含旧补丁版）及其 URL
uv python list --all-versions --show-urls

# 在项目中固定 Python 版本
uv python pin 3.12

# 全局固定版本
uv python pin 3.12 --global

# 写入解析后的解释器路径到 .python-version
uv python pin 3.12 --resolved

# 移除当前项目的版本固定
uv python pin --rm

# 查找已安装的 3.12 解释器路径
uv python find 3.12

# 卸载
uv python uninstall 3.12
```

## 初始化 `init`

生成 pyproject.toml，创建新项目

- `--app` — 创建应用项目（默认，生成 `main.py`）
- `--lib` — 创建库项目（生成 src/ 布局）
- `--package` — 配置为可构建发布的包（带 `[build-system]`）
- `--no-package` — 不配置为可构建包
- `--script` — 创建脚本（PEP 723）
- `--bare` — 仅生成 `pyproject.toml`，无示例文件
- `--name <name>` — 指定项目名
- `--description <desc>` — 设置项目描述
- `--no-description` — 禁用描述
- `--vcs <git|none>` — 版本控制系统（默认 git）
- `--build-backend <uv|hatch|flit|pdm|poetry|setuptools|maturin|scikit>` — 指定构建后端
- `--author-from <auto|git|none>` — 填充 authors 字段
- `--no-readme` — 不生成 README
- `--no-pin-python` — 不创建 `.python-version`
- `--no-workspace` — 不加入工作区，创建独立项目
  
  ## 添加依赖 `add`
- `--dev` — 添加到 dev 依赖组
- `--group <name>` — 添加到指定依赖组
- `--optional <name>` — 添加到 `[project.optional-dependencies]`（extras）
- `--editable` — 以可编辑模式添加（布尔标志，路径通过包参数指定）
- `--raw` — 原样写入依赖，不做版本标准化
- `--bounds <lower|major|minor|exact>` — 指定版本约束类型
- `-r, --requirements <file>` — 从 requirements 文件批量添加
- `-c, --constraints <file>` — 约束版本
- `-m, --marker <marker>` — 给所有包应用 marker
- `--rev <sha>` — 指定 Git commit（Git URL 写在包参数中，无 `--git` 选项）
- `--tag <tag>` — 指定 Git tag
- `--branch <name>` — 指定 Git 分支
- `--lfs` — 使用 Git LFS
- `--extra <name>` — 启用所添加依赖的 extras
- `--index <url>` — 额外镜像源（勿用废弃的 `--index-url`）
- `--default-index <url>` — 默认镜像源
- `--no-sync` — 仅更新 pyproject.toml 和 lockfile，不安装
- `--locked` — 断言 lockfile 不变
- `--frozen` — 不重新锁定
- `--active` — 优先使用当前激活的环境
- `--package <name>` — 添加到工作区中指定包
- `--script <path>` — 添加到 PEP 723 脚本而非项目
- `--workspace` — 作为工作区成员
- `--no-workspace` — 不作为工作区成员
- `--no-install-project` — 跳过安装当前项目
- `--no-install-workspace` — 跳过安装工作区成员
- `--no-install-local` — 跳过安装本地路径依赖
- `--no-install-package <name>` — 跳过安装指定包
  
  ## 移除依赖 `remove`
- `--dev` — 从 dev 组移除
- `--group <name>` — 从指定组移除
- `--optional <name>` — 从 optional-dependencies 移除
- `--no-sync` — 不同步环境
- `--frozen` — 不重新锁定
- `--locked` — 断言 lockfile 不变
- `--active` — 优先使用当前激活的环境
- `--package <name>` — 从工作区中指定包移除
- `--script <path>` — 从脚本移除
  
  ## 同步环境 `sync`
  
  根据 uv.lock 文件安装依赖
- `--extra <name>` — 启用指定 extra
- `--all-extras` — 启用所有 extras
- `--no-extra <name>` — 排除指定 extra
- `--dev` — 包含 dev 组（默认）
- `--no-dev` — 排除 dev 组
- `--only-dev` — 仅包含 dev 组
- `--group <name>` — 包含指定依赖组
- `--all-groups` — 包含所有依赖组
- `--no-group <name>` — 排除指定依赖组
- `--no-default-groups` — 忽略默认依赖组
- `--only-group <name>` — 仅包含指定依赖组
- `--no-editable` — 以非 editable 方式安装所有 editable 依赖
- `--no-editable-package <name>` — 指定包以非 editable 方式安装
- `--inexact` — 不移除环境中多余的包（默认会移除）
- `--exact` — （注意：sync 无此选项，`--exact` 属于 `uv run`）
- `--frozen` — 不更新 lockfile，按现有版本安装（CI 推荐）
- `--locked` — 断言 lockfile 不变
- `--dry-run` — 仅预演，不写文件
- `--check` — 检查环境是否与项目同步
- `--active` — 同步到当前激活的环境
- `--no-install-project` — 跳过安装当前项目
- `--no-install-workspace` — 跳过安装工作区成员
- `--no-install-local` — 跳过安装本地路径依赖
- `--no-install-package <name>` — 跳过安装指定包
- `--all-packages` — 同步整个工作区
- `--package <name>` — 仅同步指定包
- `--script <path>` — 为脚本同步环境
- `--python-platform <platform>` — 指定目标平台
- `--output-format <text|json>` — 输出格式
- `--reinstall` — 强制重装所有包
- `--reinstall-package <name>` — 强制重装指定包
  
  ## 更新生成 lock 文件 `lock`
- `--check` — 检查 lockfile 是否最新
- `--check-exists` — 仅断言 lockfile 存在
- `--dry-run` — 仅预演，不写文件
- `--script <path>` — 为脚本生成 lockfile
- `--upgrade` — 升级所有依赖到最新兼容版本
- `--upgrade-package <name>` — 仅升级指定包
- `--locked` — 断言 lockfile 不变
- 注：`uv lock` **没有** `--frozen` / `--no-update` 选项（lock 的职责就是更新 lockfile）
  
  ## 导出依赖 `export`
  
  将 uv.lock 导出为其他格式
- `--format <requirements.txt|pylock.toml|cyclonedx1.5>` — 输出格式（默认 requirements.txt）
- `-o, --output-file <file>` — 输出到文件
- `--extra <name>` — 启用指定 extra
- `--all-extras` — 启用所有 extras
- `--no-extra <name>` — 排除指定 extra
- `--dev` — 包含 dev 组
- `--no-dev` — 排除 dev 组
- `--only-dev` — 仅包含 dev 组
- `--group <name>` — 包含指定依赖组
- `--all-groups` — 包含所有依赖组
- `--no-group <name>` — 排除指定依赖组
- `--no-default-groups` — 忽略默认依赖组
- `--only-group <name>` — 仅包含指定依赖组
- `--all-packages` — 导出整个工作区
- `--package <name>` — 导出指定包的依赖
- `--prune <name>` — 从依赖树中剪除指定包
- `--no-hashes` — 不包含哈希值
- `--no-annotate` — 不输出注释
- `--no-header` — 不输出文件头注释
- `--emit-index-url` — 输出中包含 `--index-url` 条目
- `--emit-find-links` — 输出中包含 `--find-links` 条目
- `--no-editable` — 以非 editable 导出所有 editable 依赖
- `--no-editable-package <name>` — 指定包以非 editable 导出
- `--no-emit-project` — 不导出当前项目
- `--no-emit-workspace` — 不导出工作区成员
- `--no-emit-local` — 不导出本地路径依赖
- `--no-emit-package <name>` — 不导出指定包
- `--frozen` — 不更新 lockfile（推荐配合使用）
- `--locked` — 断言 lockfile 不变
- `--script <path>` — 导出脚本依赖
  
  ## 查看依赖树 `tree`
  
  ```
  uv tree                # 显示项目依赖树
  ```
- `-d, --depth <n>` — 最大显示深度（默认 255）
- `--package <name>` — 仅显示指定包的子树
- `--invert` — 显示反向依赖（布尔标志，包名通过 `--package` 指定）
- `--prune <name>` — 剪除指定包
- `--no-dedupe` — 不去重（重复显示已展示过的依赖）
- `--universal` — 显示平台无关的依赖树
- `--outdated` — 显示每个包的最新可用版本
- `--show-sizes` — 显示压缩 wheel 大小
- `--dev` — 包含 dev 组
- `--no-dev` — 排除 dev 组
- `--only-dev` — 仅包含 dev 组
- `--group <name>` — 包含指定依赖组
- `--all-groups` — 包含所有依赖组
- `--no-group <name>` — 排除指定依赖组
- `--no-default-groups` — 忽略默认依赖组
- `--only-group <name>` — 仅包含指定依赖组
- `--locked` — 断言 lockfile 不变
- `--frozen` — 不更新 lockfile
- `--script <path>` — 显示脚本依赖树
- `--python-version <ver>` — 按版本过滤
- `--python-platform <platform>` — 按平台过滤
  
  ## 运行脚本或命令 `run`
- `--with <pkg>` — 临时添加依赖运行（不写入 pyproject.toml）
- `--with-editable <path>` — 临时以 editable 模式添加
- `--with-requirements <file>` — 临时从 requirements 文件加载
- `--no-sync` — 不自动同步环境
- `--isolated` — 在隔离的虚拟环境中运行
- `--active` — 优先使用当前激活的环境
- `-m, --module` — 运行 Python 模块
- `-s, --script` — 作为脚本运行
- `--gui-script` — 作为 GUI 脚本运行
- `--exact` — 精确同步，移除多余包
- `--no-project` — 不发现项目/工作区
- `--all-packages` — 安装所有工作区成员
- `--package <name>` — 在指定工作区包中运行
- `--extra <name>` — 启用指定 extra
- `--all-extras` — 启用所有 extras
- `--no-extra <name>` — 排除指定 extra
- `--dev` — 包含 dev 组
- `--no-dev` — 排除 dev 组
- `--only-dev` — 仅包含 dev 组
- `--group <name>` — 包含指定依赖组
- `--all-groups` — 包含所有依赖组
- `--no-group <name>` — 排除指定依赖组
- `--no-default-groups` — 忽略默认依赖组
- `--only-group <name>` — 仅包含指定依赖组
- `--no-editable` — 以非 editable 安装所有 editable 依赖
- `--no-editable-package <name>` — 指定包以非 editable 安装
- `--env-file <file>` — 加载 `.env` 文件（注：无 `--no-env` 选项）
- `--no-env-file` — 不加载 `.env` 文件
- `--frozen` — 不更新 lockfile 运行
- `--locked` — 断言 lockfile 不变
- `--python-platform <platform>` — 目标平台
  
  ## 虚拟环境 `venv`
  
  通常无需手动创建，sync 和 run 命令会自动处理
  
  ```
  uv venv               # 在当前目录创建 .venv
  uv venv --python 3.11 # 指定 Python 版本
  uv venv myenv         # 指定路径
  ```
- `--python <ver>` — 指定 Python 版本（不存在时自动下载）
- `--seed` — 预装 pip、setuptools、wheel
- `--no-project` — 不发现项目/工作区
- `-c, --clear` — 清除目标路径已存在文件
- `--force` — 允许 `--clear` 清除非虚拟环境目录
- `--allow-existing` — 保留目标路径已存在文件
- `--prompt <name>` — 自定义终端提示符
- `--system-site-packages` — 可访问系统 site-packages
- `--relocatable` — 创建可重定位的虚拟环境
- 注：`uv venv` **没有** `--active` 选项
  
  ## 兼容 pip 的命令 `pip`
  
  ```
  uv pip install requests            # 类似 pip install，但快得多
  uv pip install -r requirements.txt
  uv pip list
  uv pip freeze
  uv pip uninstall requests
  uv pip compile requirements.in -o requirements.txt
  uv pip sync requirements.txt       # 严格匹配（多删少补，慎用）
  ```
  
  `uv pip install`
- `-r <file>` — 从文件安装
- `-e <path>` — 可编辑安装
- `--index <url>` — 额外镜像源
- `--default-index <url>` — 默认镜像源

`uv pip compile`

- `-o <file>` — 输出文件
- `--upgrade` — 升级到最新版本

`uv pip sync`

- 让环境严格匹配 requirements.txt（多删少补，慎用）

`uv pip list`

- `--outdated` — 显示可升级
- `--strict` — 校验环境
- `--format <columns|freeze|json>` — 输出格式
- `--editable` — 仅含 editable
- `--exclude-editable` — 排除 editable

`uv pip freeze`

- `--strict` — 校验环境
- `--exclude-editable` — 排除 editable
- `--path <path>` — 限制路径
  
  ## 工具管理（替代 pipx）`tool`
  
  ```
  uv tool install ruff     # 全局安装 CLI 工具到隔离环境
  uv tool run ruff check . # 临时运行（uvx 别名）
  uv tool list
  uv tool upgrade ruff
  uv tool uninstall ruff
  ```
  
  `uv tool install`
- `--with <pkg>` — 附加依赖
- `--with-requirements <file>` — 从文件加载附加依赖
- `-e, --editable` — 以 editable 模式安装目标包
- `--with-editable <path>` — 以 editable 模式附加包
- `--with-executables-from <pkg>` — 从指定包安装可执行文件
- `--force` — 强制覆盖已有安装
- `--python <ver>` — 指定 Python 版本
- `-c, --constraints <file>` — 约束版本
- `--overrides <file>` — 覆盖版本
- `--excludes <file>` — 排除包

`uv tool upgrade`

- `--all` — 升级所有工具
- `--python <ver>` — 指定 Python 版本

`uv tool uninstall`

- `--all` — 卸载所有工具

`uv tool list`

列出已通过 `uv tool install` 安装的全部 CLI 工具及其版本

- `--show-paths` — 显示每个工具环境与可执行文件的路径
- `--show-version-specifiers` — 显示安装时使用的版本约束
- `--show-with` — 显示随工具安装的附加依赖
- `--show-extras` — 显示随工具安装的 extra 依赖
- `--show-python` — 显示每个工具关联的 Python 版本
- `--outdated` — 列出可升级的工具
- `--exclude-newer <date>` — 仅列出指定日期前上传的候选包
- `-n, --no-cache` — 不使用缓存
- `--cache-dir <path>` — 指定缓存目录
- `--managed-python` — 强制使用 uv 管理的 Python
- `--no-managed-python` — 禁用 uv 管理的 Python

`uv tool run` (`uvx`)

`uvx` 是 `uv tool run` 的顶层别名，临时在隔离环境中运行 CLI 工具，无需全局安装

```
uvx ruff check .            # 临时运行 ruff（不安装到全局）
uvx --from httpx httpx      # 命令名≠包名时用 --from 指定源包
uvx --with rich myscript.py # 临时附加依赖运行
uvx -U ruff check .         # 升级到最新版本运行
```

主要选项：

- `--from <pkg>` — 指定源包（命令名≠包名时）
- `-w, --with <pkg>` — 附加依赖
- `--with-editable <path>` — 以 editable 模式附加包
- `--with-requirements <file>` — 从文件加载附加依赖
- `-c, --constraints <file>` — 约束版本
- `-b, --build-constraints <file>` — 约束构建依赖
- `--overrides <file>` — 覆盖版本
- `--isolated` — 隔离运行，忽略任何已安装的工具
- `--env-file <file>` — 加载 `.env` 文件
- `--no-env-file` — 不加载 `.env` 文件
- `--lfs` — 使用 Git LFS
- `--python-platform <platform>` — 目标平台（如 `linux`、`macos`、`windows`）
- `--torch-backend <backend>` — PyTorch 后端（如 `cpu`、`cu126`、`auto`）
- `-V, --version` — 显示 uvx 版本

索引选项：

- `--index <url>` — 额外镜像源
- `--default-index <url>` — 默认镜像源（替代废弃的 `--index-url`）
- `-i, --index-url <url>` — （已废弃，用 `--default-index`）
- `--extra-index-url <url>` — （已废弃，用 `--index`）
- `-f, --find-links <url>` — 本地查找链接位置
- `--no-index` — 忽略注册表索引（如 PyPI）
- `--index-strategy <first-index|unsafe-first-match|unsafe-best-match>` — 多索引解析策略
- `--keyring-provider <disabled|subprocess>` — keyring 认证

解析器选项：

- `-U, --upgrade` — 允许升级（忽略已有 pin）
- `-P, --upgrade-package <pkg>` — 仅升级指定包
- `--upgrade-group <group>` — 升级整个依赖组
- `--resolution <highest|lowest|lowest-direct>` — 版本选择策略
- `--prerelease <disallow|allow|if-necessary|explicit|if-necessary-or-explicit>` — 预发布策略
- `--fork-strategy <fewest|requires-python>` — 跨版本/平台选择策略
- `--exclude-newer <date>` — 排除指定日期后上传的包
- `--exclude-newer-package <pkg>` — 仅对指定包排除指定日期后的版本
- `--no-sources` — 忽略 `tool.uv.sources` 表
- `--no-sources-package <pkg>` — 对指定包忽略 sources

安装器选项：

- `--reinstall` — 重装所有包
- `--reinstall-package <pkg>` — 重装指定包
- `--link-mode <clone|copy|hardlink|symlink>` — 安装链接模式
- `--compile-bytecode` — 安装后编译字节码

构建选项：

- `-C, --config-setting <KEY=VALUE>` — 传递给构建后端的设置
- `--config-settings-package <PACKAGE:KEY=VALUE>` — 对指定包传递构建设置
- `--no-build-isolation` — 禁用构建隔离
- `--no-build-isolation-package <pkg>` — 对指定包禁用构建隔离
- `--no-build` — 不构建源码分发包
- `--no-build-package <pkg>` — 对指定包不构建源码分发包
- `--no-binary` — 不安装预构建 wheel
- `--no-binary-package <pkg>` — 对指定包不安装预构建 wheel

缓存选项：

- `-n, --no-cache` — 不使用缓存
- `--cache-dir <path>` — 指定缓存目录
- `--refresh` — 刷新所有缓存数据
- `--refresh-package <pkg>` — 刷新指定包缓存

Python 选项：

- `-p, --python <ver>` — 指定 Python 版本
- `--managed-python` — 强制使用 uv 管理的 Python
- `--no-managed-python` — 禁用 uv 管理的 Python
- `--no-python-downloads` — 禁用自动下载 Python

全局选项参见[全局选项](#全局选项各个命令通用)章节，常用包括 `-q`/`-v`、`--color`、`--offline`、`--no-progress`、`--directory`、`--project`、`--no-config`、`--config-file`

用法示例：

```
# 基础用法
uvx ruff check .                 # 临时运行 ruff 检查
uvx black --version              # 查看 black 版本
uvx pycowsay "hello"             # 运行一次性命令

# 命令名≠包名时用 --from
uvx --from httpx httpx           # 显式指定源包
uvx --from pgcli pgcli           # 包名与命令名不同时

# 附加依赖
uvx --with rich mytool           # 临时附加 rich
uvx --with-requirements reqs.txt mytool  # 从文件加载附加依赖
uvx --with-editable ./my-pkg mytool      # editable 模式附加

# 指定 Python 版本
uvx --python 3.12 ruff check .

# 隔离运行（忽略已安装的工具）
uvx --isolated ruff check .

# 升级到最新版本
uvx --upgrade ruff check .
uvx -U ruff check .
uvx -U --upgrade-package ruff ruff check .  # 仅升级 ruff

# 使用镜像源
uvx --default-index https://pypi.tuna.tsinghua.edu.cn/simple ruff
uvx --index https://mirrors.aliyun.com/pypi/simple ruff

# 不使用缓存
uvx --no-cache ruff check .

# 约束版本
uvx -c constraints.txt ruff check .

# 指定目标平台（跨平台安装）
uvx --python-platform linux ruff check .

# 不构建源码分发包（仅用预构建 wheel）
uvx --no-binary ruff
uvx --no-build ruff
```

  ## 关键文件
- pyproject.toml — 项目元数据与依赖声明
- uv.lock — 锁定所有依赖版本（应提交到 git）
- .python-version — 固定的 Python 版本
- .venv/ — 虚拟环境（一般加入 .gitignore）
