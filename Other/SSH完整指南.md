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
# SSH 配置与管理完全指南

## 第一部分：SSH 客户端配置

### 常用选项

#### 连接相关
  
- **Host**：用于定义主机别名，方便后续连接。借助它，你可以用简短的别名替代完整的主机名或 IP 地址。
- **HostName**：指定远程主机的真实主机名或者 IP 地址。
- **Port**：明确 SSH 服务的端口，默认是 22。你可以根据需要修改，以增强安全性或适配特殊环境。
- **User**：指定连接远程主机时使用的用户名。
  
#### 认证相关
  
- **IdentityFile**：指定用于认证的私钥文件路径。在使用公钥认证时，需要指定私钥文件。
- **PubkeyAuthentication**：是否启用公钥认证，可选值为 `yes` 或 `no`。
- **PasswordAuthentication**：是否启用密码认证，可选值为 `yes` 或 `no`。
- **PermitRootLogin**：是否允许 root 用户通过 SSH 登录，可选值为 `yes` 或 `no`。
  
#### 访问控制相关
  
- **AllowUsers**：指定允许访问的用户列表，多个用户用空格分隔。
- **AllowGroups**：指定允许访问的用户组列表，多个组用空格分隔。
- **DenyUsers**：指定禁止访问的用户列表，多个用户用空格分隔。
  
#### 连接保持与优化相关
  
- **TCPKeepAlive**：决定是否开启 TCP 保持活动机制，可选值为 `yes` 或 `no`。开启后，客户端会定期发送数据包以维持连接。
- **Compression**：是否开启数据压缩，可选值为 `yes` 或 `no`。开启后可减少传输数据量，提高传输速度。
- **ClientAliveInterval**：设置客户端向服务器发送心跳包的时间间隔（单位为秒）。
- **ClientAliveCountMax**：设置客户端在没有收到服务器心跳包的情况下，最多允许发送多少次心跳包。
  
#### 日志相关
  
- **LogLevel**：设置 SSH 日志的详细程度，可选值为 `QUIET`、`FATAL`、`ERROR`、`INFO` 或 `VERBOSE`。
  
#### 转发相关
  
- **ForwardX11**：是否开启 X11 转发，可选值为 `yes` 或 `no`。开启后可在本地显示远程服务器上的图形应用。
- **LocalForward**：用于本地端口转发。将本地的某个端口转发到远程服务器的指定端口。
- **RemoteForward**：用于远程端口转发。将远程服务器的某个端口转发到本地的指定端口。
  
### SSH 配置文件示例
  
```bash
Host myserver
HostName 192.168.1.100
User admin
Port 5555
IdentityFile ~/.ssh/id_rsa_admin
Compression yes # 启用数据压缩
ServerAliveInterval 60 # 客户端心跳检测间隔
  
Host *
ForwardX11 yes # 启用X11转发
TCPKeepAlive yes # 保持TCP连接
```

---

## 第二部分：SSH 服务端配置

### 在 Rocky Linux 和 Debian 上开启 SSH 服务

下面是 Rocky Linux 和 Debian 开启 SSH 服务的主要步骤对比：

| 步骤         | Rocky Linux                                                              | Debian                                                                      |
| :----------- | :----------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| **安装SSH**    | `sudo dnf install openssh-server openssh-clients`                       | `sudo apt update && sudo apt install openssh-server`                       |
| **启动服务**   | `sudo systemctl enable --now sshd`                                       | `sudo systemctl enable --now ssh`                                           |
| **允许Root登录** | 修改 `/etc/ssh/sshd_config`：`PermitRootLogin yes` | 修改 `/etc/ssh/sshd_config`：`PermitRootLogin yes` |
| **重启服务**   | `sudo systemctl restart sshd`                                           | `sudo systemctl restart ssh`                                               |

### 配置 SSH 安全登录

允许 root 远程登录会增加服务器被暴力破解的风险，**强烈建议仅在必要时临时开启，并使用强密码**。更安全的做法是**禁止 root 直接登录，并通过普通用户登录后切换至 root**。

#### 使用 SSH 密钥对认证

使用 SSH 密钥对进行认证比仅用密码更安全。基本过程如下：

