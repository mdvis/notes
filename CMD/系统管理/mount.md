`mount` 的核心作用是**将存储设备（或虚拟文件系统）关联到目录树的某个节点（挂载点）**，使该设备上的文件可被访问；不带参数运行时则**显示当前已挂载的文件系统**。

**典型使用场景：**

- 系统启动：`/etc/fstab` 中定义的文件系统自动挂载（脚本中常用 `mount -a` 触发）
- 手动挂载 U 盘、移动硬盘、NFS、ISO 镜像
- 容器 / chroot 环境准备：挂载 `/proc`、`/sys`、`/dev`，或目录绑定（bind mount）
- 脚本中**检查某个目录是否已挂载**，避免重复挂载或误操作
- 只读挂载可疑设备，防止恶意程序自动执行
## 2. 基本语法与高频选项
### 语法骨架
```
mount [-t 文件系统类型] [-o 挂载选项] [设备] [目录]
mount [-a]
mount   # 无参数 → 列出所有已挂载的文件系统
```

- `设备` 和 `目录`：如果 `/etc/fstab` 中已有对应条目，**只给其中一个即可**，另一个会自动查找。
- `-t` 和 `-o`：通常可省略（系统会自动检测类型；选项有默认值）。
### 高频选项（共 7 个，脚本中常用）

> 标 ★ 的是**先掌握这三个**，足以应对 80% 的脚本需求。

| 选项          | 缩写来源          | 作用                                           | 可运行示例                                      |
| ----------- | ------------- | -------------------------------------------- | ------------------------------------------ |
| **`-t`**​ ★ | **t**ype      | 指定文件系统类型（如 ext4、vfat、nfs）                    | `mount -t ext4 /dev/sdb1 /mnt`             |
| **`-o`**​ ★ | **o**ptions   | 指定挂载参数（ro/rw、noexec、loop、bind 等，逗号分隔）        | `mount -o rw,noexec,nosuid /dev/sdb1 /mnt` |
| **`-a`**​ ★ | **a**ll       | 挂载 `/etc/fstab` 中所有未挂载的文件系统                  | `mount -a`                                 |
| `-r`        | **r**ead-only | 只读挂载（等价于 `-o ro`）                            | `mount -r /dev/sdb1 /mnt`                  |
| `-v`        | **v**erbose   | 显示详细挂载过程，排错时有用                               | `mount -v /dev/sdb1 /mnt`                  |
| `-L`        | **L**abel     | 通过分区卷标挂载（**GNU 特有**，依赖 `/dev/disk/by-label`） | `mount -L MYUSB /mnt`                      |
| `--bind`    | GNU 长选项       | 将已存在的目录挂载到另一个位置（**GNU/Linux 特有**，BSD 无此选项）   | `mount --bind /src /dst`                   |

**BSD 注意事项：**

- BSD 没有 `--bind`，FreeBSD 用 `mount_nullfs /src /dst`，macOS 用 `mount -t bindfs` 或第三方工具。
- BSD 没有 `-L`；FreeBSD 可用 `glabel` 或直接指定 `/dev/label/xxx`。
- BSD 的 `mount -a` 行为与 GNU 类似，但 FreeBSD 还支持 `mount -A`（挂载 fstab 中所有，包括已挂载的会重新挂载）。

## 3. 新手最容易踩的坑

| 错误写法                                   | 实际后果                                             | 正确写法                                                  |
| -------------------------------------- | ------------------------------------------------ | ----------------------------------------------------- |
| `mount /dev/sdb1 /mnt/mydisk`（挂载点不存在）  | 报错 `mount point /mnt/mydisk does not exist`      | `mkdir -p /mnt/mydisk && mount /dev/sdb1 /mnt/mydisk` |
| `mount /dev/sdb1 /mnt`（普通用户执行）         | 报错 `only root can do that` 或 `permission denied` | `sudo mount /dev/sdb1 /mnt`（脚本需 root 运行）              |
| `mount image.iso /mnt`（GNU 旧内核/旧版）     | 提示需要指定文件系统类型或设备不存在                               | `mount -o loop image.iso /mnt`（现代 GNU 自动 loop，但显式写更稳） |
| 脚本中直接 `mount /dev/sdb1 /data`不检查       | 若已挂载，可能隐藏原目录内容或报错                                | 先检查：`grep -qs '/data ' /proc/mounts                   |
| macOS/FreeBSD 脚本写 `mount --bind /a /b` | BSD 不识别 `--bind`，直接报错                            | FreeBSD: `mount_nullfs /a /b`；脚本中用 `uname` 判断系统       |

---

## 4. 和功能相近的命令对比

|对比命令|核心差异|可操作的判断依据|
|---|---|---|
|`findmnt`|专门查询挂载信息，输出结构化（树状、JSON），**不修改系统状态**​|需要**解析挂载信息**写脚本 → 优先用 `findmnt -J` 或 `findmnt -s`；需要挂载/卸载 → 必须用 `mount`/`umount`|
|`lsblk`|列出块设备，显示分区和文件系统类型，**不显示挂载点细节**​|想看"磁盘有哪些分区" → `lsblk -f`；想实际挂载 → `mount`|
|`df`|显示已挂载文件系统的**磁盘空间使用**​|只关心"还剩多少空间" → `df -h`；关心"挂没挂上、挂哪儿了" → `mount` 或 `findmnt`|
|`swapon`|专用于交换分区/文件，与文件系统挂载无关|需要启用 swap → `swapon`；需要挂载普通目录 → `mount`|

---

## 5. 脚本化要点

### 退出码

|退出码|含义|
|---|---|
|`0`|成功|
|`1`|参数错误、权限不足等调用问题|
|`2`|系统错误（设备不存在、IO 错误等）|
|`32`|挂载失败（如已挂载、fstab 错误，不同版本可能略有差异）|

> **最佳实践**：脚本中只判断 `if [ $? -eq 0 ]` 或 `if cmd; then`，不要硬编码 32。

### 管道 / 重定向组合

```
# 保存当前挂载列表（比解析 /proc/mounts 可读性稍差但通用）
mount > /tmp/mounts.txt

