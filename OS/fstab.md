系统开机时会主动读取 `/etc/fstab` 这个文件中的内容，根据文件里面的配置挂载磁盘。这样我们只需要将磁盘的挂载信息写入这个文件中我们就不需要每次开机启动之后手动进行挂载了。

## 挂载的限制
1. 根目录是必须挂载的，而且==一定要先于其他 mount point 被挂载==。因为是所有目录的根目录，其他目录都是由根目录 `/` 衍生出来的
2. 挂载点必须是已经存在的目录
3. 挂载点的指定可以任意，但必须遵守必要的系统目录架构原则
4. 所有挂载点在同一时间只能被挂载一次
5. 所有分区在同一时间只能挂在一次
6. 若进行卸载，必须将工作目录退出挂载点（及其子目录）之外
## 参数

```
UUID=be7c41...375162  /         ext4   defaults  1  1
tmpfs                 /dev/shm  tmpfs  defaults  0  0
```

| 列   | 名           | 作用                            |
| --- | ----------- | ----------------------------- |
| 第一列 | Device      | 磁盘设备文件或者该设备的 Label 或者 UUID    |
| 第二列 | Mount point | 挂载在那个目录                       |
| 第三列 | Filesystem  | 文件系统                          |
| 第四列 | Parameters  | 文件系统参数，默认 async               |
| 第五列 | dump        | 能否被dump备份命令作用（通常 0 或 1）       |
| 第六列 | fsck        | 是否检验扇区,开机过程中系统默认用fsck检验系统是否完整 |
## 查看分区的 Label 和 UUID
```
dumpe2fs -h /dev/sda1 blkid /dev/vda1
```
## 文件系统
*   ext2
*   ext3
*   ext4
*   reiserfs
*   xfs
*   jfs
*   smbfs
*   iso9660
*   vfat
*   ntfs
*   swap
*   auto
## 文件系统参数
* auto - 在启动时或键入了 mount -a 命令时自动挂载
* noauto - 只在你的命令下被挂载
* exec - 允许执行此分区的二进制文件
* noexec - 不允许执行此文件系统上的二进制文件
* ro - 以只读模式挂载文件系统
* rw - 以读写模式挂载文件系统
* user - 允许任意用户挂载此文件系统，若无显示定义，隐含启用 noexec, nosuid, nodev 参数
* users - 允许所有 users 组中的用户挂载文件系统
* nouser - 只能被 root 挂载
* owner - 允许设备所有者挂载
* sync - I/O 同步进行，默认为 async
* async - I/O 异步进行，默认为 async
* dev - 解析文件系统上的块特殊设备
* nodev - 不解析文件系统上的块特殊设备
* suid - 允许 suid 操作和设定 sgid 位。这一参数通常用于一些特殊任务，使一般用户运行程序时临时提升权限
* nosuid - 禁止 suid 操作和设定 sgid 位
* noatime - 不更新文件系统上 inode 访问记录，可以提升性能(参见 atime 参数)
* nodiratime - 不更新文件系统上的目录 inode 访问记录，可以提升性能(参见 atime 参数)
* relatime - 实时更新 inode access 记录。只有在记录中的访问时间早于当前访问才会被更新。（与 noatime 相似，但不会打断如 mutt 或其它程序探测文件在上次访问后是否被修改的进程。），可以提升性能(参见 atime 参数)
* flush - vfat 的选项，更频繁的刷新数据，复制对话框或进度条在全部数据都写入后才消失
* usrquota 启动文件系统对用户磁盘配额模式支持
* grpquota 启动文件系统对群组磁盘配额模式的支持
* defaults - 使用文件系统的默认挂载参数，例如 ext4 的默认参数为:rw, suid, dev, exec, auto, nouser, async.
#### btrfs 挂载选项

1.  acl/noacl
2.  autodefrag/noautodefrag
3.  compress/compress-force
4.  subvol/subvolid
5.  device
6.  degraded
7.  commit
8.  ssd/nossd
9.  ssd\_spread/nossd\_spread
10.  nodiscard
11.  norecovery
12.  usebackuproot/nousebackuproot
13.  space\_cache=version、nospace\_cache、clear\_cache
14.  skip\_balance
15.  datacow/nodatacow
16.  datasum/nodatasum

```
UUID=ff4a838b-1571-4d31-9063-456f29b742fd /home btrfs compress=zstd:1,subvol=home 0 0
```

### <dump> dump 备份取值

*   0 不做dump备份
*   1 每天进行dump操作
*   2 不定日期进行dump操作

### <pass> fsck 检查参数

*   0 不检验
*   1 最早检验（一般根目录会选择）
*   2 1级别检验完后进行检验