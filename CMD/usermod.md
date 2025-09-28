usermod
===

用于修改用户的基本信息

## 补充说明

**usermod命令** 用于修改用户的基本信息。usermod 命令不允许你改变正在线上的使用者帐号名称。当 usermod 命令用来改变user id，必须确认这名user没在电脑上执行任何程序。你需手动更改使用者的 crontab 档。也需手动更改使用者的 at 工作档。采用 NIS server 须在server上更动相关的NIS设定。

### 语法

```shell
usermod(选项)(参数)
```

### 选项
- `-c, --comment <内容>` 设置用户帐号的描述信息
- `-d, --home <目录>` 设置用户主目录，修改用户登入时的目录，只是修改`/etc/passwd`中用户的家目录配置信息，不会自动创建新的家目录，通常和`-m`一起使用
- `-m, --move-home <移动用户家目录>` 移动用户家目录到新的位置，不能单独使用，一般与`-d`一起使用
- `-g, --gid <群组名或ID>` 设置用户主组，修改用户所属的群组
- `-G, --groups <群组1,2,3..>` 修改用户所属的附加群组
- `-a, --append` 追加用户到指定组，而不是替换现有附加组，必须与 `-G` 一起使用
- `-l, --login <新帐号名称>` 修改用户帐号名称
- `-p, --password <密码>` 设置用户密码
- `-u, --uid <uid>` 修改用户 ID
- `-e, --exporedate <有效期限>` 修改帐号的有效期限；YYYY-MM-DD
- `-f, --inactive <缓冲天数>` 修改在密码过期后多少天即关闭该帐号, 0 标识立即禁用
- `-L, --lock` 锁定用户密码，使密码无效
- `-U, --unlock` 解除密码锁定
- `-h` 帮助
- `-s, --shell <shell>` 修改用户登入后所使用的 shell
- `-Z, --selinux-user` 更改用户的 SELinux 用户映射，即用户在 SELinux 策略中的角色
- `-o, --non-unique` 允许用户有非唯一的用户 ID，即与其他用户共享同一个用户 ID。

### 参数

登录名：指定要修改信息的用户登录名。

### 实例

将 newuser2 添加到组 staff 中：

```shell
usermod -G staff newuser2
```

修改newuser的用户名为newuser1：

```shell
usermod -l newuser1 newuser
```

锁定账号newuser1：

```shell
usermod -L newuser1
```

解除对newuser1的锁定：

```shell
usermod -U newuser1
```

增加用户到用户组中:

```shell
apk add shadow # 安装 shadow 包, usermod 命令包含在 usermod 中
usermod -aG group user # 添加用户到用户组中
```

`-a` 参数表示附加，只和 `-G` 参数一同使用，表示将用户增加到组中。

修改用户家目录：
```
[root@node-1 ~]# useradd lutixiaya
[root@node-1 ~]# ls /home
lutixiaya
[root@node-1 ~]# usermod -md /data/new_home lutixiaya
[root@node-1 ~]# ls /home/
[root@node-1 ~]# ls /data/
new_home
```


