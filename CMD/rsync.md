# Rsync 详解及类似协议/工具

---

## 一、Rsync 是什么？

**Rsync**（Remote Sync）是 Linux/Unix 系统下的一款**远程数据同步工具**，最初由 Andrew Tridgell 和 Paul Mackerras 开发，用于取代老旧的 `rcp` 命令。它可以通过 LAN/WAN 在多台主机之间高效同步文件和目录。

---

## 二、核心算法原理（Rsync Algorithm）

这是 rsync 最精华的部分，也是它区别于 `scp`、`cp` 等工具的关键：

### 增量传输算法流程

假设主机 α 有文件 A，主机 β 有文件 B，两者内容相似但不完全相同：

```
步骤 1：分块
  β 将文件 B 切分成固定大小的块（如 512 字节）

步骤 2：计算校验和
  β 对每个块计算两种校验和：
    - 弱校验（Rolling Checksum，32位）—— 快速比对
    - 强校验（MD5，128位）—— 精确确认
  β 将这些校验和发送给 α

步骤 3：滑动窗口匹配
  α 在文件 A 上以 1 字节为步长滑动窗口
  用 Rolling Checksum 快速查找与 B 中某块匹配的区域
  弱校验命中后，再用 MD5 强校验确认

步骤 4：生成差异指令
  匹配成功的块 → 发送"引用指令"（只需几个字节）
  未匹配的数据 → 发送原始字节（literal data）

步骤 5：重组
  β 根据指令 + 原始数据，重组出完整的文件 A
```

> 📌 **关键优势**：只传输**差异部分**，而非整个文件。对于大文件的微小修改，传输量极小。

---

## 三、工作模式

|模式|说明|示例|
|---|---|---|
|**本地复制**|类似 `cp`，在同一机器上同步|`rsync -a /src/ /dst/`|
|**远程 Shell（SSH）**|通过 SSH 隧道传输，最常用|`rsync -avz /src/ user@host:/dst/`|
|**Rsync Daemon**|以守护进程方式运行，监听 873 端口|`rsync -avz /src/ host::module/`|

---

## 四、常用参数

```bash
rsync -avzP --delete /local/path/ user@remote:/remote/path/
```

|参数|含义|
|---|---|
|`-a`|归档模式（= `-rlptgoD`），递归 + 保留权限/时间/属主等|
|`-v`|详细输出|
|`-z`|传输时压缩|
|`-P`|显示进度 + 支持断点续传（`--partial --progress`）|
|`--delete`|删除目标端多余文件（镜像同步）|
|`--exclude`|排除指定文件/目录|
|`--bwlimit`|限制带宽（KB/s）|
|`-e ssh`|指定远程 shell（默认即 ssh）|
|`--dry-run`|模拟运行，不实际传输|

---

## 五、典型使用场景

```bash
# 1. 增量备份到远程服务器
rsync -avz --delete /data/ backup@192.168.1.100:/backup/data/

# 2. 排除日志目录
rsync -avz --exclude='*.log' --exclude='tmp/' /app/ user@host:/app/

# 3. 限速 + 断点续传
rsync -avzP --bwlimit=1000 /bigfile.iso user@host:/iso/

# 4. 通过 rsync daemon 同步
rsync -avz /web/ backup-server::webmodule/
```

---

## 六、类似的协议和工具

### 🔹 文件传输/同步类

|工具/协议|特点|与 rsync 对比|
|---|---|---|
|**SCP / SFTP**|基于 SSH 的简单文件复制|无增量算法，每次全量传输|
|**Rclone**|支持 40+ 云存储（S3、GDrive、OneDrive等）的同步工具|支持增量，但侧重云存储；可调用 rsync 算法|
|**Unison**|双向同步工具|rsync 是单向的，Unison 支持**双向**冲突检测|
|**lsyncd**|基于 inotify + rsync 的**实时**同步守护进程|底层仍用 rsync，但实现了文件变更的实时触发|
|**Syncthing**|P2P 去中心化实时文件同步|无需中心服务器，自动发现、加密、版本管理|
|**DRBD**|块设备级别的网络镜像（类似网络 RAID-1）|工作在**块设备层**，比 rsync 更底层、更实时|

### 🔹 协议层面

|协议|说明|
|---|---|
|**Rsync 协议**|自有协议，默认端口 873，支持 daemon 模式|
|**SSH 协议**|rsync 最常用的传输通道（端口 22），提供加密|
|**FTP / FTPS**|传统文件传输协议，无增量能力|
|**WebDAV**|基于 HTTP 的文件管理协议，部分客户端支持增量|
|**BitTorrent Sync（Resilio）**|基于 BT 协议的 P2P 文件同步|

### 🔹 备份工具（内置增量）

|工具|说明|
|---|---|
|**Borg Backup**|去重 + 压缩 + 加密的增量备份，底层思想类似 rsync|
|**Restic**|类似 Borg，支持多种后端（S3、SFTP、REST）|
|**Duplicity**|增量加密备份，支持 GPG 加密|

---

## 七、如何选择？

```
需要服务器间单向增量同步？        → rsync ✅
需要实时触发同步？               → lsyncd / Syncthing
需要双向同步 + 冲突处理？         → Unison / Syncthing
需要同步到云存储？               → Rclone
需要块级实时镜像（数据库等）？     → DRBD
需要加密增量备份 + 版本管理？     → Borg / Restic
只是简单拷个文件？               → scp / sftp 就够了
```

---

如果你对某个工具或 rsync 的某个具体用法（比如 daemon 配置、crontab 定时同步、与 inotify 结合等）想深入了解，随时可以继续问！