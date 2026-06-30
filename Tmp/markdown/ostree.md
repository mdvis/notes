**OSTree** 是用于 Linux 操作系统的原子式（atomic）升级系统，它像“git for OS binaries”一样管理完整的只读文件系统树（filesystem trees），支持版本化、回滚和高效差分更新。

**rpm-ostree** 是 OSTree 的 RPM 层实现（Fedora Silverblue、Kinoite 等 Atomic/Immutable 系统常用），结合了 OSTree 的原子部署和传统 RPM 包管理。

**Toolbox**（现称 Toolbx）是基于 Podman 的工具，用于在 immutable 系统上创建容器化、可变的命令行开发环境。你可以在 Toolbox 里用 `dnf` 安装工具，而不污染主机只读根文件系统。

这些技术主要用于 Fedora Silverblue 等 Atomic Desktop 系统。下面是综合、验证过的常见使用教程（基于官方文档和可靠指南）。

### 1. 系统基础：查看与更新（rpm-ostree）

在主机终端执行这些命令（无需进入 Toolbox）。

- **查看当前部署状态**：

  ```
  rpm-ostree status
  ```

  显示当前部署、挂起的变更、版本等。当前部署用 `●` 标记。

- **检查/执行更新**：

  ```
  rpm-ostree upgrade --check     # 只检查
  rpm-ostree upgrade             # 下载并准备新部署（原子式）
  rpm-ostree upgrade -r          # 更新后自动重启
  ```

- **回滚**（非常有用）：

  ```
  rpm-ostree rollback            # 切换到上一个部署
  rpm-ostree rollback -r         # 切换并重启
  ```

- **安装/卸载系统层软件**（Layering，尽量少用，避免过多层导致复杂）：

  ```
  rpm-ostree install <package>   # 如 vim, htop
  rpm-ostree uninstall <package>
  rpm-ostree override remove <package>  # 移除基础镜像中的包
  ```

- **其他常用**：
  - `rpm-ostree db diff` 或 `rpm-ostree db list`：比较部署间的包差异。
  - `rpm-ostree cleanup -p -b -r -m`：清理旧部署和缓存。

**注意**：变更后通常需要重启生效。避免大量 layering，优先用 Flatpak（GUI 应用）或 Toolbox（CLI 开发工具）。

### 2. Toolbox 基础使用

Toolbox 在 Fedora Atomic Desktops 上预装，其他 Fedora 版可用 `sudo dnf install toolbox` 安装。

#### 创建与进入

```bash
toolbox create                  # 创建默认 Toolbox（匹配主机版本）
toolbox create --release f40    # 指定 Fedora 版本
toolbox create mydev            # 自定义名称
toolbox enter                   # 进入默认
toolbox enter mydev             # 进入指定
```

进入后提示符通常有 ♦ 符号（取决于 shell 主题）。里面是可变环境，可用 `dnf` 自由安装包。

#### 运行命令（无需进入）

```bash
toolbox run <command>           # 在默认 Toolbox 中运行
toolbox run -c mydev gcc --version
```

#### 列表与清理

```bash
toolbox list                    # 列出容器和镜像
toolbox list -c                 # 只列容器
toolbox rm mydev                # 删除容器
toolbox rmi <image>             # 删除镜像（-a 删除全部）
```

#### 退出

在 Toolbox 内输入 `exit` 或 Ctrl+D。

**提示**：

- Toolbox 共享你的 home 目录、D-Bus 等，GUI 应用通常能直接运行（但菜单项可能需手动添加）。
- 可创建多个 Toolbox 用于不同项目/不同发行版（e.g., `--distro ubuntu` 或自定义 image）。
- 开发时优先在 Toolbox 里安装编译器、SDK、库等。

### 3. 软件安装推荐策略（Silverblue 等系统）

1. **GUI 应用** → **Flatpak**（Flathub）：`flatpak install flathub org.example.App`
2. **CLI / 开发工具** → **Toolbox**
3. **必须系统级**（驱动、内核模块等）→ **rpm-ostree layering**（少用）

### 4. 进阶 OSTree 命令（底层）

- `ostree admin status` / `ostree log` 等（rpm-ostree 通常够用）。
- 纯 OSTree Hello World 示例（测试环境）可参考官方：init repo、commit、checkout。

### 5. 常见问题与最佳实践

- **更新后不生效**：确认重启，并用 `rpm-ostree status` 检查 pending deployment。
- **空间不足**：用 `rpm-ostree cleanup` 清理旧部署。
- **GUI 从 Toolbox 启动**：通常直接运行即可；菜单项可用工具导出 .desktop 文件。
- **权限**：Toolbox 内以你的用户身份运行，无需 sudo（但 dnf 需要）。
- **备份**：immutable 系统本身稳定，但 `/var` 和 home 仍需备份。
- 避免在 Toolbox 内做危险操作（它不是完整沙箱）。

更多官方资源：

- Toolbx 文档：https://docs.fedoraproject.org/en-US/atomic-desktops/toolbox/
- rpm-ostree 手册和 Silverblue 指南。
- OSTree 官网：https://ostreedev.github.io/ostree/

这个教程基于官方文档和可靠 Fedora 资源验证，适用于 Fedora Silverblue/Kinoite 等 OSTree-based 系统。实际操作时建议先在测试环境中练习 rollback 功能。遇到具体问题可提供更多细节进一步解答！
