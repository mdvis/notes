先纠正一个**极其常见的拼写错误**：Linux/Unix 里这个命令叫 **`umount`**，不是 `unmount`（少一个 n）。很多人第一次用都会敲错，系统会提示 `command not found`。

下面按你的结构来系统学习 `umount`。

---

## 1. 这个命令解决什么问题，典型使用场景

**解决什么问题**：将已挂载的文件系统从目录树中"断开"——也就是卸载。卸载后，该目录不再指向存储设备上的文件系统，设备可以被安全移除。

**典型使用场景**：

|场景|例子|
|---|---|
|安全弹出外接设备|U 盘、移动硬盘用完，`umount /media/usb` 后再拔|
|脚本中临时挂载后清理|备份脚本挂载 NFS → 写数据 → 卸载|
|网络文件系统卡死|NFS 服务器挂了，客户端 `umount -f` 或 `-l` 强制断开|
|磁盘维护/替换|运维更换硬盘前必须卸载对应分区|
|容器/CI 环境清理|确保构建过程中产生的挂载点被回收|

---

## 2. 基本语法与高频选项

### 语法骨架

```
umount [选项] <挂载点|设备>
```

- `[选项]` — 可省略，直接卸载
- `<挂载点|设备>` — **至少给一个**。可以是挂载目录路径（如 `/mnt/usb`），也可以是设备路径（如 `/dev/sdb1`）。两者等价，推荐用**挂载点**，语义更清晰

### 高频选项（按真实脚本使用频率）

|选项|缩写来源|作用|可运行示例|
|---|---|---|---|
|`-a`|**a**ll|卸载 `/etc/mtab` 中所有文件系统（常与 `-t` 配合）|`umount -a -t tmpfs`|
|`-f`|**f**orce|强制卸载（对 NFS 等网络文件系统尤其有用）|`umount -f /mnt/nfs`|
|`-l`|**l**azy|**延迟卸载**：立即从 VFS 断开，等设备不再繁忙后再真正卸载（⚠️ Linux/GNU 特有，BSD/macOS 无此选项）|`umount -l /mnt/busy`|
|`-r`|**r**emount|卸载失败时自动以只读方式重新挂载（防止数据丢失）|`umount -r /dev/sdb1`|
|`-t <type>`|**t**ype|只卸载指定类型的文件系统|`umount -t nfs4 /mnt/data`|

> ★ **先掌握这三个**：`-f`、`-l`、`-t`。覆盖了 90% 的脚本和排障需求。
> 
> **BSD vs GNU 关键差异**：
> 
> - `-l`（lazy）是 **Linux util-linux 特有**，FreeBSD/OpenBSD/macOS 没有等价选项。BSD 上强制卸载只能靠 `-f`
> - `-n`（不写 `/etc/mtab`）是 **Linux 特有**
> - `-r` 在 Linux 和 BSD 上都有，但 Linux 下更常用
> - BSD 的 `umount` 支持 `-v`（verbose），Linux 也支持

---

## 3. 新手最容易踩的坑

|错误写法|实际后果|正确写法|
|---|---|---|
|`unmount /mnt/usb`|`command not found`，敲错命令名|`umount /mnt/usb`|
|在 `/mnt/usb` 目录下执行 `umount /mnt/usb`|`umount: /mnt/usb: target is busy` — 当前 shell 占用着该目录|先 `cd` 到其他目录，或 `cd /` 再卸载|
|`umount /dev/sdb` （对整个磁盘而非分区）|如果磁盘没直接挂载会报 "not mounted"；如果有分区挂载了也卸不掉|用具体分区：`umount /dev/sdb1` 或用挂载点：`umount /mnt/usb`|
|`umount *`|通配符展开后可能卸载掉你不想要的挂载点，甚至导致系统分区被卸掉|**永远不要对 umount 用通配符**，明确指定路径|
|`umount -f /`|强制卸载根文件系统 — 系统直接半死，可能需重启修复|永远不要对 `/`、`/usr`、`/var` 等系统挂载点用 `-f`|
|脚本里不检查返回值直接往下走|卸载实际失败了，后续 `mkfs` 或 `dd` 操作可能破坏正在使用的文件系统|用 `if ! umount ...` 或检查 `$?`|

---

## 4. 和功能相近的命令对比

|命令|什么时候选它|判断依据|
|---|---|---|
|**`umount`**​|卸载任何已挂载的文件系统|**通用首选**，所有 Unix-like 系统都有|
|**`fusermount -u`**​|卸载 FUSE 用户态文件系统（如 sshfs、rclone mount）|普通用户挂载的 FUSE 文件系统，root 的 `umount` 有时卸不掉，必须用 `fusermount -u`|
|**`eject`**​|卸载 + 弹出光驱/磁带|需要物理弹出介质时才用；U 盘不需要 `eject`，`umount` 就够了|
|**`udisksctl unmount`**​|桌面环境、PolicyKit 场景下卸载|需要用户权限管理时用；服务器脚本里没必要|
|**`mount -o remount,ro`**​|不想卸载，只想变成只读|系统需要维护但服务不能中断时|

