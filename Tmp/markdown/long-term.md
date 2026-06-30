---

# Debian 长期维护实践指南

## 核心思想

把“系统状态”变成 **声明式** + **可版本管理**。目标是：**半年后重装系统，半小时内恢复工作状态**。

维护分为四层：

1. 系统配置（dotfiles）
2. 已安装软件（app list）
3. 服务/容器配置（container config）
4. 用户数据（documents / media / databases）

---

## 1. dotfiles：核心配置管理

### 推荐工具：`chezmoi`

安装：`sudo apt install chezmoi`

初始化并拉取已有仓库：

```bash
chezmoi init https://github.com/你/dotfiles.git
chezmoi apply
```

优势：
- 自动管理软链接
- 支持模板（按主机/OS 差异配置）
- 可加密敏感信息（如 API key）
- 新机器 5 分钟恢复环境

### 简单备选：GNU Stow 或纯 Git + 软链接

```bash
ln -s ~/dotfiles/.zshrc ~/.zshrc
```

### 推荐目录结构

```
~/.local/share/chezmoi/
├── dot_bashrc
├── dot_config/
│   ├── nvim/
│   ├── kitty/
│   └── tmux/
└── .chezmoiscript   # 安装后自动执行的脚本
```

---

## 2. app list：记录装过的软件

### 方案一：手写显式安装列表（推荐）

```text
# packages.txt
git
neovim
tmux
docker.io
ripgrep
fzf
```

恢复：`xargs sudo apt install -y < packages.txt`

优点：干净、可读、不引入依赖包。

### 方案二：导出 apt-mark 手动安装包

```bash
apt-mark showmanual > manual-packages.txt
```

恢复：`xargs -a manual-packages.txt sudo apt install -y`

### 扩展：Flatpak / pipx / cargo

```bash
flatpak list --app > flatpak-apps.txt
pipx list
cargo install --list
```

这些也应纳入版本管理。

---

## 3. 容器配置：必须 Git 化

**不要**只敲 `docker run` 命令，必须使用 Compose 文件。

### 推荐目录结构

```
~/containers/
├── jellyfin/
│   ├── compose.yaml
│   └── .env
├── immich/
│   └── compose.yaml
└── postgres/
```

每个服务独立目录，`compose.yaml` 和 `.env` 纳入 Git（`.env` 可加密或忽略）。

### 启动命令

```bash
docker compose up -d
```

### 更轻量的选择：Podman

```bash
sudo apt install podman podman-compose
```

### 容器的数据卷（volumes）必须备份

`/config`、`/data`、`/db` 等挂载目录要纳入数据备份。

---

## 4. 数据备份：真正值钱的部分

遵循 **3-2-1 原则**（3 份拷贝，2 种介质，1 份异地）。

### 推荐工具

| 工具 | 特点 |
|------|------|
| **Restic** | 加密、去重、支持多后端（B2/S3/本地） |
| **BorgBackup** | 去重率高，压缩强，适合本地/NAS |
| **Syncthing** | 多设备实时同步（文档/照片） |
| **Timeshift** | 系统快照回滚（不备份个人数据） |

### 备份策略分层

| 数据类型 | 工具 | 频率 | 目的地 |
|----------|------|------|--------|
| dotfiles & 配置 | Git | 每次变更 | GitHub/GitLab |
| 容器数据卷 | Restic / Borg | 每日 | NAS / 外置硬盘 |
| 文档、照片、密码库 | Restic + Syncthing | 实时/每日 | 远程云（B2/OneDrive） |
| 大文件、媒体 | rsync + 外部硬盘 | 每周 | 冷存储 |

### 自动化：systemd.timer

比 cron 日志更清晰。示例：

```bash
# /etc/systemd/system/backup.service
[Service]
ExecStart=/home/user/bin/restic-backup.sh

# /etc/systemd/system/backup.timer
[Timer]
OnCalendar=daily
```

---

## 5. 整体工作流：从零恢复一台 Debian

假设你已准备好：

- 一个私有的 **dotfiles 仓库**（含 chezmoi 配置）
- 一个 **containers 仓库**（所有 compose 文件）
- 一个 **packages.txt** 显式包列表
- 一个 **bootstrap.sh** 自动化脚本
- **Restic/Borg** 备份数据（独立于系统）

### 新机器恢复步骤

1. 安装 Debian minimal
2. 安装 `git` 和 `chezmoi`
3. 克隆并应用 dotfiles：
   `chezmoi init https://github.com/你/dotfiles.git && chezmoi apply`
4. 安装软件包：
   `xargs -a packages.txt sudo apt install -y`
5. 拉取容器配置并启动：
   `git clone .../containers && cd containers && docker compose up -d`
6. 恢复数据：
   `restic restore latest --target ~/`

30 分钟内回到熟悉的工作环境。

---

## 6. 进阶：半声明式系统

虽然 Debian 不像 NixOS 完全声明式，但能做到 **80% 可重建**。

### 可选增强

- **Ansible**：编写 playbook 管理多台机器
- **Nix + Home Manager**：在 Debian 上叠加 Nix，统一管理用户软件和配置
- **Immutable 发行版**：Fedora Atomic / openSUSE MicroOS（完全换发行版）

> 建议：先做好基础的四层管理，不要一上来追求全自动。否则你最后维护的是“维护系统本身”。

---

## 7. 你现在最应该做的事（优先级）

### 第一阶段（今天就做）
- 用 `chezmoi` 管理 `~/.bashrc`、`~/.gitconfig`、`~/.config/nvim`
- 为每个容器写 `compose.yaml` 并推送到 Git
- 用 Restic/Borg 备份一次重要数据

### 第二阶段（本周完成）
- 整理 `packages.txt` 显式列表
- 写一个 `bootstrap.sh` 脚本
- 设置 systemd.timer 自动备份

### 第三阶段（可选）
- 学习 Ansible 或 Nix
- 将个人笔记/密码库也纳入 Git

---

## 总结：你的最终维护架构

```
GitHub/GitLab
├── dotfiles        (chezmoi 仓库)
├── containers/     (compose 文件)
├── scripts/        (bootstrap.sh, 备份脚本)
└── docs/           (README, 架构记录)

NAS / 外置硬盘 / B2
└── restic/borg 仓库   (加密、去重、每日备份)
```

这套方案已经在许多 Debian 桌面用户和 homelab 玩家身上验证可行，维护成本低，恢复速度快。
