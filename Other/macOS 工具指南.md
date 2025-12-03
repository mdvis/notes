# macOS 工具指南


## defaults

### macOS 命令 `defaults` 介绍

`defaults` 是 macOS 系统内置的命令行工具，用于管理和操作用户默认设置（User Defaults）。这些设置通常以属性列表（.plist 文件）的形式存储在 `~/Library/Preferences/` 目录下，主要用于记录应用程序的偏好配置、系统选项等。它允许用户通过终端（Terminal）快速读取、写入或删除这些设置，而无需手动编辑 plist 文件。 该命令源于 1998 年的 OPENSTEP 系统，并在 macOS 中得到广泛使用。

#### 主要用途
- **读取设置**：查看应用程序或系统的当前配置值。
- **写入设置**：修改偏好，例如调整 Dock 的显示方式或 Finder 的行为。
- **删除设置**：重置特定键值对。
- **自动化配置**：常用于脚本中批量设置 macOS 环境，例如在新机上快速应用个性化选项。

它特别适用于开发者、系统管理员或高级用户，因为它比图形界面更精确和高效。

#### 基本语法
`defaults` 命令的基本格式为：
```
defaults [子命令] [域] [键] [值]
```
- **域（Domain）**：通常是应用程序的 Bundle ID（如 `com.apple.dock` 表示 Dock），或 `NSGlobalDomain` 表示全局系统设置。
- **键（Key）**：具体设置项的名称。
- **值（Value）**：要写入的数据，支持字符串、数字、布尔值、数组等类型。

以下是常用子命令的表格总结：

| 子命令     | 描述                  | 示例命令                          | 示例说明 |
|------------|-----------------------|-----------------------------------|----------|
| `read`    | 读取域下的所有键值，或指定键 | `defaults read com.apple.dock` <br> `defaults read com.apple.dock orientation` | 读取 Dock 的所有设置 <br> 读取 Dock 的方向设置 |
| `write`   | 写入键值对            | `defaults write com.apple.dock orientation -string "left"` | 将 Dock 放置在左侧 |
| `delete`  | 删除指定键            | `defaults delete com.apple.dock orientation` | 删除 Dock 方向设置 |
| `domains` | 列出所有可用域        | `defaults domains`                | 显示所有偏好域 |

#### 实用示例
1. **显示隐藏文件**（全局设置）：
   ```
   defaults write com.apple.finder AppleShowAllFiles -bool true
   killall Finder
   ```
   这会让 Finder 显示所有文件（包括 . 开头的隐藏文件），然后重启 Finder 生效。

2. **读取 Safari 的默认主页**：
   ```
   defaults read com.apple.Safari HomePage
   ```

3. **重置所有设置**（谨慎使用）：
   ```
   defaults delete -g  # 删除全局设置
   ```

#### 注意事项
- **权限**：大多数操作无需 sudo，但系统级设置可能需要管理员权限。
- **生效**：写入后，通常需重启相关应用（如用 `killall` 命令）才能生效。
- **备份**：修改前建议备份 plist 文件，以防出错。
- **类型匹配**：值类型需正确（如 `-bool true` 用于布尔值，`-string "text"` 用于字符串），否则命令会失败。
- **更多资源**：Apple 官方文档或 man 页（在终端输入 `man defaults`）提供完整细节。

如果您有特定设置想修改或更多示例需求，请提供细节，我可以进一步说明！


## diskutil

### macOS diskutil 全面用法指南

`diskutil` 是 macOS 内置的命令行工具，用于磁盘、分区和卷的管理。它提供比图形界面更强大的功能，如挂载、格式化、修复和 APFS 容器操作。以下是常见与高级用法的综合总结，按功能分类。所有命令在 Terminal 中运行，敏感操作需 `sudo` 权限。操作前备份数据，并用 `diskutil list` 确认设备 ID 以防误操作。

