### macOS 中的 launchctl 详细介绍

launchctl 是 macOS（以及 Darwin 内核系统）中用于管理 launchd 的命令行工具。launchd 是 macOS 的系统初始化守护进程（类似于 Linux 中的 systemd 或 init），负责启动和管理系统级守护进程（daemons）和用户级代理进程（agents）。它于 macOS 10.4 Tiger 引入，取代了传统的 rc 脚本和 cron 机制，提供更高效的按需启动（on-demand launching）、资源管理和调度功能。launchctl 不直接与 launchd 交互，而是通过它来加载、卸载、启用/禁用服务，并控制服务的生命周期。

launchd 的核心优势在于：
- **按需启动**：服务仅在需要时启动（如网络请求或文件变化），减少系统资源消耗。
- **统一管理**：支持定时任务、文件监控、网络监听等多种触发器。
- **安全性**：服务以特定用户/组运行，并支持沙箱和资源限制。
- **兼容性**：从 macOS 10.4 开始支持，直至当前版本（macOS 15 Sequoia，2024 年发布）基本保持稳定，但 launchctl 在 macOS 10.11 El Capitan 后引入了新的子命令语法（v2），旧语法（v1）已弃用。

下面将从配置、命令、使用示例和最佳实践等方面详细说明。

#### 1. 配置服务：launchd.plist 文件
launchd 服务通过 XML 格式的属性列表（plist）文件配置。这些文件定义服务的行为、触发条件和环境。plist 文件必须是有效的 XML，根元素为 `<dict>`。

##### plist 文件位置
根据服务类型和作用域，文件存储在不同目录：
| 目录路径 | 描述 | 所有者 | 示例用途 |
|----------|------|--------|----------|
| `/System/Library/LaunchDaemons/` | Apple 系统级守护进程（daemon），系统启动时运行，不受用户登录影响。 | root | 系统核心服务，如内核扩展加载。 |
| `/System/Library/LaunchAgents/` | Apple 用户级代理进程（agent），所有用户可见。 | root | 用户界面相关服务。 |
| `/Library/LaunchDaemons/` | 第三方系统级守护进程，所有用户可见，需 root 权限。 | root | 全局服务，如数据库守护进程。 |
| `/Library/LaunchAgents/` | 第三方用户级代理进程，所有用户可见。 | root | 全局用户任务。 |
| `~/Library/LaunchAgents/` | 当前用户专属代理进程，仅登录用户可见。 | 用户 | 个人脚本自动化。 |

- **文件命名**：通常以 `.plist` 结尾，文件名应为逆 DNS 格式（如 `com.example.myservice.plist`），以避免冲突。
- **权限**：daemon 文件为 644（root 拥有），agent 文件为 644（用户拥有）。文件不应可写（mode 600 或 400）。

##### plist 关键键（Keys）
plist 的核心是一个 `<dict>`，包含以下常用键（基于 launchd.plist(5) man page）：

