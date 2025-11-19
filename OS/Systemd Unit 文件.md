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
