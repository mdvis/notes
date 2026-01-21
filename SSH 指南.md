本文档整合了SSH相关的核心知识，包括基础使用、密钥管理、安全配置和登录记录监控。
## SSH基础命令
### 基本连接语法
```bash
ssh [选项] 用户名@主机名
```
### 常用参数详解
#### 连接参数
- `-p` 指定端口：`ssh -p 2222 user@hostname`
- `-l` 指定登录用户：`ssh -l username hostname`
- `-4` 强制使用IPv4地址
- `-6` 强制使用IPv6地址
#### 认证相关
- `-i <私钥>` 指定私钥文件进行认证：`ssh -i ~/.ssh/my_key user@hostname`，默认`~/.ssh/id_rsa`
- `-o` 自定义配置参数：
  - `-o "PasswordAuthentication=no"` 禁用密码认证
  - `-o "StrictHostKeyChecking=no"` 跳过主机秘钥验证
  - `-o "ServerAliveInterval=60"` 保持连接心跳（按间隔发送心跳包）
  - `-o "ConnectTimeout=10"` 设置连接超时
#### 远程执行
- `command` 链接到远程主机直接执行命令后退出：`ssh user@hostname "ls -l"`
#### 安全选项
- `-v` 调试模式，显示详细连接日志（`-v`, `-vv`, `-vvv` 详细度递增）
- `-q` 静默模式
- `-C` 压缩传输，启用数据压缩，加快传输速度
#### 会话管理
- `-f` 后台执行ssh指令
- `-N` 不执行远程命令，仅建立链接（常用于端口转发）
#### X11转发
- `-X` 开启X11转发功能，允许在本地显示远程图形界面程序：`ssh -X user@hostname xclock`
- `-x` 关闭X11转发功能
- `-Y` 开启信任X11转发功能
#### 认证代理
- `-A` 开启认证代理连接转发功能
- `-a` 关闭认证代理连接转发功能
#### 其他参数
- `-F` 指定配置文件：`ssh -F ~/custom_ssh_config user@hostname`
- `-b` 使用本机指定地址作为对应连接的源ip地址
- `-g` 允许远程主机连接主机的转发端口
- `-1` 强制使用ssh协议版本1
- `-2` 强制使用ssh协议版本2
#### 跳板机/代理
- `-J` 代理跳转（跳板机），通过跳板机连接到目标主机：
  - `ssh -J jump_user@jump_host user@target_host`
  - `ssh -J proxy_host1 remote_host2`
  - `ssh -J user@proxy_host1:port1,user@proxy_host2:port2 user@remote_host3`
### 实用示例
```bash
# 保持连接心跳，防止自动断开
ssh -o ServerAliveInterval=60 user@hostname
# 通过跳板机连接到目标主机
ssh -J jump_user@jump_host user@target_host
# 带压缩的连接
ssh -C user@hostname
# 调试模式连接
ssh -vv user@hostname
# 使用pem文件连接（权限需为0400）
ssh -i /path/file.pem root@192.168.1.5
# 执行远程命令
ssh user@hostname "ls -l"
# 调用本地脚本
ssh root@192.168.1.5 bash < script.sh
```
## SSH密钥管理
### 生成密钥对
#### RSA密钥
```bash
# 生成2048位RSA密钥
ssh-keygen -t rsa -b 2048
# 生成4096位RSA密钥（更安全）
ssh-keygen -t rsa -b 4096
```
#### ECDSA密钥
```bash
# 生成256位ECDSA密钥
ssh-keygen -t ecdsa -b 256
# 生成384位ECDSA密钥
ssh-keygen -t ecdsa -b 384
# 生成521位ECDSA密钥
ssh-keygen -t ecdsa -b 521
```
#### Ed25519密钥（推荐）
```bash
# 生成Ed25519密钥（现代、安全、快速）
ssh-keygen -t ed25519
```

#### 密钥类型推荐

**推荐的类型：**

1. **Ed25519**（优先）：适用于新部署环境，兼顾安全性和效率
2. **RSA 4096**：如需兼容旧系统（如 CentOS 7 等），或机构策略要求
3. **检查兼容性**：确认 SSH 服务端和客户端是否支持 Ed25519（OpenSSH 6.5+ 通常支持）

