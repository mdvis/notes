包管理和项目管理工具，可替代`pip`、`virtualenv`、`pyenv`、`pipx` 等
## 项目管理（推荐 workflow）
```
uv init my-project                # 创建新项目（生成 pyproject.toml）
uv init --app / --lib / --package # 指定项目类型

cd my-project

uv add requests                   # 添加依赖到 pyproject.toml + 更新 lockfile
uv add --dev pytest               # 添加开发依赖
uv add "fastapi>=0.100"           # 指定版本

uv remove requests                # 移除依赖

uv run python main.py             # 在项目环境中运行命令
uv run pytest                     # 运行测试

uv sync                           # 根据 uv.lock 同步安装依赖（创建/激活 .venv）
uv export -o requirements.txt
uv lock                           # 仅更新 lockfile，不安装
uv tree                           # 查看依赖树
```
## 全局选项（各个命令通用）
- `-q, --quiet` 安静模式
- `-qq`
- `-v, --verbose` 详细输出
- `--python <ver>` 指定 python 版本
- `--no-cache` 不使用缓存
- `--offline` 离线模式
- `--project <path>, --director <path>` 指定项目目录 
## Python 版本管理
```
uv python install 3.12 # 安装 Python 3.12
uv python list         # 列出可用版本
uv python pin 3.12     # 固定项目 Python 版本（写入 .python-version）
```
## 初始化 init
生成 pyproject.toml，创建新项目
- `--lib` 
- `--app`
- `--package, --myproject`
## 添加依赖 add
- `--dev` 
- `--group <name>`
- `<lib_name>>=<ver>` 
- `-r <file>`
## 移除依赖 remove
- `--dev` 
## 同步环境 sync
根据 uv.lock 文件安装依赖
- `--dev` 
- `--all-extras` 
- `--all-groups` 
- `--exact` 
## 更新生成 lock 文件 lock
- `--frozen` 
## 导出依赖 export
- `--format` 
## 运行脚本或命令 run
- `--with` 
- `--python` 
- `--all-extras, --extra <name>` 
- `--all-groups` 
- `--frozen` 
- `--active` 
## 虚拟环境
通常无需手动创建，sync 和 run 命令会自动处理
```
uv venv               # 在当前目录创建 .venv
uv venv --python 3.11 # 指定 Python 版本
uv venv myenv         # 指定路径
```
## 兼容 pip 的命令
```
uv pip install requests # 类似 pip install，但快得多
uv pip install -r requirements.txt
uv pip list
uv pip freeze
uv pip uninstall requests
uv pip compile requirements.in -o requirements.txt
```
## 工具管理（替代 pipx）
```
uv tool install ruff     # 全局安装 CLI 工具到隔离环境
uv tool run ruff check . # 临时运行（类似 pipx run）
uv tool list
uv tool upgrade ruff
uv tool uninstall ruff
```
## 常用一次性命令
```
uv run --with rich python -c "import rich; print('hi')" # 临时加包运行
uvx ruff check .                                        # uv tool run = pipx run
```
## 关键文件
- pyproject.toml — 项目元数据与依赖声明
- uv.lock — 锁定所有依赖版本（应提交到 git）
- .python-version — 固定的 Python 版本
- .venv/ — 虚拟环境（一般加入 .gitignore）
## 典型流程
```
uv init demo && cd demo
uv add fastapi uvicorn
uv run uvicorn main:app --reload
```