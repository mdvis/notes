# 开发运维管理必备 Linux 命令

## 🔥 核心命令（必须掌握）

### 文件操作
- `ls` - 列出目录内容
- `cd` - 切换目录
- `pwd` - 显示当前工作目录
- `cp` - 复制文件/目录
- `mv` - 移动/重命名文件
- `rm` - 删除文件
- `mkdir` - 创建目录
- `chmod` - 修改文件权限
- `chown` - 修改文件所有者
- `find` - 搜索文件和目录

### 文本处理
- `cat` - 显示文件内容
- `grep` - 搜索文本模式
- `sed` - 流编辑器，用于过滤和转换文本
- `awk` - 文本处理工具
- `head` - 显示文件开头几行
- `tail` - 显示文件末尾几行（日志监控必备）
- `less` - 分页查看文件内容

### 系统监控
- `ps` - 显示运行进程
- `top` - 实时进程查看器
- `htop` - 增强版交互式进程查看器
- `free` - 显示内存使用情况
- `df` - 显示文件系统磁盘空间
- `du` - 显示目录磁盘使用量
- `lsof` - 列出打开的文件和进程

### 网络连接
- `ping` - 测试网络连通性
- `curl` - 从服务器传输数据
- `wget` - 从网络下载文件
- `ssh` - 安全shell远程访问
- `scp` - 通过网络安全复制文件

### 进程管理
- `kill` - 终止进程
- `killall` - 按名称杀死进程
- `jobs` - 显示活动作业
- `nohup` - 运行免疫挂起的命令

### 系统信息
- `uname` - 系统信息
- `whoami` - 当前用户名
- `id` - 用户和组ID
- `uptime` - 系统运行时间和负载

## 🔶 高优先级命令（应尽快学习）

### 高级文件操作
- `tar` - 归档文件
- `gzip/gunzip` - 压缩/解压缩文件
- `zip/unzip` - 创建/提取zip压缩包
- `rsync` - 高效文件同步
- `ln` - 创建链接

### 系统管理
- `sudo` - 以其他用户身份执行
- `su` - 切换用户
- `passwd` - 修改密码
- `useradd/userdel` - 管理用户
- `systemctl` - 控制systemd服务
- `service` - 控制系统服务
- `mount/umount` - 挂载/卸载文件系统
- `fdisk` - 管理磁盘分区

### 网络工具
- `netstat` - 网络连接和统计信息
- `ss` - netstat的现代替代品
- `ip` - 配置网络接口
- `ifconfig` - 配置网络接口（传统工具）
- `iptables` - 配置防火墙规则
- `dig` - DNS查询工具
- `nslookup` - DNS查询

### 开发工具
- `git` - 版本控制（开发者绝对必备）
- `make` - 构建自动化工具
- `diff` - 比较文件
- `wc` - 单词、行数、字符计数

### 文本操作
- `sort` - 排序文本行
- `uniq` - 删除重复行
- `cut` - 从文本中提取列
- `tr` - 字符转换
- `xargs` - 从输入构建命令行

## 🔸 中等优先级命令（有用的知识）

### 系统监控和调试
- `dmesg` - 内核环形缓冲区消息
- `journalctl` - 查看systemd日志
- `lscpu` - CPU信息
- `lsblk` - 列出块设备
- `lsmod` - 列出内核模块
- `lspci` - 列出PCI设备

### 文件系统
- `fsck` - 文件系统检查
- `mkfs` - 创建文件系统
- `blkid` - 块设备属性
- `file` - 确定文件类型

### 归档和压缩
- `7z` - 7-zip压缩工具
- `bzip2` - Bzip2压缩

### 网络诊断
- `traceroute` - 跟踪网络路径
- `mtr` - 网络诊断工具
- `tcpdump` - 数据包分析器

### 安全
- `openssl` - SSL/TLS工具包
- `gpg` - GNU隐私保护

## 🔹 专业命令（按需学习）

### 包管理
- `apt-get` - Debian/Ubuntu包管理器
- `yum` - RHEL/CentOS包管理器
- `dnf` - 现代RHEL包管理器
- `rpm` - RPM包管理器
- `pacman` - Arch Linux包管理器

### 文本编辑器和查看器
- `vi/vim` - 文本编辑器（学习基础用法）
- `nano` - 简单文本编辑器

### 高级系统工具
- `cron/crontab` - 计划任务
- `screen` - 终端复用器
- `strace` - 系统调用跟踪器
- `sysctl` - 配置内核参数

## 📚 学习策略

### 第一阶段：基础（第1-2周）
掌握**核心命令** - 这些是日常使用的命令

### 第二阶段：运维（第3-4周）
学习**高优先级命令**用于系统管理和开发

### 第三阶段：专业化（持续进行）
根据具体工作需求掌握**中等/专业命令**

## 🛠️ 日常工作流命令

对于典型的开发运维日常工作，专注于这些最常用的组合：

```bash
# 文件导航和管理
ls -la && cd /path/to/project && pwd

# 进程监控
ps aux | grep process_name
top -p $(pgrep process_name)

# 日志监控
tail -f /var/log/application.log
journalctl -u service_name -f

# 文件搜索
find /path -name "*.log" -type f
grep -r "error" /var/log/

# 系统健康检查
df -h && free -h && uptime

# 网络调试
ping google.com && curl -I http://service.com
netstat -tlnp | grep :80
```

## 💡 专业技巧

1. **学习命令参数**：`-l`、`-a`、`-r`、`-f` 在许多命令中都常用
2. **使用手册页面**：`man command_name` 查看详细文档
3. **命令历史**：使用 `history` 和 `Ctrl+R` 搜索之前的命令
4. **别名**：为常用命令组合创建快捷方式
5. **管道和重定向**：掌握 `|`、`>`、`>>`、`<` 进行命令链接

从核心命令开始，然后根据具体工作需求逐步扩展知识面！