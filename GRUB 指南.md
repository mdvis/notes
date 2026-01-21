GRUB（GNU GRand Unified Bootloader）是 Linux 系统中最常用的引导加载器之一。它负责在系统开机时初始化硬件、加载内核并启动操作系统。掌握 GRUB 是理解 Linux 启动流程的关键技能，尤其在系统救援和故障排除中。本指南基于实践经验，涵盖 GRUB 的基础知识、工作原理、手动引导、命令详解、修复方法、常见问题排查以及实战练习。通过循序渐进的学习，你将能够手动启动系统、修复引导问题，并在虚拟机环境中安全练习。

## 一、GRUB 是什么？

GRUB 是一个多启动引导加载器，主要用于 Linux 系统，但也支持 Windows 等其他操作系统。它在开机后从 BIOS/UEFI 接手控制，负责加载操作系统内核。GRUB 的关键组件包括：

- **GRUB Stage 1**：安装在 MBR（Master Boot Record）或 EFI 分区中，用于引导 Stage 2。
- **GRUB Stage 2**：位于 /boot/grub 目录，包含核心模块和配置文件。
- **配置文件**：/boot/grub/grub.cfg，定义启动菜单、内核路径和参数。
- **内核映像**：vmlinuz，通常位于 /boot/ 下。
- **初始化文件系统**：initrd 或 initramfs，提供启动所需的临时根文件系统。

GRUB 支持传统 BIOS + MBR 和现代 UEFI + GPT 模式。在 UEFI 系统中，GRUB 文件通常位于 /boot/efi/EFI/ 下。

## 二、GRUB 启动流程简述

Linux 系统启动流程涉及多个阶段，GRUB 是关键一环。以下是典型流程（以 BIOS + MBR 为例，UEFI 类似但使用 EFI 系统分区）：

1. **BIOS/UEFI 初始化**：硬件自检，加载引导程序。
2. **MBR/EFI 引导**：执行 GRUB Stage 1，跳转到 Stage 2 (/boot/grub)。
3. **读取配置文件**：加载 /boot/grub/grub.cfg，显示启动菜单。
4. **加载内核和 initramfs**：选择菜单项后，GRUB 加载 vmlinuz 和 initrd/initramfs。
5. **移交控制权**：内核接管系统，挂载根文件系统，启动 init 进程（systemd 或其他）。

如果 grub.cfg 损坏或丢失，系统可能进入 GRUB 命令行模式（grub> 或 grub rescue>）。

| 阶段 | 组件 | 描述 |
|------|------|------|
| BIOS/UEFI | 固件 | 初始化硬件，查找引导设备 |
| GRUB Stage 1 | MBR/EFI | 引导核心模块 |
| GRUB Stage 2 | /boot/grub | 加载模块和配置文件 |
| 内核加载 | vmlinuz + initramfs | 启动操作系统 |

## 三、GRUB 命令行模式

GRUB 有两种命令行模式，用于手动干预和救援：

| 模式 | 提示符 | 功能 | 何时出现 |
|------|--------|------|----------|
| Normal 模式 | grub> | 完整命令支持，包括模块加载、路径补全 | grub.cfg 丢失或损坏，但 /boot/grub 可用 |
| Rescue 模式 | grub rescue> | 有限命令，仅基本变量设置和模块加载 | /boot/grub 丢失或模块无法加载 |

在开机时，按 Shift 或 Esc 可进入 GRUB 菜单；按 C 进入命令行模式。

## 四、基础命令详解

以下是 GRUB 常用命令的速查表和详细解释。命令主要在 grub> 模式下使用；在 rescue 模式下，仅支持 ls、set 和 insmod。

| 命令 | 功能 | 示例 |
|------|------|------|
| ls | 列出磁盘、分区和内容 | ls; ls (hd0,msdos1)/ |
| set | 查看/修改环境变量 | set; set root=(hd0,msdos1); set prefix=(hd0,msdos1)/boot/grub |
| insmod | 加载模块 | insmod normal; insmod linux; insmod ext2 |
| normal | 进入正常 GRUB 菜单 | normal |
| linux | 加载 Linux 内核 | linux /boot/vmlinuz root=/dev/sda1 ro quiet splash |
| initrd | 加载初始化内存盘 | initrd /boot/initrd.img |
| boot | 开始引导 | boot |
| search | 按文件/UUID 查找分区 | search --file /vmlinuz --set=root; search --fs-uuid <UUID> |
| cat | 查看文件内容 | cat (hd0,msdos1)/boot/grub/grub.cfg |
| help | 显示帮助 | help; help linux |

