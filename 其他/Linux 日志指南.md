Linux 系统拥有强大的日志功能，能够记录系统和应用程序的各种运行信息，帮助管理员监控系统状态、诊断问题并进行故障排除。
## 主流日志体系
### `rsyslog` 常见服务器日志系统
 - 配置文件 `/etc/rsyslog.conf` `/etc/rsyslog.d/*.conf`
 - 特点
	 1. 高性能
	 2. 支持 TCP/UDP
	 3. 支持日志转发
	 4. 支持数据库
	 5. 支持 Kafka/Elasticsearch
- 日志级别
	1. emerg 系统不可用
	2. alert 需立即处理
	3. crit 严重错误
	4. err 错误
	5. warning 警告
	6. notice 正常但重要
	7. info 信息
	8. debug 调试
- 日志来源
	1. auth 认证
	2. authpriv 私密认证
	3. cron 计划任务
	4. daemon 守护进程
	5. kern 内核
	6. mail 邮件
	7. user 用户程序
	8. local0-7 自定义
### `systemd-journald` 现代 linux 日志系统
- 结构化日志系统(KV格式)；自动索引(可以按 service、pid、时间、uid、priority 查询)；统一 systemd 服务日志；支持内核日志
- 易失日志 `/run/log/journal/`；持久日志 `/var/log/journal`；二进制格式；
### `rsyslog`+`journald` journald 负责收集 rsyslog 存储文本日志
systemd-journald 负责从内核、服务标准输出/错误、审计系统中实时收集日志；rsyslog 负责从 journald 接收数据，根据规则将其分拣、过滤并保存为纯文本文件。
``` bash
# 配置
/etc/systemd/journald.conf

ForwardToSyslog=yes
```
### logrotata 日志轮转系统
- 压缩日志 `.log.1` `.log.2.gz`
- 定期切割
- 删除旧日志
- 配置 `/etc/logrotate.conf` 和 `/etc/logrotate.d/*`

```sh
# 配置示例

/var/log/nginx/*.log {
    daily    # 每日轮转
    rotate 7 # 保留 7 份
    compress # gzip 压缩
}
```

周期：daily、weekly、monthly、yearly、hourly
保留数量：rotate，例如 `rotate 7 保留七个旧日志`
大小：size、minsize、maxsize
压缩配置：compress、delaycompress、nocompress、compresscmd、compressext
创建日志：create、nocreate、copytruncate、nocopytruncate
...
### 常见日志文件
#### 通用（跨发行版基本一致）
- `/var/log/dmesg`：记录系统启动时内核产生的消息，可使用 `dmesg` 命令查看。（启动日志）
- `/var/log/boot.log`：记录系统引导过程中的事件。（启动）
- `/var/log/kern.log`：内核日志
- `/var/log/cron`：记录定时任务（如 cron 作业）的执行情况。
- `/var/log/audit/audit.log`：auditd 审计日志（需安装 auditd，主要 RHEL 系）
- `/var/log/journal/`：journald 持久化日志（systemd 发行版通用）
- `/run/log/journal/`：journald 易失日志（systemd 发行版通用）
#### 发行版差异（同名功能、不同路径）
| 功能 | Debian/Ubuntu 系 | RHEL/CentOS/SUSE 系 |
| --- | --- | --- |
| 系统常规日志 | `/var/log/syslog` | `/var/log/messages` |
| 认证/安全日志 | `/var/log/auth.log` | `/var/log/secure` |
> 注：以上文本日志是否生成取决于是否安装/运行 rsyslog；查询入口统一用 `journalctl` 跨发行版通用。
### journald
- `-b` 本次启动日志
- `-u` 查看某服务日志`journalctl -u ssh`
- `-f` 实时跟踪
- `-p`
- `--since`
- `--until`
- `-k`
## 安全审计日志（auditd）
安全审计系统，主要用于监控文件访问、监控系统调用、安全审计；日志文件`/var/log/audit/audit.log`
## 内核日志（klog/dmesg）
`/proc/kmsg` 日志缓冲区
## 日志存储层
1. journald 二进制日志
	- `/run/log/journal`
	- `/var/log/journal`
2. 传统文本日志
	- `/var/log`

---

主流发行版日志系统上形成了比较清晰的格局，主要围绕两个核心组件：
- **systemd-journald**（简称journaVjld）：二进制日志、本地优先、结构化、systemd原生
- **rsyslog**：传统文本日志、可持久化到文件、网络转发能力强
绝大多数现代发行版都**同时存在两者**，但“谁是主要日志查看入口”有所不同。
## 服务器常用发行版日志系统现状
- RHEL. journalctl + rsyslog  /var/log/messages
- Debian  journalctl + rsyslog  /var/log/syslog   (默认没有 rsyslog,需要单装)
- SUSE  journalctl + rsyslog  /var/log/messages
## 快速记忆口诀（2025–2026年现状）
- 只要是**systemd**发行版（几乎全部现代发行版）→ journalctl 永远都能用
- 服务器生产环境 → **90%+** 都会装rsyslog并保留传统文本日志
- 桌面普通用户 → 越来越多人只看journalctl（或图形化的Logs工具）
- 还想保留经典 /var/log/messages、/var/log/secure 等文件, 装rsyslog（或syslog-ng）
- 极少数非systemd发行版（如Alpine、Void、Gentoo不强制systemd）→ 基本还是rsyslog / syslog-ng / busybox-syslog
## 查看当前系统日志方式对比
```bash
# 几乎所有现代系统都能用（推荐）
journalctl -u ssh               # 查看sshd服务日志
journalctl -b -p err            # 本次启动的错误日志
journalctl --since "2025-03-01" # 时间范围查询

# 传统方式（需要rsyslog或syslog-ng在运行）
tail -f /var/log/syslog         # Ubuntu/Debian风格
tail -f /var/log/messages       # RHEL/CentOS/openSUSE风格
less /var/log/secure            # 认证日志（RHEL系）
```