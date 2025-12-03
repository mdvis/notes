# SSH 完整指南

---
title: SSH Complete Guide
date: 2021-01-27 11:48:05
background: bg-blue-400
tags:
  - protocol
  - remote
  - network
  - 22
categories:
  - Linux Command
---

## 快速开始

### 基本连接

连接到服务器（默认端口 22）

```shell
$ ssh root@192.168.1.5
```

指定端口连接

```shell
$ ssh root@192.168.1.5 -p 6222
$ ssh -p 2222 user@hostname
```

使用 pem 文件连接（权限需为 0400）

```shell
$ ssh -i /path/file.pem root@192.168.1.5
$ ssh -i ~/.ssh/my_key user@hostname
```

### 远程执行

执行远程命令

```shell
$ ssh root@192.168.1.5 'ls -l'
$ ssh user@hostname "ls -l"
```

调用本地脚本

```shell
$ ssh root@192.168.1.5 bash < script.sh
```

压缩并下载文件

```shell
$ ssh root@192.168.1.5 "tar cvzf - ~/source" > output.tgz
```

### SCP 文件传输

从远程复制到本地

```shell
$ scp user@server:/dir/file.ext dest/
```

在两个服务器之间复制

```shell
$ scp user@server:/file user@server:/dir
```

从本地复制到远程

```shell
$ scp dest/file.ext user@server:/dir
```

递归复制整个文件夹

```shell
$ scp -r user@server:/dir dest/
```

复制文件夹中的所有文件

```shell
$ scp user@server:/dir/* dest/
```

从服务器文件夹复制到当前文件夹

```shell
$ scp user@server:/dir/* .
```

### SCP 选项

| 选项      | 说明                     |
| --------- | ------------------------ |
| scp `-r`  | 递归复制整个目录         |
| scp `-C`  | 压缩数据                 |
| scp `-v`  | 显示详细信息             |
| scp `-P`  | 指定端口                 |
| scp `-B`  | 批处理模式（无密码提示） |
| scp `-p`  | 保留文件时间和权限       |

## SSH 配置

### 配置文件位置

| 文件路径                 | 说明             |
| ------------------------ | ---------------- |
| `/etc/ssh/ssh_config`    | 系统范围配置     |
| `~/.ssh/config`          | 用户特定配置     |
| `~/.ssh/id_{type}`       | 私钥             |
| `~/.ssh/id_{type}.pub`   | 公钥             |
| `~/.ssh/known_hosts`     | 已知服务器       |
| `~/.ssh/authorized_keys` | 授权登录密钥     |

### 配置示例

```toml
Host server1
    HostName 192.168.1.5
    User root
    Port 22
    IdentityFile ~/.ssh/server1.key
```

通过别名连接

```shell
$ ssh server1
```

## SSH 连接选项

### 常用参数

- `-p` 指定端口
- `-i <私钥>` 指定私钥文件进行认证（默认 `~/.ssh/id_rsa`）
- `-l` 指定连接远程服务器登录用户名
- `-v` 调试模式，显示详细连接日志（`-v`, `-vv`, `-vvv` 详细度递增）
- `-F` 指定配置文件，使用自定义 SSH 配置 `~/.ssh/config`
- `-N` 不执行远程命令，仅建立链接（常用于端口转发）
- `-C` 压缩传输，启用数据压缩，加快传输速度
- `-q` 静默模式
- `-f` 后台执行 ssh 指令
- `-1` 强制使用 ssh 协议版本 1
- `-2` 强制使用 ssh 协议版本 2
- `-4` 强制使用 IPv4 地址
- `-6` 强制使用 IPv6 地址

### 认证代理

- `-A` 开启认证代理连接转发功能
- `-a` 关闭认证代理连接转发功能

### 网络配置

- `-b` 使用本机指定地址作为对应连接的源 ip 地址

### X11 转发

- `-X` X11 图形界面转发，允许在本地显示远程图形界面程序

```shell
$ ssh -X user@hostname xclock
```

- `-x` 关闭 X11 转发功能
- `-y` 开启信任 X11 转发功能

### 端口转发

本地端口转发，将本地端口流量转发到远程主机端口（用于内网）

```shell
$ ssh -L 8080:localhost:80 user@hostname
```

远程端口转发，将远程主机端口转发到本地端口（反向代理）

```shell
$ ssh -R 8080:localhost:80 user@hostname
```

### 跳板机/代理

代理跳转（跳板机），通过跳板机连接到目标主机

```shell
$ ssh -J jump_user@jump_host user@target_host
$ ssh -J proxy_host1 remote_host2
$ ssh -J user@proxy_host1 user@remote_host2
```

多重跳转