#### 1. **查看磁盘信息**
   - **diskutil list**：列出所有物理磁盘、逻辑卷和分区。  
     示例：`diskutil list`  
     输出：显示标识符（如 `/dev/disk0`）、大小和类型。
   - **diskutil info [disk/volume]**：获取指定磁盘/卷详情（如 UUID、文件系统）。  
     示例：`diskutil info /dev/disk1s1`
   - **diskutil apfs list**：列出 APFS 容器和卷详情（高级）。  
     示例：`diskutil apfs list`  
     输出：容器 UUID、卷大小和共享状态。
   - **diskutil cs list**：列出 CoreStorage 逻辑卷组（旧版支持）。  
     示例：`diskutil cs list`

#### 2. **挂载与卸载**
   - **diskutil mount [volume]**：挂载卷，使其在 Finder 可见。  
     示例：`diskutil mount /dev/disk1s1`
   - **diskutil unmount [volume]**：卸载指定卷。  
     示例：`diskutil unmount /dev/disk1s1`
   - **diskutil unmountDisk [disk]**：卸载整个磁盘的所有卷（常用于外部驱动器）。  
     示例：`diskutil unmountDisk /dev/disk2`

#### 3. **格式化与擦除**
   - **diskutil eraseDisk [格式] [卷名称] [设备]**：擦除并格式化整个磁盘。  
     示例：`diskutil eraseDisk APFS MyDisk /dev/disk2`（APFS 为 macOS 推荐格式）。
   - **diskutil eraseVolume [volume] [格式] [名称]**：擦除并格式化指定卷。  
     示例：`sudo diskutil eraseVolume APFS NewVol /dev/disk1s2`  
     启用加密：`sudo diskutil eraseDisk APFS EncryptedVol GPT /dev/disk2`（提示设置密码）。

#### 4. **分区管理**
   - **diskutil partitionDisk [设备] [分区方案] [分区大小] [格式] [名称]**：创建分区。  
     示例：`diskutil partitionDisk /dev/disk2 GPT APFS 100G MyPartition`（GPT 为现代默认方案）。
   - **diskutil resizeVolume [volume] [大小]**：调整卷大小。  
     示例：`diskutil resizeVolume /dev/disk1s1 200G`

#### 5. **修复与验证**
   - **diskutil repairDisk [设备]**：修复磁盘错误（类似于 fsck）。  
     示例：`sudo diskutil repairDisk /dev/disk1`
   - **diskutil verifyDisk [设备]**：验证磁盘完整性。  
     示例：`diskutil verifyDisk /dev/disk1`

#### 6. **APFS 容器与卷管理**（高级）
   - **diskutil apfs createContainer [物理存储]**：在物理磁盘上创建 APFS 容器。  
     示例：`sudo diskutil apfs createContainer /dev/disk2`
   - **diskutil apfs addVolume [容器] [类型] [名称]**：在容器中添加新卷。  
     示例：`sudo diskutil apfs addVolume disk3 APFS DataVol`
   - **diskutil apfs deleteVolume [卷]**：删除指定卷（需先卸载）。  
     示例：`sudo diskutil apfs deleteVolume /dev/disk3s2`

#### 7. **克隆与复制**（高级）
   - **diskutil cloneVolume [源卷] [目标卷]**：克隆卷（用于备份/迁移）。  
     示例：`sudo diskutil cloneVolume /dev/disk1s1 /dev/disk2s1`  
     注意：目标需有足够空闲空间。

#### 8. **重命名与标签**（高级）
   - **diskutil rename [卷] [新名称]**：重命名卷或设置标签。  
     示例：`diskutil rename /dev/disk1s1 "My Backup"`

#### 9. **加密管理**（高级）
   - **diskutil apfs unlockVolume [卷] [密码]**：解锁加密卷。  
     示例：`diskutil apfs unlockVolume /dev/disk1s1`（交互式输入密码）。

#### 10. **CoreStorage 与 RAID**（旧版支持，高级）
   - **diskutil cs create [大小] [物理磁盘]**：创建 CoreStorage 逻辑卷。  
     示例：`sudo diskutil cs create 100g /dev/disk2`
   - **diskutil appleRAID create stripe RAIDSet /dev/disk2 /dev/disk3**：创建条带化 RAID。

