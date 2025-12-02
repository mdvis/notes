# Systemd 完整指南


## Systemd 组成(架构)

## 🧱 一、总体结构：systemd 是 Linux 的“系统管理框架”

systemd 是 Linux 用户空间最核心的系统与服务管理器（system and service manager），负责从系统启动到关机的所有生命周期管理。  
它取代了传统的 **SysV init** 与 **Upstart**，并提供了更统一的机制来：

- 启动和停止服务（service management）
    
- 管理依赖和并行启动（dependency-based boot）
    
- 管理会话、日志、设备、挂载点、命名空间（session, logs, mounts, namespaces）
    
- 与内核的 **cgroups** 深度整合，实现资源隔离和监控
    

所以可以把整个 systemd 看作是一个 **多进程协作的“系统平台”**。

---

## 🧩 二、systemd core（核心）

这一层是 systemd 的内核，负责定义基础机制。

### 1. manager

管理所有单元（unit）的核心调度器。它：

- 解析 unit 文件
    
- 管理依赖关系图（dependency graph）
    
- 调度启动、停止、重启等动作
    
- 处理信号、事件、超时等
    

### 2. systemd

即 `/lib/systemd/systemd` 主进程（PID 1），是第一个用户空间进程。  
负责：

- 读取 `/etc/systemd/system/` 与 `/lib/systemd/system/` 下的 unit 文件
    
- 激活目标（target）
    
- 管理服务与挂载
    
- 与 journald、logind 等子守护进程通信
    

### 3. unit（单元）

unit 是 systemd 的最小管理单元，每种 unit 对应一种系统资源类型。常见类型：

|类型|用途|
|---|---|
|`.service`|服务（守护进程）|
|`.target`|逻辑分组，表示系统状态|
|`.socket`|套接字激活|
|`.path`|文件路径激活|
|`.timer`|定时任务（取代 cron）|
|`.mount` / `.automount`|挂载点|
|`.swap`|交换空间|
|`.snapshot`|运行时快照|

> 🔹 systemd 启动时，会根据目标（target）拉起相应的服务树。

### 4. login 子系统

这一部分提供登录会话管理，与 `logind` 守护进程协作。

- **multiseat**：支持多用户多终端（例如多显示器会话）
    
- **inhibit**：阻止系统进入睡眠或关机的机制
    
- **session**：跟踪用户登录、tty、X11、Wayland 等会话
    
- **pam**：与 Linux 的 PAM（Pluggable Authentication Modules）集成
    

### 5. namespace

利用 Linux 的命名空间（mount, pid, network, etc.）机制为服务隔离环境。

### 6. log

systemd 有自己的日志系统 journald，负责收集和管理日志。

### 7. cgroup

systemd 是 cgroups（控制组）的主要用户。  
每个服务都运行在自己的 cgroup 中，systemd 可以用它：

- 限制 CPU、内存、I/O
    
- 跟踪服务进程
    
- 实现清理和资源隔离
    

### 8. dbus

systemd 通过 D-Bus 暴露控制接口，让外部工具（如 GNOME、NetworkManager）与它通信。

---

## ⚙️ 三、systemd daemons（守护进程）

这些是 systemd 的核心后台服务，分别负责不同子系统。

|守护进程|作用|
|---|---|
|**systemd**|主进程（PID 1），系统管理核心|
|**journald**|收集、存储和查询日志（代替 syslog）|
|**networkd**|轻量级网络管理（配置 IP、路由等）|
|**logind**|用户登录与会话管理（座席、休眠、锁屏等）|
|**user session**|用户会话中的 systemd 实例（每个用户一个）|

> ✅ systemd 既能运行在系统级，也能为每个用户运行一个独立实例。

---

## 🧰 四、systemd utilities（实用工具）

这些是与核心组件交互的命令行工具。

|工具|功能|
|---|---|
|**systemctl**|管理服务、目标和单元的主命令|
|**journalctl**|查询和过滤日志（来自 journald）|
|**notify**|服务向 systemd 报告状态（READY=1 等）|
|**analyze**|分析启动性能（boot chart、critical-chain）|
|**cgls**|以树状方式显示 cgroup 层级|
|**cgtop**|实时查看各 cgroup 的资源使用情况|
|**loginctl**|管理用户登录会话|
|**nspawn**|类似轻量容器的工具（类似 chroot + cgroup + namespace）|

