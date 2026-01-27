# Linux 分区建议

| **目录**      | **文件系统**   | **作用**                                                | **为什么单独分区**                           | **推荐大小**                                                                                                                  |
| ----------- | ---------- | ----------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `/` (根目录)   | Ext4/Btrfs | 系统核心文件存储                                              | 系统的基础分区，必须存在                          | 桌面：15-25 GB  <br>服务器：25-50 GB                                                                                             |
| `/boot`     | Ext4/Btrfs | 启动加载器和内核文件存储                                          | 提高启动稳定性，避免其他分区问题影响系统启动                | 500 MB - 1 GB                                                                                                             |
| `/boot/efi` | FAT32      | EFI 系统分区，存储 UEFI 引导文件（如 GRUB 的 `grubx64.efi`、系统启动项配置） | 提供 UEFI 引导支持，需使用 FAT32 文件系统（UEFI 的标准） | 300-500 MB                                                                                                                |
| `/home`     | Ext4/Btrfs | 用户的个人文件和设置存储                                          | 防止用户数据占满根目录空间，方便重装系统时保护数据             | 根据需求，通常 20 GB 或更大                                                                                                         |
| `/var`      | Ext4/Btrfs | 日志文件、缓存文件、邮件队列等存储                                     | 防止日志或缓存增长过快挤占根分区空间，提升服务器稳定性           | 普通系统：2-5 GB  <br>服务器：按需分配                                                                                                 |
| `/tmp`      | Ext4/Btrfs | 临时文件存储                                                | 防止恶意用户创建大量临时文件导致系统崩溃，可用内存文件系统提高性能     | 桌面：1-2 GB  <br>服务器：5-10 GB                                                                                                |
| `/usr`      | Ext4/Btrfs | 用户安装的程序和库文件存储                                         | 防止程序安装占满根分区空间，可只读挂载提高安全性              | 桌面：15-20 GB  <br>服务器：25-50 GB                                                                                             |
| `/opt`      | Ext4/Btrfs | 第三方或自定义安装的软件包存储                                       | 隔离非标准软件，便于管理和维护                       | 5-20 GB 或根据需求调整                                                                                                           |
| `/srv`      | Ext4/Btrfs | 服务数据存储（如 Web 服务器或 FTP 服务数据）                           | 保证服务数据独立，便于备份和管理                      | 根据服务需求分配                                                                                                                  |
| `/swap`     | Swap       | 内存不足时的备用空间                                            | 提高系统稳定性，防止内存耗尽                        | 按需分配，**小于 2 GB 内存**：`swap` 等于内存大小的 **2 倍**。**2-8 GB 内存**：`swap` 等于内存大小。**超过 8 GB 内存**：`swap` 通常设置为 **1-2 GB**（或根据实际需求调整）。 |

## fstab

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
* ext2
* ext3
* ext4
* reiserfs
* xfs
* jfs
* smbfs
* iso9660
* vfat
* ntfs
* swap
* auto

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
1. acl/noacl
2. autodefrag/noautodefrag
3. compress/compress-force
4. subvol/subvolid
5. device
6. degraded
7. commit
8. ssd/nossd
9. ssd\_spread/nossd\_spread
10. nodiscard
11. norecovery
12. usebackuproot/nousebackuproot
13. space\_cache=version、nospace\_cache、clear\_cache
14. skip\_balance
15. datacow/nodatacow
16. datasum/nodatasum

```
UUID=ff4a838b-1571-4d31-9063-456f29b742fd /home btrfs compress=zstd:1,subvol=home 0 0
```

### `<dump>` dump 备份取值
* 0 不做dump备份
* 1 每天进行dump操作
* 2 不定日期进行dump操作

### `<pass>` fsck 检查参数
* 0 不检验
* 1 最早检验（一般根目录会选择）
* 2 1级别检验完后进行检验

## 磁盘and卷

### Linux 磁盘管理与分区扩容综合指南

---

#### 一、核心概念区分

| **场景**       | **适用工具**                             | **关键特点**            |
| ------------ | ------------------------------------ | ------------------- |
| **非 LVM 环境** | `fdisk` + `resize2fs/xfs_growfs`     | 直接操作物理分区，需保持起始扇区一致  |
| **LVM 环境**   | `pvcreate` + `vgextend` + `lvextend` | 逻辑卷动态扩展，支持在线扩容，灵活性高 |

---

### 二、通用操作命令

#### 1. **磁盘空间查看**

