日常最常用的就四个
1. uv add
2. uv sync
3. uv run
4. uv lock。
## Python 版本管理
```
uv python install 3.12 # 安装 Python 3.12
uv python list         # 列出可用版本
uv python pin 3.12     # 固定项目 Python 版本（写入 .python-version）
```
## 项目管理（推荐 workflow）
```
uv init my-project                # 创建新项目（生成 pyproject.toml）
uv init --app / --lib / --package # 指定项目类型

cd my-project

uv add requests                   # 添加依赖到 pyproject.toml + 更新 lockfile
uv add --dev pytest               # 添加开发依赖
uv add "fastapi>=0.100"           # 指定版本

uv remove requests                # 移除依赖

uv sync                           # 根据 uv.lock 同步安装依赖（创建/激活 .venv）
uv run python main.py             # 在项目环境中运行命令
uv run pytest                     # 运行测试
uv lock                           # 仅更新 lockfile，不安装
uv tree                           # 查看依赖树
```
## 虚拟环境
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