这些工具体现了 systemd 的一体化设计理念：  
统一管理接口 + 分层抽象。

---

## 🎯 五、systemd targets（目标）

target 是一种特殊的 unit 类型，用来表示“系统状态”或“运行级别”（类似传统的 runlevel）。

|Target|说明|
|---|---|
|**bootmode**|启动模式|
|**basic.target**|启动基础服务|
|**multi-user.target**|多用户（无图形）模式，相当于 runlevel 3|
|**graphical.target**|图形界面模式（runlevel 5）|
|**shutdown.target / reboot.target**|关机、重启状态|
|**user-session.target**|用户会话级别目标|

> 目标之间可以层层依赖：  
> `graphical.target → multi-user.target → basic.target`  
> 这使得启动过程可并行、可控。

---

## 📚 六、systemd libraries（依赖库）

systemd 通过多种库实现功能扩展与系统集成：

|库|作用|
|---|---|
|**dbus-1**|与系统总线通信|
|**libpam**|用户认证接口|
|**libcap**|权限能力（capabilities）管理|
|**libcryptsetup**|加密卷支持（LUKS）|
|**tcpwrapper**|网络访问控制|
|**libaudit**|审计系统|
|**libnotify**|桌面通知接口|

这些库使 systemd 能与 Linux 安全机制、认证系统和桌面环境无缝对接。

---

## 🧬 七、Linux kernel 层（systemd 的底层依赖）

systemd 并非孤立运行，它深度依赖 Linux 内核的现代特性：

|内核特性|说明|
|---|---|
|**cgroups**|控制组，用于资源控制与监控|
|**autofs**|自动挂载机制|
|**kdbus（或 modern dbus-broker）**|内核级 DBus（实验性特性）|

这些机制支撑了 systemd 的并行化启动、服务隔离、容器化运行（nspawn）等能力。

---

## 🧩 八、整体架构图（逻辑层次）

```
┌─────────────────────────────┐
│        User Space Apps      │
│  (loginctl, journalctl ...) │
└─────────────┬───────────────┘
              │
┌─────────────┴───────────────┐
│        systemd core         │
│  (PID 1, manager, units, dbus) │
└─────────────┬───────────────┘
              │
┌─────────────┴───────────────┐
│       systemd daemons       │
│ journald | logind | networkd│
└─────────────┬───────────────┘
              │
┌─────────────┴───────────────┐
│        Linux Kernel         │
│  (cgroups, namespaces ...)  │
└─────────────────────────────┘
```

---

## 🧠 九、总结：systemd 的设计哲学

1. **一体化**：将 init、logging、session、network 等整合到统一框架。
    
2. **并行化**：基于依赖关系并行启动，提高启动速度。
    
3. **事件驱动**：使用 socket/path/timer 激活机制，按需启动服务。
    
4. **可监控性**：与 cgroups、journald 集成，精准监控每个服务。
    
5. **模块化**：通过 unit 和 target 组成灵活的依赖树。
    
6. **统一接口**：通过 D-Bus 提供 API，命令行工具一致。
    

---

是否希望我接下来帮你画一个更详细的 **systemd 组件关系图（带层级与依赖箭头）**？  
可以用图形方式清晰展示 systemd、journald、logind、cgroups、targets、units 的关系。


## Systemd 命令速览

# 🧭 systemd 管理命令速查表（Cheat Sheet）

> 适用系统：Fedora / RHEL / CentOS / Ubuntu (≥15.04) / Debian (≥8) / Arch / openSUSE  
> 核心命令：`systemctl`、`journalctl`、`loginctl`、`hostnamectl`、`timedatectl`、`localectl` 等

---

## 🧩 一、服务管理（systemctl）

