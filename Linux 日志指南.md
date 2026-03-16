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
``` bash
# 配置
/etc/systemd/journald.conf

ForwardToSyslog=yes
```
### logrotata 日志轮转系统
- 压缩日志
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


**常见日志文件：**
- `/var/log/messages`：记录系统的常规信息和错误，是诊断系统问题的首要日志文件。
- `/var/log/secure`：记录与安全相关的事件，如用户认证、授权等操作。
- `/var/log/cron`：记录定时任务（如 cron 作业）的执行情况。
- `/var/log/dmesg`：记录系统启动时内核产生的消息，可使用 `dmesg` 命令查看。
- `/var/log/boot.log`：记录系统引导过程中的事件。
- `/var/log/maillog`：记录邮件相关的信息。
- `/var/log/btmp`：记录失败的登录尝试，可使用 `lastb` 命令查看。
- `/var/log/wtmp`：永久记录所有用户的登录、注销信息，以及系统的启动、重启、关机事件，可使用 `last` 命令查看。
- `/var/log/utmp`：记录当前已登录的用户信息，可使用 `who`、`w`、`users` 等命令查看。
- `/var/log/lastlog`：记录系统中所有用户最后一次登录时间的日志，可使用 `lastlog` 命令查看。
**日志服务：**
大多数 Linux 发行版使用 `syslog` 或其变体（如 `rsyslog`）作为日志守护进程，负责收集和管理日志信息。配置文件通常位于 `/etc/rsyslog.conf`，可在其中设置不同服务和日志级别的记录方式。
**日志级别：**
日志信息根据严重程度分为不同级别，包括：
- `emerg`：紧急情况，系统不可用。
- `alert`：需要立即采取措施的问题。
- `crit`：严重情况，可能影响系统功能。
- `err`：错误信息。
- `warning`：警告信息。
- `notice`：普通但重要的情况。
- `info`：一般信息。
- `debug`：调试信息。
**日志分析技巧：**
- 使用 `grep` 搜索特定关键词，例如查找失败的登录尝试：
    `grep "Failed password" /var/log/secure`
- 使用 `awk` 提取特定字段，例如统计尝试登录的 IP 地址：
    `grep "Failed password" /var/log/secure | awk '{print $11}' | sort | uniq -c | sort -nr`
- 使用 `tail -f` 实时监控日志文件的最新输出：
    `tail -f /var/log/messages`
通过熟练使用这些日志文件和分析技巧，管理员可以有效地监控系统运行状态，及时发现并解决潜在问题。