#### 11. **空间与活动监控**（高级）
   - **diskutil activity**：实时监控磁盘活动。  
     示例：`sudo diskutil activity /dev/disk1`（Ctrl+C 停止）。
   - 获取空间：用 `diskutil info /dev/disk1s1 | grep "Disk Size"`（结合脚本）。

#### 注意事项
- **权限与备份**：擦除/分区需 `sudo`，始终备份数据。
- **文件系统**：APFS 为现代默认；HFS+ 用于旧版兼容。
- **分区方案**：GPT（GUID）为 macOS 默认，MBR 用于旧硬件。
- **错误处理**：命令失败时，检查日志 `log show --predicate 'subsystem == "com.apple.diskarbitrationd"' --last 1h`。
- **帮助**：`man diskutil` 或 `diskutil [子命令] --help` 查看详情；参考 Apple 官方文档。

这个合并版覆盖了基础到高级用法。如果需要示例脚本、特定场景或进一步扩展，随时说！


## launchctl

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


## xattr

### macOS 命令 xattr 介绍

`xattr` 是 macOS 系统内置的命令行工具，用于显示和操作文件（包括目录和符号链接）的**扩展属性**（Extended Attributes）。扩展属性是一种任意元数据，与文件系统属性（如修改时间或文件大小）分开存储，通常是 null-terminated UTF-8 字符串或二进制数据。它常用于存储文件来源、Finder 信息或安全标记（如 Gatekeeper 隔离标记）。你可以通过 `ls -la@ filename` 在命令行查看文件的扩展属性。

`xattr` 是 "extended attributes" 的缩写，使用它可以列出、打印、写入或删除这些属性。命令成功时返回 0 退出码，失败时返回非零码并输出错误消息。

#### 语法
- **列出属性**：`xattr [-lrsvx] file ...`
- **打印指定属性的值**：`xattr -p [-lrsvx] attr_name file ...`
- **写入属性**：`xattr -w [-rsx] attr_name attr_value file ...`
- **删除指定属性**：`xattr -d [-rsv] attr_name file ...`
- **清除所有属性**：`xattr -c [-rsv] file ...`
- **显示帮助**：`xattr -h | --help`

#### 常用选项
以下是主要选项的表格总结：

| 选项 | 描述 |
|------|------|
| `-c` | 清除文件的所有扩展属性及其值。 |
| `-d` | 删除指定的属性。 |
| `-h` | 显示帮助信息。 |
| `-l` | 同时显示属性名和值（默认只显示名或值）；十六进制显示时包含偏移量和 ASCII 表示。 |
| `-p` | 打印指定属性的值。 |
| `-r` | 如果文件是目录，则递归处理目录下的所有文件。 |
| `-s` | 如果文件是符号链接，则操作链接本身，而非其指向的文件。 |
| `-v` | 强制显示文件名（即使只有一个文件）。 |
| `-w` | 写入指定的属性名和值。 |
| `-x` | 以十六进制格式显示或写入属性值。 |

#### 示例
1. **列出文件的所有扩展属性**：
   ```
   xattr -l example.txt
   ```
   输出示例：
   ```
   com.apple.quarantine:
   0171;5c3b5f5a;Safari;https://example.com/
   ```

2. **删除文件的隔离标记**（常用于移除下载文件的 Gatekeeper 隔离）：
   ```
   xattr -d com.apple.quarantine ~/Downloads/demo.app
   ```

3. **递归清除目录下所有文件的扩展属性**（例如移除应用捆绑包的安全隔离）：
   ```
   xattr -rc /path/to/directory
   ```

4. **添加“来源”元数据到文件**：
   ```
   xattr -w com.apple.metadata:kMDItemWhereFroms "https://example.com/" /path/to/file
   ```

5. **复制一个属性的值**（例如从 `/usr` 复制 FinderInfo 到 `MyDir`）：
   ```
   xattr -px com.apple.FinderInfo /usr  # 先打印源值
   xattr -wx com.apple.FinderInfo "$(xattr -px com.apple.FinderInfo /usr)" MyDir  # 写入目标
   ```

更多细节可通过 `man xattr` 在终端查看手册页。


## Brewfile

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

### macOS 命令 `defaults` 介绍

