在 Linux 系统中，systemd 是一种常见的系统和服务管理器。它有一套强大的工具集，用于管理和控制系统的启动过程、服务和守护进程。以下是一些常用的 systemd 工具和命令：

1. systemctl  
    systemctl 是 systemd 的主要命令行工具，用于启动、停止、重启、检查服务状态等。  
    常用命令：

systemctl start ：启动指定服务。  
systemctl stop ：停止指定服务。  
systemctl restart ：重启指定服务。  
systemctl status ：查看服务的状态。  
systemctl enable ：设置服务在启动时自动启动。  
systemctl disable ：禁用服务的自动启动。  
systemctl list-units：列出所有当前加载的服务单元（包括活动和非活动服务）。  
systemctl is-active ：检查服务是否处于活动状态。  
systemctl show ：显示服务的详细信息。  
1. journalctl  
journalctl 用于查看 systemd 日志，查看系统日志非常方便。  
常用命令：

journalctl：查看所有日志。  
journalctl -xe：查看系统中断时的日志。  
journalctl -u ：查看特定服务的日志。  
journalctl --since "YYYY-MM-DD HH:MM:SS"：查看自指定时间以来的日志。  
journalctl --until "YYYY-MM-DD HH:MM:SS"：查看直到指定时间为止的日志。  
1. systemd-analyze  
systemd-analyze 用于分析系统启动性能，检查启动过程的瓶颈。  
常用命令：

systemd-analyze：查看系统启动时间。  
systemd-analyze blame：列出启动过程中各个服务的启动时间（按时间排序）。  
systemd-analyze critical-chain：显示启动过程中最耗时的服务链。  
systemd-analyze plot：生成启动图表，帮助分析启动性能。  
1. systemd-cgls  
systemd-cgls 用于查看系统的控制组（cgroup）树结构，帮助查看系统资源分配。  
命令：

systemd-cgls：显示当前系统的 cgroup 层级。  
1. systemd-run  
systemd-run 用于启动一个服务并使其成为一个临时的 systemd 服务。  
命令：

systemd-run ：以一个单独的单元运行指定命令。  
1. systemd-tmpfiles  
systemd-tmpfiles 用于管理临时文件。  
常用命令：

systemd-tmpfiles --clean：清理无用的临时文件。  
systemd-tmpfiles --create：根据配置文件创建必要的临时文件。  
1. loginctl  
loginctl 用于管理用户会话和登录信息。  
常用命令：

loginctl list-users：列出当前所有登录的用户。  
loginctl list-sessions：列出当前所有会话。  
loginctl show ：查看指定用户的详细信息。  
1. hostnamectl  
hostnamectl 用于查看和设置主机名（hostname）。  
常用命令：

hostnamectl：查看当前主机的相关信息（如主机名、操作系统、内核等）。  
hostnamectl set-hostname ：设置主机名。

以下是 systemd 常用工具集的整理，涵盖服务管理、日志分析、系统配置、启动优化等场景：

1. 服务管理工具 (systemctl)  
    核心功能：管理系统服务（启动、停止、状态查看等）。

常用命令：

bash  
复制  
systemctl start # 启动服务  
systemctl stop # 停止服务  
systemctl restart # 重启服务  
systemctl status # 查看服务状态  
systemctl enable # 设置开机自启  
systemctl disable # 禁用开机自启  
systemctl is-active # 检查服务是否运行  
systemctl list-unit-files # 列出所有已安装的服务单元  
systemctl list-dependencies # 查看服务依赖关系  
1. 日志管理工具 (journalctl)  
核心功能：查看和管理 systemd 日志（基于 journald）。

常用命令：

bash  
复制  
journalctl -u # 查看指定服务的日志  
journalctl -f # 实时跟踪最新日志（类似 `tail -f`）  
journalctl -b # 查看本次启动的日志  
journalctl --since "2023-10-01" --until "2023-10-02" # 按时间筛选  
journalctl -p err # 仅显示错误日志（按优先级过滤）  
journalctl -k # 查看内核日志  
1. 系统启动管理  
目标（Target）管理（替代传统运行级别）：

bash  
复制  
systemctl isolate graphical.target # 切换到图形界面模式  
systemctl set-default multi-user.target # 设置默认启动为命令行模式  
systemctl get-default # 查看当前默认启动目标  
启动耗时分析：

bash  
复制  
systemd-analyze # 显示系统总启动时间  
systemd-analyze blame # 按服务列出启动耗时  
systemd-analyze critical-chain # 分析服务启动关键路径  
systemd-analyze plot > boot.svg # 生成启动过程时序图（SVG）  
1. 主机与系统配置工具  
主机名与时区：

bash  
复制  
hostnamectl set-hostname # 修改主机名  
hostnamectl status # 查看主机信息  
timedatectl set-timezone Asia/Shanghai # 设置时区  
timedatectl list-timezones # 列出所有时区  
本地化设置：

bash  
复制  
localectl set-locale LANG=en_US.UTF-8 # 设置系统语言  
localectl list-keymaps # 列出可用键盘布局  
1. 电源管理  
控制电源状态：

bash  
复制  
systemctl reboot # 重启系统  
systemctl poweroff # 关机  
systemctl suspend # 挂起（睡眠）  
systemctl hibernate # 休眠  
1. 其他实用工具  
临时运行服务：

bash  
复制  
systemd-run --unit=custom-task /path/to/command # 以临时服务运行命令  
资源监控：

bash  
复制  
systemd-cgtop # 实时监控控制组（cgroup）资源占用  
用户级服务管理：

bash  
复制  
systemctl --user start # 管理用户级别的服务（需启用 linger）  
1. 配置文件与重载  
单元文件路径：

系统级：/usr/lib/systemd/system/

自定义：/etc/systemd/system/

重载配置：

bash  
复制  
systemctl daemon-reload # 修改服务配置后必须执行  
常用场景示例  
排查服务失败：

bash  
复制  
systemctl status nginx # 查看状态  
journalctl -u nginx -p 3 --since "10 min ago" # 过滤错误日志  
优化启动速度：

bash  
复制  
systemd-analyze blame # 找出耗时长的服务  
systemctl disable slow-service # 禁用非必要服务  
掌握这些工具可显著提升 Linux 系统管理效率！