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