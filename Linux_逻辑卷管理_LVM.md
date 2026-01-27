## LVM

好的，我们来详细梳理一下 LVM 的常用操作和标准使用流程。LVM 的核心优势在于它提供了动态调整存储容量的灵活性。

### LVM 核心概念

首先，理解三个核心概念：
1. **PV** - 物理卷
   * 实体：可以是硬盘分区、整个硬盘、RAID阵列。
   * 操作：被 LVM 初始化的存储设备。
2. **VG** - 卷组
   * 实体：一个或多个 PV 的集合。
   * 操作：像一个“存储池”，从里面划分空间给 LV 使用。
3. **LV** - 逻辑卷
   * 实体：从 VG 中划分出来的一块空间。
   * 操作：最终被格式化成文件系统并挂载使用的部分，对于系统来说，它就像一个普通分区。

---

### 一、标准 LVM 使用流程

这是一个从零开始创建并使用 LVM 的完整流程。
**步骤 1：准备物理磁盘或分区**
使用 `fdisk` 或 `gdisk` 创建新分区，并将其**类型标记为 `8e` (Linux LVM)**（对于 MBR）或 `8e00` (Linux LVM)（对于 GPT）。

```bash
sudo fdisk /dev/sdb
# 在 fdisk 交互界面中：n (新建) -> p (主分区) -> ... -> t (修改类型) -> 8e (LVM) -> w (保存)
```

**步骤 2：创建 PV**
使用 `pvcreate` 命令将分区初始化为物理卷。

```bash
# 创建单个 PV
sudo pvcreate /dev/sdb1
# 一次性创建多个 PV
sudo pvcreate /dev/sdb1 /dev/sdc1
# 查看所有 PV
sudo pvs
# 或查看详细信息
sudo pvdisplay
```

**步骤 3：创建 VG**
使用 `vgcreate` 命令将一个或多个 PV 组合成一个卷组。

```bash
# 创建名为 "myvg" 的 VG，并包含 /dev/sdb1
sudo vgcreate myvg /dev/sdb1
# 查看所有 VG
sudo vgs
# 或查看详细信息
sudo vgdisplay
```

**步骤 4：创建 LV**
使用 `lvcreate` 命令从 VG 中划分出逻辑卷。

```bash
# 创建名为 "mylv" 的 LV，大小为 20G
sudo lvcreate -L 20G -n mylv myvg
# 创建使用 VG 所有剩余空间的 LV
sudo lvcreate -l 100%FREE -n mylv myvg
# 查看所有 LV
sudo lvs
# 或查看详细信息
sudo lvdisplay
```

创建成功后，LV 的设备文件通常位于 `/dev/<vg_name>/<lv_name>`，例如 `/dev/myvg/mylv`。
**步骤 5：格式化和挂载 LV**
像使用普通分区一样，对 LV 进行格式化并挂载。

```bash
# 格式化为 ext4 文件系统
sudo mkfs.ext4 /dev/myvg/mylv
# 创建挂载点
sudo mkdir /mnt/mydata
# 挂载 LV
sudo mount /dev/myvg/mylv /mnt/mydata
```

**步骤 6：配置开机自动挂载**
编辑 `/etc/fstab` 文件，添加一行。

```bash
sudo vim /etc/fstab
```

添加以下内容（推荐使用 UUID，更稳定）：

```bash
# 先使用 `blkid` 命令查看 LV 的 UUID
/dev/myvg/mylv /mnt/mydata ext4 defaults 0 2
# 或者使用更稳定的 UUID 方式（推荐）
UUID=你的LV_UUID /mnt/mydata ext4 defaults 0 2
```

保存后，可以使用 `sudo mount -a` 测试配置是否正确。
---

### 二、LVM 常用维护操作

#### 1. VG 管理

* **扩展 VG**（当有新的 PV 可用时）：
  
  ```bash
  # 先将新磁盘/分区创建为 PV
  sudo pvcreate /dev/sdc1
  # 将其添加到已有的 VG "myvg" 中
  sudo vgextend myvg /dev/sdc1
  ```
* **缩小 VG**（**危险操作，需先迁移数据**）：
  
  ```bash
  # 1. 将数据从 /dev/sdb1 迁移到 VG 中的其他 PV
  sudo pvmove /dev/sdb1
  # 2. 从 VG "myvg" 中移除 PV /dev/sdb1
  sudo vgreduce myvg /dev/sdb1
  ```
  
  #### 2. LV 管理（核心优势）
