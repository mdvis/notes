## 一、作用

`fdisk` 是 Linux/Unix 系统下用于**磁盘分区管理**的命令行工具（全称 **f**ormat **disk**），属于 `util-linux` 包。它通过交互式菜单驱动界面完成以下操作：

- 创建、删除磁盘分区
- 修改分区类型（如 Linux filesystem、EFI System、Linux swap）
- 创建和管理**分区表**（MBR、GPT、Sun、SGI 等格式）
- 查看磁盘与分区信息
- 管理 MBR 的**引导标志**（bootable flag）

注意：`fdisk` 只操作**分区表元数据**，不创建文件系统。创建文件系统要用 `mkfs`，创建分区后还需 `partprobe`/`partx` 或重启让内核重新加载分区表。

## 二、适用场景

- 为新增磁盘规划分区布局
- 给系统新增 EFI System Partition（ESP）或 swap 分区
- 在 MBR 与 GPT 之间查看/转换分区表（转换通常改用 `gdisk` 或 `sgdisk` 更安全）
- 排查引导问题（检查 boot 标志、分区类型 ID）
- 脚本环境外的手动精细调整

**不适用**：大容量 GPT 磁盘的精细操作建议用 `gdisk`/`parted`；批量自动化分区建议用 `sfdisk`（`fdisk` 的非交互姊妹工具）；LVM/加密卷管理在上层工具处理。

## 三、基本概念

| 概念 | 说明 |
|------|------|
| **磁盘（Disk）** | 块设备本身，如 `/dev/sda`、`/dev/nvme0n1`、`/dev/vda` |
| **分区（Partition）** | 磁盘上逻辑划分的区段，如 `/dev/sda1`；MBR 中主分区编号 1–4，逻辑分区从 5 起 |
| **分区表（Partition Table）** | 记录分区布局的元数据，位于磁盘起始处（MBR 在第 1 扇区，GPT 主表在磁盘头部、备份表在尾部） |
| **MBR** | Master Boot Record，传统分区表格式 |
| **GPT** | GUID Partition Table，UEFI 时代的现代分区表格式 |
| **主分区 / 扩展分区 / 逻辑分区** | MBR 特有结构：最多 4 个主分区，或 3 主 + 1 扩展（扩展分区内再容纳逻辑分区） |
| **分区类型 ID** | 标识分区用途的代码，如 `83`（Linux）、`82`（swap）、`ef`（ESP）、`8e`（LVM） |

## 四、常用命令参数

```
fdisk [选项] [设备]
```

| 参数 | 作用 |
|------|------|
| `-l` | 列出指定设备（或全部设备）的分区表后退出，**只读** |
| `-l /dev/sda` | 仅查看某块磁盘 |
| `-u[=cylinders\|sectors]` | 指定显示单位（现代系统默认 sectors） |
| `-b <size>` | 指定扇区大小 |
| `-c[=dos]` | 兼容模式（DOS 风格） |
| `-L <when>` | 彩色输出（always/never/auto） |
| `-o <list>` | 自定义输出列（配合 `-l`），如 `-o Device,Start,End,Size,Type` |
| `-x` | 显示详细字段 |

典型只读用法：

```sh
fdisk -l                # 查看所有磁盘分区
fdisk -l /dev/nvme0n1   # 查看指定磁盘
lsblk -f                # 补充查看文件系统/挂载信息
```

## 五、交互式子命令

不带 `-l` 进入交互模式后（`fdisk /dev/sda`），单字母命令：

**分区操作**

| 命令 | 作用 |
|------|------|
| `n` | 新建分区（询问类型、编号、起止位置） |
| `d` | 删除分区 |
| `t` | 更改分区类型 |
| `a` | 切换 bootable 标志（仅 MBR 有意义） |

**显示与检查**

| 命令 | 作用 |
|------|------|
| `p` | 打印当前分区表（内存中的改动，未写入） |
| `l` | 列出已知分区类型代码 |
| `F` | 列出未分配的空闲空间 |
| `x` | 进入专家模式（更多底层选项） |
| `i` | 显示分区信息 |

**保存与退出**

| 命令 | 作用 |
|------|------|
| `w` | **写入分区表到磁盘并退出**（改动生效） |
| `q` | **放弃所有未保存改动退出** |

关键机制：所有操作先改内存中的副本，`p` 可随时预览，只有按 `w` 才真正落盘；出错可按 `q` 安全放弃。

## 六、典型使用示例

### 1. 为新磁盘创建单个分区

```sh
sudo fdisk /dev/sdb
# n → 接受默认（primary、分区号）→ 回车用默认起始 → 回车用默认结尾（全部空间）
# w → 写入
sudo partprobe /dev/sdb        # 让内核立即识别新分区
sudo mkfs.ext4 /dev/sdb1       # 创建文件系统
```

### 2. 创建指定大小的分区