|操作|命令示例|
|---|---|
|启动服务|`systemctl start nginx`|
|停止服务|`systemctl stop nginx`|
|重启服务|`systemctl restart nginx`|
|重新加载配置|`systemctl reload nginx`|
|查看状态|`systemctl status nginx`|
|设置开机自启|`systemctl enable nginx`|
|禁止开机自启|`systemctl disable nginx`|
|立即启动并设置自启|`systemctl enable --now nginx`|
|查看所有活动的服务|`systemctl list-units --type=service`|
|查看所有已安装的服务|`systemctl list-unit-files --type=service`|
|屏蔽（禁止启动）服务|`systemctl mask nginx`|
|取消屏蔽服务|`systemctl unmask nginx`|

---

## 🧠 二、系统信息工具

|功能|命令|
|---|---|
|查看主机名及信息|`hostnamectl status`|
|设置主机名|`hostnamectl set-hostname server01`|
|查看/设置系统语言|`localectl status` / `localectl set-locale LANG=zh_CN.UTF-8`|
|查看/设置键盘布局|`localectl set-keymap us`|
|查看时间状态|`timedatectl status`|
|设置时区|`timedatectl set-timezone Asia/Shanghai`|
|启用 NTP 同步|`timedatectl set-ntp true`|

---

## 👥 三、用户登录与会话（loginctl）

|功能|命令|
|---|---|
|查看登录会话|`loginctl list-sessions`|
|查看用户信息|`loginctl show-user username`|
|终止用户会话|`loginctl terminate-session 3`|
|注销用户|`loginctl terminate-user username`|
|锁定当前会话|`loginctl lock-session`|
|解锁会话|`loginctl unlock-session`|

---

## 🧾 四、日志管理（journalctl）

|功能|命令|
|---|---|
|查看所有日志|`journalctl`|
|查看最近日志（实时）|`journalctl -f`|
|查看指定服务日志|`journalctl -u nginx`|
|查看最近 1 小时日志|`journalctl --since "1 hour ago"`|
|查看上次启动日志|`journalctl -b -1`|
|查看指定启动日志|`journalctl -b 0`（当前）/ `journalctl -b -2`（上上次）|
|显示错误日志|`journalctl -p err`|
|清理日志|`journalctl --vacuum-time=7d`（保留 7 天）|

---

## ⚙️ 五、启动与性能分析

|功能|命令|
|---|---|
|查看启动总耗时|`systemd-analyze time`|
|查看启动过程耗时排行|`systemd-analyze blame`|
|查看关键启动链|`systemd-analyze critical-chain`|
|检查 unit 文件语法|`systemd-analyze verify nginx.service`|
|检查配置差异|`systemd-delta`|

---

## 🧱 六、挂载与设备管理

|功能|命令|
|---|---|
|挂载设备|`systemd-mount /dev/sdb1 /mnt`|
|卸载设备|`systemd-umount /mnt`|
|检查虚拟化环境|`systemd-detect-virt`|
|查看 cgroup 树|`systemd-cgls`|
|查看实时资源使用|`systemd-cgtop`|

---

## 🧰 七、实用辅助工具

|功能|命令|
|---|---|
|以 systemd 方式运行命令|`systemd-run --unit=testjob --scope top`|
|比较修改后的配置|`systemd-delta`|
|管理临时文件|`systemd-tmpfiles --clean`|
|管理系统用户|`systemd-sysusers --dry-run`|
|直接向日志写入|`echo "hello"|
|阻止系统挂起|`systemd-inhibit --why="Backup running" rsync /data /backup`|
|DNS 解析调试|`resolvectl status` / `resolvectl query example.com`|

---

## 💡 八、常用状态与控制命令总结

```bash
# 查看系统状态
systemctl status
systemctl list-units --type=service
systemctl list-timers

# 重载配置（不重启服务）
systemctl daemon-reload

# 重启 systemd 管理器本身
systemctl daemon-reexec

