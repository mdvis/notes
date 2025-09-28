# XDG 基本目录
X Desktop Group

用户目录
----

*   XDG\_CONFIG\_HOME
    *   用于存放特定用户的配置（类似于/etc）。
    *   默认应为$HOME/.config。
*   XDG\_CACHE\_HOME
    *   用于存放特定用户的非必要（缓存）数据（类似于/var/cache）。
    *   默认应为$HOME/.cache。
*   XDG\_DATA\_HOME
    *   用于存放特定用户的数据文件（类似于/usr/share）。
    *   默认应为$HOME/.local/share。
*   XDG\_STATE\_HOME
    *   用于存放特定用户的状态文件（类似于/var/lib）。
    *   默认应为$HOME/.local/state。
*   XDG\_RUNTIME\_DIR
    *   用于存放特定用户的非必要数据文件，如Sockets、命名管道等。
    *   不需要提供默认值；如果没有设置也未提供等价物，应该发出警告。
    *   必须由用户拥有，访问模式为0700。
    *   文件系统符合OS标准。
    *   必须位于本地文件系统上。
    *   可能会定期清理。
    *   每6小时修改一次或设置粘滞位以确保持久性。
    *   只能在用户登录期间存在。
    *   不应该存储大文件，因为它可能是作为tmpfs挂载的。
    *   pam\_systemd将其设置为/run/user/$UID。

系统目录
----

*   `XDG_DATA_DIRS`
    *   由`:`分隔的目录列表（类似于`PATH`）。
    *   默认应为`/usr/local/share:/usr/share`。
*   `XDG_CONFIG_DIRS`
    *   由`:`分隔的目录列表（类似于`PATH`）。
    *   默认应为`/etc/xdg`。