```bash
# 查看所有挂载点使用情况（含文件系统类型）
df -Th
# 树形显示块设备结构（磁盘→分区→挂载点）
lsblk -f
# 查看磁盘分区表（MBR/GPT）
fdisk -l
```

#### 2. **分区表重载**

```bash
# 通知内核更新分区表（避免重启）
partprobe /dev/sda
```

---

### 三、非 LVM 环境扩容流程

#### **适用场景**：直接操作物理分区（如 `/dev/sda1`）

#### 1. **操作流程**

```bash
# 1. 检查磁盘使用率
df -h /
# 2. 使用 fdisk 调整分区（需相同起始扇区！）
sudo fdisk /dev/sda
   → p        # 记录起始扇区
   → d        # 删除旧分区
   → n        # 新建分区（保持原起始扇区）
   → w        # 保存
# 3. 重载分区表
sudo partprobe /dev/sda
# 4. 调整文件系统
sudo resize2fs /dev/sda1      # ext2/3/4
或
sudo xfs_growfs /             # XFS（需已挂载）
```

#### 2. **注意事项**

- **扇区一致性**：新分区必须与原分区起始扇区相同，否则数据丢失。
- **备份数据**：建议使用 `dd if=/dev/sda1 of=/backup/sda1.img` 备份。
- **文件系统验证**：操作前执行 `fsck /dev/sda1` 检查完整性。

---

### 四、LVM 环境扩容流程

#### **适用场景**：逻辑卷管理（如 `/dev/centos/root`）

#### 1. **核心组件**

- **PV（物理卷）**：磁盘或分区（如 `/dev/sda2`）。
- **VG（卷组）**：PV 的集合（如 `vg_centos`）。
- **LV（逻辑卷）**：从 VG 划分的可扩展空间（如 `/dev/vg_centos/root`）。

#### 2. **扩容流程**

```bash
# 1. 添加新磁盘或扩展现有分区
sudo fdisk /dev/sdb → 创建分区类型 `8e` (Linux LVM)
# 2. 初始化物理卷
sudo pvcreate /dev/sdb1
# 3. 扩展卷组
sudo vgextend vg_centos /dev/sdb1
# 4. 扩展逻辑卷
sudo lvextend -l +100%FREE /dev/vg_centos/root
# 5. 调整文件系统
sudo resize2fs /dev/vg_centos/root    # ext2/3/4
或
sudo xfs_growfs /dev/vg_centos/root   # XFS
```

#### 3. **关键命令详解**

| **命令**      | **作用**                   | **常用参数**                     |
| ----------- | ------------------------ | ---------------------------- |
| `pvdisplay` | 显示物理卷详细信息                | `-m` 查看PE映射                  |
| `vgdisplay` | 显示卷组剩余空间（`Free PE/Size`） | `-v` 显示详细VG、LV、PV关系          |
| `lvextend`  | 扩展逻辑卷容量                  | `-L +10G` 指定大小，`-r` 自动调整文件系统 |

#### 4. **高级操作**
- **在线扩容**：无需卸载文件系统（ext4/XFS 均支持）。
- **缩小逻辑卷**：  
  
  ```bash
  # ext4：需先卸载 → e2fsck → resize2fs → lvreduce
  # XFS：**不支持缩小**，需备份后重建
  ```

---

### 五、风险规避与最佳实践

1. **操作前检查**：
   
   ```bash
   # 确认设备名称
   lsblk
   # 验证文件系统类型
   blkid /dev/sda1
   ```
2. **数据备份方案**：
   - **全盘备份**：`dd if=/dev/sda of=/backup/sda.img bs=4M`
   - **增量备份**：`rsync -a --delete /data/ /backup/data/`
3. **LVM 环境维护**：
   - 定期检查 VG 剩余空间：`vgs`
   - 避免 VG 空间耗尽：预留 5-10% 的未分配空间。

---

### 六、操作流程图解

#### 非 LVM 扩容流程

```
[检查df] → [fdisk调整分区] → [partprobe] → [resize2fs/xfs_growfs]
```

#### LVM 扩容流程

```
[添加磁盘] → [pvcreate] → [vgextend] → [lvextend] → [resize2fs/xfs_growfs]
```

---

通过本指南，您可安全完成 Linux 系统下的磁盘扩容操作。根据实际环境选择 LVM 或非 LVM 方案，严格遵循操作顺序，确保数据安全。

## 在 Linux 中查看硬盘 UUID

