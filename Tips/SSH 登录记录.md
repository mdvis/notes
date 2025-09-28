# SSH 登录记录
Linux 中可以使用以下命令来查看使用 SSH 登录的记录：

1.  `last` 命令：

```
last -i | grep ssh
```

这将显示最近的 SSH 登录记录，包括用户名、IP 地址和登录时间。

1.  `lastlog` 命令：

```
lastlog -u <username> | grep ssh
```

这将显示指定用户的最近一次 SSH 登录记录，包括用户名、IP 地址和登录时间。

1.  `auth.log` 文件：

```
cat /var/log/auth.log | grep ssh
```

这将显示 authentication 日志文件中的 SSH 登录记录，包括用户名、IP 地址和登录时间。

1.  `secure` 文件：

```
cat /var/log/secure | grep ssh
```

这将显示安全日志文件中的 SSH 登录记录，包括用户名、IP 地址和登录时间。

1.  `syslog` 文件：

```
cat /var/log/syslog | grep ssh
```

这将显示系统日志文件中的 SSH 登录记录，包括用户名、IP 地址和登录时间。

1.  使用 `journalctl` 命令：

```
journalctl -u sshd | grep "Accepted"
```

这将显示 systemd-journald 中的 SSH 登录记录，包括用户名、IP 地址和登录时间。 请注意，以上命令可能需要 root 权限才能执行，並且日志文件的路径可能因系统而异。