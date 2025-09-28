# Unit 文件
Systemd 管理的不同资源统称为 Unit（单位）

systemd 支持的 12 种 Unit 文件类型
--------------------------

1.  .automount 控制自动挂载文件系统
2.  .device 定义设备之间的依赖关系（/dev）
3.  .mount 定义系统结构层次中的一个挂载点，可以代替过去的 /etc/fstab
4.  .path 监控指定目录或文件变化，并触发其他 Unit 运行
5.  .scope 这种 Unit 文件不是用户创建，而是 systemd 运行产生的，描述一些系统服务分组信息
6.  .service 封装守护进程的启动、停止、重启和重载操作，最常见的 Unit 文件
7.  .slice 表示一个 CGroup 树，通常用户不会自己创建此类 Unit 文件
8.  .snapshot 由 systemctl snapshot 命令创建的 systemd units 运行状态快照
9.  .socket 监控来自于系统或网络的数据消息，用于实现基于数据自动触发服务启动
10.  .swap 定义一个用户做虚拟内存的交换分区
11.  .target 用于对 Unit 文件进行逻辑分组，引导其他 Unit 的执行
12.  .timer 用于配制在特定时间触发的任务，代替 crontab

systemd 目录
----------

按照约定 Unit 文件应放置在指定的三个系统目录之一中，下面顺序越靠上优先级越高

*   /etc/systemd/system 系统或用户定义的配置文件
*   /run/systemd/system 软件运行时生成的配置文件
*   /usr/lib/systemd/system 系统或第三方软件安装时添加的配置文件
    *   有的可能是这个目录 /lib/systemd/system systemd 默认从目录 /etc/systemd/system 读取配置，但通常存放的都是来自 /usr/lib/systemd/system 的符号连接

Unit 和 Target
-------------

Unit 是 Systemd 管理系统资源的基本单元，可以认为每个系统资源就是一个 Unit，并使用一个 Unit 文件定义。在 Unit 文件中需要包含相应服务的描述、属性以及需要运行的命令。

Target 是 Systemd 中用于指定系统资源启动组的方式，相当于 SysV-init 中的运行级别。

简单说，Target 就是一个 Unit 组，包含许多相关的 Unit 。启动某个 Target 的时候，Systemd 就会启动里面所有的 Unit。从这个意义上说，Target 这个概念类似于”状态点”，启动某个 Target 就好比启动到某种状态。

### systemd service unit

```
[Unit]
Description=Docker
After=docker.service
Requires=docker.service
[Service]
TimeoutStartSec=0
ExecStartPre=-/usr/bin/docker kill busybox1
ExecStartPre=-/usr/bin/docker rm busybox1
ExecStartPre=/usr/bin/docker pull busybox
ExecStart=/usr/bin/docker run --name busybox1 busybox /bin/sh -c "while true; do echo Hello;sleep 1;done"
ExecStop="/usr/bin/docker stop busybox1"
ExecStopPost="/usr/bin/docker rm busybox1"
[Install]
WantedBy=multi-user.target
```

三个配置区段 Unit 和 Install 段： 所有 Unit 文件通用，用于配制服务的描述、依赖和随系统启动的方式 Service 段：服务类型（.service）特有的，用于定义服务的具体管理和操作方法

#### Unit 段

*   Description：描述 Unit 文件的信息
*   Documentation：制定服务的文档，可以是一个或多个文档的 URL
*   Requires：依赖的其他 Unit 列表，列在其中的 Unit 模版会在这个服务启动时的同时被启动，且其中任一个服务启动失败，本服务也会终止
*   Wants：与 Requires 相似，会触发列出的服务，但不会考虑是否成功
*   After：与 Requires 相似，列出的所有服务启动后，才启动当前服务
*   Before：与 After 相反
*   Binds To：与 Requires 相似，失败时失败，成功时成功，任一个意外结束或重启，此服务也结束或重启
*   Part Of：一个 Bind To 作用的子集，仅在列出的任务模块失败或重启时，终止或重启当前服务，而不会随列出模板的启动而启动
*   OnFailure：当这个模板启动失败时，就会自动启动列出的每个模块
*   Conflicts：与这个模块有冲突的模块，如果列出的模块中有已经在运行的，这个服务就不能启动，反之亦然

#### Install 段

这部分配置的目标模块通常是特定运行目标的 .target 文件，用来使得服务在系统启动时自动运行。这个区段可以包含三种启动约束：

*   WantedBy：和 Unit 段的 Wants 作用相似，只有后面列出的不是服务所依赖的模块，而是依赖当前服务的模块。它的值是一个或多个 Target，当前 Unit 激活时（enable）符号链接会放入 /etc/systemd/system 目录下面以 <Target 名> + .wants 后缀构成的子目录中，如 “/etc/systemd/system/multi-user.target.wants/“
*   RequiredBy：和 Unit 段的 Wants 作用相似，只有后面列出的不是服务所依赖的模块，而是依赖当前服务的模块。它的值是一个或多个 Target，当前 Unit 激活时，符号链接会放入 /etc/systemd/system 目录下面以 <Target 名> + .required 后缀构成的子目录中
*   Also：当前 Unit enable/disable 时，同时 enable/disable 的其他 Unit
*   Alias：当前 Unit 可用于启动的别名 `systemctl list-units --type=target` 获取当前正在使用的运行目标

#### Service 段

只有 Service 类型的 Unit 才有这块，主要字段分为==服务生命周期==和==服务上下文配置==两个方面

1.  服务生命周期相关

*   type：
    *   Type=simple
    *   Type=forking
    *   Type=oneshot
    *   Type=dbus
    *   Type=notify
    *   Type=idle

1.  服务上下文配置相关

[https://cloud.tencent.com/developer/article/1516125](https://cloud.tencent.com/developer/article/1516125) [https://blog.csdn.net/weixin\_37766296/article/details/80192633](https://blog.csdn.net/weixin_37766296/article/details/80192633) [https://ruanyifeng.com/blog/2016/03/systemd-tutorial-part-two.html](https://ruanyifeng.com/blog/2016/03/systemd-tutorial-part-two.html) [http://www.jinbuguo.com/systemd/systemd.service.html](http://www.jinbuguo.com/systemd/systemd.service.html) [https://www.cnblogs.com/hongdada/p/9700900.html](https://www.cnblogs.com/hongdada/p/9700900.html) [https://www.cnblogs.com/nxzblogs/p/11755972.html](https://www.cnblogs.com/nxzblogs/p/11755972.html)