在 Linux 系统中，UUID（通用唯一识别码）用于唯一标识磁盘分区或文件系统。UUID 是一个 128 位的数字，通常表示为 32 个十六进制数字，并用连字符分割为 5 组，总共 36 个字符的格式

## 使用 blkid 命令

_blkid_ 是一个命令行工具，用于定位或打印块设备的属性。它利用 _libblkid_ 库来获取磁盘分区的 UUID。使用方法如下：

```sh
blkid
输出示例：
/dev/sda1: UUID="d92fa769-e00f-4fd7-b6ed-ecf7224af7fa" TYPE="ext4" PARTUUID="eab59449-01"
/dev/sdc1: UUID="d17e3c31-e2c9-4f11-809c-94a549bc43b7" TYPE="ext2" PARTUUID="8cc8f9e5-01"
```

## 使用 lsblk 命令

_lsblk_ 命令列出所有可用的或指定的块设备的信息。它读取 _sysfs_ 文件系统和 _udev_ 数据库以收集信息。使用方法如下：

```bash
lsblk -o name,mountpoint,size,uuid
输出示例：
NAME MOUNTPOINT SIZE UUID
sda 30G
└─sda1 / 20G d92fa769-e00f-4fd7-b6ed-ecf7224af7fa
sdb 10G
sdc 10G
├─sdc1 1G d17e3c31-e2c9-4f11-809c-94a549bc43b7
```

## 使用 by-uuid 路径

在 _/dev/disk/by-uuid/_ 目录下包含了 UUID 和实际的块设备文件，UUID 与实际的块设备文件链接在一起。使用方法如下：

```bash
ls -lh /dev/disk/by-uuid/
输出示例：
lrwxrwxrwx 1 root root 10 Jan 29 08:34 d92fa769-e00f-4fd7-b6ed-ecf7224af7fa -> ../../sda1
lrwxrwxrwx 1 root root 10 Jan 29 08:34 d17e3c31-e2c9-4f11-809c-94a549bc43b7 -> ../../sdc1
```

## 使用 hwinfo 命令

_hwinfo_ 是一个硬件信息工具，用于检测系统中已存在的硬件，并以可读的格式显示各种硬件组件的详细信息。使用方法如下：

```bash
hwinfo --block | grep by-uuid | awk '{print $3,$7}'
输出示例：
/dev/sdc1, /dev/disk/by-uuid/d17e3c31-e2c9-4f11-809c-94a549bc43b7
/dev/sda1, /dev/disk/by-uuid/d92fa769-e00f-4fd7-b6ed-ecf7224af7fa
```

# Filesystem Hierarchy Standard (FHS)