# 查看 systemd 版本
systemd --version
```

---

## 📦 九、文件位置参考

|类型|路径|
|---|---|
|系统服务单元|`/usr/lib/systemd/system/`|
|用户自定义单元|`/etc/systemd/system/`|
|用户级单元|`~/.config/systemd/user/`|
|临时日志|`/run/log/journal/`|
|永久日志|`/var/log/journal/`|

---

是否希望我帮你把这份 **Cheat Sheet 导出为 PDF 或 Markdown 文件**？  
（适合打印或收藏离线使用）


## Systemd 管理工具总览

`systemd` 是核心的初始化系统和服务管理框架。围绕它有一整套 **管理工具**，用于控制服务、分析启动、管理会话、日志等。下面是 systemd 生态中最常用的管理工具总结 👇

---

## 🧩 一、服务与系统管理类

|工具|主要用途|常用命令示例|
|---|---|---|
|**systemctl**|管理 systemd 单元（unit），如服务、挂载点、设备、目标等。|`systemctl status nginx``systemctl start/stop/restart nginx``systemctl enable/disable nginx``systemctl list-units --type=service`|
|**systemd-analyze**|分析系统启动性能，查看启动时间分布。|`systemd-analyze time``systemd-analyze blame``systemd-analyze critical-chain`|
|**hostnamectl**|查看与设置主机名及相关信息。|`hostnamectl status``hostnamectl set-hostname server01`|
|**localectl**|管理系统语言与键盘布局。|`localectl status``localectl set-locale LANG=zh_CN.UTF-8`|
|**timedatectl**|管理系统时间、时区、NTP 同步。|`timedatectl status``timedatectl set-timezone Asia/Shanghai``timedatectl set-ntp true`|
|**loginctl**|管理用户登录会话、seat、多用户环境。|`loginctl list-sessions``loginctl show-session 2``loginctl terminate-user alice`|
|**systemd-run**|临时以 systemd 管理方式运行命令或创建临时服务。|`systemd-run --unit=myjob --scope top`|

---

## 🔧 二、日志与调试类

|工具|主要用途|常用命令示例|
|---|---|---|
|**journalctl**|查看和过滤 systemd 日志（替代传统 syslog）。|`journalctl -xe``journalctl -u nginx``journalctl --since "1 hour ago"`|
|**systemd-cgls**|显示 cgroup（控制组）层级树。|`systemd-cgls`|
|**systemd-cgtop**|类似 top，显示 cgroup 实时资源使用。|`systemd-cgtop`|
|**systemd-delta**|比较被修改的 systemd 配置与默认配置。|`systemd-delta`|

---

## 🧱 三、单元与配置相关工具

|工具|主要用途|常用命令示例|
|---|---|---|
|**systemd-analyze verify**|检查 unit 文件语法。|`systemd-analyze verify nginx.service`|
|**systemd-escape**|转义路径或名称为合法 unit 名。|`systemd-escape /home/user/mountpoint`|
|**systemd-cat**|将命令输出直接写入 systemd 日志。|`echo "test"|
|**systemd-tmpfiles**|管理 /tmp、/var/tmp 等临时文件的创建与清理。|`systemd-tmpfiles --create`|
|**systemd-sysusers**|管理系统用户和组（根据配置文件创建系统账号）。|`systemd-sysusers --dry-run`|

---

## ⚙️ 四、引导与挂载管理类

|工具|主要用途|常用命令示例|
|---|---|---|
|**systemd-boot**|简洁的 UEFI 启动管理器（替代 grub）。|`bootctl status``bootctl update`|
|**systemd-mount / systemd-umount**|临时挂载文件系统。|`systemd-mount /dev/sdb1 /mnt``systemd-umount /mnt`|
|**systemd-detect-virt**|检测系统是否运行在虚拟机或容器中。|`systemd-detect-virt`|

---

## 🧠 五、调试与恢复相关

|工具|主要用途|常用命令示例|
|---|---|---|
|**systemd-resolve**（或 `resolvectl`）|管理和调试 DNS 解析（由 `systemd-resolved` 提供）。|`resolvectl status``resolvectl query example.com`|
|**systemd-inhibit**|防止系统挂起、重启或关闭。|`systemd-inhibit --why="Backup running" rsync /data /backup`|
|**systemd-nspawn**|启动轻量级容器（类似 chroot 但更强大）。|`systemd-nspawn -D /srv/container`|

---

## 💡 补充说明

