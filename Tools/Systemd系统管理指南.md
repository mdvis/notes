# Systemd系统管理指南

本文档整合了Systemd的核心知识，包括基本概念、管理命令、Unit文件配置和系统维护。

## 目录
1. [Systemd概述](#systemd概述)
2. [Systemd管理命令](#systemd管理命令)
3. [Systemd Unit文件](#systemd-unit文件)
4. [Systemd架构组成](#systemd架构组成)
5. [Systemd最佳实践](#systemd最佳实践)
6. [故障排除](#故障排除)

## Systemd概述

### 什么是Systemd

Systemd是一个系统和服务管理器，已成为大多数现代Linux发行版的默认初始化系统。它替代了传统的SysV init系统，提供了并行启动、按需激活、依赖管理等功能。

### 主要特性

1. **并行启动**：同时启动多个服务，大幅提升启动速度
2. **按需激活**：服务只在需要时启动，节省系统资源
3. **依赖管理**：自动处理服务间的依赖关系
4. **统一管理**：统一的服务管理接口
5. **日志集成**：集成了journald日志系统
6. **资源控制**：支持cgroup资源限制
7. **定时任务**：替代cron的定时任务功能

### Systemd核心组件

- **systemd**：核心守护进程，PID为1
- **journald**：日志管理系统
- **logind**：会话管理
- **networkd**：网络配置管理
- **timedated**：时间管理
- **localed**：地区和语言设置
- **hostnamed**：主机名管理

## Systemd管理命令

### 基础命令

#### systemctl基础操作
```bash
# 查看系统状态
systemctl status

# 查看所有服务状态
systemctl list-units --type=service

# 查看所有已启用的服务
systemctl list-unit-files --state=enabled

# 查看失败的服务
systemctl --failed
```

#### 服务管理
```bash
# 启动服务
sudo systemctl start service_name

# 停止服务
sudo systemctl stop service_name

# 重启服务
sudo systemctl restart service_name

# 重新加载配置（不重启服务）
sudo systemctl reload service_name

# 查看服务状态
systemctl status service_name

# 查看服务详细信息
systemctl show service_name

# 查看服务日志
journalctl -u service_name
```

#### 开机启动管理
```bash
# 启用服务（开机自启动）
sudo systemctl enable service_name

# 禁用服务
sudo systemctl disable service_name

# 立即启用并设置为开机启动
sudo systemctl enable --now service_name

# 查看服务是否启用开机启动
systemctl is-enabled service_name

# 查看服务状态
systemctl is-active service_name
```

### 高级管理命令

#### 服务依赖关系
```bash
# 查看服务依赖
systemctl list-dependencies service_name

# 递归查看所有依赖
systemctl list-dependencies --all service_name

# 查看哪些服务依赖于指定服务
systemctl list-reverse-dependencies service_name
```

#### 性能分析
```bash
# 分析启动过程
systemd-analyze

# 详细启动分析
systemd-analyze blame

# 显示单元文件
systemd-analyze critical-chain

# 显示安全分析
systemd-analyze security
```

#### 资源管理
```bash
# 查看服务资源使用情况
systemd-cgtop

# 查看特定服务资源限制
systemctl show service_name -p CPUQuota,MemoryLimit
```

### 系统管理命令

#### 电源管理
```bash
# 重启系统
sudo systemctl reboot

# 关闭系统
sudo systemctl poweroff

# 挂起系统
sudo systemctl suspend

# 休眠系统
sudo systemctl hibernate

# 混合睡眠
sudo systemctl hybrid-sleep
```

#### 运行级别管理
```bash
# 查看当前运行级别
systemctl get-default

# 设置默认运行级别
sudo systemctl set-default graphical.target
sudo systemctl set-default multi-user.target

# 切换运行级别（不重启）
sudo systemctl isolate multi-user.target
sudo systemctl isolate graphical.target

# 查看可用target
systemctl list-units --type=target --all
```

#### 紧急模式
```bash
# 进入紧急模式
sudo systemctl emergency

# 进入救援模式
sudo systemctl rescue

# 从紧急模式恢复正常
systemctl default
```

### 日志管理

#### journalctl基础用法
```bash
# 查看系统日志
journalctl

# 查看实时日志
journalctl -f

# 查看最新日志
journalctl -n 100

# 查看特定时间段的日志
journalctl --since "2024-12-01 10:00:00"
journalctl --until "2024-12-01 11:00:00"

# 查看最近的错误日志
journalctl -p err

# 查看特定服务的日志
journalctl -u service_name

# 查看内核日志
journalctl -k
```

#### 日志过滤和分析
```bash
# 过滤特定进程的日志
journalctl _PID=1234

# 过滤特定用户的日志
journalctl _UID=1000

# 查看特定单元的日志
journalctl -u service_name.service

# 组合过滤条件
journalctl _SYSTEMD_UNIT=nginx.service _PID=1234

# 查看启动日志
journalctl -b

# 查看上次启动的日志
journalctl -b -1
```

## Systemd Unit文件

### Unit文件类型

Systemd支持多种Unit类型：

1. **Service Unit (`.service`)**：系统服务
2. **Socket Unit (`.socket`)**：网络套接字
3. **Device Unit (`.device`)**：设备文件
4. **Mount Unit (`.mount`)**：文件系统挂载点
5. **Automount Unit (`.automount`)**：自动挂载
6. **Swap Unit (`.swap`)**：交换分区
7. **Target Unit (`.target`)**：运行级别目标
8. **Path Unit (`.path`)**：路径监控
9. **Timer Unit (`.timer`)**：定时器
10. **Slice Unit (`.slice`)**：资源管理分组

### Service Unit文件详解

#### 基本结构
```ini
[Unit]
Description=My Custom Service
Documentation=man:myservice(8)
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=myservice
Group=myservice
ExecStart=/usr/bin/myservice --config /etc/myservice.conf
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

#### Unit Section详解
```ini
[Unit]
Description=服务描述信息
Documentation=文档链接
After=在哪些unit之后启动
Before=在哪些unit之前启动
Requires=强依赖的unit
Wants=弱依赖的unit
PartOf=属于哪个unit
Conflicts=冲突的unit
```

#### Service Section详解
```ini
[Service]
# 服务类型
Type=simple|exec|forking|oneshot|dbus|notify|idle

# 执行用户和组
User=username
Group=groupname

# 工作目录
WorkingDirectory=/path/to/directory

# 环境变量
Environment="VAR1=value1"
Environment="VAR2=value2"
EnvironmentFile=/path/to/env-file

# 启动命令
ExecStart=/path/to/executable [arguments]
ExecStartPre=/path/to/pre-command
ExecStartPost=/path/to/post-command

# 重启配置
Restart=no|on-success|on-failure|on-abnormal|on-watchdog|on-abort|always
RestartSec=重启前等待时间
StartLimitInterval=重启限制时间
StartLimitBurst=重启限制次数

# 资源限制
LimitCPU=CPU限制
LimitFSIZE=文件大小限制
LimitNOFILE=文件描述符限制

# 安全设置
NoNewPrivileges=true
ProtectSystem=full
ProtectHome=true
```

#### Install Section详解
```ini
[Install]
Alias=服务的别名
WantedBy=哪些target会自动启用这个服务
RequiredBy=哪些target会要求这个服务
Also=同时启用的其他服务
```

### 创建自定义Service

#### 示例1：Web应用服务
```ini
[Unit]
Description=My Web Application
Documentation=https://github.com/user/myapp
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=webapp
Group=webapp
WorkingDirectory=/opt/webapp
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/node /opt/webapp/app.js
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=mywebapp

# 安全配置
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/webapp/data

[Install]
WantedBy=multi-user.target
```

#### 示例2：数据库服务
```ini
[Unit]
Description=PostgreSQL Database Server
Documentation=man:postgres(1)
After=network.target
Wants=network-online.target

[Service]
Type=notify
User=postgres
Group=postgres
Environment=PGDATA=/var/lib/postgresql/data
ExecStart=/usr/lib/postgresql/14/bin/postgres -D ${PGDATA}
ExecReload=/bin/kill -HUP $MAINPID
KillMode=mixed
KillSignal=SIGINT
TimeoutSec=0

# 资源限制
LimitNOFILE=65536
MemoryMax=4G

[Install]
WantedBy=multi-user.target
```

#### 示例3：定时任务服务
```ini
# timer文件
[Unit]
Description=Run my script daily
Requires=myapp.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

```ini
# 对应的service文件
[Unit]
Description=My Daily Task

[Service]
Type=oneshot
ExecStart=/opt/scripts/daily-task.sh
```

### Unit文件管理

#### 创建和管理Unit文件
```bash
# 系统级Unit文件位置
/etc/systemd/system/
/usr/lib/systemd/system/

# 用户级Unit文件位置
~/.config/systemd/user/
/usr/lib/systemd/user/

# 创建自定义服务
sudo nano /etc/systemd/system/myservice.service

# 重新加载systemd配置
sudo systemctl daemon-reload

# 启用服务
sudo systemctl enable myservice.service

# 启动服务
sudo systemctl start myservice.service
```

#### Unit文件语法检查
```bash
# 检查Unit文件语法
systemd-analyze verify /etc/systemd/system/myservice.service

# 查看解析后的Unit文件
systemd-cat myservice.service
```

## Systemd架构组成

### 核心组件详解

#### 1. systemd核心进程
```bash
# 查看systemd进程
ps aux | grep systemd

# 查看systemd版本
systemd --version
```

#### 2. journald日志系统

**特性：**
- 二进制日志格式，高效存储
- 结构化日志数据
- 元数据自动收集
- 查看历史日志（持久化存储）

**配置文件：**`/etc/systemd/journald.conf`

```ini
[Journal]
Storage=persistent          # persistent|volatile|auto
Compress=yes                # 压缩日志
Seal=yes                    # 安全密封
SplitMode=uid               # split|uid
RateLimitInterval=30s       # 速率限制间隔
RateLimitBurst=10000        # 速率限制突发
SystemMaxUse=10%            # 系统日志最大使用量
SystemMaxFileSize=100M      # 单个日志文件最大大小
```

#### 3. logind会话管理

**功能：**
- 用户登录/注销管理
- 会话权限控制
- 设备访问控制
- 挂起/休眠管理

**配置文件：**`/etc/systemd/logind.conf`

```ini
[Login]
HandlePowerKey=poweroff     # 电源键行为
HandleSuspendKey=suspend    # 挂起键行为
HandleHibernateKey=hibernate # 休眠键行为
HoldoffTimeoutSec=30s       # 操作延迟时间
IdleAction=ignore           # 空闲时操作
IdleActionSec=30min         # 空闲时间
```

#### 4. networkd网络管理

**功能：**
- 网络接口配置
- 路由管理
- DNS配置
- 网络设备监控

**配置文件位置：**
- `/etc/systemd/network/` - 网络配置
- `/etc/systemd/resolved.conf` - DNS配置

```ini
# 示例网络配置文件
[Match]
Name=eth0

[Network]
DHCP=yes
Address=192.168.1.100/24
Gateway=192.168.1.1
DNS=8.8.8.8
```

#### 5. timedated时间管理

**功能：**
- 系统时间管理
- 时区设置
- NTP同步

**命令：**
```bash
# 查看当前时间设置
timedatectl status

# 设置时区
sudo timedatectl set-timezone Asia/Shanghai

# 设置NTP同步
sudo timedatectl set-ntp true

# 手动设置时间
sudo timedatectl set-time "2024-12-01 10:00:00"
```

#### 6. localed地区设置

**功能：**
- 系统语言设置
- 字符编码配置
- 键盘布局设置

**命令：**
```bash
# 查看当前地区设置
localectl status

# 设置系统语言
sudo localectl set-locale LANG=zh_CN.UTF-8

# 设置键盘布局
sudo localectl set-keymap us
```

### 进程管理和服务生命周期

#### 1. 服务状态转换
```
Inactive → Loading → Active (running) → Deactivating → Inactive
            ↓
         Failed → Auto-restart
```

#### 2. 启动顺序管理
```bash
# 查看启动依赖图
systemd-analyze dot > boot_dependencies.dot

# 查看启动过程
systemd-analyze critical-chain

# 查看启动时间
systemd-analyze blame
```

## Systemd最佳实践

### 服务配置最佳实践

#### 1. 安全配置
```ini
[Service]
# 安全配置
NoNewPrivileges=true          # 禁止获得新权限
ProtectSystem=full           # 保护系统文件系统
ProtectHome=true             # 保护用户主目录
PrivateTmp=true              # 使用私有临时目录
ProtectKernelTunables=true   # 保护内核参数
ProtectKernelModules=true    # 保护内核模块
ProtectControlGroups=true    # 保护cgroup控制

# 网络安全
PrivateNetwork=true          # 使用私有网络
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
IPAddressDeny=any
IPAddressAllow=localhost

# 文件系统访问
ReadOnlyPaths=/etc/
ReadWritePaths=/var/log/myapp/
```

#### 2. 资源限制
```ini
[Service]
# CPU限制
CPUQuota=50%                 # 限制CPU使用率
CPUAffinity=0,1             # 指定CPU核心

# 内存限制
MemoryMax=1G                # 最大内存使用
MemoryLow=512M              # 内存低水位
MemorySwapMax=1G            # 交换空间限制

# 文件描述符限制
LimitNOFILE=65536          # 最大文件描述符数

# 进程数限制
LimitNPROC=100             # 最大进程数
```

#### 3. 日志配置
```ini
[Service]
# 标准输出重定向
StandardOutput=journal
StandardError=journal
SyslogIdentifier=myapp

# 日志级别
LogLevelMax=info
LogRateLimitInterval=1s
LogRateLimitBurst=1000
```

### 系统管理最佳实践

#### 1. 服务监控
```bash
# 创建服务状态监控脚本
#!/bin/bash
services=("nginx" "mysql" "redis")

for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        echo "$service is running"
    else
        echo "$service is not running"
        # 可选：自动重启服务
        # systemctl restart $service
    fi
done
```

#### 2. 日志轮转配置
```ini
# /etc/logrotate.d/myapp
/var/log/myapp/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 myapp myapp
    postrotate
        systemctl reload myapp
    endscript
}
```

#### 3. 性能优化
```bash
# 优化系统启动
sudo systemctl disable bluetooth
sudo systemctl disable cups
sudo systemctl disable avahi-daemon

# 设置启动超时
sudo mkdir -p /etc/systemd/system.conf.d
echo "DefaultTimeoutStartSec=10s" | sudo tee /etc/systemd/system.conf.d/timeout.conf
echo "DefaultTimeoutStopSec=10s" | sudo tee -a /etc/systemd/system.conf.d/timeout.conf

# 重新加载配置
sudo systemctl daemon-reload
```

## 故障排除

### 常见问题及解决方案

#### 1. 服务无法启动
```bash
# 查看详细错误信息
systemctl status service_name
journalctl -u service_name

# 检查服务配置文件语法
systemd-analyze verify /etc/systemd/system/service_name.service

# 手动测试启动命令
sudo -u username /path/to/executable
```

#### 2. 服务自动重启
```bash
# 查看重启历史
journalctl -u service_name | grep "Restarting"

# 修改重启策略
sudo nano /etc/systemd/system/service_name.service
# 修改Restart和RestartSec设置

# 重新加载并应用
sudo systemctl daemon-reload
sudo systemctl restart service_name
```

#### 3. 权限问题
```bash
# 检查文件权限
ls -la /path/to/executable
ls -la /path/to/config

# 检查用户/组权限
id username
groups username

# 修复权限
sudo chown user:group /path/to/file
sudo chmod 755 /path/to/executable
```

#### 4. 资源限制问题
```bash
# 查看资源使用情况
systemctl show service_name -p CPUQuota,MemoryLimit
systemd-cgtop

# 查看系统限制
ulimit -a
cat /proc/limits

# 调整限制
sudo nano /etc/systemd/system/service_name.service
# 修改LimitNOFILE等设置
```

#### 5. 网络相关服务问题
```bash
# 检查网络状态
systemctl status network.target
ip addr show
netstat -tlnp

# 检查防火墙设置
sudo ufw status
sudo iptables -L

# 检查DNS解析
nslookup hostname
dig hostname
```

### 调试技巧

#### 1. 详细日志
```bash
# 增加日志详细程度
sudo systemctl edit service_name
```

```ini
[Service]
Environment=SYSTEMD_LOG_LEVEL=debug
```

```bash
# 查看系统级调试日志
sudo journalctl -b -p debug
```

#### 2. 单元测试
```bash
# 测试单元文件
systemd-analyze verify service_name.service

# 模拟启动（不实际执行）
systemd-run --dry-run --unit=test /path/to/executable
```

#### 3. 进程跟踪
```bash
# 追踪进程
sudo strace -p $(pgrep process_name)

# 网络连接跟踪
sudo netstat -tpan | grep process_name
```

通过遵循这些最佳实践和故障排除方法，可以有效地管理Systemd服务，确保系统的稳定运行。