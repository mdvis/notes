**Samba** 是 Linux/Unix 系统实现 **SMB（Server Message Block）协议** 的软件，用来：

* 让 Linux 与 Windows **互相共享文件**
* 让 Windows 用户访问 Linux 共享目录
* 让 Linux 访问 Windows 共享目录
* 做局域网文件服务器

适用于企业文件服务器、NAS、自建共享盘等场景。

---

## 二、Samba 在系统中的主要组件

| 组件            | 作用                  |
| ------------- | ------------------- |
| **smbd**      | 处理文件共享、权限控制、传输等核心操作 |
| **nmbd**      | 提供 NetBIOS 名称服务（可选） |
| **testparm**  | 检查配置文件语法            |
| **smbclient** | 命令行方式访问 SMB 共享      |
| **pdbedit**   | Samba 用户管理          |
## 三、安装 Samba

### 1. 在 Debian/Ubuntu 系列

```bash
sudo apt update
sudo apt install samba samba-common
```

### 2. 在 CentOS/Rocky/RedHat

```bash
sudo yum install samba samba-common samba-client
```

安装后配置文件路径为：

```
/etc/samba/smb.conf
```

## 四、基本配置 smb.conf

编辑配置文件：

```bash
sudo nano /etc/samba/smb.conf
```

### 1. 全局设置（必备）

```ini
[global]
   workgroup = WORKGROUP
   server string = Samba Server
   security = user
   map to guest = bad user
```

含义：

* **security = user**：使用账号密码访问（推荐）
* **map to guest = bad user**：无效用户自动转为 guest（可选）

## 五、创建共享目录

下面以 `/srv/share` 为例。

### 1. 创建共享目录

```bash
sudo mkdir -p /srv/share
sudo chmod -R 777 /srv/share   # 测试阶段先给全权限
```

### 2. 添加到 smb.conf

在文件末尾加入：

```ini
[share]
   path = /srv/share
   browseable = yes
   writable = yes
   guest ok = yes
   read only = no
```

使其成为一个可读写、无需密码的共享目录（适合局域网测试）。

---

## 六、Samba 用户管理（密码访问方式）

如果你想用账号/密码访问 Samba：

### 1. 创建 Linux 用户

```bash
sudo useradd smbuser
sudo passwd smbuser
```

### 2. 添加 Samba 用户并设置密码

```bash
sudo smbpasswd -a smbuser
```

启用用户：

```bash
sudo smbpasswd -e smbuser
```

### 3. 设置共享目录权限

```bash
sudo chown -R smbuser:smbuser /srv/share
```

### 4. 修改 smb.conf → 使用密码访问

```ini
[secure]
   path = /srv/share
   valid users = smbuser
   read only = no
   browseable = yes
```

## 七、重启 Samba 服务

修改配置后必须重启：

```bash
sudo systemctl restart smbd
sudo systemctl enable smbd
```

查看状态：

```bash
sudo systemctl status smbd
```

## 八、从 Windows 连接 Samba

在 Windows 资源管理器地址栏输入：

```
\\服务器IP
```

例如：

```
\\192.168.1.10
```

访问共享目录：

```
\\192.168.1.10\share
```

如果使用账号密码访问：

* 用户名：smbuser
* 密码：你设置的 Samba 密码
## 九、从 Linux 连接 Samba

## 1. 使用 smbclient（类似 FTP）

```bash
smbclient //192.168.1.10/share -U smbuser
```

下载文件：

```bash
get 文件
```

上传文件：

```bash
put 文件
```

## 2. 挂载 SMB 到 Linux

```bash
sudo mount -t cifs //192.168.1.10/share /mnt/smb -o username=smbuser,password=密码
```

卸载：

```bash
sudo umount /mnt/smb
```

## 十、常用 Samba 命令（最常用的都在这里）

### 1. 检查配置语法：

```bash
testparm
```

### 2. 查看 Samba 共享

```bash
smbclient -L localhost -U smbuser
```

### 3. 添加 Samba 用户

```bash
smbpasswd -a 用户名
```

### 4. 查看 Samba 用户

```bash
pdbedit -L
```

### 5. 服务管理

```bash
sudo systemctl start smbd
sudo systemctl stop smbd
sudo systemctl restart smbd
```

---

## 十一、常见问题与解决方法

### ❗ Windows 访问时提示 “无法访问”

可能原因：

* 防火墙未放行 445 端口

解决：

```bash
sudo ufw allow samba
```

或：

```bash
sudo firewall-cmd --add-service=samba --permanent
sudo firewall-cmd --reload
```

---

### ❗ Windows 提示账号密码错误

检查 Samba 用户是否存在：

```bash
pdbedit -L
```

确保用户启用：

```bash
smbpasswd -e 用户名
```

---

### ❗ 报错 NT_STATUS_BAD_NETWORK_NAME

配置文件共享段落名和路径是否正确
比如：

```ini
[share]
path = /srv/share
```

---

## 十二、示例 smb.conf（完整示例）

适合新手复制使用：

```ini
[global]
   workgroup = WORKGROUP
   server string = Samba Server
   security = user
   map to guest = bad user

[public]
   path = /srv/public
   browseable = yes
   writable = yes
   guest ok = yes
   read only = no

[secure]
   path = /srv/secure
   valid users = smbuser
   read only = no
   browseable = yes
```
