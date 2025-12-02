- `-p` 指定端口 `ssh -p 2222 user@hostname`
- `command` 链接到远程主机直接执行命令后退出 `ssh user@hostname "ls -l"`
- `-i <私钥>` 指定私钥文件进行认证 `ssh -i ~/.ssh/my_key user@hostname`，默认 `~/.ssh/id_rsa`
- `-L` 本地端口转发，将本地端口流量转发到远程主机端口（用于内网）`ssh -L 8080:localhost:80 user@hostname` 本地 8080 转发到主机 host 的 80 端口
- `-R` 远程端口转发，将远程主机端口转发到本地端口（反向代理）`ssh -R 8080:localhost:80 user@hostname` 远程主机 8080 转发到本地 80 端口
- `-X` X11 图形界面转发，允许在本地显示远程图形界面程序`ssh -X user@hostname xclock` 远程执行图形程序，窗口显示在本地
- `-J` 代理跳转（跳板机），通过跳板机连接到目标主机`ssh -J jump_user@jump_host user@target_host`
- `-o` 自定义配置参数
	- `-o "PasswordAuthentication=no"` 禁用密码认证
	- `-o "StrictHostKeyChecking=no"` 跳过主机秘钥验证
	- `-o "ServerAliveInterval=60"` 保持连接心跳（按间隔发送心跳包）
	- `-o "ConnectTimeout=10"` 设置连接超时
- `-v` 调试模式，显示详细连接日志（`-v`, `-vv`, `-vvv` 详细度递增）
- `-F` 指定配置文件，使用自定义 SSH 配置 `~/.ssh/config`, `ssh -F ~/custom_ssh_config user@hostname`
- `-N` 不执行远程命令，仅建立链接（常用于端口转发）`ssh -N -L 3306:localhost:3306 user@hostname`
- `-C` 压缩传输，启用数据压缩，加快传输速度 `ssh -C user@hostname`
- `-1` 强制使用ssh协议版本1；
- `-2` 强制使用ssh协议版本2；
- `-4` 强制使用IPv4地址；
- `-6` 强制使用IPv6地址；
- `-A` 开启认证代理连接转发功能；
- `-a` 关闭认证代理连接转发功能；
- `-b` 使用本机指定地址作为对应连接的源ip地址；
- `-f` 后台执行ssh指令；
- `-g` 允许远程主机连接主机的转发端口；
- `-l` 指定连接远程服务器登录用户名；
- `-N` 不执行远程指令；
- `-q` 静默模式；
- `-x` 关闭X11转发功能；
- `-y` 开启信任X11转发功能。

```
ssh -o ServerAliveInterval=60 user@hostname
```