`defaults` 是 macOS 系统内置的命令行工具，用于管理和操作用户默认设置（User Defaults）。这些设置通常以属性列表（.plist 文件）的形式存储在 `~/Library/Preferences/` 目录下，主要用于记录应用程序的偏好配置、系统选项等。它允许用户通过终端（Terminal）快速读取、写入或删除这些设置，而无需手动编辑 plist 文件。 该命令源于 1998 年的 OPENSTEP 系统，并在 macOS 中得到广泛使用。

#### 主要用途
- **读取设置**：查看应用程序或系统的当前配置值。
- **写入设置**：修改偏好，例如调整 Dock 的显示方式或 Finder 的行为。
- **删除设置**：重置特定键值对。
- **自动化配置**：常用于脚本中批量设置 macOS 环境，例如在新机上快速应用个性化选项。

它特别适用于开发者、系统管理员或高级用户，因为它比图形界面更精确和高效。

#### 基本语法
`defaults` 命令的基本格式为：
```
defaults [子命令] [域] [键] [值]
```
- **域（Domain）**：通常是应用程序的 Bundle ID（如 `com.apple.dock` 表示 Dock），或 `NSGlobalDomain` 表示全局系统设置。
- **键（Key）**：具体设置项的名称。
- **值（Value）**：要写入的数据，支持字符串、数字、布尔值、数组等类型。

以下是常用子命令的表格总结：

| 子命令     | 描述                  | 示例命令                          | 示例说明 |
|------------|-----------------------|-----------------------------------|----------|
| `read`    | 读取域下的所有键值，或指定键 | `defaults read com.apple.dock` <br> `defaults read com.apple.dock orientation` | 读取 Dock 的所有设置 <br> 读取 Dock 的方向设置 |
| `write`   | 写入键值对            | `defaults write com.apple.dock orientation -string "left"` | 将 Dock 放置在左侧 |
| `delete`  | 删除指定键            | `defaults delete com.apple.dock orientation` | 删除 Dock 方向设置 |
| `domains` | 列出所有可用域        | `defaults domains`                | 显示所有偏好域 |

#### 实用示例
1. **显示隐藏文件**（全局设置）：
   ```
   defaults write com.apple.finder AppleShowAllFiles -bool true
   killall Finder
   ```
   这会让 Finder 显示所有文件（包括 . 开头的隐藏文件），然后重启 Finder 生效。

2. **读取 Safari 的默认主页**：
   ```
   defaults read com.apple.Safari HomePage
   ```

3. **重置所有设置**（谨慎使用）：
   ```
   defaults delete -g  # 删除全局设置
   ```

#### 注意事项
- **权限**：大多数操作无需 sudo，但系统级设置可能需要管理员权限。
- **生效**：写入后，通常需重启相关应用（如用 `killall` 命令）才能生效。
- **备份**：修改前建议备份 plist 文件，以防出错。
- **类型匹配**：值类型需正确（如 `-bool true` 用于布尔值，`-string "text"` 用于字符串），否则命令会失败。
- **更多资源**：Apple 官方文档或 man 页（在终端输入 `man defaults`）提供完整细节。

如果您有特定设置想修改或更多示例需求，请提供细节，我可以进一步说明！### macOS diskutil 全面用法指南

`diskutil` 是 macOS 内置的命令行工具，用于磁盘、分区和卷的管理。它提供比图形界面更强大的功能，如挂载、格式化、修复和 APFS 容器操作。以下是常见与高级用法的综合总结，按功能分类。所有命令在 Terminal 中运行，敏感操作需 `sudo` 权限。操作前备份数据，并用 `diskutil list` 确认设备 ID 以防误操作。

#### 1. **查看磁盘信息**
   - **diskutil list**：列出所有物理磁盘、逻辑卷和分区。  
     示例：`diskutil list`  
     输出：显示标识符（如 `/dev/disk0`）、大小和类型。
   - **diskutil info [disk/volume]**：获取指定磁盘/卷详情（如 UUID、文件系统）。  
     示例：`diskutil info /dev/disk1s1`
   - **diskutil apfs list**：列出 APFS 容器和卷详情（高级）。  
     示例：`diskutil apfs list`  
     输出：容器 UUID、卷大小和共享状态。
   - **diskutil cs list**：列出 CoreStorage 逻辑卷组（旧版支持）。  
     示例：`diskutil cs list`

