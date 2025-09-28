## 基础命令结构
```bash
qemu-img [standard options] command [command options]
```
## 核心命令与参数
1. `create`（创建镜像）
	- **语法**：`qemu-img create -f <fmt> [-o <options>] <filename> [size]`
	- **参数详解**：
	  - `-f <fmt>`：指定镜像格式（如 `qcow2`、`raw`、`vmdk`）。
	  - `-o <options>`：设置镜像属性（逗号分隔），常用选项：
	    - `preallocation=off/metadata/falloc/full`：磁盘预分配策略：
	      - `off`：默认，不预分配（稀疏文件）。
	      - `metadata`：仅预分配元数据（仍为稀疏文件）。
	      - `falloc`：预分配空间但不置零（性能较好）。
	      - `full`：预分配并置零（非稀疏文件，性能最差）。
	    - `backing_file=<path>`：指定后端镜像文件（用于差异镜像）。
	  - `size`：镜像大小（支持 `K/M/G/T` 单位，如 `10G`）。
	  - `-b <img>` 创建时指定基础镜像。
```bash
qemu-img create -f qcow2 -o preallocation=falloc,backing_file=base.img disk.qcow2 20G
```
1. `convert`（格式转换）
	- **支持格式**
		​1. **RAW** 默认格式，直接映射物理存储，支持稀疏文件存储（如Linux的ext4或Windows的NTFS文件系统）。
		​2. **qcow2** QEMU原生推荐格式，支持写时复制（COW）、压缩、加密和快照功能，适合动态扩展存储需求。
		​3. **qcow（旧版）** ​ 早期QEMU的COW格式，已被qcow2取代，但仍兼容。
		​4. **VMDK** VMware虚拟机磁盘格式，支持与VMware 3/4/6版本兼容。
		​5. **VDI** VirtualBox虚拟磁盘格式，适用于与VirtualBox环境交互。
		​6. **VHD/VPC** Microsoft Virtual PC/Hyper-V传统虚拟磁盘格式。
		​7. **VHDX** Hyper-V 2012及以上版本的高性能虚拟磁盘格式，支持更大容量和更优性能。
		​8. **QED** QEMU增强型磁盘格式（已逐渐被qcow2取代）。
		​9. **cloop** 压缩的Loop格式，主要用于读取Knoppix等Live CD镜像。
		​10. **其他格式** 包括历史遗留的cow格式（仅部分场景兼容）。
	- **语法**：`qemu-img convert -f <src_fmt> -O <dst_fmt> [-c] [-p] <src_file> <dst_file>`
	- **参数详解**：
	  - `-f <src_fmt>`：指定源镜像格式（若未指定自动检测）。
	  - `-O <dst_fmt>`：指定目标镜像格式（如 `raw`→`qcow2`）。
	  - `-c`：启用压缩（仅支持 `qcow2`、`vmdk` 等格式）。
	  - `-p`：显示转换进度。
```bash
qemu-img convert -f raw -O qcow2 -c centos.raw centos.qcow2
```
3. `info`（查看镜像信息）
	- **语法**：`qemu-img info <filename>`
	- **功能**：显示镜像格式、大小、后端文件、快照等信息。
```
file format: qcow2
virtual size: 20 GiB (21474836480 bytes)
disk size: 2.5 GiB
cluster_size: 65536
backing file: base.img
```
4. `check`（镜像检查）
	- **语法**：`qemu-img check [-f <fmt>] <filename>`
	- **参数详解**：
	  - `-f <fmt>`：指定镜像格式（支持 `qcow2`、`qed`、`vdi`）。
	- **功能**：检测镜像一致性及错误。
5. `resize`（调整大小）
	- **语法**：`qemu-img resize <filename> [+|-]<size>`
	- **参数详解**：
	  - `+<size>`：扩展镜像。
	  - `-<size>`：缩小镜像（需文件系统支持）。
```bash
qemu-img resize disk.qcow2 +5G
```
6. `snapshot`（快照管理）
	- **子命令**：
	  - `-l`：列出快照。
	  - `-c <name>`：创建快照。
	  - `-a <name>`：恢复快照。
	  - `-d <name>`：删除快照。
```bash
qemu-img snapshot -c backup1 disk.qcow2
```
## 格式对比（常用场景）
| 格式      | 优点           | 缺点          | 适用场景          |
| ------- | ------------ | ----------- | ------------- |
| `qcow2` | 支持快照、压缩、稀疏存储 | 性能略低于 `raw` | 虚拟机动态扩展、开发测试  |
| `raw`   | 高性能、直接访问     | 占用空间大、无快照   | 物理机直通磁盘、高性能需求 |
| `vmdk`  | 兼容 VMware    | 功能限制较多      | VMware 环境迁移   |
## 注意事项
- **稀疏文件**：`qcow2` 默认生成稀疏文件，实际占用空间小于虚拟大小（可通过 `ls -lh` 查看）。
- **后端镜像**：使用 `backing_file` 时，修改仅记录差异，需手动提交变更（`qemu-img commit`）。
- **预分配策略**：`full` 预分配会显著增加初始化时间，但适合需频繁写入的场景。
## QEMU 支持的磁盘映像格式
| **格式名称**      | **描述**                 | **优点**               | **缺点**              | **适用场景**              |
| ------------- | ---------------------- | -------------------- | ------------------- | --------------------- |
| **raw**       | 原始二进制磁盘映像              | 简单高效，性能最佳，无元数据开销     | 无压缩、快照或动态扩展，浪费空间    | 高性能需求或兼容现有工具          |
| **qcow2**     | QEMU 默认格式，支持动态扩展和快照    | 动态分配、快照、压缩、加密        | 性能略低于 raw，结构复杂      | 通用虚拟化，需节省空间或快照        |
| **qcow**      | qcow2 前身，旧版格式          | 支持动态分配和快照            | 功能不如 qcow2，性能和安全较差  | 兼容旧系统或迁移历史数据          |
| **vdi**       | VirtualBox 磁盘映像        | 动态扩展，与 VirtualBox 兼容 | 无 qcow2 高级功能（如快照压缩） | QEMU 与 VirtualBox 互操作 |
| **vmdk**      | VMware 磁盘格式            | 动态扩展，与 VMware 兼容     | 部分高级功能支持有限          | 与 VMware 环境交互         |
| **vhd/vhdx**  | Microsoft 虚拟硬盘格式       | 动态扩展，与 Hyper-V 兼容    | vhdx 支持有限           | 与 Hyper-V 环境交互        |
| **iso**       | 光盘映像格式                 | 标准格式，广泛兼容            | 只读，不适合主磁盘           | 安装系统或加载光盘内容           |
| **bochs**     | Bochs 模拟器磁盘映像          | 与 Bochs 兼容           | 功能有限，使用较少           | 与 Bochs 交互或历史场景       |
| **cloop**     | 压缩只读循环设备映像             | 支持压缩，节省空间            | 只读，不支持动态存储          | 运行 Live CD 系统         |
| **parallels** | Parallels Desktop 磁盘映像 | 与 Parallels 兼容       | 支持有限，使用较少           | 与 Parallels 环境交互      |
- 常用格式: raw（高性能）、qcow2（功能全面）。
- 兼容性格式: vdi、vmdk、vhd。
- 特殊用途: iso（光盘）、cloop（只读压缩）。