**一句话判断**：服务器/脚本里卸载 → `umount`；FUSE 用户态挂载 → `fusermount -u`；桌面环境 → `udisksctl`。

---

## 5. 脚本化要点

### 退出码

|退出码|含义|
|---|---|
|`0`|卸载成功|
|`1`|失败（busy、not mounted、权限不足等）|

### 判断成败的惯用写法

```
# 写法一：if 直接判断（最推荐，可读性好）
if ! umount /mnt/backup; then
    echo "ERROR: 卸载失败，尝试 lazy unmount" >&2
    umount -l /mnt/backup || exit 1
fi

# 写法二：$? 判断
umount /mnt/backup
if [ $? -ne 0 ]; then
    echo "卸载失败，退出码 $?"
    exit 1
fi

# 写法三：set -e + 容错（脚本开头）
set -e
umount /mnt/backup || umount -l /mnt/backup  # set -e 下 || 链不会触发退出
```

### 与管道/重定向的组合

```
# 静默卸载（脚本里不希望看到 stdout/stderr）
umount /mnt/usb >/dev/null 2>&1

# 记录卸载结果到日志
umount /mnt/usb >> /var/log/backup.log 2>&1

# 配合 findmnt 检查是否已卸载（比 grep mtab 更可靠）
if ! findmnt /mnt/usb > /dev/null; then
    echo "已确认卸载"
fi
```

### BSD 兼容性注意（写跨平台脚本时）

```
# 检测是否是 Linux，决定是否用 -l
if [[ "$(uname)" == "Linux" ]]; then
    umount -l "$MOUNTPOINT"   # Linux: lazy unmount
else
    umount -f "$MOUNTPOINT"   # BSD/macOS: 只能 force
fi
```

---

## 6. 由浅入深的示例

### 示例 1：最基础的卸载（日常操作）

```
# 查看当前挂载
mount | grep usb

# 卸载 U 盘
umount /media/myusb
```

### 示例 2：卸载 NFS（网络文件系统卡死场景）

```
# NFS 服务器已宕机，普通 umount 会卡住
# Linux 上先用 -f 尝试强制
umount -f /mnt/nfs

# 如果 -f 也卡住（内核层卡死），用 -l 延迟卸载（Linux 特有）
umount -l /mnt/nfs
# 之后该挂载点立即从目录树消失，内核在后台清理
```

### 示例 3：批量卸载某类型的所有文件系统

```
# 卸载所有 tmpfs（常用于容器清理脚本）
umount -a -t tmpfs

# 只卸载指定类型的并打印详情
umount -v -a -t fuse.sshfs
```

### 示例 4：脚本中带重试的健壮卸载

```
#!/bin/bash
# unmount_with_retry.sh — 带重试和 lazy fallback 的卸载函数

unmount_robust() {
    local target="$1"
    local max_retries=3
    local i

    for ((i=1; i<=max_retries; i++)); do
        if umount "$target" 2>/dev/null; then
            echo "✓ 卸载成功: $target"
            return 0
        fi
        echo "  第 $i 次尝试失败，等待 2 秒..."
        sleep 2
    done

    # 重试都失败，尝试 lazy unmount（仅 Linux）
    if [[ "$(uname)" == "Linux" ]]; then
        echo "  尝试 lazy unmount..."
        if umount -l "$target"; then
            echo "✓ Lazy unmount 成功: $target"
            return 0
        fi
    fi

    echo "✗ 所有卸载方式均失败: $target" >&2
    return 1
}

unmount_robust /mnt/backup || exit 1
```

### 示例 5：找出谁在占用挂载点并自动释放（进阶排障）

```
#!/bin/bash
# 当 umount 报 busy 时，自动找出占用进程并处理

MOUNTPOINT="/mnt/usb"

if umount "$MOUNTPOINT" 2>/dev/null; then
    echo "卸载成功"
    exit 0
fi

echo "挂载点繁忙，查找占用进程..."

# Linux: 用 lsof 或 fuser
if command -v lsof &>/dev/null; then
    echo "--- lsof 结果 ---"
    lsof +D "$MOUNTPOINT"
elif command -v fuser &>/dev/null; then
    echo "--- fuser 结果 ---"
    fuser -vm "$MOUNTPOINT"
fi

# 自动 kill 占用进程（谨慎使用！）
# fuser -km "$MOUNTPOINT"

# 然后再试一次
umount "$MOUNTPOINT" && echo "卸载成功" || echo "仍然失败"
```

---

是否需要我帮你把示例 4 的健壮卸载函数改成一个**可直接 `source` 到任意脚本里的通用工具函数**，或者再深入讲一下 **lazy unmount（`-l`）的内核原理和风险提示**？