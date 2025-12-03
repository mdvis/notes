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
