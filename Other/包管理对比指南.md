# 主流包管理器对比指南：APT vs DNF vs Pacman vs Nix

本文档系统整理了 Linux 系统中最主流的几个包管理器：APT（Debian/Ubuntu）、DNF（Fedora/RHEL）、Pacman（Arch Linux）和 Nix（NixOS）的使用方法和功能对比。

## 一、基本概念对比

| 特性 | APT/dpkg | DNF/RPM | Pacman | Nix |
|------|----------|---------|--------|-----|
| **适用发行版** | Debian, Ubuntu, Mint 等 | Fedora, RHEL, CentOS 等 | Arch Linux, Manjaro 等 | NixOS, 以及其他 Linux/macOS |
| **核心工具类型** | `dpkg` (低级), `apt` (高级) | `rpm` (低级), `dnf` (高级) | `pacman` (兼具高低级) | `nix` (声明式包管理) |
| **包格式** | `.deb` | `.rpm` | `.pkg.tar.zst` | Nix Store (符号链接) |
| **依赖管理** | 自动解决依赖 | 自动解决依赖 | 自动解决依赖 | 声明式依赖，强隔离 |
| **版本管理** | 版本锁定 | 版本锁定 | 版本锁定 | 版本可并存，可回滚 |

## 二、核心操作命令对比

| 功能描述 | APT/dpkg | DNF/RPM | Pacman | Nix |
|----------|----------|---------|--------|-----|
| **安装本地包** | `sudo dpkg -i pkg.deb` | `sudo rpm -ivh pkg.rpm` | `sudo pacman -U pkg.pkg.tar.zst` | `nix-env -i ./package.nix` |
| **安装仓库包** | `sudo apt install pkg` | `sudo dnf install pkg` | `sudo pacman -S pkg` | `nix-env -iA nixpkgs.pkg` |
| **卸载包** | `sudo apt remove pkg` | `sudo dnf remove pkg` | `sudo pacman -R pkg` | `nix-env -e pkg` |
| **卸载包及依赖** | `sudo apt autoremove pkg` | `sudo dnf autoremove pkg` | `sudo pacman -Rs pkg` | `nix-env --uninstall pkg` |
| **更新软件源列表** | `sudo apt update` | `sudo dnf check-update` | `sudo pacman -Sy` | `nix-channel --update` |
| **升级所有软件** | `sudo apt upgrade` | `sudo dnf upgrade` | `sudo pacman -Syu` | `nix-env -u` |
| **搜索软件包** | `apt search pattern` | `dnf search pattern` | `pacman -Ss pattern` | `nix-env -qaP pattern` |
| **查看包信息** | `apt show pkg` | `dnf info pkg` | `pacman -Si pkg` | `nix-env -qa --description pkg` |
| **列出已安装包** | `dpkg -l` | `rpm -qa` / `dnf list installed` | `pacman -Q` | `nix-env -q` |
| **查询文件属于哪个包** | `dpkg -S /path/to/file` | `rpm -qf /path/to/file` | `pacman -Qo /path/to/file` | `nix-store -q --roots /path/to/file` |
| **列出包内文件** | `dpkg -L pkg` | `rpm -ql pkg` | `pacman -Ql pkg` | `nix-store -q --references pkg` |
| **清理包缓存** | `sudo apt clean` | `sudo dnf clean all` | `sudo pacman -Sc` | `nix-collect-garbage` |
| **查找孤儿包** | `deborphan` (需安装) | `sudo dnf autoremove` | `pacman -Qdtq` | `nix-collect-garbage -d` |

## 三、高级功能对比

### APT 高级功能

| 功能 | 命令 |
|------|------|
| 彻底移除软件包（包括配置） | `sudo apt purge <package_name>` |
| 锁定包版本 | `sudo apt-mark hold <package_name>` |
| 解锁包版本 | `sudo apt-mark unhold <package_name>` |
| 查看包依赖 | `apt-cache depends <package_name>` |
| 查看反向依赖 | `apt-cache rdepends <package_name>` |
| 下载包但不安装 | `apt download <package_name>` |
| 检查系统依赖完整性 | `sudo apt check` |
| 仅下载包 | `apt-get download <package_name>` |
| 模拟安装（不实际执行） | `apt-get install --dry-run <package_name>` |
| 查看包变更日志 | `apt changelog <package_name>` |
| 搜索包内容 | `apt-file search <filename>` |
| 更新特定包 | `apt-get install <package_name>=<version>` |

### DNF 高级功能