| 键名 | 类型 | 描述 | 示例 |
|------|------|------|------|
| `Label` | `<string>` | **必需**：唯一标识服务名，用于 launchctl 引用。 | `<key>Label</key><string>com.example.myservice</string>` |
| `Program` | `<string>` | **可选**：可执行文件路径（若无 `ProgramArguments`，则必需）。 | `<key>Program</key><string>/usr/local/bin/myscript</string>` |
| `ProgramArguments` | `<array of <string>>` | **可选**：程序及其参数数组（推荐使用）。 | `<key>ProgramArguments</key><array><string>/usr/bin/python</string><string>/path/to/script.py</string></array>` |
| `KeepAlive` | `<boolean>` 或 `<dict>` | **可选**：控制服务持久性。`true` 表示持续运行；`false`（默认）表示按需启动。字典形式支持条件，如 `<key>SuccessfulExit</key><true/>`（成功退出后重启）。 | `<key>KeepAlive</key><true/>` |
| `RunAtLoad` | `<boolean>` | **可选**：加载 plist 时立即运行服务（默认 `false`）。 | `<key>RunAtLoad</key><true/>` |
| `StartInterval` | `<integer>` | **可选**：每 N 秒运行一次（类似 cron）。 | `<key>StartInterval</key><integer>300</integer>`（每 5 分钟） |
| `StartCalendarInterval` | `<dict>` 或 `<array of <dict>>` | **可选**：基于日历调度（如 cron）。子键：`Minute`、`Hour`、`Day`、`Weekday`（0/7=周日）、`Month`。 | `<key>StartCalendarInterval</key><dict><key>Hour</key><integer>13</integer><key>Minute</key><integer>45</integer></dict>`（每天 13:45） |
| `WatchPaths` | `<array of <string>>` | **可选**：文件/路径变化时启动。 | `<key>WatchPaths</key><array><string>/var/log/mylog</string></array>` |
| `QueueDirectories` | `<array of <string>>` | **可选**：目录非空时启动，并保持运行直到清空。 | `<key>QueueDirectories</key><array><string>/var/spool/myqueue</string></array>` |
| `Sockets` | `<dict of <dict>>` | **可选**：网络套接字监听，按需启动。子键：`SockServiceName`（端口）、`SockType`（`stream` 为 TCP、`dgram` 为 UDP）、`SockFamily`（`IPv4`）。 | `<key>Sockets</key><dict><key>Listeners</key><dict><key>SockServiceName</key><string>8080</string><key>SockType</key><string>stream</string></dict></dict>` |
| `UserName` / `GroupName` | `<string>` | **可选**：以指定用户/组运行（仅 root 加载时有效）。 | `<key>UserName</key><string>myuser</string>` |
| `WorkingDirectory` | `<string>` | **可选**：工作目录。 | `<key>WorkingDirectory</key><string>/tmp</string>` |
| `StandardOutPath` / `StandardErrorPath` | `<string>` | **可选**：重定向 stdout/stderr 到文件（调试用）。 | `<key>StandardOutPath</key><string>/var/log/myservice.out</string>` |
| `EnvironmentVariables` | `<dict of <string>>` | **可选**：设置环境变量。 | `<key>EnvironmentVariables</key><dict><key>PATH</key><string>/usr/local/bin:$PATH</string></dict>` |
| `Nice` | `<integer>` | **可选**：进程优先级（-20 到 20）。 | `<key>Nice</key><integer>10</integer>` |
| `Disabled` | `<boolean>` | **可选**：禁用服务（默认 `false`）。 | `<key>Disabled</key><true/>` |

