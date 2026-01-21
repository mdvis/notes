systemctl
===

系统服务管理器指令

## 补充说明

**systemctl命令** 是系统服务管理器指令，它实际上将 service 和 chkconfig 这两个命令组合到一起。

| 任务 | 旧指令 | 新指令 |
| ---- | ---- | ---- |
| 使某服务自动启动 | chkconfig --level 3 httpd on | systemctl enable httpd.service |
| 使某服务不自动启动 | chkconfig --level 3 httpd off | systemctl disable httpd.service |
| 检查服务状态 | service httpd status | systemctl status httpd.service （服务详细信息） systemctl is-active httpd.service （仅显示是否 Active) |
| 显示所有已启动的服务 | chkconfig --list | systemctl list-units --type=service |
| 启动服务 | service httpd start | systemctl start httpd.service |
| 停止服务 | service httpd stop | systemctl stop httpd.service |
| 重启服务 | service httpd restart | systemctl restart httpd.service |
| 重载服务 | service httpd reload | systemctl reload httpd.service |

### 实例

```shell
systemctl start nfs-server.service . # 启动nfs服务
systemctl enable nfs-server.service # 设置开机自启动
systemctl enable nfs-server.service --now # 设置开机自启动，并立刻启动
systemctl disable nfs-server.service # 停止开机自启动
systemctl disable nfs-server.service --now # 停止开机自启动，并立刻停止
systemctl status nfs-server.service # 查看服务当前状态
systemctl restart nfs-server.service # 重新启动某服务
systemctl list-units --type=service # 查看所有已启动的服务
```

开启防火墙22端口

```shell
iptables -I INPUT -p tcp --dport 22 -j accept
```

如果仍然有问题，就可能是SELinux导致的

关闭SElinux：

修改`/etc/selinux/config`文件中的`SELINUX=""`为disabled，然后重启。

彻底关闭防火墙：

```shell
sudo systemctl status firewalld.service
sudo systemctl stop firewalld.service          
sudo systemctl disable firewalld.service
```
`systemctl` 是 Linux 中的一个强大的工具，用于管理和控制系统服务。以下是它的详细说明：
**基本用法**
```
systemctl [命令] [单元]
```
* `命令`: 对单元执行的操作（例如 `start`、`stop`、`restart` 等）
* `单元`: 要操作的单元名称（服务）
**常见命令**
* `start`: 启动单元
* `stop`: 停止单元
* `restart`: 重启单元
* `reload`: 重新加载单元配置
* `status`: 显示单元状态
* `enable`: 在启动时启用单元
* `disable`: 在启动时禁用单元
**单元类型**
* **Service**: 系统服务（例如 `ssh.service`）
* **Target**: 单元组（例如 `multi-user.target`）
* **Mount**: 文件系统挂载点（例如 `mnt-data.mount`）
* **Timer**: 触发单元的定时器（例如 `daily.timer`）
**选项**
* `-t TYPE`: 指定单元类型（例如 `-t service`）
* `-p PROPERTY`: 设置单元属性（例如 `-p Environment=VAR=value`）
* `-f FILE`: 指定单元配置文件（例如 `-f /etc/systemd/service.conf`）
* `-l LEVEL`: 设置单元日志级别（例如 `-l debug`）
**示例**
* `systemctl start ssh.service`: 启动 SSH 服务
* `systemctl stop httpd.service`: 停止 HTTPD 服务
* `systemctl restart postfix.service`: 重启 Postfix 服务
* `systemctl enable nginx.service`: 在启动时启用 Nginx 服务
* `systemctl disable crond.service`: 在启动时禁用 Cron 守护进程
**Systemd 概念**
* **Units**: 系统的 individual 组件（服务、目标、挂载点、定时器）
* **Dependencies**: 单元之间的关系（例如一个服务依赖于另一个服务）
* **Targets**: 可以一起启动或停止的一组单元
* **Wants**: 单元之间的依赖关系（例如一个服务想要在另一个服务后启动）