- **ls**：用于探索磁盘结构，确认分区内容（如查找 /boot/）。
- **set**：核心变量包括 root（根分区）和 prefix（GRUB 模块路径）。
- **insmod**：加载文件系统支持（如 ext2、btrfs）或功能模块。
- **linux/initrd/boot**：手动启动的核心序列，必须按顺序执行。
- **search**：在多磁盘环境中自动定位分区。
- **cat/help**：调试工具，用于检查配置文件或命令用法。

## 五、在 GRUB 命令行手动启动系统

如果系统进入 grub> 或 grub rescue>，可以手动引导：

1. **找到系统分区**：使用 ls 逐一检查分区，直到找到 /boot/ 或 /boot/grub/。
2. **设置根目录和 prefix**：set root=(hd0,msdos1); set prefix=(hd0,msdos1)/boot/grub。
3. **加载 normal 模式**（可选）：insmod normal; normal（返回菜单）。
4. **手动加载内核**：linux /boot/vmlinuz root=/dev/sda1 ro; initrd /boot/initrd.img; boot。

注意：
- 内核路径可能为 /vmlinuz 或 /boot/vmlinuz-版本号。
- root= 参数可使用 /dev/sda1 或 UUID=xxxx。
- 追加参数：nomodeset（图形问题）、single（单用户模式）。

从 rescue 模式恢复：先 set root 和 prefix，然后 insmod normal; normal。

## 六、修复 GRUB 的常用方法

使用 LiveCD（如 Ubuntu 安装介质）修复：

- **自动修复**：sudo grub-install /dev/sda; sudo update-grub。
- **手动修复（chroot）**：
  1. 挂载根分区：sudo mount /dev/sda1 /mnt。
  2. 绑定目录：sudo mount --bind /dev /mnt/dev; sudo mount --bind /proc /mnt/proc; sudo mount --bind /sys /mnt/sys。
  3. chroot：sudo chroot /mnt。
  4. 安装：grub-install /dev/sda; update-grub; exit。
  5. 卸载：sudo umount /mnt/{dev,proc,sys}; sudo umount /mnt。

针对 UEFI：使用 /dev/sda（整个磁盘，非分区），并确保 EFI 分区挂载。

## 七、常见问题与排查

| 问题 | 原因 | 解决 |
|------|------|------|
| grub rescue> 提示 | 分区号/UUID 变化或模块丢失 | set root= 和 prefix=，insmod normal |
| 更新内核后启动项错误 | grub.cfg 未更新 | update-grub |
| Windows 启动项丢失 | GRUB 未检测到 | os-prober; update-grub |
| GRUB 无法加载 | MBR 被覆盖（如安装 Windows） | grub-install /dev/sda |
| 启动黑屏 | 图形驱动问题 | 在 linux 命令添加 nomodeset |
| 找不到文件 | 路径错误 | 使用 ls 检查 /boot/ |

调试技巧：使用 search 自动查找；cat 检查 fstab 或 grub.cfg。

## 八、练习手册

在虚拟机（如 VirtualBox）中练习，使用快照回滚。目标：掌握手动引导和修复。

1. **练习 1：从 grub> 手动启动** – 模拟 grub.cfg 丢失，使用 linux/initrd/boot。
2. **练习 2：从 rescue 恢复 normal** – 设置 root/prefix，insmod normal。
3. **练习 3：调试路径错误** – 故意输入错路径，使用 ls 修正。
4. **练习 4：使用 UUID** – blkid 获取 UUID，在 linux 命令中使用。
5. **练习 5：search 自动识别** – search --file /vmlinuz --set=root。
6. **练习 6：重新安装 GRUB** – 模拟 MBR 损坏，使用 LiveCD chroot 修复。

| 技能点 | 掌握标志 |
|--------|----------|
| 识别分区 (ls) | 能判断 /boot 位置 |
| 设置 root/prefix | 从 rescue 进入 normal |
| 加载内核/initrd | 手动启动系统 |
| 处理错误 | 通过 ls 调整路径 |
| UUID/search | 多磁盘引导 |
| 重装 GRUB | 修复覆盖引导 |

## 九、安全建议和进阶

- 始终在虚拟机练习，避免破坏物理系统。
- 启用快照：实验前快照，失败后回滚。
- 进阶：探索 GRUB 自定义（如主题、加密）、多系统引导、UEFI 特定配置。
- 资源：man grub、GRUB 官方文档。

通过本指南，你将从理论到实践全面掌握 GRUB，成为 Linux 系统救援专家。