1. **生成密钥对**：在客户端计算机上使用 `ssh-keygen` 命令生成公钥和私钥对：
    ```bash
    ssh-keygen -t rsa -b 4096
    ```
    过程中会提示你输入保存密钥的文件名（默认为 `~/.ssh/id_rsa`）和一个**可选的密码（passphrase）**以提高安全性。

2. **将公钥上传到服务器**：将生成的公钥（默认为 `~/.ssh/id_rsa.pub`）内容添加到服务器的相应用户的 `~/.ssh/authorized_keys` 文件中。你可以使用 `ssh-copy-id` 命令方便地完成（如果服务器已配置密码认证）：
    ```bash
    ssh-copy-id username@server_ip
    ```
    或者手动复制。

3. **确保权限正确**：服务器上 `.ssh` 目录的权限应为 `700`，`authorized_keys` 文件的权限应为 `600`：
    ```bash
    chmod 700 ~/.ssh
    chmod 600 ~/.ssh/authorized_keys
    ```

4. **在服务器上启用密钥认证**：确保服务器的 `/etc/ssh/sshd_config` 中包含：
    ```
    PubkeyAuthentication yes
    ```

#### 其他安全设置建议

在 `/etc/ssh/sshd_config` 文件中，你还可以考虑以下安全选项：

*   **禁用密码认证**（在启用密钥认证后）：将 `PasswordAuthentication` 设置为 `no` 可以彻底杜绝密码暴力破解。
*   **更改默认端口**：将 `Port` 改为一个非标准端口（如 6000）可以减少自动化攻击。
*   **限制用户登录**：使用 `AllowUsers` 或 `AllowGroups` 指令只允许特定的用户或组进行SSH登录。
*   **设置空闲超时间隔**：`ClientAliveInterval` 可以设置一个空闲超时时间间隔，在一段时间无活动后自动断开连接。

**⚠️ 重要提示：修改任何配置后，都要重启 SSH 服务才能生效**：
- Rocky Linux: `sudo systemctl restart sshd`
- Debian: `sudo systemctl restart ssh`

---

## 第三部分：SSH 登录方法

### 使用密码登录

```bash
ssh username@server_ip
```
如果服务器 SSH 服务不在默认的 22 端口，使用 `-p` 指定端口：
```bash
ssh -p port_number username@server_ip
```

### 使用密钥登录

如果在生成私钥时使用了默认路径和文件名，并且公钥已上传至服务器，SSH 命令会自动尝试使用密钥登录：
```bash
ssh username@server_ip
```
如果私钥不在默认路径或使用了多个密钥，需要用 `-i` 选项指定：
```bash
ssh -i /path/to/private_key username@server_ip
```

### 远程连接示例

假设你已在一台 IP 为 `192.168.1.100` 的 Rocky Linux 服务器上创建了用户 `testuser`，并设置了 SSH 密钥，则从本地计算机连接：
```bash
ssh testuser@192.168.1.100
```

---

## 第四部分：高级 SSH 用法

### SSH 隧道

SSH 的 `-L` 和 `-R` 选项允许你在两台机器之间建立加密的"隧道"，将本地 TCP 端口映射到远程机器或反之。这常用于访问受限网络内的服务或增强其他不安全协议的安全性。

---

## 第五部分：常见问题处理

*   **权限问题**：确保服务器上相应用户的 `~/.ssh` 目录和 `~/.ssh/authorized_keys` 文件的权限设置正确（`.ssh` 目录为 `700`，`authorized_keys` 文件为 `600`）。

*   **配置未生效**：每次修改 `/etc/ssh/sshd_config` 后，**必须重启 SSH 服务**。

*   **防火墙阻挡**：确保服务器防火墙放行了 SSH 所使用的端口（通常是 22 或你自定义的端口）。
    *   若使用 `ufw`（Debian 常见）：`sudo ufw allow port_number/tcp`
    *   若使用 `firewalld`（Rocky Linux 常见）：`sudo firewall-cmd --permanent --add-port=port_number/tcp && sudo firewall-cmd --reload`

*   **SELinux/AppArmor**：在某些严格策略下，SELinux（Rocky Linux）或 AppArmor（Debian）可能会阻止 SSH 操作，必要时需调整策略或放行。

---

## 第六部分：安全最佳实践

### 注意事项

