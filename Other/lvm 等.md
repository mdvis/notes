非常好 👍  
你想要的是一份**完整、系统、实用**的教程，把前两篇内容（“调整 Fedora root 分区大小”+“LVM 原理讲解”）整合成一篇逻辑清晰的文档，对吧？  
下面是我为你**融合、补全、优化**后的版本，内容涵盖：

- LVM 基础与结构
    
- 扩容 root 分区的详细步骤（LVM / 非 LVM）
    
- 文件系统类型差异（ext4 / xfs）
    
- 实战命令与安全建议
    
- 快照与回滚说明
    

---

# 🧭 Fedora / Linux 调整 Root 分区大小完整指南（含 LVM 原理）

在 Fedora（或其他基于 Linux 的系统）中调整 **root 分区大小** 是一项敏感操作，因为 root 分区是系统核心挂载点，涉及文件系统、LVM（若使用）与分区表修改。

本文分为三部分：

1. **LVM 基础知识**
    
2. **调整 root 分区大小的实战步骤**
    
3. **常见问题与安全建议**
    

---

## 🧩 一、LVM 基础知识

### 1️⃣ 什么是 LVM？

**LVM（Logical Volume Manager）** 是 Linux 的一种**逻辑卷管理机制**，它在物理存储设备之上创建更灵活的“虚拟分区”。

相比传统固定分区（如 `/dev/sda1`），LVM 允许：

- 动态调整分区大小（无需重启）
    
- 合并多块磁盘为一个逻辑卷组
    
- 快速创建快照（snapshot）备份系统状态
    
- 无缝迁移数据到新硬盘
    

---

### 2️⃣ LVM 三层结构

```
Physical Volume (PV)
  ↓
Volume Group (VG)
  ↓
Logical Volume (LV)
```

#### ▪ Physical Volume（PV，物理卷）

- 是底层实际存储设备，如 `/dev/sda2`、`/dev/nvme0n1p2`
    
- 用命令创建：
    
    ```bash
    pvcreate /dev/sda2
    ```
    

#### ▪ Volume Group（VG，卷组）

- 把多个 PV 组合为一个大的“存储池”
    
- 用命令创建：
    
    ```bash
    vgcreate fedora /dev/sda2 /dev/sdb1
    ```
    

#### ▪ Logical Volume（LV，逻辑卷）

- 从 VG 中划分出的可用空间，相当于“虚拟分区”，可格式化并挂载
    
- 示例结构：
    
    ```
    VG: fedora
     ├─ LV: root (100G)
     ├─ LV: home (300G)
     └─ LV: swap (16G)
    ```
    
- 创建命令：
    
    ```bash
    lvcreate -L 100G -n root fedora
    mkfs.xfs /dev/fedora/root
    ```
    

---

### 3️⃣ 常用 LVM 命令速查表

|功能|命令示例|
|---|---|
|查看 PV|`pvs` 或 `pvdisplay`|
|查看 VG|`vgs` 或 `vgdisplay`|
|查看 LV|`lvs` 或 `lvdisplay`|
|创建 PV|`pvcreate /dev/sda2`|
|创建 VG|`vgcreate fedora /dev/sda2`|
|创建 LV|`lvcreate -L 20G -n root fedora`|
|扩展 LV|`lvextend -L +10G /dev/fedora/root`|
|缩小 LV|`lvreduce -L 50G /dev/fedora/root`|
|删除|`lvremove` / `vgremove` / `pvremove`|

---

### 4️⃣ 快照（Snapshot）

LVM 可创建快照以便快速回滚或备份：

```bash
lvcreate -s -n rootsnap -L 5G /dev/fedora/root
```

快照会记录自创建以来的所有数据变化，方便恢复系统状态。

---

## 🧱 二、调整 Root 分区大小（实战步骤）

### 1️⃣ 检查系统是否使用 LVM

```bash
lsblk
```

或

```bash
df -h
```

查看 `/`（root） 挂载在哪个设备：

- 若是 `/dev/mapper/fedora-root` → **LVM 系统**
    