* **扩展 LV**（**在线操作，无需卸载**）：
  
  ```bash
  # 1. 先扩展 LV 本身的大小（例如增加 10G）
  sudo lvextend -L +10G /dev/myvg/mylv
  # 或者扩展到指定大小
  sudo lvextend -L 30G /dev/myvg/mylv
  # 2. 然后扩展文件系统，使增加的空间可用
  # 对于 ext4 文件系统：
  sudo resize2fs /dev/myvg/mylv
  # 对于 xfs 文件系统：
  sudo xfs_growfs /mnt/mydata  # 注意 xfs 需要指定挂载点
  ```
* **缩小 LV**（**有风险，务必先备份！**）：
  
  ```bash
  # 1. 卸载文件系统
  sudo umount /mnt/mydata
  # 2. 强制检查文件系统
  sudo e2fsck -f /dev/myvg/mylv
  # 3. 先缩小文件系统（例如缩小到 15G）
  sudo resize2fs /dev/myvg/mylv 15G
  # 4. 再缩小 LV
  sudo lvreduce -L 15G /dev/myvg/mylv
  # 5. 重新挂载
  sudo mount /dev/myvg/mylv /mnt/mydata
  ```
  
  **注意：XFS 文件系统不支持缩小！**
* **删除 LV**：
  
  ```bash
  # 确保已卸载
  sudo umount /mnt/mydata
  # 删除 LV
  sudo lvremove /dev/myvg/mylv
  ```
* **创建 LV 快照**（用于备份）：
  
  ```bash
  # 创建一个名为 "mylv-snap" 的快照，大小为 1G
  sudo lvcreate -L 1G -s -n mylv-snap /dev/myvg/mylv
  # 挂载快照（只读）进行备份
  sudo mount -o ro /dev/myvg/mylv-snap /mnt/snapshot
  # 备份完成后，卸载并删除快照
  sudo umount /mnt/snapshot
  sudo lvremove /dev/myvg/mylv-snap
  ```
  
  #### 3. PV 管理
* **查看 PV 信息**：
  
  ```bash
  sudo pvs
  sudo pvdisplay
  ```
* **从 VG 中移除 PV**（见上面 VG 缩小部分）。

---

### 三、常用命令总结

| 功能       | 命令                                                      | 说明                  |
|:-------- |:------------------------------------------------------- |:------------------- |
| **信息查看** | `pvs/vgs/lvs`                                           | 简洁信息                |
|          | `pvdisplay/vgdisplay/lvdisplay`                         | 详细信息                |
| **创建**   | `pvcreate /dev/sdX1`                                    | 创建 PV               |
|          | `vgcreate vg_name /dev/sdX1`                            | 创建 VG               |
|          | `lvcreate -L size -n lv_name vg_name`                   | 创建 LV               |
| **扩展**   | `vgextend vg_name /dev/sdX2`                            | 扩展 VG               |
|          | `lvextend -L +size /dev/vg_name/lv_name`                | 扩展 LV               |
|          | `resize2fs /dev/vg_name/lv_name`                        | 扩展 ext4 文件系统        |
| **缩小**   | `lvreduce -L -size /dev/vg_name/lv_name`                | **小心**：缩小 LV        |
|          | `resize2fs /dev/vg_name/lv_name new_size`               | **小心**：缩小 ext4 文件系统 |
| **删除**   | `lvremove /dev/vg_name/lv_name`                         | 删除 LV               |
|          | `vgremove vg_name`                                      | 删除 VG（需先删 LV）       |
|          | `pvremove /dev/sdX1`                                    | 删除 PV（需先从 VG 中移除）   |
| **快照**   | `lvcreate -s -L size -n snap_name /dev/vg_name/lv_name` | 创建快照                |

### 最佳实践与注意事项

1. **备份第一**：在对 LV 进行缩小、删除等危险操作前，务必备份重要数据。
2. **使用 UUID**：在 `/etc/fstab` 中挂载时，使用 `UUID=` 而非设备路径，因为设备路径（如 `/dev/sdb`）可能在重启后发生变化，而 VG/LV 的名称路径（如 `/dev/myvg/mylv`）相对稳定，但 UUID 是最稳定的。
3. **快照非备份**：快照主要用于创建一致性备份的瞬间状态，它不能替代异地备份。
4. **预留空间**：不要将 VG 的 100% 空间全部分配给 LV，留一些空间有利于快照和灵活性。
5. **规划大小**：合理规划 LV 的初始大小，虽然 LVM 可以动态扩展，但缩小要麻烦得多。
   掌握以上操作，你就能很好地管理和使用 LVM 来满足动态存储需求了。
