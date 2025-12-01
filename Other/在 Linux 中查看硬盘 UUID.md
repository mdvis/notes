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