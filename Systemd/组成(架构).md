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