1. **安全第一**：尽量避免直接允许 root 用户通过 SSH 远程登录。建议**使用普通用户登录后，再通过 `su` 或 `sudo` 切换权限**。

2. **密钥管理**：妥善保管你的私钥，如同保管你的密码一样。建议对私钥设置强密码（passphrase）。

3. **服务更新**：定期更新系统以及 SSH 服务软件包，以获取安全补丁。

4. **定期审查**：定期检查 SSH 日志文件（通常在 `/var/log/auth.log` 或 `/var/log/secure`）以发现异常活动。

5. **限制访问**：尽可能限制能访问 SSH 的 IP 地址或网络。

---

**本指南涵盖了 SSH 配置与管理的完整知识，帮助你安全地配置和使用 SSH 服务。**
# openSSL
openSSL

生成localhost证书
-------------

```sh
openssl req -x509 -out localhost.crt -keyout localhost.key \
-newkey rsa:2048 -nodes -sha256 \
-subj '/CN=localhost' -extensions EXT -config <( \
printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```
加密的方式在本地主机和远程主机之间复制文件。 **scp命令** 用于在Linux下进行远程拷贝文件的命令，和它类似的命令有cp，不过cp只是在本机进行拷贝不能跨服务器，而且scp传输是加密的。可能会稍微影响一下速度。当你服务器硬盘变为只读read only system时，用scp可以帮你把文件移出来。另外，scp还非常不占资源，不会提高多少系统负荷，在这一点上，rsync就远远不及它了。虽然 rsync比scp会快一点，但当小文件众多的情况下，rsync会导致硬盘I/O非常高，而scp基本不影响系统正常使用。
###  语法
```shell
scp(选项)(参数)
```
###  选项
```shell
-1：使用ssh协议版本1；
-2：使用ssh协议版本2；
-4：使用ipv4；
-6：使用ipv6；
-B：以批处理模式运行；
-C：使用压缩；
-F：指定ssh配置文件；
-i：identity_file 从指定文件中读取传输时使用的密钥文件（例如亚马逊云pem），此参数直接传递给ssh；
-l：指定宽带限制；
-o：指定使用的ssh选项；
-P：指定远程主机的端口号；
-p：保留文件的最后修改时间，最后访问时间和权限模式；
-q：不显示复制进度；
-r：以递归方式复制。
```
###  参数
* 源文件: 指定要复制的源文件。
* 目标文件: 格式为 `user@host:filename`
###  实例
从远程复制到本地的scp命令与上面的命令雷同，只要将从本地复制到远程的命令后面2个参数互换顺序就行了。

**从远程机器复制文件到本地目录** 
```shell
scp root@10.10.10.10:/opt/soft/nginx-0.5.38.tar.gz /opt/soft/
```
从 10.10.10.10 机器上的 `/opt/soft/` 的目录中下载 nginx-0.5.38.tar.gz 文件到本地 `/opt/soft/` 目录中。

**从亚马逊云复制OpenVPN到本地目录** 
```shell
scp -i amazon.pem ubuntu@10.10.10.10:/usr/local/openvpn_as/etc/exe/openvpn-connect-2.1.3.110.dmg openvpn-connect-2.1.3.110.dmg
```
从 10.10.10.10 机器上下载 openvpn 安装文件到本地当前目录来。

 **从远程机器复制到本地** 
```shell
scp -r root@10.10.10.10:/opt/soft/mongodb /opt/soft/
```
从10.10.10.10机器上的 `/opt/soft/` 中下载mongodb目录到本地的 `/opt/soft/` 目录来。

 **上传本地文件到远程机器指定目录** 
```shell
scp /opt/soft/nginx-0.5.38.tar.gz root@10.10.10.10:/opt/soft/scptest

# 指定端口 2222
scp -rp -P 2222 /opt/soft/nginx-0.5.38.tar.gz root@10.10.10.10:/opt/soft/scptest
```
复制本地 `/opt/soft/` 目录下的文件 nginx-0.5.38.tar.gz 到远程机器 10.10.10.10 的 `opt/soft/scptest` 目录。

 **上传本地目录到远程机器指定目录** 
```shell
scp -r /opt/soft/mongodb root@10.10.10.10:/opt/soft/scptest
```
上传本地目录 `/opt/soft/mongodb` 到远程机器10.10.10.10上 `/opt/soft/scptest` 的目录中去。