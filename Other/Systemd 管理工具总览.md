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