```sh
sudo fdisk /dev/sdb
# n → 起始默认 → 结束位置输入 +50G（相对大小语法）
# w
```

结束位置支持 `+<大小><K,M,G,T>` 相对语法，如 `+10G`。

### 3. 设置分区类型（如 swap、ESP）

```sh
sudo fdisk /dev/sdb
# t → 选择分区号 → 输入类型代码（如 82 为 swap，ef 为 EFI System）
# w
```

### 4. MBR 磁盘上创建主分区 + 逻辑分区

```sh
sudo fdisk /dev/sdc
# n → p（主分区）→ ...
# n → e（扩展分区，占用剩余空间）→ ...
# n → 在扩展分区内自动创建逻辑分区（编号从 5 开始）
# w
```

### 5. 删除分区

```sh
sudo fdisk /dev/sdb
# d → 选择分区号（多个则重复）→ w
```

### 6. 检查磁盘当前布局

```sh
sudo fdisk -l /dev/sda
```

输出示例（节选）：

```
Disk /dev/sda: 100 GiB
Disklabel type: gpt
Device       Start       End   Sectors  Size Type
/dev/sda1     2048    206847    204800  100M EFI System
/dev/sda2   206848 209715167 209508320  100G Linux filesystem
```

## 七、注意事项与潜在风险

1. **写操作不可撤销**：`w` 一旦执行，误删/误建分区即生效。操作前务必确认设备名（`lsblk` 核对），写错磁盘会毁掉数据。
2. **不要操作已挂载的文件系统所在分区**：卸载（`umount`）后再分区；根分区需从 Live 环境操作。
3. **删除分区 ≠ 删除数据，但会使其不可访问**：分区表丢失后可尝试 `testdisk` 恢复，但不应依赖。
4. **内核分区表缓存**：写盘后需 `partprobe`、`partx -u` 或重启，否则后续 `mkfs`/挂载可能找不到新分区（"kernel failed to re-read partition table"）。
5. **对齐问题**：现代 fdisk 默认按 1 MiB（2048 扇区）对齐，这对 SSD/4Kn 磁盘的性能和寿命很重要，不要手动指定非对齐起始位置，除非有特殊理由。
6. **修改已使用分区的起止位置可能导致文件系统损坏**：缩小分区必须先 `resize2fs` 缩文件系统再缩分区，顺序不可颠倒。
7. **fdisk 不管理文件系统**：它不懂 ext4/xfs 等格式，也不做数据迁移。
8. **权限**：需要 root（`sudo`）。
9. **虚拟机/云环境**：云盘扩容后通常需要 `growpart` + 文件系统扩容，而不是手动 fdisk。

## 八、MBR 与 GPT 的差异与限制

| 维度 | MBR（DOS 分区表） | GPT |
|------|------------------|-----|
| **最大磁盘容量** | 2 TiB（512B 扇区）；超出部分不可寻址 | 理论 8 ZiB，实际无限制 |
| **分区数量** | 4 个主分区（或 3 主 + 1 扩展 + 任意逻辑分区） | 默认 128 个分区（无需扩展分区概念） |
| **分区标识** | 1 字节类型代码（`83`、`82`、`ef` 等） | 128 位 GUID 类型 |
| **引导方式** | BIOS/传统引导，boot 标志 + 引导代码 | UEFI 引导，依赖 EFI System Partition |
| **冗余性** | 单份，位于磁盘起始，损坏即丢失 | 主表 + 尾部备份表，含 CRC 校验，可修复 |
| **fdisk 支持** | 完整支持 | util-linux ≥ 2.23 的 fdisk 支持基本 GPT 操作；更精细的 GPT 操作建议 `gdisk`/`sgdisk`/`parted` |
| **保护性 MBR** | — | GPT 磁盘含 protective MBR，防止旧工具误格式化 |

**fdisk 处理两种格式时的行为差异**：

- 打开磁盘时 fdisk 自动识别 `Disklabel type`（`dos` 或 `gpt`）。
- MBR 模式下 `n` 会询问分区类型（primary/extended/logical），GPT 模式下没有这一问（无主/扩展之分）。
- `a`（bootable 标志）只在 MBR 下有实际意义；GPT 下可用 `t` 改类型或用专家命令处理 legacy BIOS boot 属性位。
- **MBR→GPT 转换**：fdisk 在专家模式提供 `g`（新建 GPT）等命令，但**转换会清空分区表**；保留数据转换请使用 `gdisk`（`sgdisk -g .` 可无损转换 MBR→GPT）。
- UEFI 系统引导盘的 ESP 必须存在于 GPT 磁盘上（类型 GUID `C12A7328-F81F-11D2-BA4B-00A0C9E7908`，fdisk 类型代码 `ef`）。

**工具选择建议**：小磁盘/BIOS 系统 MBR 用 fdisk 足够；GPT/UEFI 环境优先 `gdisk` 或 `parted`；自动化脚本用 `sfdisk`；云盘在线扩容用 `growpart`。