| 功能 | 命令 |
|------|------|
| 重新安装包 | `dnf reinstall pkg` |
| 仅下载不安装 | `dnf download pkg` |
| 安装源码构建依赖 | `dnf builddep pkg.spec` |
| 查看依赖树 | `dnf repoquery --tree-requires pkg` |
| 启用模块流 | `dnf module enable php:7.4` |
| 禁用模块流 | `dnf module disable php` |
| 查看历史记录 | `dnf history` |
| 撤销指定事务 | `dnf history undo ID` |
| 锁定包版本 | `dnf versionlock add pkg` |
| 临时启用仓库 | `dnf --enablerepo=repo_name install pkg` |
| 查找提供特定文件的包 | `dnf provides /path/to/file` |
| 查看仓库信息 | `dnf repoinfo pkg` |
| 同步系统包版本 | `dnf distro-sync` |
| 检查系统依赖完整性 | `dnf check` |
| 查看组信息 | `dnf group info "group"` |
| 安装组 | `dnf group install "group"` |
| 启用 Copr 仓库 | `dnf copr enable user/project` |

### Pacman 高级功能

| 功能 | 命令 |
|------|------|
| 强制刷新包数据库 | `sudo pacman -Syy` |
| 清理包缓存（保留最近版本） | `sudo pacman -Sc` |
| 清理包缓存（全部删除） | `sudo pacman -Scc` |
| 重新安装包 | `sudo pacman -S --reinstall pkg` |
| 忽略包更新 | `sudo pacman -S pkg --assume-installed pkg_version` |
| 检查包完整性 | `sudo pacman -Qkk` |
| 查找提供特定文件的包 | `pacman -Fs filename` |
| 同步时间（修复 GPG 错误） | `sudo hwclock --systohc` |
| 同步时间（网络时间协议） | `sudo timedatectl set-ntp true` |
| 安装包但不确认 | `sudo pacman -S --noconfirm pkg` |
| 安装包但跳过依赖检查 | `sudo pacman -S --nodeps pkg` |
| 查看包的更新历史 | `pacman -Qi pkg` |
| 比较版本 | `vercmp version1 version2` |
| 从 AUR 安装包 | `yay -S pkg` (需要 AUR 辅助工具) |

### Nix 高级功能

| 功能 | 命令 |
|------|------|
| 进入临时开发环境 | `nix-shell -p pkg1 pkg2` |
| 使用 shell.nix 文件 | `nix-shell` |
| 构建包 | `nix-build -E 'expression'` |
| 运行包（不安装） | `nix run nixpkgs.pkg` |
| 回滚到上一环境 | `nix-env --rollback` |
| 查看环境变迁历史 | `nix-env --list-generations` |
| 切换到特定环境版本 | `nix-env --switch-generation N` |
| 删除特定环境版本 | `nix-env --delete-generations N` |
| 安装特定系统包 | `nix profile install nixpkgs#pkg` (新式) |
| 列出已安装包（新式） | `nix profile list` |
| 删除已安装包（新式） | `nix profile remove <index>` |
| 开发 shell 环境 | `nix develop` (使用 flake.nix) |
| 构建 flake | `nix build .#pkg` |
| 运行 flake 应用 | `nix run .` |
| 进入 flake 开发环境 | `nix develop .` |
| 测试 flake | `nix flake check .` |

## 四、特殊用途工具

### mise (多语言版本管理器)

虽然不是传统包管理器，但作为现代开发环境的重要工具，这里也做简要介绍：

| 命令 | 描述 |
|------|------|
| `mise install [tool]@[version]` | 安装特定工具的版本 |
| `mise use [tool]@[version]` | 在当前目录设置工具版本 |
| `mise ls` | 列出已安装的工具版本 |
| `mise ls-remote [tool]` | 列出工具的可安装版本 |
| `mise activate [shell]` | 在 shell 中激活 mise |

## 五、术语解释

- **仓库（Repository）**：包来源定义，通常为远程镜像或本地路径
- **依赖（Dependency）**：包运行所需的其他包
- **事务（Transaction）**：一次安装、升级或删除操作的完整过程
- **GPG 签名**：确保软件包来源可信、内容未篡改
- **声明式包管理**：通过配置文件声明期望的系统状态
- **不可变包管理**：包安装后不可更改，升级创建新版本
- **垃圾回收**：删除未被任何环境引用的包
- **快照（Snapshot）**：系统状态的完整记录，用于回滚
- **原子操作**：要么完全成功，要么完全失败的操作
- **符号链接（Symlink）**：指向另一个文件的链接
- **Nix Store**：Nix 系统中存储所有包的目录（通常是 /nix/store）
- **Flake**：Nix 的声明式配置格式，用于可重现的环境
- **Generation**：Nix 环境的一个版本，支持回滚
- **AUR（Arch User Repository）**：Arch Linux 社区维护的软件仓库
- **模块（Module）**：DNF 中的软件包集合，用于管理相关软件
- **Copr**：Fedora 社区构建平台，提供第三方软件包
- **Pin**：APT 中锁定特定软件包版本的机制
- **Hold**：阻止软件包被自动更新的状态

