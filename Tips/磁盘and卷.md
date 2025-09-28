### Linux 磁盘管理与分区扩容综合指南

---

#### 一、核心概念区分
| **场景**       | **适用工具**                     | **关键特点**                                |
|----------------|----------------------------------|-------------------------------------------|
| **非 LVM 环境** | `fdisk` + `resize2fs/xfs_growfs` | 直接操作物理分区，需保持起始扇区一致                |
| **LVM 环境**    | `pvcreate` + `vgextend` + `lvextend` | 逻辑卷动态扩展，支持在线扩容，灵活性高               |

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
| **命令**         | **作用**                          | **常用参数**                     |
|------------------|-----------------------------------|----------------------------------|
| `pvdisplay`      | 显示物理卷详细信息                | `-m` 查看PE映射                  |
| `vgdisplay`      | 显示卷组剩余空间（`Free PE/Size`） | `-v` 显示详细VG、LV、PV关系      |
| `lvextend`       | 扩展逻辑卷容量                    | `-L +10G` 指定大小，`-r` 自动调整文件系统 |

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