```shell
$ ssh -J user@proxy_host1:port1,user@proxy_host2:port2 user@remote_host3
```

### 自定义配置参数

使用 `-o` 选项自定义配置参数

```shell
$ ssh -o "PasswordAuthentication=no" user@hostname
$ ssh -o "StrictHostKeyChecking=no" user@hostname
$ ssh -o "ServerAliveInterval=60" user@hostname
$ ssh -o "ConnectTimeout=10" user@hostname
$ ssh -o ServerAliveInterval=60 user@hostname
```

- `-o "PasswordAuthentication=no"` 禁用密码认证
- `-o "StrictHostKeyChecking=no"` 跳过主机秘钥验证
- `-o "ServerAliveInterval=60"` 保持连接心跳（按间隔发送心跳包）
- `-o "ConnectTimeout=10"` 设置连接超时

## SSH 密钥生成

### ssh-keygen 命令

为 ssh 生成、管理和转换认证密钥，它支持 RSA 和 DSA 两种认证密钥。

#### 基本语法

```shell
ssh-keygen(选项)
```

#### 主要选项

| 选项 | 说明                           |
| ---- | ------------------------------ |
| `-t` | 指定密钥类型                   |
| `-b` | 指定密钥长度（位数）           |
| `-C` | 添加注释                       |
| `-f` | 指定用来保存密钥的文件名       |
| `-l` | 显示公钥文件的指纹数据         |
| `-p` | 修改私钥密语                   |
| `-y` | 读取私钥输出公钥               |
| `-e` | 读取 openssh 的私钥或公钥文件  |
| `-i` | 读取未加密的 ssh-v2 兼容密钥   |
| `-N` | 提供一个新密语                 |
| `-P` | 提供（旧）密语                 |
| `-q` | 静默模式                       |

#### 密钥类型

**推荐的类型：**

1. **Ed25519**（优先）：适用于新部署环境，兼顾安全性和效率
2. **RSA 4096**：如需兼容旧系统（如 CentOS 7 等），或机构策略要求
3. **检查兼容性**：确认 SSH 服务端和客户端是否支持 Ed25519（OpenSSH 6.5+ 通常支持）

**不推荐的类型：**
- **DSA**：已过时，OpenSSH 7.0+ 默认禁用，存在安全风险
- **RSA 2048 或更短**：不再满足现代安全标准

#### 生成密钥示例

生成 Ed25519 密钥（默认保存为 ~/.ssh/id_ed25519）

```bash
ssh-keygen -t ed25519
```

生成 RSA 4096 密钥

```bash
ssh-keygen -t rsa -b 4096
```

生成 RSA 4096 位密钥带邮箱注释

```shell
$ ssh-keygen -t rsa -b 4096 -C "your@mail.com"
```

#### 密钥管理

交互式生成密钥

```shell
$ ssh-keygen
```

指定文件名

```shell
$ ssh-keygen -f ~/.ssh/filename
```

从私钥生成公钥

```shell
$ ssh-keygen -y -f private.key > public.pub
```

修改密钥注释

```shell
$ ssh-keygen -c -f ~/.ssh/id_rsa
```

修改私钥密语

```shell
$ ssh-keygen -p -f ~/.ssh/id_rsa
```

#### known_hosts 管理

搜索 known_hosts

```shell
$ ssh-keygen -F <ip/hostname>
```

从 known_hosts 移除

```shell
$ ssh-keygen -R <ip/hostname>
```

### ssh-copy-id 命令

把本地主机的 SSH 公钥复制到远程主机的 authorized_keys 文件上。ssh-copy-id 也会给远程主机的用户主目录（home）和 `~/.ssh` 和 `~/.ssh/authorized_keys` 设置合适的权限。

#### 语法

```shell
ssh-copy-id [-i [identity_file]] [user@]machine
```

#### 选项

- `-i` 指定公钥文件
- `-p <端口>` 指定远程主机的 SSH 端口

#### 使用示例

把本地的 SSH 公钥文件安装到远程主机对应的账户下

```shell
$ ssh-copy-id user@server
$ ssh-copy-id -i ~/.ssh/id_rsa.pub user@server
```

将 Ed25519 公钥上传到服务器

```bash
ssh-copy-id -i ~/.ssh/id_ed25519 user@hostname
```

复制到别名服务器

```shell
$ ssh-copy-id server1
```

复制特定密钥

```shell
$ ssh-copy-id -i ~/.ssh/id_rsa.pub user@server
```

#### 前置条件

ssh-copy-id 使用 ssh 登陆远程服务器，一般是通过密码校验用户身份，所以在 sshd 的配置中应该启用密码校验方式：