多数Linux发行版遵从FHS标准并且声明其自身政策以维护FHS的要求。但截至2009年，包括由自由标准小组成员参与开发的版本在内的绝大多数发行版，并不完全执行建议的标准。
FHS创建之时，其他的UNIX和类Unix操作系统已经有了自己的标准，尤其是hier文件系统布局描述。 自从第七版Unix(于1979年发布)以来已经存在，或是SunOS filesystem，和之后的Solaris filesystem。 例如，macOS 使用如 `/Library`、 `/Applications`和`/Users` 等长名与传统UNIX目录层次保持一致。 现在的Linux发行版包含一个`/sys`目录作为虚拟文件系统(sysfs，类似于 `/proc`，一个procfs)，它存储且允许修改连接到系统的设备，然而许多传统UNIX和类Unix操作系统使用`/sys`作为内核代码树的符号链接。 一些Linux系统如GoboLinux和Syllable Server使用了和FHS完全不同的文件系统层次组织方法。
在FHS中，所有的文件和目录的安装与否。 这些目录中的绝大多数都在所有的UNIX操作系统中存在，并且一般都以大致类似的方法使用；然而，这里的描述是针对于FHS的，并未考虑除了Linux平台以外的权威性。
| 目录               | 描述                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| /                | 第一层次结构的根、 整个文件系统层次结构的根目录。根目录是Linux文件系统中的顶级目录。所有其他目录都是根目录的子目录，使其成为整个文件系统的父目录。                                   |
| /bin/            | 包含启动系统和执行基本操作所需的基本二进制可执行文件。这些对所有用户都可用。需要在单用户模式。                                                                |
| /boot/           | 引导程序。保存启动系统所需的文件，包括 Linux 内核、初始 RAM 磁盘映像（用于启动时需要的驱动程序）和引导加载程序配置文件（如 GRUB ）。                                    |
| /dev/            | 必要设备。包含代表硬件组件或其他系统设备的设备文件。例如，/dev/sda 代表第一个 SATA 驱动器，/dev/tty 代表终端。                                            |
| /etc/            | 特定主机，系统范围内的配置文件。存储系统和应用程序的配置文件。这些文件通常是可以编辑的文本文件，用于更改系统或应用程序的行为。存储系统和应用程序的配置文件。这些文件通常是可以编辑的文本文件，用于更改系统或应用程序的行为。 |
| /etc/opt/        | /opt/的配置文件                                                                                                     |
| /etc/X11/        | X窗口系统的配置文件                                                                                                     |
| /etc/sgml/       | SGML的配置文件                                                                                                      |
| /etc/xml/        | XML的配置文件                                                                                                       |
| /home/           | 用户的家目录，包含保存的文件、个人设置等，一般为单独的分区。                                                                                 |
| /lib/            | /bin/ 和 /sbin/中二进制文件必要的库文件。包括系统和应用程序运行所需的基本共享库和内核模块。                                                           |
| /media/          | 可移除媒体(如CD-ROM)的挂载点 (在FHS-2.3中出现)。                                                                              |
| /mnt/            | 临时挂载的文件系统。                                                                                                     |
| /opt/            | 可选应用软件。用于安装附加的应用软件包。它是安装第三方应用程序的地方，将它们与 /usr 中的系统默认应用程序分开。                                                     |
| /proc/           | 虚拟文件系统格式挂载。一个虚拟文件系统，为内核向进程发送信息提供了一种机制。它不包含真实文件，而是运行时系统信息（例如，系统内存、挂载的设备、硬件配置等）。                                 |
| /root/           | 超级用户                                                                                                           |
| /sbin/           | 必要的系统二进制文件，_例如：_ init、 ip、 mount。包含基本的系统二进制文件，类似于 /bin，但用于系统管理任务，通常对非特权用户不可访问。                                 |
| /srv/            | 站点的具体数据，由系统提供。                                                                                                 |
| /tmp/            | 临时文件(参见 /var/tmp)，在系统重启时目录中文件不会被保留。一个临时目录，应用程序可以在其中存储临时文件。它通常在重启或间隔一段时间后被清空。                                   |
| /usr/            | 用于存储只读用户数据的第二层次； 包含绝大多数的多用户工具和应用程序。承载用户应用程序和大量系统内容。它包含程序、库、文档等的子目录，这些不是启动或修复系统所必需的。                            |
| /usr/bin/        | 非必要可执行文件；面向所有用户。                                                                                               |
| /usr/include/    | 标准包含文件。                                                                                                        |
| /usr/lib/        | /usr/bin/和/usr/sbin/中二进制文件的库。                                                                                  |
| /usr/sbin/       | 非必要的系统二进制文件，\_例如：\_大量网络服务。                                                                                     |
| /usr/share/      | 体系结构无关（共享）数据。                                                                                                  |
| /usr/src/        | 源代码,\_例如:\_内核源代码及其头文件。                                                                                         |
| /usr/X11R6/      | X窗口系统 版本 11, Release 6.                                                                                        |
| /usr/local/      | 本地数据的\_第三层次\_， 具体到本台主机。通常而言有进一步的子目录， \_例如：\_bin/、lib/、share/.                                                  |
| /var/            | 变量文件——在正常运行的系统中其内容不断变化的文件，如日志，脱机文件和临时电子邮件文件。有时是一个单独的分区。                                                        |
| /var/cache/      | 应用程序缓存数据。这些数据是在本地生成的一个耗时的I/O或计算结果。应用程序必须能够再生或恢复数据。缓存的文件可以被删除而不导致数据丢失。                                          |
| /var/lib/        | 状态信息。 由程序在运行时维护的持久性数据。 \_例如：\_数据库、包装的系统元数据等。                                                                   |
| /var/lock/       | 锁文件，一类跟踪当前使用中资源的文件。                                                                                            |
| /var/log/        | 日志文件，包含大量日志文件，为了防止日志占满根分区，生产环境中一般是单独分区。                                                                        |
| /var/mail/       | 用户的电子邮箱。                                                                                                       |
| /var/run/        | 自最后一次启动以来运行中的系统的信息，\_例如：\_当前登录的用户和运行中的守护进程。                                                                    |
| /var/spool/      | 等待处理的任务的脱机文件，\_例如：\_打印队列和未读的邮件。                                                                                |
| /var/spool/mail/ | 用户的邮箱(不鼓励的存储位置)                                                                                                |
| /var/tmp/        | 在系统重启过程中可以保留的临时文件。                                                                                             |
| /run/            | 代替/var/run目录。                                                                                                  |
| /sys             | 目录作为虚拟文件系统                                                                                                     |