#### 2. **挂载与卸载**
   - **diskutil mount [volume]**：挂载卷，使其在 Finder 可见。  
     示例：`diskutil mount /dev/disk1s1`
   - **diskutil unmount [volume]**：卸载指定卷。  
     示例：`diskutil unmount /dev/disk1s1`
   - **diskutil unmountDisk [disk]**：卸载整个磁盘的所有卷（常用于外部驱动器）。  
     示例：`diskutil unmountDisk /dev/disk2`

#### 3. **格式化与擦除**
   - **diskutil eraseDisk [格式] [卷名称] [设备]**：擦除并格式化整个磁盘。  
     示例：`diskutil eraseDisk APFS MyDisk /dev/disk2`（APFS 为 macOS 推荐格式）。
   - **diskutil eraseVolume [volume] [格式] [名称]**：擦除并格式化指定卷。  
     示例：`sudo diskutil eraseVolume APFS NewVol /dev/disk1s2`  
     启用加密：`sudo diskutil eraseDisk APFS EncryptedVol GPT /dev/disk2`（提示设置密码）。

#### 4. **分区管理**
   - **diskutil partitionDisk [设备] [分区方案] [分区大小] [格式] [名称]**：创建分区。  
     示例：`diskutil partitionDisk /dev/disk2 GPT APFS 100G MyPartition`（GPT 为现代默认方案）。
   - **diskutil resizeVolume [volume] [大小]**：调整卷大小。  
     示例：`diskutil resizeVolume /dev/disk1s1 200G`

#### 5. **修复与验证**
   - **diskutil repairDisk [设备]**：修复磁盘错误（类似于 fsck）。  
     示例：`sudo diskutil repairDisk /dev/disk1`
   - **diskutil verifyDisk [设备]**：验证磁盘完整性。  
     示例：`diskutil verifyDisk /dev/disk1`

#### 6. **APFS 容器与卷管理**（高级）
   - **diskutil apfs createContainer [物理存储]**：在物理磁盘上创建 APFS 容器。  
     示例：`sudo diskutil apfs createContainer /dev/disk2`
   - **diskutil apfs addVolume [容器] [类型] [名称]**：在容器中添加新卷。  
     示例：`sudo diskutil apfs addVolume disk3 APFS DataVol`
   - **diskutil apfs deleteVolume [卷]**：删除指定卷（需先卸载）。  
     示例：`sudo diskutil apfs deleteVolume /dev/disk3s2`

#### 7. **克隆与复制**（高级）
   - **diskutil cloneVolume [源卷] [目标卷]**：克隆卷（用于备份/迁移）。  
     示例：`sudo diskutil cloneVolume /dev/disk1s1 /dev/disk2s1`  
     注意：目标需有足够空闲空间。

#### 8. **重命名与标签**（高级）
   - **diskutil rename [卷] [新名称]**：重命名卷或设置标签。  
     示例：`diskutil rename /dev/disk1s1 "My Backup"`

#### 9. **加密管理**（高级）
   - **diskutil apfs unlockVolume [卷] [密码]**：解锁加密卷。  
     示例：`diskutil apfs unlockVolume /dev/disk1s1`（交互式输入密码）。

#### 10. **CoreStorage 与 RAID**（旧版支持，高级）
   - **diskutil cs create [大小] [物理磁盘]**：创建 CoreStorage 逻辑卷。  
     示例：`sudo diskutil cs create 100g /dev/disk2`
   - **diskutil appleRAID create stripe RAIDSet /dev/disk2 /dev/disk3**：创建条带化 RAID。

#### 11. **空间与活动监控**（高级）
   - **diskutil activity**：实时监控磁盘活动。  
     示例：`sudo diskutil activity /dev/disk1`（Ctrl+C 停止）。
   - 获取空间：用 `diskutil info /dev/disk1s1 | grep "Disk Size"`（结合脚本）。