- **MachServices**：用于 Mach 端口注册，支持 on-demand 服务。
- **资源限制**：`SoftResourceLimits` / `HardResourceLimits`（`<dict of <integer>>`），如 `CPU`（CPU 时间秒数）、`FileSize`（文件大小字节）。
- **完整示例**（简单持续运行脚本）：
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
  <plist version="1.0">
  <dict>
      <key>Label</key>
      <string>com.example.myservice</string>
      <key>ProgramArguments</key>
      <array>
          <string>/bin/sh</string>
          <string>/path/to/myscript.sh</string>
      </array>
      <key>KeepAlive</key>
      <true/>
      <key>RunAtLoad</key>
      <true/>
      <key>StandardOutPath</key>
      <string>/var/log/myservice.log</string>
  </dict>
  </plist>
  ```

#### 2. launchctl 命令详解
launchctl 的语法为 `launchctl [subcommand] [specifier] [arguments]`。从 macOS 10.11 开始，使用 v2 子命令（推荐）；旧 v1 语法（如 `load/unload`）已弃用，但仍兼容。

##### 域指定符（Specifiers）
子命令常需指定域（domain）或服务：
- `system/[service-name]`：系统域（root 权限修改）。
- `user/[uid]/[service-name]`：用户域（UID 如 `501`）。
- `gui/[uid]/[service-name]`：GUI 登录域（更方便）。
- `login/[asid]/[service-name]`：登录会话域（ASID 为审计会话 ID）。
- `pid/[pid]/[service-name]`：进程域。
- `session/[asid]/[service-name]`：会话域。

示例：`system/com.apple.myservice`。

##### 主要子命令
| 子命令 | 描述 | 示例 |
|--------|------|------|
| `bootstrap domain-target [path ...]` | 加载（bootstrap）服务或域。路径可为 plist、XPC 捆绑或目录。 | `launchctl bootstrap system /Library/LaunchDaemons/com.example.plist` |
| `bootout domain-target [path ...]` | 卸载（bootout）服务或域。 | `launchctl bootout system /Library/LaunchDaemons/com.example.plist` |
| `enable service-target` | 启用服务（仅系统/用户域）。 | `launchctl enable system/com.example.myservice` |
| `disable service-target` | 禁用服务（跨重启持久）。 | `launchctl disable system/com.example.myservice` |
| `start service-target` | 启动服务。 | `launchctl start system/com.example.myservice` |
| `stop service-target` | 停止服务。 | `launchctl stop system/com.example.myservice` |
| `list [service-target]` | 列出域/服务状态（PID、最后退出码）。 | `launchctl list` 或 `launchctl list system/com.example` |
| `print [domain-target \| service-target]` | 打印服务/域详情（GUI/用户域）。 | `launchctl print gui/$(id -u)` |
| `kickstart [-p] service-target` | 强制重启服务（`-p` 为子进程）。 | `launchctl kickstart system/com.example` |
| `load [-w] path` | **旧语法**：加载 plist（`-w` 写入启用状态）。 | `launchctl load -w ~/Library/LaunchAgents/com.example.plist` |
| `unload [-w] path` | **旧语法**：卸载 plist。 | `launchctl unload -w ~/Library/LaunchAgents/com.example.plist` |
| `export [-X] plist` | 导出 plist 到 stdout（`-X` 为 XML）。 | `launchctl export ~/Library/LaunchAgents/com.example.plist` |
| `debug [domain-target \| service-target]` | 启用调试日志。 | `launchctl debug system/com.example` |
| `quit [domain-target]` | 优雅退出域。 | `launchctl quit user/$(id -u)` |

- **全局选项**：`--version` 显示版本；`-v` 详细输出。
- **交互模式**：`launchctl` 进入 REPL，支持 tab 补全。

#### 3. 使用示例
1. **创建并加载用户代理**：
   - 创建 plist 文件 `~/Library/LaunchAgents/com.example.timer.plist`（内容如上例，每 5 分钟运行脚本）。
   - 加载：`launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.example.timer.plist`
   - 检查：`launchctl list | grep com.example`
   - 卸载：`launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.example.timer.plist`

2. **网络监听服务**（TCP 端口 8080）：
   - plist 中添加 `Sockets` 键。
   - 加载后，服务按需启动于连接到达。

3. **监控文件变化**：
   - 使用 `WatchPaths` 键，服务在文件修改时运行。

#### 4. 域（Domains）和安全考虑
- **域类型**：
  - **系统域**（`system`）：全局，root 控制。
  - **用户域**（`user/[uid]`）：持久用户上下文。
  - **GUI/登录域**（`gui/[uid]` / `login/[asid]`）：登录相关，共享资源但服务隔离。
  - **会话/进程域**：临时，用于 XPC 服务。
- **安全**：
  - 服务以最低权限运行（指定 `UserName`）。
  - 避免在 plist 中使用绝对路径，除非必要。
  - SIP（System Integrity Protection）保护系统 plist，无法修改 `/System/Library/`。
  - 调试时使用 `Debug` 键和 Console.app 查看日志。
  - 常见问题：权限错误（需 `sudo`）、plist 语法无效（用 `plutil -lint file.plist` 检查）。

#### 5. 最佳实践
- **按需启动优先**：使用 `KeepAlive` 的条件字典，避免常驻进程。
- **不 daemonize**：服务不应自行 fork 或 daemon（1.0），由 launchd 处理。
- **信号处理**：服务应优雅响应 SIGTERM（系统关机）。
- **调试**：添加输出路径，启用 `Debug`，用 `launchctl print` 检查状态。
- **迁移旧工具**：替换 cron 用 `StartCalendarInterval`；替换 inetd 用 `Sockets`。
- **更新注意**：macOS Ventura+ 加强沙箱，plist 需兼容 XPC 服务。

更多细节可参考 Apple 官方文档。 如果需要特定示例代码或 troubleshooting，请提供更多细节！