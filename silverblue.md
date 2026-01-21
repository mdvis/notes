### Fedora Silverblue 完整使用流程指南

Fedora Silverblue 是 Fedora 的不可变（immutable）桌面变体，核心系统以原子方式更新，高度稳定且易于回滚。设计理念是：

- **主机系统保持最小化、不可变**：只包含核心组件，避免直接用 `dnf` 安装 RPM 污染系统。
- **GUI 应用** → 用 **Flatpak**（沙盒化、跨发行版）。
- **CLI/开发工具** → 用 **Toolbox** 或 **Distrobox** 容器（隔离、可变环境）。
- **极少数需要** → 用 `rpm-ostree override/layer` 安装 RPM（不推荐，易破坏原子性）。

以下是**从新安装到日常维护的完整使用流程**，按阶段组织，全部基于官方推荐方式（2026 年最新实践基本不变）。

#### 1. 首次启动与基础配置（安装后立即做）
- **更新系统**（必须第一步）：
  ```bash
  rpm-ostree update
  # 如果有新映像，下载后重启
  systemctl reboot
  ```
- **启用 Flathub**（Flatpak 官方仓库）：
  ```bash
  flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
  flatpak remote-add --if-not-exists flathub-beta https://dl.flathub.org/beta/flathub-beta.flatpakrepo  # 可选，测试版
  ```

- **安装常用 Flatpak 应用**（示例）：
  ```bash
  flatpak install flathub org.mozilla.firefox
  flatpak install flathub com.visualstudio.code
  flatpak install flathub com.spotify.Client
  flatpak install flathub org.gnome.Extensions  # 或 Extension Manager
  ```

#### 2. 日常应用管理
##### GUI 应用（推荐全部用 Flatpak）
- **搜索应用**：
  ```bash
  flatpak search <关键词>
  ```
- **安装/卸载/更新**：
  ```bash
  flatpak install flathub <app-id>
  flatpak uninstall <app-id>
  flatpak update          # 更新所有 Flatpak 应用
  ```
- **管理**：用 GNOME Software（系统自带）或 Flatseal（权限管理）：
  ```bash
  flatpak install flathub com.github.tchx84.Flatseal
  ```

##### CLI 与开发工具（推荐 Toolbox 或 Distrobox）
**Toolbox**（官方首选，紧密集成 Fedora）：
- 创建容器（默认与主机同版本）：
  ```bash
  toolbox create                # 默认名为 fedora
  toolbox create -c mydev       # 自定义容器名
  ```
- 进入容器：
  ```bash
  toolbox enter                 # 或 toolbox enter mydev
  ```
- 在容器内像普通 Fedora 一样使用 dnf：
  ```bash
  sudo dnf install git vim python3 nodejs gcc make ...
  sudo dnf groupinstall "Development Tools"
  ```
- 项目代码放在主机 `~/projects`，容器会自动挂载 `$HOME`。

**Distrobox**（更灵活，想用 Ubuntu/Arch 等）：
- 先安装（用 layering，一次性）：
  ```bash
  rpm-ostree install distrobox
  systemctl reboot
  ```
- 创建容器：
  ```bash
  distrobox create --name ubuntu --image ubuntu:24.04
  distrobox enter ubuntu
  ```

**对比**：
- 用 Toolbox：最简单、官方推荐、性能最好。
- 用 Distrobox：需要其他发行版工具链时。

#### 3. 系统更新与维护
- **日常更新**（每周或需要时）：
  ```bash
  rpm-ostree update          # 检查并应用新系统映像
  flatpak update             # 更新所有 Flatpak
  toolbox enter && sudo dnf update  # 更新容器（可选自动）
  ```
- **查看状态**：
  ```bash
  rpm-ostree status          # 显示当前部署、待处理更新
  ostree admin status        # 更详细
  ```
- **清理旧版本**（释放空间）：
  ```bash
  rpm-ostree cleanup -p      # -p 表示 pending
  rpm-ostree override remove --clean  # 清理 layering（如果用过）
  ```

#### 4. 系统回滚与故障恢复（Silverblue 最大优势）
- **查看历史部署**：
  ```bash
  rpm-ostree status
  ```
- **回滚到上一个版本**（如果更新后出问题）：
  ```bash
  rpm-ostree rollback
  systemctl reboot
  ```
- **完全重置系统**（保留用户数据）：
  ```bash
  rpm-ostree reset           # 重置所有 layering/override
  # 或极端情况
  rpm-ostree rebase fedora:fedora/41/x86_64/silverblue  # 换到特定版本
  ```

#### 5. 高级/可选操作（谨慎使用）
- **Layering RPM**（不推荐，只在 Flatpak/Toolbox 无法满足时）：
  ```bash
  rpm-ostree install <package>      # 会创建新部署，重启生效
  rpm-ostree override remove <package>  # 移除
  ```
  示例：安装 NVIDIA 驱动、多媒体编解码器（推荐用 RPM Fusion）：
  ```bash
  rpm-ostree install https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm
  ```

- **自定义启动参数**（GRUB）：
  ```bash
  rpm-ostree kargs --append="mitigations=off"  # 示例
  ```

- **Podman/Docker**：直接在主机用 Podman（无特权），或在 Toolbox 内用 Docker。

#### 6. 最佳实践总结
- **优先级**：Flatpak > Toolbox/Distrobox > layering RPM（尽量避免）。
- **数据备份**：用户文件在 `/home`，定期备份到外部或云端。
- **性能**：Silverblue 启动快、更新原子化，几乎不会因为软件冲突崩溃。
- **学习资源**：
  - 官方文档：https://docs.fedoraproject.org/en-US/fedora-silverblue/
  - 社区：Universal Blue（ublue.it）提供定制镜像（如 Bazzite 游戏版、Bluefin 开发版）。

按这个流程使用，Silverblue 会非常稳定且高效。有什么具体场景（如游戏、开发特定语言）需要深入配置，随时问我！