# 检查某个设备是否已挂载（GNU）
mount | grep -q '/dev/sdb1' && echo "已挂载"

# GNU 推荐：直接读 /proc/mounts（更可靠，BSD 无此文件，对应 /etc/mtab）
grep -qs '/dev/sdb1' /proc/mounts
```

### 判断成败的惯用写法

```
# 写法1：if 直接判断
if mount -o ro /dev/sdb1 /mnt; then
    echo "挂载成功"
else
    echo "挂载失败，退出码 $?" >&2
    exit 1
fi

# 写法2：set -e 环境下用 || 兜底
mount /dev/sdb1 /mnt || { echo "无法挂载" >&2; exit 1; }

# 写法3：先检查挂载点，避免重复挂载（GNU 用 mountpoint，BSD 用 grep）
if ! mountpoint -q /mnt 2>/dev/null; then
    mount /dev/sdb1 /mnt
fi

# 写法4：mount -a 的容错（fstab 有错也不想让脚本直接退出）
mount -a || echo "警告：部分文件系统挂载失败，请检查 /etc/fstab" >&2
```

---

## 6. 由浅入深的示例

### 示例 1：查看当前所有挂载（最基础）

```
mount
# 或只看某类文件系统
mount -t ext4
```

### 示例 2：挂载 U 盘（FAT32），带错误处理

```
MP="/mnt/usb"
mkdir -p "$MP"
if ! mount -t vfat -o rw,uid=1000,gid=1000 /dev/sdb1 "$MP"; then
    echo "U盘挂载失败！" >&2
    exit 1
fi
echo "U盘已挂载到 $MP"
```

### 示例 3：脚本中安全挂载（检查是否已挂载，支持只读）

```
DEVICE="/dev/sdb1"
MOUNTPOINT="/mnt/backup"

# GNU/Linux 用 /proc/mounts；BSD 用 mount 输出
if ! grep -qs "$MOUNTPOINT " /proc/mounts 2>/dev/null; then
    mount -o ro "$DEVICE" "$MOUNTPOINT" || exit 1
    echo "已只读挂载 $DEVICE 到 $MOUNTPOINT"
else
    echo "$MOUNTPOINT 已经挂载，跳过"
fi
```

### 示例 4：挂载 ISO 镜像（GNU/Linux）

```
mkdir -p /mnt/iso
mount -o loop,ro image.iso /mnt/iso
# 用完卸载
# umount /mnt/iso
```

> **BSD 等效写法**（FreeBSD）：
> 
> ```
> md=$(mdconfig -f image.iso)
> mount -t cd9660 /dev/$md /mnt/iso
> ```

### 示例 5：chroot 环境准备（GNU/Linux 绑定挂载）

```
TARGET="/chroot/jail"
mkdir -p "$TARGET"/{proc,sys,dev}
mount -t proc proc "$TARGET/proc"
mount --bind /sys "$TARGET/sys"
mount --bind /dev "$TARGET/dev"
mount --bind /dev/pts "$TARGET/dev/pts"
```

> **BSD 等效**（FreeBSD 用 `mount_nullfs` 和 `mount -t devfs`）：
> 
> ```
> mount -t devfs devfs "$TARGET/dev"
> mount_nullfs /usr "$TARGET/usr"
> ```

---

是否需要我帮你针对**某个具体的脚本场景**（比如自动备份前检查挂载、Docker 容器外的 bind mount 管理）写一段**完整的可复用 shell 函数**？