将 `/etc/ssh/sshd_config` 中的 `PasswordAuthentication` 设置为 `yes`，之后重启 sshd

## SSH 密钥管理工具

### ssh-agent 命令

后台进程，安全存储私钥，避免重复输入密码。SSH 密钥管理器。

**ssh-agent** 是一种控制用来保存公钥身份验证所使用的私钥的程序。ssh-agent 在 X 会话或登录会话之初启动，所有其他窗口或程序则以客户端程序的身份启动并加入到 ssh-agent 程序中。通过使用环境变量，可定位代理并在登录到其他使用 ssh 机器上时使用代理自动进行身份验证。

其实 ssh-agent 就是一个密钥管理器，运行 ssh-agent 以后，使用 ssh-add 将私钥交给 ssh-agent 保管，其他程序需要身份验证的时候可以将验证申请交给 ssh-agent 来完成整个认证过程。

#### 语法

```shell
ssh-agent [-c | -s] [-d] [-a bind_address] [-t life] [command [arg ...]]
ssh-agent [-c | -s] -k
```

#### 选项

- `-a bind_address` 绑定代理到指定的 UNIX 域套接字
- `-c` 生成 C-shell 风格的命令输出
- `-d` 调试模式
- `-k` 把 ssh-agent 进程杀掉
- `-s` 生成 Bourne shell 风格的命令输出
- `-t life` 设置默认值添加到代理人的身份最大寿命

#### 使用示例

运行 ssh-agent

```shell
$ ssh-agent
```

运行 ssh-agent，它会打印出来它使用的环境和变量。

### ssh-add 命令

把专用密钥添加到 ssh-agent 的高速缓存中。

#### 语法

```shell
ssh-add [-cDdLlXx] [-t life] [file ...]
ssh-add -s pkcs11
ssh-add -e pkcs11
```

#### 选项

- `-D` 删除 ssh-agent 中的所有密钥
- `-d <秘钥>` 从 ssh-agent 中删除密钥
- `-e pkcs11` 删除 PKCS#11 共享库 pkcs1 提供的钥匙
- `-s pkcs11` 添加 PKCS#11 共享库 pkcs1 提供的钥匙
- `-L` 显示 ssh-agent 中的公钥
- `-l` 显示 ssh-agent 中的密钥
- `-t <秒数>` 对加载的密钥设置超时时间，超时 ssh-agent 将自动卸载密钥
- `-X` 对 ssh-agent 进行解锁
- `-x` 对 ssh-agent 进行加锁

#### 使用示例

把专用密钥添加到 ssh-agent 的高速缓存中

```shell
$ ssh-add ~/.ssh/id_dsa
```

从 ssh-agent 中删除密钥

```shell
$ ssh-add -d ~/.ssh/id_xxx.pub
```

查看 ssh-agent 中的密钥

```shell
$ ssh-add -l
```

显示 ssh-agent 中的公钥

```shell
$ ssh-add -L
```

对加载的密钥设置超时时间（秒数）

```shell
$ ssh-add -t 3600 ~/.ssh/id_dsa
```

## SSH 登录记录

Linux 中可以使用以下命令来查看使用 SSH 登录的记录：

### last 命令

```shell
$ last -i | grep ssh
```

这将显示最近的 SSH 登录记录，包括用户名、IP 地址和登录时间。

### lastlog 命令

```shell
$ lastlog -u <username> | grep ssh
```

这将显示指定用户的最近一次 SSH 登录记录，包括用户名、IP 地址和登录时间。

### 查看日志文件

#### auth.log 文件（Debian/Ubuntu）

```shell
$ cat /var/log/auth.log | grep ssh
```

这将显示 authentication 日志文件中的 SSH 登录记录，包括用户名、IP 地址和登录时间。

#### secure 文件（RHEL/CentOS）

```shell
$ cat /var/log/secure | grep ssh
```

这将显示安全日志文件中的 SSH 登录记录，包括用户名、IP 地址和登录时间。

#### syslog 文件

```shell
$ cat /var/log/syslog | grep ssh
```

这将显示系统日志文件中的 SSH 登录记录，包括用户名、IP 地址和登录时间。

### journalctl 命令

```shell
$ journalctl -u sshd | grep "Accepted"
```

这将显示 systemd-journald 中的 SSH 登录记录，包括用户名、IP 地址和登录时间。

### 注意

请注意，以上命令可能需要 root 权限才能执行，并且日志文件的路径可能因系统而异。

## 参考资源

- [OpenSSH Config File Examples](https://www.cyberciti.biz/faq/create-ssh-config-file-on-linux-unix/) _(cyberciti.biz)_
- [ssh_config Manual](https://linux.die.net/man/5/ssh_config) _(linux.die.net)_