- 所有这些命令都属于 **systemd 工具集**，位于 `/usr/bin/` 目录下。
    
- 查看帮助文档：
    
    ```bash
    man systemctl
    man journalctl
    man loginctl
    ```
    
- 查询版本：
    
    ```bash
    systemd --version
    ```
    

---

是否希望我帮你整理一张 **systemd 管理命令速查表（Cheat Sheet）**？我可以输出为 Markdown、PDF 或命令行格式。


## Systemd Unit 文件

非常好 👍  
你已经完全理解了 systemd 的体系结构，所以我们现在可以深入到最实用的部分：**如何编写一个 systemd unit 文件**。

下面我会从 **语法结构 → Unit 类型 → 核心指令 → 实战示例 → 调试技巧** 全面讲解，确保你能独立编写、调试、优化一个 systemd 服务。

---

# 🧱 一、Unit 文件概念

`unit` 是 systemd 的基本管理单元，每个 unit 文件描述一个 **系统资源或服务的行为**。

它是一个纯文本文件，通常位于以下路径：

|路径|说明|
|---|---|
|`/etc/systemd/system/`|系统管理员定义的 unit（优先级最高）|
|`/lib/systemd/system/`|软件包提供的默认 unit|
|`~/.config/systemd/user/`|用户级 unit（非 root）|

文件名格式：

```
<name>.<type>
```

例如：

```
nginx.service
mybackup.timer
mnt-data.mount
```

---

# 🧩 二、Unit 文件的三大段落结构

每个 unit 文件通常包含以下三个部分：

```ini
[Unit]
# 描述、依赖关系、启动顺序等

[Service]
# 若类型是 service，这里定义启动方式、执行命令、守护策略

[Install]
# 定义安装目标（target）与启用策略
```

---

# 🧠 三、[Unit] 段：元信息与依赖管理

该段用于描述单元与系统中其他单元的关系。

|指令|说明|
|---|---|
|`Description=`|简要描述|
|`Documentation=`|文档链接（如 man 或 URL）|
|`After=`|定义启动顺序（在谁之后启动）|
|`Before=`|在谁之前启动|
|`Requires=`|强依赖（必须存在，否则失败）|
|`Wants=`|弱依赖（尽量启动，不影响主服务）|
|`Conflicts=`|互斥关系|
|`Condition...=`|条件判断（如 `ConditionPathExists=`）|

✅ **示例：**

```ini
[Unit]
Description=My Web Service
After=network.target
Wants=network-online.target
```

---

# ⚙️ 四、[Service] 段：定义服务行为（仅对 `.service` 类型有效）

这是最常见、最核心的一部分。  
用于定义如何启动、停止、重启守护进程。

### 常用字段

|指令|说明|
|---|---|
|`Type=`|服务类型（见下）|
|`ExecStart=`|启动命令（必须）|
|`ExecReload=`|重载命令（可选）|
|`ExecStop=`|停止命令（可选）|
|`Restart=`|失败后自动重启策略|
|`RestartSec=`|重启前等待时间|
|`User=` / `Group=`|以哪个用户身份运行|
|`WorkingDirectory=`|工作目录|
|`Environment=`|环境变量|
|`PIDFile=`|指定进程 PID 文件（可选）|
|`StandardOutput=` / `StandardError=`|日志输出重定向|
|`TimeoutStartSec=`|启动超时|
|`OOMPolicy=`|OOM 策略（如 stop / restart）|
|`CPUQuota=` / `MemoryLimit=`|cgroup 资源限制|

---

### 🔹 服务类型 Type=

`Type=` 定义了 systemd 如何判断服务“已就绪”。

|Type|说明|
|---|---|
|`simple`|默认类型，直接执行 `ExecStart`|
|`forking`|后台守护进程（如传统 daemon）|
|`oneshot`|只执行一次的任务（如脚本）|
|`notify`|程序通过 `sd_notify` 通知就绪（READY=1）|
|`idle`|延迟启动，等其他任务完成后运行|

✅ **示例：简单 Web 服务**