磁盘分区标志（`flags`）是写入分区表的一种特殊标记，用来告诉操作系统或固件（如BIOS/UEFI）如何处理这个分区。

下面这个表格整理了你要了解的分区标志及其核心信息：

| 分区标志 | 适用分区表类型 | 主要功能说明 |
| :--- | :--- | :--- |
| **`esp`** | GPT, MBR | **UEFI系统分区**，用于存放UEFI启动文件，在GPT分区表上等同于`boot`标志。 |
| **`boot`** | GPT, MBR, Apple | **启动标志**，含义因分区表而异（如MBR中标记活动分区，GPT中表示UEFI启动分区）。 |
| **`legacy_boot`** | GPT | 标记该GPT分区可能包含传统BIOS可引导的代码（如GRUB）。 |
| **`bios_grub`** | GPT | 专用于**GRUB BIOS启动分区**，通常是一个小分区（~1MB），存放GRUB的第二阶段代码。 |
| **`prep`** | GPT, MBR | **PReP启动分区**，用于在PowerPC或IBM RS6K/CHRP硬件上启动。 |
| **`msftdata`** | GPT | 标识分区包含**Microsoft文件系统**（NTFS/FAT），有时也用于Linux文件系统以实现兼容。 |
| **`msftres`** | GPT | 标识 **“Microsoft保留”分区**，供Windows系统内部使用。 |
| **`irst`** | GPT, MBR | 标识 **Intel快速启动技术** 分区。 |
| **`raid`** | MBR | 告知Linux该分区是**软件RAID阵列**的成员。 |
| **`lvm`** | MBR | 告知Linux该分区是**LVM物理卷**。 |
| **`swap`** | Apple | 在Apple分区表上，标记该分区为**Linux交换空间**。 |
| **`hidden`** | MBR, PC98 | 对**Microsoft操作系统隐藏**该分区。 |
| **`diag`** | MBR | 标识用于**诊断或恢复**的分区。 |
| **`lba`** | MBR | 指示旧版DOS/Win9x系统使用**LBA（逻辑块寻址）模式**访问分区。 |
| `atvrecv`, `bls_boot`, `chromeos_kernel`, `hp-service`, `no_automount` | *结果未明确说明* | 这些标志信息在现有资料中未详细说明，可能为特定系统或发行版（如ChromeOS, HP设备）使用的专有标志。 |
## disk flags
### 🔧 核心标志详解
*   **启动相关标志 (`esp`, `boot`, `bios_grub`, `legacy_boot`)**
    这些标志关乎系统启动。在**UEFI+GPT**的现代电脑中，**`esp`** 标志是必须的，它标记的分区（FAT32格式）存放着操作系统的启动加载器。
    对于需要在传统BIOS的主板上从GPT硬盘启动的系统，则需要一个带有 **`bios_grub`** 标志的小分区（通常1MB），供GRUB写入其核心代码。

*   **系统/文件系统标识 (`msftdata`, `msftres`)**
    **`msftdata`** 和 **`msftres`** 主要用于Windows环境。`msftdata`标识数据分区，而`msftres`是一个由Windows自动创建和管理的特殊分区，用户不应直接操作。

*   **特殊功能标志 (`raid`, `lvm`, `hidden`)**
    **`raid`** 和 **`lvm`** 用于在Linux中标记软件RAID阵列成员和LVM物理卷，帮助系统正确识别和管理。
    **`hidden`** 标志则是一个兼容性技巧，可以将某个分区（如Linux的根分区）对Windows系统隐藏，避免被误识别或分配盘符。

### 💡 实用操作与注意事项
*   **查看与设置**：在Linux中，常用 `parted` 或 `gdisk` 工具管理分区标志。例如，使用 `sudo parted /dev/sda set 1 esp on` 可为第一个分区设置`esp`标志。
*   **注意互斥性**：某些标志（如`boot`和`msftres`）在同一分区上可能是互斥的，设置一个可能需要先关闭另一个。
*   **分区表类型限制**：标志的可用性取决于磁盘分区表类型（MBR或GPT）。例如，`bios_grub`仅用于GPT。

如果你需要了解如何在具体场景（例如安装双系统）中配置这些标志，或者想深入了解某个未详细说明的标志，我可以为你提供更具体的指导。
