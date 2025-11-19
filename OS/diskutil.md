### macOS diskutil 全面用法指南

`diskutil` 是 macOS 内置的命令行工具，用于磁盘、分区和卷的管理。它提供比图形界面更强大的功能，如挂载、格式化、修复和 APFS 容器操作。以下是常见与高级用法的综合总结，按功能分类。所有命令在 Terminal 中运行，敏感操作需 `sudo` 权限。操作前备份数据，并用 `diskutil list` 确认设备 ID 以防误操作。

#### 1. **查看磁盘信息**
   - **diskutil list**：列出所有物理磁盘、逻辑卷和分区。  
     示例：`diskutil list`  
     输出：显示标识符（如 `/dev/disk0`）、大小和类型。
   - **diskutil info [disk/volume]**：获取指定磁盘/卷详情（如 UUID、文件系统）。  
     示例：`diskutil info /dev/disk1s1`
   - **diskutil apfs list**：列出 APFS 容器和卷详情（高级）。  
     示例：`diskutil apfs list`  
     输出：容器 UUID、卷大小和共享状态。
   - **diskutil cs list**：列出 CoreStorage 逻辑卷组（旧版支持）。  
     示例：`diskutil cs list`

#### 2. **挂载与卸载**
   - **diskutil mount [volume]**：挂载卷，使其在 Finder 可见。  
     示例：`diskutil mount /dev/disk1s1`
   - **diskutil unmount [volume]**：卸载指定卷。  
     示例：`diskutil unmount /dev/disk1s1`
   - **diskutil unmountDisk [disk]**：卸载整个磁盘的所有卷（常用于外部驱动器）。  
     示例：`diskutil unmountDisk /dev/disk2`

#### 3. **格式化与擦除**
   - **diskutil eraseDisk [格式] [卷名称] [设备]**：擦除并格式化整个磁盘。  
     示例：`diskutil eraseDisk APFS MyDisk /dev/disk2`（APFS 为 macOS 推荐格式）。
   - **diskutil eraseVolume [volume] [格式] [名称]**：擦除并格式化指定卷。  
     示例：`sudo diskutil eraseVolume APFS NewVol /dev/disk1s2`  
     启用加密：`sudo diskutil eraseDisk APFS EncryptedVol GPT /dev/disk2`（提示设置密码）。

#### 4. **分区管理**
   - **diskutil partitionDisk [设备] [分区方案] [分区大小] [格式] [名称]**：创建分区。  
     示例：`diskutil partitionDisk /dev/disk2 GPT APFS 100G MyPartition`（GPT 为现代默认方案）。
   - **diskutil resizeVolume [volume] [大小]**：调整卷大小。  
     示例：`diskutil resizeVolume /dev/disk1s1 200G`

#### 5. **修复与验证**
   - **diskutil repairDisk [设备]**：修复磁盘错误（类似于 fsck）。  
     示例：`sudo diskutil repairDisk /dev/disk1`
   - **diskutil verifyDisk [设备]**：验证磁盘完整性。  
     示例：`diskutil verifyDisk /dev/disk1`

#### 6. **APFS 容器与卷管理**（高级）
   - **diskutil apfs createContainer [物理存储]**：在物理磁盘上创建 APFS 容器。  
     示例：`sudo diskutil apfs createContainer /dev/disk2`
   - **diskutil apfs addVolume [容器] [类型] [名称]**：在容器中添加新卷。  
     示例：`sudo diskutil apfs addVolume disk3 APFS DataVol`
   - **diskutil apfs deleteVolume [卷]**：删除指定卷（需先卸载）。  
     示例：`sudo diskutil apfs deleteVolume /dev/disk3s2`

#### 7. **克隆与复制**（高级）
   - **diskutil cloneVolume [源卷] [目标卷]**：克隆卷（用于备份/迁移）。  
     示例：`sudo diskutil cloneVolume /dev/disk1s1 /dev/disk2s1`  
     注意：目标需有足够空闲空间。

#### 8. **重命名与标签**（高级）
   - **diskutil rename [卷] [新名称]**：重命名卷或设置标签。  
     示例：`diskutil rename /dev/disk1s1 "My Backup"`

#### 9. **加密管理**（高级）
   - **diskutil apfs unlockVolume [卷] [密码]**：解锁加密卷。  
     示例：`diskutil apfs unlockVolume /dev/disk1s1`（交互式输入密码）。

#### 10. **CoreStorage 与 RAID**（旧版支持，高级）
   - **diskutil cs create [大小] [物理磁盘]**：创建 CoreStorage 逻辑卷。  
     示例：`sudo diskutil cs create 100g /dev/disk2`
   - **diskutil appleRAID create stripe RAIDSet /dev/disk2 /dev/disk3**：创建条带化 RAID。

#### 11. **空间与活动监控**（高级）
   - **diskutil activity**：实时监控磁盘活动。  
     示例：`sudo diskutil activity /dev/disk1`（Ctrl+C 停止）。
   - 获取空间：用 `diskutil info /dev/disk1s1 | grep "Disk Size"`（结合脚本）。

#### 注意事项
- **权限与备份**：擦除/分区需 `sudo`，始终备份数据。
- **文件系统**：APFS 为现代默认；HFS+ 用于旧版兼容。
- **分区方案**：GPT（GUID）为 macOS 默认，MBR 用于旧硬件。
- **错误处理**：命令失败时，检查日志 `log show --predicate 'subsystem == "com.apple.diskarbitrationd"' --last 1h`。
- **帮助**：`man diskutil` 或 `diskutil [子命令] --help` 查看详情；参考 Apple 官方文档。

这个合并版覆盖了基础到高级用法。如果需要示例脚本、特定场景或进一步扩展，随时说！