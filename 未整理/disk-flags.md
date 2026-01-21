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