```ini
[Service]
Type=simple
ExecStart=/usr/local/bin/myserver --port 8080
Restart=on-failure
RestartSec=3
User=www-data
WorkingDirectory=/var/www/myserver
Environment=ENV=prod
```

✅ **示例：后台守护进程**

```ini
[Service]
Type=forking
PIDFile=/run/mydaemon.pid
ExecStart=/usr/sbin/mydaemon -D
ExecStop=/bin/kill -TERM $MAINPID
Restart=on-failure
```

✅ **示例：一次性任务（oneshot）**

```ini
[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh
RemainAfterExit=yes
```

> `RemainAfterExit=yes` 表示任务完成后仍视为“active”，适用于初始化脚本。

---

# 🧩 五、[Install] 段：定义如何启用

此段决定当你执行：

```bash
sudo systemctl enable myservice.service
```

时，symbolic link 会指向哪个 target。

|指令|说明|
|---|---|
|`WantedBy=`|软依赖目标（常见）|
|`RequiredBy=`|强依赖目标|
|`Alias=`|提供别名|
|`Also=`|同时启用其他单元|

✅ **示例：**

```ini
[Install]
WantedBy=multi-user.target
```

这意味着它会在系统进入 `multi-user.target`（即 runlevel 3）时自动启动。

---

# 🧩 六、完整示例：自定义 Web 服务

```ini
# /etc/systemd/system/myweb.service
[Unit]
Description=My Custom Web Server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/myweb --config /etc/myweb/config.yml
WorkingDirectory=/var/www/myweb
User=www-data
Restart=on-failure
RestartSec=5
Environment=ENV=production

[Install]
WantedBy=multi-user.target
```

安装并启用：

```bash
sudo systemctl daemon-reload
sudo systemctl enable myweb.service
sudo systemctl start myweb.service
```

查看状态与日志：

```bash
systemctl status myweb.service
journalctl -u myweb.service -f
```

---

# 🧠 七、其他 Unit 类型简述

|类型|作用|
|---|---|
|`.socket`|监听套接字，自动激活对应 `.service`|
|`.path`|监控文件路径变化触发启动|
|`.timer`|定时启动 `.service`|
|`.mount`|挂载点定义（代替 /etc/fstab）|
|`.automount`|按需挂载|
|`.target`|一组服务的集合，类似运行级别|
|`.slice`|cgroup 资源分组控制|
|`.scope`|临时外部启动进程的封装（非 systemd 启动）|

✅ **Timer 示例：每小时运行备份脚本**

```ini
# /etc/systemd/system/backup.service
[Unit]
Description=Run backup job

[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh

[Install]
WantedBy=multi-user.target
```

```ini
# /etc/systemd/system/backup.timer
[Unit]
Description=Run backup hourly

[Timer]
OnCalendar=hourly
Persistent=true

[Install]
WantedBy=timers.target
```

---

# 🧩 八、调试与测试技巧

|命令|功能|
|---|---|
|`systemctl daemon-reload`|重新加载 unit 配置（修改后必须）|
|`systemctl cat <unit>`|查看完整配置（包括继承）|
|`systemd-analyze verify <unit>`|检查语法错误|
|`journalctl -u <unit>`|查看日志|
|`systemctl show <unit>`|查看运行时属性|
|`systemctl edit <unit>`|创建 drop-in 覆盖配置（推荐修改方式）|

---

# 🧩 九、常见陷阱与建议

✅ **最佳实践：**

1. 不直接修改 `/lib/systemd/system/` 下的文件  
    → 使用 `/etc/systemd/system/` 覆盖或 `systemctl edit`
    
2. 确保 `ExecStart` 命令绝对路径正确
    
3. 启动前执行 `systemctl daemon-reload`
    
4. 使用 `journalctl -xe` 调试失败原因
    
5. 服务程序必须避免 daemonize（若 `Type=simple`）
    
6. 用 `Restart=on-failure` 自动恢复意外崩溃的服务
    

---

是否希望我接下来帮你画一张图，展示一个 **`.service` 单元的生命周期与 systemd 交互流程图**（从 systemctl → manager → journald → cgroup）？  
那张图能直观看到 unit 是怎么被加载、启动、监控、停止的。