## 六、最佳实践建议

### 通用原则
1. **定期更新**：保持系统和软件包更新以获得安全补丁
2. **备份配置**：重要系统的包管理配置应定期备份
3. **测试环境**：在生产环境应用重大更新前先在测试环境验证
4. **权限管理**：了解何时需要 root 权限，何时不需要
5. **日志监控**：定期检查包管理器的日志文件
6. **依赖管理**：理解包之间的依赖关系，避免循环依赖

### 各系统特定建议

#### APT 系统
- 使用 `apt list --upgradable` 检查可升级包
- 定期运行 `apt autoremove` 清理无用依赖
- 使用 `apt-mark showhold` 检查被锁定的包
- 在重大更新前使用 `apt list --upgradable` 查看更新列表
- 使用 `apt-cache policy pkg` 检查包的可用版本和优先级
- 定期运行 `apt update` 保持包列表最新

#### DNF 系统
- 利用模块系统管理软件的不同版本流
- 定期清理缓存避免磁盘空间不足
- 使用事务历史功能追踪系统变更
- 使用 `dnf autoremove` 清理不需要的依赖
- 启用 fastestmirror 插件以提高下载速度
- 定期运行 `dnf check` 检查系统依赖完整性

#### Pacman 系统
- 定期备份 `/etc/pacman.d/` 目录
- 使用 `pacman -Qtd` 查找孤立包
- 关注 Arch Wiki 获取最新的安装和配置信息
- 在系统更新前使用 `pacman -Syu --print` 预览更新
- 定期运行 `pacman -Sc` 清理包缓存
- 使用 `pacman -Qm` 查找 AUR 安装的包

#### Nix 系统
- 学习 Nix 语言语法以充分利用其功能
- 使用 Flakes 进行声明式系统配置
- 定期运行垃圾回收释放磁盘空间
- 使用 `nix profile` 命令（新式）而非旧的 `nix-env`
- 定期检查 generations 数量，必要时清理旧版本
- 使用 `nix flake check` 验证配置的正确性

## 七、故障排除

### 常见问题解决方法

#### APT
- 修复损坏的包数据库：`sudo dpkg --configure -a`
- 修复依赖问题：`sudo apt install -f`
- 清理损坏的锁文件：`sudo rm /var/lib/dpkg/lock*`
- 修复损坏的包缓存：`sudo apt update --fix-missing`
- 强制重新配置包：`sudo dpkg-reconfigure pkg`

#### DNF
- 清理缓存并重建：`sudo dnf clean all && sudo dnf makecache`
- 重置到之前的系统状态：`sudo dnf history undo ID`
- 修复损坏的 RPM 数据库：`sudo rpm --rebuilddb`
- 解决依赖冲突：`sudo dnf --skip-broken install pkg`
- 检查系统完整性：`sudo dnf check`

#### Pacman
- 修复密钥环问题：`sudo pacman-key --init && sudo pacman-key --populate archlinux`
- 强制同步数据库：`sudo pacman -Syy`
- 修复依赖问题：`sudo pacman -S --noconfirm $(pacman -Qtdq)`
- 修复损坏的包：`sudo pacman -S --force pkg`
- 重新初始化包数据库：`sudo rm -rf /var/lib/pacman/sync/* && sudo pacman -Sy`

#### Nix
- 修复损坏的 store：`nix-store --verify --check-contents`
- 清理垃圾：`nix-collect-garbage -d`
- 修复权限问题：`sudo chown -R $(id -u):$(id -g) ~/.nix-defexpr`
- 重建包：`nix-store --realise /nix/store/hash-name.drv`
- 验证 store 完整性：`nix-store --verify --repair /nix/store/hash-name`

## 八、性能优化技巧

### APT 优化
- 并行下载：在 `/etc/apt/apt.conf.d/99parallel-downloads` 中添加 `APT::Acquire::Retries "3";`
- 使用更快的镜像源：配置地理位置最近的镜像
- 减少日志输出：`APT::Status-Fd "2";`

### DNF 优化
- 启用并行下载：在 `/etc/dnf/dnf.conf` 中设置 `max_parallel_downloads=10`
- 启用 fastestmirror：`fastestmirror=True`
- 使用 delta RPMs：`deltarpm=True`

### Pacman 优化
- 使用 SSD 存储包缓存
- 配置多个镜像源以提高下载速度
- 定期清理包缓存避免占用过多磁盘空间

### Nix 优化
- 定期运行垃圾回收释放磁盘空间
- 使用 Nix Channels 保持包集合更新
- 配置二进制缓存以加快构建速度
