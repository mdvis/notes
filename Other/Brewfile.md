### Brewfile 相关用法概述

Brewfile 是 Homebrew（macOS/Linux 包管理器）的一个配置文件，用于记录已安装的软件包（formulae、casks 等），便于在不同机器上复现环境。`brew bundle` 子命令是管理 Brewfile 的核心工具。下面是主要用法总结，基于官方文档。

#### 1. **生成 Brewfile（Dump 已安装依赖）**
   - 命令：`brew bundle dump --file=~/Brewfile`
   - 功能：将当前已安装的 Homebrew 软件、cask、tap 等导出到指定文件（默认当前目录）。
   - 常用选项：
     - `--force`：覆盖现有文件。
     - `--describe`：为每个条目添加描述注释。
     - `--global`：使用全局路径（如 `~/.Brewfile`）。
   - 示例：运行后，Brewfile 会包含类似以下内容：
     ```
     tap "homebrew/cask"
     brew "git"
     cask "visual-studio-code"
     ```

#### 2. **从 Brewfile 安装依赖（Install）**
   - 命令：`brew bundle install --file=~/Brewfile`
   - 功能：根据 Brewfile 安装或升级所有列出的依赖。
   - 常用选项：
     - `--no-upgrade`：不升级已安装的包（默认行为，可通过环境变量 `$HOMEBREW_BUNDLE_NO_UPGRADE=1` 启用）。
     - `--force`：强制安装/覆盖。
     - `--cleanup`：安装后清理未列出的包。
     - `--global`：从全局 Brewfile 读取。
   - 示例：用于新机器快速设置环境。

#### 3. **清理未列出依赖（Cleanup）**
   - 命令：`brew bundle cleanup --file=~/Brewfile`
   - 功能：卸载 Brewfile 中未列出的已安装包，保持环境干净。
   - 常用选项：
     - `--force`：实际执行卸载（否则仅检查并退出 1）。
     - `--zap`：对 cask 使用 `zap` 命令彻底清理。

#### 4. **检查依赖（Check）**
   - 命令：`brew bundle check --file=~/Brewfile`
   - 功能：验证 Brewfile 中的所有依赖是否已安装。如果一切正常，返回成功退出码（适合脚本使用）。
   - 选项：`--verbose` 或 `-v`：列出缺失的依赖。

#### 5. **列出 Brewfile 中的依赖（List）**
   - 命令：`brew bundle list --file=~/Brewfile`
   - 功能：显示 Brewfile 内容，默认仅列出 formulae。
   - 选项：
     - `--all`：显示所有类型（formulae、casks、taps 等）。
     - `--cask`：仅 casks。
     - `--tap`：仅 taps。

#### 6. **编辑 Brewfile**
   - 命令：`brew bundle edit --file=~/Brewfile`
   - 功能：用默认编辑器打开 Brewfile，便于手动修改。

#### 7. **添加/移除条目**
   - 添加：`brew bundle add git`（默认添加 formulae）；用 `--cask` 添加 cask，如 `brew bundle add --cask firefox`。
   - 移除：手动编辑 Brewfile，或使用 cleanup 间接移除。

#### 注意事项
- Brewfile 支持多种类型：`brew`（formulae）、`cask`（GUI 应用）、`tap`（仓库）、`mas`（Mac App Store）、`whalebrew`（Docker 容器）、`vscode`（VS Code 扩展）。
- 环境变量可自定义行为，如 `$HOMEBREW_BUNDLE_FILE_GLOBAL` 指定全局文件。
- 更多细节见官方文档。 如果你是 Homebrew 新手，先确保已安装：`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`。有具体问题可以再问！