**不推荐的类型：**
- **DSA**：已过时，OpenSSH 7.0+ 默认禁用，存在安全风险
- **RSA 2048 或更短**：不再满足现代安全标准
### 密钥管理命令
#### ssh-keygen参数详解
```bash
ssh-keygen [选项]
```
常用参数：
- `-t` 密钥类型（rsa, ecdsa, ed25519）
- `-b` 密钥位数
- `-C` 添加注释
- `-f` 指定密钥文件名
- `-N` 设置新密码
- `-p` 更改密钥密码
- `-y` 读取公钥
- `-l` 显示密钥指纹
- `-B` 显示密钥bubblebabble摘要
#### 示例
```bash
# 生成带注释的密钥
ssh-keygen -t ed25519 -C "your_email@example.com"
# 更改密钥密码
ssh-keygen -p -f ~/.ssh/id_rsa
# 显示公钥内容
ssh-keygen -y -f ~/.ssh/id_rsa
# 显示密钥指纹
ssh-keygen -l -f ~/.ssh/id_rsa.pub
# 交互式生成密钥
ssh-keygen
# 指定文件名
ssh-keygen -f ~/.ssh/filename
# 从私钥生成公钥
ssh-keygen -y -f private.key > public.pub
# 修改密钥注释
ssh-keygen -c -f ~/.ssh/id_rsa
# 搜索 known_hosts
ssh-keygen -F <ip/hostname>
# 从 known_hosts 移除
ssh-keygen -R <ip/hostname>
```

### SSH密钥管理工具

#### ssh-agent 命令
后台进程，安全存储私钥，避免重复输入密码。SSH 密钥管理器。

**ssh-agent** 是一种控制用来保存公钥身份验证所使用的私钥的程序。ssh-agent 在 X 会话或登录会话之初启动，所有其他窗口或程序则以客户端程序的身份启动并加入到 ssh-agent 程序中。通过使用环境变量，可定位代理并在登录到其他使用 ssh 机器上时使用代理自动进行身份验证。

其实 ssh-agent 就是一个密钥管理器，运行 ssh-agent 以后，使用 ssh-add 将私钥交给 ssh-agent 保管，其他程序需要身份验证的时候可以将验证申请交给 ssh-agent 来完成整个认证过程。

##### 语法
```bash
ssh-agent [-c | -s] [-d] [-a bind_address] [-t life] [command [arg ...]]
ssh-agent [-c | -s] -k
```

##### 选项
- `-a bind_address` 绑定代理到指定的 UNIX 域套接字
- `-c` 生成 C-shell 风格的命令输出
- `-d` 调试模式
- `-k` 把 ssh-agent 进程杀掉
- `-s` 生成 Bourne shell 风格的命令输出
- `-t life` 设置默认值添加到代理人的身份最大寿命

##### 使用示例
运行 ssh-agent
```bash
ssh-agent
```
运行 ssh-agent，它会打印出来它使用的环境和变量。

#### ssh-add 命令
把专用密钥添加到 ssh-agent 的高速缓存中。

##### 语法
```bash
ssh-add [-cDdLlXx] [-t life] [file ...]
ssh-add -s pkcs11
ssh-add -e pkcs11
```

##### 选项
- `-D` 删除 ssh-agent 中的所有密钥
- `-d <秘钥>` 从 ssh-agent 中删除密钥
- `-e pkcs11` 删除 PKCS#11 共享库 pkcs1 提供的钥匙
- `-s pkcs11` 添加 PKCS#11 共享库 pkcs1 提供的钥匙
- `-L` 显示 ssh-agent 中的公钥
- `-l` 显示 ssh-agent 中的密钥
- `-t <秒数>` 对加载的密钥设置超时时间，超时 ssh-agent 将自动卸载密钥
- `-X` 对 ssh-agent 进行解锁
- `-x` 对 ssh-agent 进行加锁

##### 使用示例
把专用密钥添加到 ssh-agent 的高速缓存中
```bash
ssh-add ~/.ssh/id_dsa
```

从 ssh-agent 中删除密钥
```bash
ssh-add -d ~/.ssh/id_xxx.pub
```

查看 ssh-agent 中的密钥
```bash
ssh-add -l
```

显示 ssh-agent 中的公钥
```bash
ssh-add -L
```