#### 注意事项
- **权限与备份**：擦除/分区需 `sudo`，始终备份数据。
- **文件系统**：APFS 为现代默认；HFS+ 用于旧版兼容。
- **分区方案**：GPT（GUID）为 macOS 默认，MBR 用于旧硬件。
- **错误处理**：命令失败时，检查日志 `log show --predicate 'subsystem == "com.apple.diskarbitrationd"' --last 1h`。
- **帮助**：`man diskutil` 或 `diskutil [子命令] --help` 查看详情；参考 Apple 官方文档。

这个合并版覆盖了基础到高级用法。如果需要示例脚本、特定场景或进一步扩展，随时说！### macOS 中的 launchctl 详细介绍

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

更多细节可参考 Apple 官方文档。 如果需要特定示例代码或 troubleshooting，请提供更多细节！### Brewfile 相关用法概述

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
- 更多细节见官方文档。 如果你是 Homebrew 新手，先确保已安装：`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`。有具体问题可以再问！### macOS 命令 xattr 介绍

`xattr` 是 macOS 系统内置的命令行工具，用于显示和操作文件（包括目录和符号链接）的**扩展属性**（Extended Attributes）。扩展属性是一种任意元数据，与文件系统属性（如修改时间或文件大小）分开存储，通常是 null-terminated UTF-8 字符串或二进制数据。它常用于存储文件来源、Finder 信息或安全标记（如 Gatekeeper 隔离标记）。你可以通过 `ls -la@ filename` 在命令行查看文件的扩展属性。

`xattr` 是 "extended attributes" 的缩写，使用它可以列出、打印、写入或删除这些属性。命令成功时返回 0 退出码，失败时返回非零码并输出错误消息。

#### 语法
- **列出属性**：`xattr [-lrsvx] file ...`
- **打印指定属性的值**：`xattr -p [-lrsvx] attr_name file ...`
- **写入属性**：`xattr -w [-rsx] attr_name attr_value file ...`
- **删除指定属性**：`xattr -d [-rsv] attr_name file ...`
- **清除所有属性**：`xattr -c [-rsv] file ...`
- **显示帮助**：`xattr -h | --help`

#### 常用选项
以下是主要选项的表格总结：

| 选项 | 描述 |
|------|------|
| `-c` | 清除文件的所有扩展属性及其值。 |
| `-d` | 删除指定的属性。 |
| `-h` | 显示帮助信息。 |
| `-l` | 同时显示属性名和值（默认只显示名或值）；十六进制显示时包含偏移量和 ASCII 表示。 |
| `-p` | 打印指定属性的值。 |
| `-r` | 如果文件是目录，则递归处理目录下的所有文件。 |
| `-s` | 如果文件是符号链接，则操作链接本身，而非其指向的文件。 |
| `-v` | 强制显示文件名（即使只有一个文件）。 |
| `-w` | 写入指定的属性名和值。 |
| `-x` | 以十六进制格式显示或写入属性值。 |

#### 示例
1. **列出文件的所有扩展属性**：
   ```
   xattr -l example.txt
   ```
   输出示例：
   ```
   com.apple.quarantine:
   0171;5c3b5f5a;Safari;https://example.com/
   ```

2. **删除文件的隔离标记**（常用于移除下载文件的 Gatekeeper 隔离）：
   ```
   xattr -d com.apple.quarantine ~/Downloads/demo.app
   ```

3. **递归清除目录下所有文件的扩展属性**（例如移除应用捆绑包的安全隔离）：
   ```
   xattr -rc /path/to/directory
   ```

4. **添加“来源”元数据到文件**：
   ```
   xattr -w com.apple.metadata:kMDItemWhereFroms "https://example.com/" /path/to/file
   ```

5. **复制一个属性的值**（例如从 `/usr` 复制 FinderInfo 到 `MyDir`）：
   ```
   xattr -px com.apple.FinderInfo /usr  # 先打印源值
   xattr -wx com.apple.FinderInfo "$(xattr -px com.apple.FinderInfo /usr)" MyDir  # 写入目标
   ```

更多细节可通过 `man xattr` 在终端查看手册页。