- 若是 `/dev/sda2` 或 `/dev/nvme0n1p2` → **非 LVM 系统**
    

---

## 🧮 三、LVM 系统（Fedora 默认使用）

### 1️⃣ 查看卷组和逻辑卷状态

```bash
sudo vgs
sudo lvs
```

示例输出：

```
VG     #PV #LV #SN Attr   VSize   VFree
fedora   1   2   0 wz--n- <500.00g  100.00g
```

表示卷组 `fedora` 有 100G 未使用空间（`VFree`）。

---

### 2️⃣ 扩大 root 分区（有可用空间时）

#### （1）扩展逻辑卷并自动扩展文件系统

```bash
sudo lvextend -r -l +100%FREE /dev/fedora/root
```

- `-r` 自动执行 `resize2fs`（ext4）或 `xfs_growfs`（xfs）
    
- 若仅想增加 20G：
    
    ```bash
    sudo lvextend -r -L +20G /dev/fedora/root
    ```
    

---

### 3️⃣ 如果卷组没有剩余空间

你需先扩展物理卷：

1. 用 `gparted` 或 `parted` 扩大底层分区（如 `/dev/sda2`）
    
2. 更新 PV 信息：
    
    ```bash
    sudo pvresize /dev/sda2
    ```
    
3. 再次扩展逻辑卷：
    
    ```bash
    sudo lvextend -r -l +100%FREE /dev/fedora/root
    ```
    

⚠️ 注意：修改底层分区时需在 **Fedora Live USB** 环境下操作，避免 root 被占用。

---

## 💾 四、非 LVM 系统

若你的 root 是 `/dev/sda2` 之类的传统分区，则不能在线调整，必须使用 **Live USB 模式**。

### 步骤如下：

1. 用 Fedora Live USB 启动系统
    
2. 打开终端并运行：
    
    ```bash
    sudo gparted
    ```
    
3. 找到 `/dev/sda2`（root 所在分区）
    
4. 调整相邻分区大小，释放空闲空间
    
5. 扩大 root 分区
    
6. 点击 “Apply”
    
7. 执行文件系统扩展（根据类型）：
    

#### ▪ ext4 文件系统：

```bash
sudo e2fsck -f /dev/sda2
sudo resize2fs /dev/sda2
```

#### ▪ xfs 文件系统（Fedora 默认）：

```bash
sudo mount /dev/sda2 /mnt/root
sudo xfs_growfs /mnt/root
```

---

## ✅ 五、验证结果

重启后运行：

```bash
df -h /
```

确认 root 容量是否增加。

---

## 🧰 六、安全与最佳实践

|操作前准备|说明|
|---|---|
|🔒 备份数据|建议备份 `/etc`、`/home`、重要配置|
|🧑‍💻 使用 Live USB|修改 root 分区时系统必须离线|
|⚡ 保持电源稳定|确保笔电插电操作|
|🚫 不动 EFI/boot|切勿改动启动分区的顺序或起始扇区|
|🧾 检查文件系统|扩容前执行 `fsck` 检查文件系统一致性|

---

## 💡 七、LVM 可视化示意（文字图）

```
物理磁盘（/dev/sda）
 └─ 分区（/dev/sda2）
     ↓ 作为 PV
 └─ [Physical Volume]
       ↓ 加入卷组
 └─ [Volume Group: fedora]
       ↓ 划分出多个逻辑卷
        ├─ /dev/fedora/root   → /
        ├─ /dev/fedora/home   → /home
        └─ /dev/fedora/swap   → swap
```

---

## 🧭 总结

|系统类型|操作方式|需重启|推荐工具|
|---|---|---|---|
|LVM|`lvextend -r`|否|命令行|
|非 LVM|GParted + `resize2fs`|是|Live USB|

---

如果你愿意，我可以根据你的 `lsblk` 或 `vgs` 输出帮你生成一份**完全定制的扩容命令脚本**（适配你的实际设备名与文件系统类型），确保不误删、不破坏数据。  
是否要我帮你生成那一份？