对加载的密钥设置超时时间（秒数）
```bash
ssh-add -t 3600 ~/.ssh/id_dsa
```
### 公钥分发
#### ssh-copy-id
```bash
# 复制公钥到远程服务器
ssh-copy-id user@hostname
# 指定端口
ssh-copy-id -p 2222 user@hostname
# 使用特定密钥
ssh-copy-id -i ~/.ssh/custom_key.pub user@hostname
```
#### 手动分发
```bash
# 1. 复制公钥到远程服务器
scp ~/.ssh/id_rsa.pub user@hostname:~/
# 2. 登录远程服务器并添加公钥
ssh user@hostname
mkdir -p ~/.ssh
cat ~/id_rsa.pub >> ~/.ssh/authorized_keys
rm ~/id_rsa.pub
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### SCP 文件传输
#### 从远程复制到本地
```bash
scp user@server:/dir/file.ext dest/
```

#### 在两个服务器之间复制
```bash
scp user@server:/file user@server:/dir
```

#### 从本地复制到远程
```bash
scp dest/file.ext user@server:/dir
```

#### 递归复制整个文件夹
```bash
scp -r user@server:/dir dest/
```

#### 复制文件夹中的所有文件
```bash
scp user@server:/dir/* dest/
```

#### 从服务器文件夹复制到当前文件夹
```bash
scp user@server:/dir/* .
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
## SSH安全配置
### 配置文件位置
| 文件路径                 | 说明             |
| ------------------------ | ---------------- |
| `/etc/ssh/ssh_config`    | 系统范围配置     |
| `~/.ssh/config`          | 用户特定配置     |
| `~/.ssh/id_{type}`       | 私钥             |
| `~/.ssh/id_{type}.pub`   | 公钥             |
| `~/.ssh/known_hosts`     | 已知服务器       |
| `~/.ssh/authorized_keys` | 授权登录密钥     |

### 客户端配置 (~/.ssh/config)
```bash
# 示例配置文件
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 30
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_key
    IdentitiesOnly yes
Host myserver
    HostName 192.168.1.100
    Port 2222
    User admin
    IdentityFile ~/.ssh/server_key
    StrictHostKeyChecking yes
    UserKnownHostsFile ~/.ssh/known_hosts
Host jumpserver
    HostName jump.example.com
    User jumpuser
    IdentityFile ~/.ssh/jump_key
Host internal-*
    ProxyJump jumpserver
    User internaluser
    IdentityFile ~/.ssh/internal_key
```

### 配置示例
```bash
Host server1
    HostName 192.168.1.5
    User root
    Port 22
    IdentityFile ~/.ssh/server1.key
```

通过别名连接
```bash
ssh server1
```
### 服务器端配置 (/etc/ssh/sshd_config)
```bash
# 基础安全配置
Port 2222                       # 更改默认端口
PermitRootLogin no              # 禁止root登录
PasswordAuthentication no       # 禁用密码认证
PubkeyAuthentication yes         # 启用公钥认证
# 密钥算法配置
HostKey /etc/ssh/ssh_host_ed25519_key
HostKey /etc/ssh/ssh_host_rsa_key
# 认证限制
MaxAuthTries 3                  # 最大认证尝试次数
MaxSessions 10                  # 最大会话数
# 连接限制
ClientAliveInterval 300         # 客户端保活间隔
ClientAliveCountMax 2           # 最大保活次数
MaxStartups 10:30:60           # 连接数限制
# 网络配置
ListenAddress 0.0.0.0
UsePAM yes
X11Forwarding no               # 禁用X11转发
AllowTcpForwarding no          # 禁用TCP转发
PermitTunnel no                # 禁用隧道
# 日志配置
LogLevel VERBOSE                # 详细日志记录
SyslogFacility AUTHPRIV        # 系统日志设备
# 用户限制
AllowUsers admin user1 user2   # 只允许特定用户
DenyUsers guest nobody         # 拒绝特定用户
```
### 密钥安全
#### 生成强密钥
```bash
# 使用强算法和足够长度
ssh-keygen -t ed25519 -b 256 -a 100
# 或者使用RSA 4096位
ssh-keygen -t rsa -b 4096 -a 100
```
#### 密钥文件权限
```bash
# 设置正确的文件权限
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
chmod 600 ~/.ssh/authorized_keys
chmod 644 ~/.ssh/known_hosts
```
## SSH端口转发
### 本地端口转发
```bash
# 基本语法
ssh -L 本地端口:目标主机:目标端口 用户@SSH服务器
# 示例：访问远程服务器上的MySQL
ssh -L 3306:localhost:3306 user@remote_server
# 示例：访问内网Web服务
ssh -L 8080:internal-web.example.com:80 user@jump_server
```
### 远程端口转发
```bash
# 基本语法
ssh -R 远程端口:本地主机:本地端口 用户@远程服务器
# 示例：将本地Web服务暴露到远程服务器
ssh -R 8080:localhost:80 user@remote_server
# 示例：反向代理，允许远程访问本地服务
ssh -R 2222:localhost:22 user@remote_server
```
### 动态端口转发（SOCKS代理）
```bash
# 基本语法
ssh -D 本地端口 用户@远程服务器
# 示例：创建SOCKS代理
ssh -D 1080 user@proxy_server
# 配置浏览器使用SOCKS代理
# 代理地址：127.0.0.1
# 端口：1080
# 类型：SOCKS5
```
### 高级转发配置
#### 通过跳板机转发
```bash
# 方法1：使用-J参数
ssh -J jump_user@jump_server -L 3306:db-server:3306 user@final_server
# 方法2：在配置文件中设置ProxyJump
Host db-server
    HostName db-server.internal
    User dbuser
    ProxyJump jump_user@jump_server
    LocalForward 3306 localhost:3306
```
#### 多级转发
```bash
# 三级转发
ssh -L 8080:final-target:80 user@middle-server \
    -t ssh -L 8080:final-target:80 user@jump-server
```

### SSH 隧道
SSH 的 `-L` 和 `-R` 选项允许你在两台机器之间建立加密的"隧道"，将本地 TCP 端口映射到远程机器或反之。这常用于访问受限网络内的服务或增强其他不安全协议的安全性。
## SSH登录记录监控
### 查看登录记录的方法
#### 1. last命令
```bash
# 查看最近登录记录
last
# 只查看SSH登录
last -i | grep ssh
# 查看特定用户
last username
# 查看特定时间范围
last -t 20241201000000
# 限制显示数量
last -n 50
```
#### 2. lastlog命令
```bash
# 查看所有用户的最后登录时间
lastlog
# 查看特定用户
lastlog -u username
# 只显示最近登录的用户
lastlog -u 1000-6000
```
#### 3. 查看系统日志文件
##### Ubuntu/Debian系统
```bash
# 查看认证日志
cat /var/log/auth.log | grep ssh
# 实时监控登录
tail -f /var/log/auth.log | grep ssh
# 查看特定日期的日志
grep "Dec  1" /var/log/auth.log | grep ssh
```

##### CentOS/RHEL系统
```bash
# 查看安全日志
cat /var/log/secure | grep ssh
# 实时监控
tail -f /var/log/secure | grep ssh
# 查看失败的登录尝试
grep "Failed password" /var/log/secure
```

##### 其他系统日志文件
```bash
# 查看系统日志文件 (syslog)
cat /var/log/syslog | grep ssh
```
#### 4. 使用journalctl（Systemd系统）
```bash
# 查看SSH服务日志
journalctl -u sshd
# 查看成功的登录
journalctl -u sshd | grep "Accepted"
# 查看失败的登录
journalctl -u sshd | grep "Failed"
# 实时监控
journalctl -u sshd -f
# 查看特定时间段
journalctl -u sshd --since "2024-12-01" --until "2024-12-02"
```
### 分析登录记录
#### 查看登录频率统计
```bash
# 统计各IP的登录次数
awk '{print $1}' /var/log/auth.log | sort | uniq -c | sort -nr
# 统计各用户的登录次数
awk '/Accepted/ {print $9}' /var/log/auth.log | sort | uniq -c | sort -nr
# 查看最活跃的时间段
awk '{print $3}' /var/log/auth.log | sort | uniq -c | sort -nr
```
#### 查看失败的登录尝试
```bash
# 查看失败登录的IP
grep "Failed password" /var/log/auth.log | awk '{print $13}' | sort | uniq -c | sort -nr
# 查看被攻击的用户名
grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -nr
# 查看恶意IP（多次失败）
grep "Failed password" /var/log/auth.log | awk '{print $13}' | sort | uniq -c | awk '$1 > 10 {print $2}'
```
## SSH最佳实践
### 安全建议
#### 1. 使用强密钥
- 优先使用Ed25519密钥
- 设置足够密钥长度（RSA至少4096位）
- 为密钥设置强密码
#### 2. 禁用不安全的认证方式
```bash
# 在sshd_config中
PasswordAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no
```
#### 3. 使用fail2ban防护
```bash
# 安装fail2ban
sudo apt install fail2ban  # Ubuntu/Debian
sudo yum install fail2ban  # CentOS/RHEL
# 配置fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
# 在配置文件中添加
[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
```
#### 4. 使用证书认证
```bash
# 生成CA密钥
ssh-keygen -f ~/.ssh/ca_key
# 签署用户密钥
ssh-keygen -s ~/.ssh/ca_key -I user_id -n username -V +52w user_key.pub
# 在sshd_config中配置CA
TrustedUserCAKeys /etc/ssh/ca.pub
```
#### 5. 限制访问范围
```bash
# 使用防火墙限制SSH访问
sudo ufw allow 2222/tcp  # Ubuntu
sudo firewall-cmd --add-port=2222/tcp --permanent  # CentOS
# 使用TCP Wrappers
echo "sshd: 192.168.1.0/24" >> /etc/hosts.allow
echo "sshd: ALL" >> /etc/hosts.deny
```
#### 6. 配置双因素认证
```bash
# 安装Google Authenticator
sudo apt install libpam-google-authenticator
# 配置PAM
echo "auth required pam_google_authenticator.so" >> /etc/pam.d/sshd
# 在sshd_config中启用
ChallengeResponseAuthentication yes
```

#### 7. SSH 服务端配置增强
在 `/etc/ssh/sshd_config` 文件中，你还可以考虑以下安全选项：

*   **禁用密码认证**（在启用密钥认证后）：将 `PasswordAuthentication` 设置为 `no` 可以彻底杜绝密码暴力破解。
*   **更改默认端口**：将 `Port` 改为一个非标准端口（如 6000）可以减少自动化攻击。
*   **限制用户登录**：使用 `AllowUsers` 或 `AllowGroups` 指令只允许特定的用户或组进行SSH登录。
*   **设置空闲超时间隔**：`ClientAliveInterval` 可以设置一个空闲超时时间间隔，在一段时间无活动后自动断开连接。
*   **限制连接数**：`MaxStartups` 可以限制并发连接数，防止资源耗尽攻击。
*   **使用更安全的加密算法**：
```bash
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com
MACs hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com
KexAlgorithms curve25519-sha256@libssh.org,ecdh-sha2-nistp521
```
### 性能优化
#### 1. 启用连接复用
```bash
# 在客户端配置中添加
Host *
    ControlMaster auto
    ControlPath ~/.ssh/multiplex/%r@%h:%p
    ControlPersist 600
```
#### 2. 使用更快的加密算法
```bash
# 在sshd_config中
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com
MACs hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com
KexAlgorithms curve25519-sha256@libssh.org,ecdh-sha2-nistp521
```
#### 3. 调整系统参数
```bash
# 在/etc/sysctl.conf中添加
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
```
### 故障排除
#### 常见问题及解决方法
1. **连接被拒绝**
   - 检查SSH服务是否运行：`systemctl status sshd`
   - 检查防火墙设置
   - 检查sshd_config配置
1. **认证失败**
   - 检查密钥文件权限
   - 验证公钥是否正确添加
   - 检查用户名和主机名
1. **连接超时**
   - 检查网络连通性
   - 调整超时设置
   - 使用`-v`参数查看详细日志
1. **端口转发失败**
   - 检查目标端口是否可访问
   - 验证权限设置
   - 检查防火墙规则
#### 调试技巧
```bash
# 详细调试模式
ssh -vvv user@hostname
# 测试配置文件
ssh -T user@hostname
# 检查服务器配置
sshd -T
# 测试特定认证方式
ssh -o PreferredAuthentications=publickey user@hostname
```

#### 常见问题排查
*   **权限问题**：确保服务器上相应用户的 `~/.ssh` 目录和 `~/.ssh/authorized_keys` 文件的权限设置正确（`.ssh` 目录为 `700`，`authorized_keys` 文件为 `600`）。

*   **配置未生效**：每次修改 `/etc/ssh/sshd_config` 后，**必须重启 SSH 服务**。

*   **防火墙阻挡**：确保服务器防火墙放行了 SSH 所使用的端口（通常是 22 或你自定义的端口）。
    *   若使用 `ufw`（Debian 常见）：`sudo ufw allow port_number/tcp`
    *   若使用 `firewalld`（Rocky Linux 常见）：`sudo firewall-cmd --permanent --add-port=port_number/tcp && sudo firewall-cmd --reload`

*   **SELinux/AppArmor**：在某些严格策略下，SELinux（Rocky Linux）或 AppArmor（Debian）可能会阻止 SSH 操作，必要时需调整策略或放行。
### 安全最佳实践注意事项

1. **安全第一**：尽量避免直接允许 root 用户通过 SSH 远程登录。建议**使用普通用户登录后，再通过 `su` 或 `sudo` 切换权限**。

2. **密钥管理**：妥善保管你的私钥，如同保管你的密码一样。建议对私钥设置强密码（passphrase）。

3. **服务更新**：定期更新系统以及 SSH 服务软件包，以获取安全补丁。

4. **定期审查**：定期检查 SSH 日志文件（通常在 `/var/log/auth.log` 或 `/var/log/secure`）以发现异常活动。

5. **限制访问**：尽可能限制能访问 SSH 的 IP 地址或网络。

通过遵循这些最佳实践，可以大大提高SSH连接的安全性、可靠性和性能。