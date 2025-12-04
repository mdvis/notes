## Linux 分区建议

| **目录** | **文件系统** | **作用** | **为什么单独分区** | **推荐大小** |
| --- | --- | --- | --- | --- |
| `/` (根目录) | Ext4/Btrfs | 系统核心文件存储 | 系统的基础分区，必须存在 | 桌面：15-25 GB  <br>服务器：25-50 GB |
| `/boot` | Ext4/Btrfs | 启动加载器和内核文件存储 | 提高启动稳定性，避免其他分区问题影响系统启动 | 500 MB - 1 GB |
| `/boot/efi` | FAT32 | EFI 系统分区，存储 UEFI 引导文件（如 GRUB 的 `grubx64.efi`、系统启动项配置） | 提供 UEFI 引导支持，需使用 FAT32 文件系统（UEFI 的标准） | 300-500 MB |
| `/home` | Ext4/Btrfs | 用户的个人文件和设置存储 | 防止用户数据占满根目录空间，方便重装系统时保护数据 | 根据需求，通常 20 GB 或更大 |
| `/var` | Ext4/Btrfs | 日志文件、缓存文件、邮件队列等存储 | 防止日志或缓存增长过快挤占根分区空间，提升服务器稳定性 | 普通系统：2-5 GB  <br>服务器：按需分配 |
| `/tmp` | Ext4/Btrfs | 临时文件存储 | 防止恶意用户创建大量临时文件导致系统崩溃，可用内存文件系统提高性能 | 桌面：1-2 GB  <br>服务器：5-10 GB |
| `/usr` | Ext4/Btrfs | 用户安装的程序和库文件存储 | 防止程序安装占满根分区空间，可只读挂载提高安全性 | 桌面：15-20 GB  <br>服务器：25-50 GB |
| `/opt` | Ext4/Btrfs | 第三方或自定义安装的软件包存储 | 隔离非标准软件，便于管理和维护 | 5-20 GB 或根据需求调整 |
| `/srv` | Ext4/Btrfs | 服务数据存储（如 Web 服务器或 FTP 服务数据） | 保证服务数据独立，便于备份和管理 | 根据服务需求分配 |
| `/swap` | Swap | 内存不足时的备用空间 | 提高系统稳定性，防止内存耗尽 | 按需分配，**小于 2 GB 内存**：`swap` 等于内存大小的 **2 倍**。**2-8 GB 内存**：`swap` 等于内存大小。**超过 8 GB 内存**：`swap` 通常设置为 **1-2 GB**（或根据实际需求调整）。 |
## Linux 错误码
退出码（退出状态）可以告诉我们最后一次执行的命令的状态。在命令结束以后，我们可以知道命令是成功完成的还是以错误结束的。
**其基本思想是，程序返回退出代码 `0` 时表示执行成功，没有问题。代码 `1` 或 `0` 以外的任何代码都被视为不成功。** 退出码除了 0 和 1 外还有很多值，我将在本文介绍它们。
### Linux Shell 中的各种退出码
我们来快速了解一下 Linux Shell 中的主要退出码：

| 退出码 | 解释  |
| --- | --- |
| `0` | 命令成功执行 |
| `1` | 通用错误代码 |
| `2` | 命令（或参数）使用不当 |
| `126` | 权限被拒绝（或）无法执行 |
| `127` | 未找到命令，或 `PATH` 错误 |
| `128+n` | 命令被信号从外部终止，或遇到致命错误 |
| `130` | 通过 `Ctrl+C` 或 `SIGINT` 终止（_终止代码 2 或键盘中断_） |
| `143` | 通过 `SIGTERM` 终止（_默认终止_） |
| `255/*` | 退出码超过了 0-255 的范围，因此重新计算（LCTT 译注：超过 255 后，用退出码对 256 取模） |
> 📋 `130`（`SIGINT` 或 `^C`）和 `143`（`SIGTERM`）等终止信号是非常典型的，它们属于 `128+n` 信号，其中 `n` 代表终止码。
在简单了解了退出码之后，我们来看看它们的用法。
### 获取退出码
前一个命令执行的退出码存储在特殊变量 `$?` 中。你可以通过运行以下命令来获取：
```
echo $?
```
我们在所有演示中都将使用它来获取退出代码。 请注意，`exit` 命令支持以带着前一条命令相同的退出码退出。
### 退出码 0
退出码 `0` 表示命令执行无误，这是完成命令的理想状态。 例如，我们运行这样一条基本命令
```
neofetch 
echo $?
```
这个退出码 `0` 表示特定命令已成功执行，仅此而已。让我们再演示几个例子。 你可以尝试终止一个进程；它也会返回代码 `0`。
```
pkill lxappearance
```
查看文件内容也会返回退出码 0，这**仅**意味着 `cat` 命令执行成功。
### 退出码 1
退出码 `1` 也很常见。它通常表示命令以一般错误结束。 例如，在没有 sudo 权限的情况下使用软件包管理器，就会返回代码 `1`。在 Arch Linux 中，如果我运行下面的命令：
```
pacman -Sy
```
它会返回 `1`， 表示上一条命令运行出错。
> 📋 如果你在基于 Ubuntu 的发行版中尝试这样做（不使用 `sudo` 执行 `apt update`），运行后会得到错误码 `100`，表示你是在没有权限的情况下运行 `apt`。`100` 不是标准错误码，而是 `apt` 特有的错误码。
虽然这是一般的理解，但我们也可以将其解释为 “不被允许的操作”。 除以 `0` 等操作也会返回错误码 `1`。
### 退出码 2
这个退出码出现在当执行的命令有语法错误时。滥用命令参数也会导致此错误。 一般来说，它表示由于使用不当，命令无法执行。 例如，我在一个本应只有一个连字符的选项上添加了两个连字符，那么此时会出现退出码 2。
```
grep --z file.txt
```
当权限被拒绝时，比如访问 `/root` 文件夹，就会出现错误码 `2`。
### 退出码 126
126 是一个特殊的退出码，它用于表示命令或脚本因权限错误而未被执行。 当你尝试执行没有执行权限的 Shell 脚本时，就会出现这个错误。 请注意，该退出码只出现在没有足够权限的脚本或命令的“_执行_”中，这与一般的**权限被拒绝**错误不同。 因此，不要把它与你之前看到的退出码为 `2` 的示例混淆。在那个示例中，运行的是 `ls` 命令，权限问题出自它试图执行的目录。而本例中权限问题来自脚本本身。
### 退出码 127
这是另一个常见的退出码。退出码 `127` 指的是“未找到命令”。它通常发生在执行的命令有错别字或所需的可执行文件不在 `$PATH` 变量中时。 例如，当我尝试执行一个不带路径的脚本时，经常会看到这个错误。 当你想运行的可执行文件不在 `$PATH` 变量中时，也会出现退出码 `127`。你可以通过 在 PATH 变量中添加命令的目录来纠正这种情况。 当你输入不存在的命令时，也会得到这样的退出码。
### 退出码 128+n 系列
当应用程序或命令因致命错误而终止或执行失败时，将产生 128 系列退出码（`128+n`），其中 `n` 为信号编号。 `n` 包括所有类型的终止代码，如 `SIGTERM`、`SIGKILL` 等。
#### 退出码 130 或 SIGINT
在通过终止信号 `2` 或按下 `Ctrl+C` 中断进程时，会发出 `SIGINT`（键盘中断信号）。 因为终止信号是 `2`，所以我们得到的退出码是 `130`（128+2）。下面的视频演示了 `lxappearance` 的中断信号。
#### 退出码 137 或 SIGKILL
`SIGKILL`（立即终止信号）表示终止信号 `9`。这是终止应用程序时最不应该使用的方法。 因为终止信号为 `9`，因此我们得到的退出代码为 `137`（128+9）。
#### 退出码 143 或 SIGTERM
`SIGTERM` 是进程在未指定参数的情况下被杀死时的默认行为。 `SIGTERM` 的终止信号为 `15`，因此该信号的退出码为 `143`（128+15）。 还有一些你以前可能不知道的终止信号，它们也有自己类似的退出码。你可以在这里查看它们：
> 📋 请注意，如果进程在启动它的同一会话中终止，这些信号可能不会出现。如果要重现这些信号，请从不同的 shell 终止。
> 
> 就个人而言，信号 `128` 是无法重现的。
### 当退出码超过了 255 会怎样?
最新版本的 Bash 甚至保留了超过 255 的原始退出码的值，但一般来说，如果代码超过 255，就会被重新计算。 也就是说，代码 `256` 会变成 `0`，`257` 会变成 `1`，`383` 会变成 `127`，以此类推。为确保更好的兼容性，请将退出码保持在 `0` 至 `255` 之间。
## linux 安全指南
好的，我现在需要为用户提供一个关于Linux安全指南的全面回答。首先，我需要仔细阅读用户提供的搜索结果，从中提取关键的安全建议和最佳实践。接下来，我需要将这些信息分门别类，确保覆盖用户可能关心的各个方面，比如系统更新、用户权限、防火墙配置等。
首先，我看到搜索结果中多个网页都提到了系统更新和补丁管理的重要性，例如网页1、2、3、5、7、9都强调了及时更新系统和软件包以修复漏洞。这可能是一个基础但关键的点，需要放在前面。
然后是用户权限管理，网页1、2、3、5、8、9都提到了最小权限原则、使用sudo代替root登录、设置强密码策略等。特别是网页8还详细说明了如何配置密码复杂度和锁定策略，这部分需要整合进去。
防火墙和网络安全的配置在网页1、2、3、6、9中都有涉及，提到使用iptables或firewalld，限制不必要的端口和服务。网页4和6还讨论了选择更安全的初始化系统如不使用systemd，以及使用LibreSSL代替OpenSSL，但可能这些属于进阶内容，可能需要放在后面或者作为可选建议。
加密技术方面，网页1、2、3、4、5、6、7、10提到了文件系统加密、SSH密钥认证、磁盘加密等，特别是网页4详细讨论了内核安全配置，但可能用户需要的是更实用的步骤，所以需要简化这些内容。
日志和监控也是多个网页提到的重点，比如网页1、3、5、7、8、10，需要说明如何启用日志记录和使用工具进行分析。
恶意软件防范方面，网页2、5、7、9提到了安装防病毒软件和定期扫描，特别是网页7推荐了几款工具，需要列举出来。
此外，还有一些进阶建议，比如禁用不必要的服务（网页2、3、6、8）、使用SELinux或AppArmor（网页3、6）、定期备份数据（网页1、3、5、7）、配置SSH安全（网页9、10）等，需要分点说明。
最后，可能需要总结一些最佳实践，如定期审计、安全扫描、遵循最小安装原则等，这些在网页3、5、6、7、9中都有提到。
现在需要将这些信息结构化，分成几个主要部分，每个部分下包含具体的措施，并确保引用正确的网页来源。同时，要避免重复，合并相似的建议。例如，多个网页提到强密码策略，可以合并成一个点，引用多个来源。此外，检查是否有遗漏的重要点，如双因素认证（网页3）、使用安全软件源（网页7）等，确保覆盖全面。
可能的结构如下：
1. 系统更新与漏洞管理
2. 用户与权限管理
3. 网络安全配置
4. 数据加密与安全传输
5. 日志监控与审计
6. 恶意软件防护
7. 进阶安全措施
8. 最佳实践与持续维护
每个部分下再分点说明具体措施和相关引用。需要确保每个建议都有对应的网页支持，并且引用正确。例如，在系统更新部分引用网页1、2、3、5、7、9；在用户权限部分引用网页1、2、3、5、8、9等。
还要注意时间因素，今天是2025年3月7日，所以较旧的网页（如2022年的网页8）可能需要验证其建议是否仍然适用，但用户提供的搜索结果可能已是最新的，因此可以默认采用。同时，部分网页可能提供了更详细的操作步骤，如网页8中的具体配置文件修改，可能需要简化成用户易懂的建议，而不是详细命令。
最后，需要确保回答清晰、有条理，每个点都简洁明了，同时引用正确的来源，帮助用户进一步查阅详细信息。
以下是综合多个来源的Linux安全指南，涵盖核心防护措施与最佳实践，帮助提升系统安全性：
---
### 一、系统基础防护
1. **系统更新管理**  
   • 启用自动更新：`yum-autoupdate`（RHEL系）或`unattended-upgrades`（Debian系）
   • 定期执行手动更新：`apt update && apt upgrade` 或 `dnf update`
   • 优先应用关键安全补丁，避免使用已停止维护的旧内核
2. **最小化安装原则**  
   • 安装时仅选择必要软件包，禁用非必需服务（如`telnet`、`rpcbind`）
   • 使用轻量级初始化系统替代systemd（如OpenRC或runit）以减少攻击面
---
### 二、用户与权限控制
1. **账户安全策略**  
   • 禁用root远程登录，强制使用`sudo`执行特权命令
   • 设置密码复杂度：长度≥12位，包含大小写字母、数字及符号
   • 配置密码失败锁定：`pam_tally2.so deny=5 unlock_time=600`（5次失败后锁定10分钟）
2. **权限管理**  
   • 遵循最小权限原则：通过`chmod`限制文件权限（如配置文件设为644，脚本设为700）
   • 使用`setfacl`细化访问控制，避免全局可写目录
---
### 三、网络与访问控制
1. **防火墙配置**  
   • 启用`firewalld`或`iptables`，仅开放必要端口（如SSH自定义端口）
   • 限制IP访问：`/etc/hosts.allow`中设置白名单（如`sshd:192.168.1.0/24`）
2. **SSH安全强化**  
   • 禁用密码认证，强制使用密钥登录：`PasswordAuthentication no`
   • 修改默认端口，启用两步验证（如Google Authenticator）
   • 配置会话超时：`ClientAliveInterval 300`（5分钟无操作自动断开）
---
### 四、数据与加密保护
1. **磁盘加密**  
   • 安装时启用LUKS全盘加密，敏感目录使用`ecryptfs`
   • 数据库/配置文件采用`gpg`或`openssl`加密存储
2. **传输安全**  
   • 使用SFTP替代FTP，配置SSL/TLS加密Web服务（如Let's Encrypt证书）
   • 禁用弱加密算法：在`/etc/ssh/sshd_config`中设置`Ciphers aes256-ctr`
---
### 五、监控与应急响应
1. **日志审计**  
   • 集中管理日志：部署`rsyslog`或`journald`，监控`/var/log/auth.log`等关键文件
   • 使用工具分析异常：`fail2ban`自动封禁暴力破解IP，`Logwatch`生成日报
2. **入侵检测**  
   • 安装AIDE/Tripwire定期校验系统文件完整性
   • 启用SELinux/AppArmor强制访问控制
---
### 六、进阶安全措施
• **内核加固**：调整sysctl参数（如`kernel.kptr_restrict=2`隐藏内核指针）
• **沙箱隔离**：使用Firejail或Docker限制高风险应用权限
• **备份策略**：每日增量备份至异地存储，测试恢复流程
---
### 最佳实践清单
1. 定期进行漏洞扫描（OpenVAS/Nessus）
2. 禁用USB存储设备（通过`/etc/modprobe.d/blacklist.conf`）
3. 使用LibreSSL替代OpenSSL提升加密安全性
4. 配置`umask 027`限制新建文件默认权限
通过上述措施，可显著降低Linux系统风险。具体实施时需结合业务需求调整，建议参考各发行版官方文档细化配置。
## LVM
好的，我们来详细梳理一下 LVM 的常用操作和标准使用流程。LVM 的核心优势在于它提供了动态调整存储容量的灵活性。
### LVM 核心概念
首先，理解三个核心概念：
1.  **PV** - 物理卷
    *   实体：可以是硬盘分区、整个硬盘、RAID阵列。
    *   操作：被 LVM 初始化的存储设备。
2.  **VG** - 卷组
    *   实体：一个或多个 PV 的集合。
    *   操作：像一个“存储池”，从里面划分空间给 LV 使用。
3.  **LV** - 逻辑卷
    *   实体：从 VG 中划分出来的一块空间。
    *   操作：最终被格式化成文件系统并挂载使用的部分，对于系统来说，它就像一个普通分区。
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
*   **扩展 VG**（当有新的 PV 可用时）：
    ```bash
    # 先将新磁盘/分区创建为 PV
    sudo pvcreate /dev/sdc1
    # 将其添加到已有的 VG "myvg" 中
    sudo vgextend myvg /dev/sdc1
    ```
*   **缩小 VG**（**危险操作，需先迁移数据**）：
    ```bash
    # 1. 将数据从 /dev/sdb1 迁移到 VG 中的其他 PV
    sudo pvmove /dev/sdb1
    # 2. 从 VG "myvg" 中移除 PV /dev/sdb1
    sudo vgreduce myvg /dev/sdb1
    ```
#### 2. LV 管理（核心优势）
*   **扩展 LV**（**在线操作，无需卸载**）：
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
*   **缩小 LV**（**有风险，务必先备份！**）：
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
*   **删除 LV**：
    ```bash
    # 确保已卸载
    sudo umount /mnt/mydata
    # 删除 LV
    sudo lvremove /dev/myvg/mylv
    ```
*   **创建 LV 快照**（用于备份）：
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
*   **查看 PV 信息**：
    ```bash
    sudo pvs
    sudo pvdisplay
    ```
*   **从 VG 中移除 PV**（见上面 VG 缩小部分）。
---
### 三、常用命令总结
| 功能 | 命令 | 说明 |
| :--- | :--- | :--- |
| **信息查看** | `pvs/vgs/lvs` | 简洁信息 |
| | `pvdisplay/vgdisplay/lvdisplay` | 详细信息 |
| **创建** | `pvcreate /dev/sdX1` | 创建 PV |
| | `vgcreate vg_name /dev/sdX1` | 创建 VG |
| | `lvcreate -L size -n lv_name vg_name` | 创建 LV |
| **扩展** | `vgextend vg_name /dev/sdX2` | 扩展 VG |
| | `lvextend -L +size /dev/vg_name/lv_name` | 扩展 LV |
| | `resize2fs /dev/vg_name/lv_name` | 扩展 ext4 文件系统 |
| **缩小** | `lvreduce -L -size /dev/vg_name/lv_name` | **小心**：缩小 LV |
| | `resize2fs /dev/vg_name/lv_name new_size` | **小心**：缩小 ext4 文件系统 |
| **删除** | `lvremove /dev/vg_name/lv_name` | 删除 LV |
| | `vgremove vg_name` | 删除 VG（需先删 LV） |
| | `pvremove /dev/sdX1` | 删除 PV（需先从 VG 中移除） |
| **快照** | `lvcreate -s -L size -n snap_name /dev/vg_name/lv_name` | 创建快照 |
### 最佳实践与注意事项
1.  **备份第一**：在对 LV 进行缩小、删除等危险操作前，务必备份重要数据。
2.  **使用 UUID**：在 `/etc/fstab` 中挂载时，使用 `UUID=` 而非设备路径，因为设备路径（如 `/dev/sdb`）可能在重启后发生变化，而 VG/LV 的名称路径（如 `/dev/myvg/mylv`）相对稳定，但 UUID 是最稳定的。
3.  **快照非备份**：快照主要用于创建一致性备份的瞬间状态，它不能替代异地备份。
4.  **预留空间**：不要将 VG 的 100% 空间全部分配给 LV，留一些空间有利于快照和灵活性。
5.  **规划大小**：合理规划 LV 的初始大小，虽然 LVM 可以动态扩展，但缩小要麻烦得多。
掌握以上操作，你就能很好地管理和使用 LVM 来满足动态存储需求了。
## RAID 冗余独立磁盘阵列 redundant array
# RAID 冗余独立磁盘阵列 redundant array of inexpensive disks
| **RAID 级别** | **描述** | **磁盘数量** | **数据冗余** | **读性能** | **写性能** | **磁盘空间利用率** | **优点** | **缺点** | **适用场景** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **RAID 0** | 数据条带化，没有冗余（数据分散在多个磁盘） | 2及以上 | 无冗余 | 高   | 高   | 100% | \- 提供最快的读写速度  <br>\- 磁盘空间利用率最高 | \- 无冗余，任何一个磁盘故障会导致数据丢失 | \- 对速度要求高且不重视数据保护的应用，如视频编辑、大数据处理 |
| **RAID 1** | 镜像，数据在两个磁盘间完全复制（镜像冗余） | 2   | 有冗余 | 中等  | 中等  | 50% | \- 数据冗余保护  <br>\- 读性能提高（从多个磁盘读取数据） | \- 写性能较低（因为需要写入所有镜像磁盘）  <br>\- 磁盘利用率低 | \- 需要高数据安全性、少量磁盘空间的场景，如数据库、关键应用服务器 |
| **RAID 5** | 数据条带化，带有奇偶校验（数据分布在多个磁盘上，并进行奇偶校验） | 3及以上 | 有冗余 | 高   | 中等  | 最低（N-1）% | \- 高冗余保护  <br>\- 较高的读性能  <br>\- 写性能相比RAID 1有所提升 | \- 写入性能较低（因为要计算奇偶校验）  <br>\- 恢复数据过程较慢 | \- 数据冗余和空间利用率要求较平衡的场景，如文件服务器、Web 服务器 |
| **RAID 6** | 类似RAID 5，但使用双重奇偶校验（可以承受两个磁盘故障） | 4及以上 | 有冗余 | 高   | 较低  | 最低（N-2）% | \- 提供更高的冗余保护（支持两个磁盘故障）  <br>\- 高读性能 | \- 写入性能较低（由于需要双重奇偶校验）  <br>\- 磁盘空间利用率低于RAID 5 | \- 需要高数据保护且写负载较轻的场景，如大型存储系统、数据中心 |
| **RAID 10 (1+0)** | RAID 1与RAID 0的组合，数据镜像与条带化 | 4及以上 | 有冗余 | 很高  | 很高  | 50% | \- 高读写性能  <br>\- 良好的冗余保护  <br>\- 故障恢复能力强 | \- 磁盘利用率较低（需至少4个磁盘）  <br>\- 成本较高 | \- 高性能与数据冗余都很重要的应用，如数据库、虚拟化环境、交易系统 |
| **RAID 50 (5+0)** | RAID 5与RAID 0的组合，条带化和奇偶校验结合 | 6及以上 | 有冗余 | 高   | 高   | 最低（N-2）% | \- 较高的读写性能  <br>\- 比RAID 5更高的冗余性能和性能 | \- 写入性能较低（仍有奇偶校验计算）  <br>\- 需要更多磁盘支持 | \- 需要平衡高性能和冗余的大型存储环境，如视频编辑、云存储 |
| **RAID 60 (6+0)** | RAID 6与RAID 0的组合，双重奇偶校验与条带化结合 | 8及以上 | 有冗余 | 高   | 较高  | 最低（N-4）% | \- 提供双重奇偶校验冗余保护  <br>\- 较高的读性能  <br>\- 较强的数据恢复能力 | \- 写入性能较低（需要双重奇偶校验）  <br>\- 磁盘空间利用率较低 | \- 对数据安全性要求高的大型存储场景，如数据中心、视频存档管理系统 |
## fstab
系统开机时会主动读取 `/etc/fstab` 这个文件中的内容，根据文件里面的配置挂载磁盘。这样我们只需要将磁盘的挂载信息写入这个文件中我们就不需要每次开机启动之后手动进行挂载了。
## 挂载的限制
1. 根目录是必须挂载的，而且==一定要先于其他 mount point 被挂载==。因为是所有目录的根目录，其他目录都是由根目录 `/` 衍生出来的
2. 挂载点必须是已经存在的目录
3. 挂载点的指定可以任意，但必须遵守必要的系统目录架构原则
4. 所有挂载点在同一时间只能被挂载一次
5. 所有分区在同一时间只能挂在一次
6. 若进行卸载，必须将工作目录退出挂载点（及其子目录）之外
## 参数
```
UUID=be7c41...375162  /         ext4   defaults  1  1
tmpfs                 /dev/shm  tmpfs  defaults  0  0
```
| 列   | 名           | 作用                            |
| --- | ----------- | ----------------------------- |
| 第一列 | Device      | 磁盘设备文件或者该设备的 Label 或者 UUID    |
| 第二列 | Mount point | 挂载在那个目录                       |
| 第三列 | Filesystem  | 文件系统                          |
| 第四列 | Parameters  | 文件系统参数，默认 async               |
| 第五列 | dump        | 能否被dump备份命令作用（通常 0 或 1）       |
| 第六列 | fsck        | 是否检验扇区,开机过程中系统默认用fsck检验系统是否完整 |
## 查看分区的 Label 和 UUID
```
dumpe2fs -h /dev/sda1 blkid /dev/vda1
```
## 文件系统
*   ext2
*   ext3
*   ext4
*   reiserfs
*   xfs
*   jfs
*   smbfs
*   iso9660
*   vfat
*   ntfs
*   swap
*   auto
## 文件系统参数
* auto - 在启动时或键入了 mount -a 命令时自动挂载
* noauto - 只在你的命令下被挂载
* exec - 允许执行此分区的二进制文件
* noexec - 不允许执行此文件系统上的二进制文件
* ro - 以只读模式挂载文件系统
* rw - 以读写模式挂载文件系统
* user - 允许任意用户挂载此文件系统，若无显示定义，隐含启用 noexec, nosuid, nodev 参数
* users - 允许所有 users 组中的用户挂载文件系统
* nouser - 只能被 root 挂载
* owner - 允许设备所有者挂载
* sync - I/O 同步进行，默认为 async
* async - I/O 异步进行，默认为 async
* dev - 解析文件系统上的块特殊设备
* nodev - 不解析文件系统上的块特殊设备
* suid - 允许 suid 操作和设定 sgid 位。这一参数通常用于一些特殊任务，使一般用户运行程序时临时提升权限
* nosuid - 禁止 suid 操作和设定 sgid 位
* noatime - 不更新文件系统上 inode 访问记录，可以提升性能(参见 atime 参数)
* nodiratime - 不更新文件系统上的目录 inode 访问记录，可以提升性能(参见 atime 参数)
* relatime - 实时更新 inode access 记录。只有在记录中的访问时间早于当前访问才会被更新。（与 noatime 相似，但不会打断如 mutt 或其它程序探测文件在上次访问后是否被修改的进程。），可以提升性能(参见 atime 参数)
* flush - vfat 的选项，更频繁的刷新数据，复制对话框或进度条在全部数据都写入后才消失
* usrquota 启动文件系统对用户磁盘配额模式支持
* grpquota 启动文件系统对群组磁盘配额模式的支持
* defaults - 使用文件系统的默认挂载参数，例如 ext4 的默认参数为:rw, suid, dev, exec, auto, nouser, async.
#### btrfs 挂载选项
1.  acl/noacl
2.  autodefrag/noautodefrag
3.  compress/compress-force
4.  subvol/subvolid
5.  device
6.  degraded
7.  commit
8.  ssd/nossd
9.  ssd\_spread/nossd\_spread
10.  nodiscard
11.  norecovery
12.  usebackuproot/nousebackuproot
13.  space\_cache=version、nospace\_cache、clear\_cache
14.  skip\_balance
15.  datacow/nodatacow
16.  datasum/nodatasum
```
UUID=ff4a838b-1571-4d31-9063-456f29b742fd /home btrfs compress=zstd:1,subvol=home 0 0
```
### `<dump>` dump 备份取值
*   0 不做dump备份
*   1 每天进行dump操作
*   2 不定日期进行dump操作
### `<pass>` fsck 检查参数
*   0 不检验
*   1 最早检验（一般根目录会选择）
*   2 1级别检验完后进行检验
## 磁盘and卷
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
1. **LVM 环境维护**：
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
## 在 Linux 中查看硬盘 UUID
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
多数Linux发行版遵从FHS标准并且声明其自身政策以维护FHS的要求。但截至2009年，包括由自由标准小组成员参与开发的版本在内的绝大多数发行版，并不完全执行建议的标准。
FHS创建之时，其他的UNIX和类Unix操作系统已经有了自己的标准，尤其是hier文件系统布局描述。 自从第七版Unix(于1979年发布)以来已经存在，或是SunOS filesystem，和之后的Solaris filesystem。 例如，macOS 使用如 `/Library`、 `/Applications`和`/Users` 等长名与传统UNIX目录层次保持一致。 现在的Linux发行版包含一个`/sys`目录作为虚拟文件系统(sysfs，类似于 `/proc`，一个procfs)，它存储且允许修改连接到系统的设备，然而许多传统UNIX和类Unix操作系统使用`/sys`作为内核代码树的符号链接。 一些Linux系统如GoboLinux和Syllable Server使用了和FHS完全不同的文件系统层次组织方法。
在FHS中，所有的文件和目录的安装与否。 这些目录中的绝大多数都在所有的UNIX操作系统中存在，并且一般都以大致类似的方法使用；然而，这里的描述是针对于FHS的，并未考虑除了Linux平台以外的权威性。
| 目录               | 描述                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| /                | 第一层次结构的根、 整个文件系统层次结构的根目录。根目录是Linux文件系统中的顶级目录。所有其他目录都是根目录的子目录，使其成为整个文件系统的父目录。                                   |
| /bin/            | 包含启动系统和执行基本操作所需的基本二进制可执行文件。这些对所有用户都可用。需要在单用户模式。                                                                |
| /boot/           | 引导程序。保存启动系统所需的文件，包括 Linux 内核、初始 RAM 磁盘映像（用于启动时需要的驱动程序）和引导加载程序配置文件（如 GRUB ）。                                    |
| /dev/            | 必要设备。包含代表硬件组件或其他系统设备的设备文件。例如，/dev/sda 代表第一个 SATA 驱动器，/dev/tty 代表终端。                                            |
| /etc/            | 特定主机，系统范围内的配置文件。存储系统和应用程序的配置文件。这些文件通常是可以编辑的文本文件，用于更改系统或应用程序的行为。存储系统和应用程序的配置文件。这些文件通常是可以编辑的文本文件，用于更改系统或应用程序的行为。 |
| /etc/opt/        | /opt/的配置文件                                                                                                     |
| /etc/X11/        | X窗口系统的配置文件                                                                                                     |
| /etc/sgml/       | SGML的配置文件                                                                                                      |
| /etc/xml/        | XML的配置文件                                                                                                       |
| /home/           | 用户的家目录，包含保存的文件、个人设置等，一般为单独的分区。                                                                                 |
| /lib/            | /bin/ 和 /sbin/中二进制文件必要的库文件。包括系统和应用程序运行所需的基本共享库和内核模块。                                                           |
| /media/          | 可移除媒体(如CD-ROM)的挂载点 (在FHS-2.3中出现)。                                                                              |
| /mnt/            | 临时挂载的文件系统。                                                                                                     |
| /opt/            | 可选应用软件。用于安装附加的应用软件包。它是安装第三方应用程序的地方，将它们与 /usr 中的系统默认应用程序分开。                                                     |
| /proc/           | 虚拟文件系统格式挂载。一个虚拟文件系统，为内核向进程发送信息提供了一种机制。它不包含真实文件，而是运行时系统信息（例如，系统内存、挂载的设备、硬件配置等）。                                 |
| /root/           | 超级用户                                                                                                           |
| /sbin/           | 必要的系统二进制文件，_例如：_ init、 ip、 mount。包含基本的系统二进制文件，类似于 /bin，但用于系统管理任务，通常对非特权用户不可访问。                                 |
| /srv/            | 站点的具体数据，由系统提供。                                                                                                 |
| /tmp/            | 临时文件(参见 /var/tmp)，在系统重启时目录中文件不会被保留。一个临时目录，应用程序可以在其中存储临时文件。它通常在重启或间隔一段时间后被清空。                                   |
| /usr/            | 用于存储只读用户数据的第二层次； 包含绝大多数的多用户工具和应用程序。承载用户应用程序和大量系统内容。它包含程序、库、文档等的子目录，这些不是启动或修复系统所必需的。                            |
| /usr/bin/        | 非必要可执行文件；面向所有用户。                                                                                               |
| /usr/include/    | 标准包含文件。                                                                                                        |
| /usr/lib/        | /usr/bin/和/usr/sbin/中二进制文件的库。                                                                                  |
| /usr/sbin/       | 非必要的系统二进制文件，\_例如：\_大量网络服务。                                                                                     |
| /usr/share/      | 体系结构无关（共享）数据。                                                                                                  |
| /usr/src/        | 源代码,\_例如:\_内核源代码及其头文件。                                                                                         |
| /usr/X11R6/      | X窗口系统 版本 11, Release 6.                                                                                        |
| /usr/local/      | 本地数据的\_第三层次\_， 具体到本台主机。通常而言有进一步的子目录， \_例如：\_bin/、lib/、share/.                                                  |
| /var/            | 变量文件——在正常运行的系统中其内容不断变化的文件，如日志，脱机文件和临时电子邮件文件。有时是一个单独的分区。                                                        |
| /var/cache/      | 应用程序缓存数据。这些数据是在本地生成的一个耗时的I/O或计算结果。应用程序必须能够再生或恢复数据。缓存的文件可以被删除而不导致数据丢失。                                          |
| /var/lib/        | 状态信息。 由程序在运行时维护的持久性数据。 \_例如：\_数据库、包装的系统元数据等。                                                                   |
| /var/lock/       | 锁文件，一类跟踪当前使用中资源的文件。                                                                                            |
| /var/log/        | 日志文件，包含大量日志文件，为了防止日志占满根分区，生产环境中一般是单独分区。                                                                        |
| /var/mail/       | 用户的电子邮箱。                                                                                                       |
| /var/run/        | 自最后一次启动以来运行中的系统的信息，\_例如：\_当前登录的用户和运行中的守护进程。                                                                    |
| /var/spool/      | 等待处理的任务的脱机文件，\_例如：\_打印队列和未读的邮件。                                                                                |
| /var/spool/mail/ | 用户的邮箱(不鼓励的存储位置)                                                                                                |
| /var/tmp/        | 在系统重启过程中可以保留的临时文件。                                                                                             |
| /run/            | 代替/var/run目录。                                                                                                  |
| /sys             | 目录作为虚拟文件系统                                                                                                     |
# Systemd 完整指南
## Systemd 组成(架构)
## 🧱 一、总体结构：systemd 是 Linux 的“系统管理框架”
systemd 是 Linux 用户空间最核心的系统与服务管理器（system and service manager），负责从系统启动到关机的所有生命周期管理。  
它取代了传统的 **SysV init** 与 **Upstart**，并提供了更统一的机制来：
- 启动和停止服务（service management）
    
- 管理依赖和并行启动（dependency-based boot）
    
- 管理会话、日志、设备、挂载点、命名空间（session, logs, mounts, namespaces）
    
- 与内核的 **cgroups** 深度整合，实现资源隔离和监控
    
所以可以把整个 systemd 看作是一个 **多进程协作的“系统平台”**。
---
## 🧩 二、systemd core（核心）
这一层是 systemd 的内核，负责定义基础机制。
### 1. manager
管理所有单元（unit）的核心调度器。它：
- 解析 unit 文件
    
- 管理依赖关系图（dependency graph）
    
- 调度启动、停止、重启等动作
    
- 处理信号、事件、超时等
    
### 2. systemd
即 `/lib/systemd/systemd` 主进程（PID 1），是第一个用户空间进程。  
负责：
- 读取 `/etc/systemd/system/` 与 `/lib/systemd/system/` 下的 unit 文件
    
- 激活目标（target）
    
- 管理服务与挂载
    
- 与 journald、logind 等子守护进程通信
    
### 3. unit（单元）
unit 是 systemd 的最小管理单元，每种 unit 对应一种系统资源类型。常见类型：
|类型|用途|
|---|---|
|`.service`|服务（守护进程）|
|`.target`|逻辑分组，表示系统状态|
|`.socket`|套接字激活|
|`.path`|文件路径激活|
|`.timer`|定时任务（取代 cron）|
|`.mount` / `.automount`|挂载点|
|`.swap`|交换空间|
|`.snapshot`|运行时快照|
> 🔹 systemd 启动时，会根据目标（target）拉起相应的服务树。
### 4. login 子系统
这一部分提供登录会话管理，与 `logind` 守护进程协作。
- **multiseat**：支持多用户多终端（例如多显示器会话）
    
- **inhibit**：阻止系统进入睡眠或关机的机制
    
- **session**：跟踪用户登录、tty、X11、Wayland 等会话
    
- **pam**：与 Linux 的 PAM（Pluggable Authentication Modules）集成
    
### 5. namespace
利用 Linux 的命名空间（mount, pid, network, etc.）机制为服务隔离环境。
### 6. log
systemd 有自己的日志系统 journald，负责收集和管理日志。
### 7. cgroup
systemd 是 cgroups（控制组）的主要用户。  
每个服务都运行在自己的 cgroup 中，systemd 可以用它：
- 限制 CPU、内存、I/O
    
- 跟踪服务进程
    
- 实现清理和资源隔离
    
### 8. dbus
systemd 通过 D-Bus 暴露控制接口，让外部工具（如 GNOME、NetworkManager）与它通信。
---
## ⚙️ 三、systemd daemons（守护进程）
这些是 systemd 的核心后台服务，分别负责不同子系统。
|守护进程|作用|
|---|---|
|**systemd**|主进程（PID 1），系统管理核心|
|**journald**|收集、存储和查询日志（代替 syslog）|
|**networkd**|轻量级网络管理（配置 IP、路由等）|
|**logind**|用户登录与会话管理（座席、休眠、锁屏等）|
|**user session**|用户会话中的 systemd 实例（每个用户一个）|
> ✅ systemd 既能运行在系统级，也能为每个用户运行一个独立实例。
---
## 🧰 四、systemd utilities（实用工具）
这些是与核心组件交互的命令行工具。
|工具|功能|
|---|---|
|**systemctl**|管理服务、目标和单元的主命令|
|**journalctl**|查询和过滤日志（来自 journald）|
|**notify**|服务向 systemd 报告状态（READY=1 等）|
|**analyze**|分析启动性能（boot chart、critical-chain）|
|**cgls**|以树状方式显示 cgroup 层级|
|**cgtop**|实时查看各 cgroup 的资源使用情况|
|**loginctl**|管理用户登录会话|
|**nspawn**|类似轻量容器的工具（类似 chroot + cgroup + namespace）|
这些工具体现了 systemd 的一体化设计理念：  
统一管理接口 + 分层抽象。
---
## 🎯 五、systemd targets（目标）
target 是一种特殊的 unit 类型，用来表示“系统状态”或“运行级别”（类似传统的 runlevel）。
|Target|说明|
|---|---|
|**bootmode**|启动模式|
|**basic.target**|启动基础服务|
|**multi-user.target**|多用户（无图形）模式，相当于 runlevel 3|
|**graphical.target**|图形界面模式（runlevel 5）|
|**shutdown.target / reboot.target**|关机、重启状态|
|**user-session.target**|用户会话级别目标|
> 目标之间可以层层依赖：  
> `graphical.target → multi-user.target → basic.target`  
> 这使得启动过程可并行、可控。
---
## 📚 六、systemd libraries（依赖库）
systemd 通过多种库实现功能扩展与系统集成：
|库|作用|
|---|---|
|**dbus-1**|与系统总线通信|
|**libpam**|用户认证接口|
|**libcap**|权限能力（capabilities）管理|
|**libcryptsetup**|加密卷支持（LUKS）|
|**tcpwrapper**|网络访问控制|
|**libaudit**|审计系统|
|**libnotify**|桌面通知接口|
这些库使 systemd 能与 Linux 安全机制、认证系统和桌面环境无缝对接。
---
## 🧬 七、Linux kernel 层（systemd 的底层依赖）
systemd 并非孤立运行，它深度依赖 Linux 内核的现代特性：
|内核特性|说明|
|---|---|
|**cgroups**|控制组，用于资源控制与监控|
|**autofs**|自动挂载机制|
|**kdbus（或 modern dbus-broker）**|内核级 DBus（实验性特性）|
这些机制支撑了 systemd 的并行化启动、服务隔离、容器化运行（nspawn）等能力。
---
## 🧩 八、整体架构图（逻辑层次）
```
┌─────────────────────────────┐
│        User Space Apps      │
│  (loginctl, journalctl ...) │
└─────────────┬───────────────┘
              │
┌─────────────┴───────────────┐
│        systemd core         │
│  (PID 1, manager, units, dbus) │
└─────────────┬───────────────┘
              │
┌─────────────┴───────────────┐
│       systemd daemons       │
│ journald | logind | networkd│
└─────────────┬───────────────┘
              │
┌─────────────┴───────────────┐
│        Linux Kernel         │
│  (cgroups, namespaces ...)  │
└─────────────────────────────┘
```
---
## 🧠 九、总结：systemd 的设计哲学
1. **一体化**：将 init、logging、session、network 等整合到统一框架。
    
2. **并行化**：基于依赖关系并行启动，提高启动速度。
    
3. **事件驱动**：使用 socket/path/timer 激活机制，按需启动服务。
    
4. **可监控性**：与 cgroups、journald 集成，精准监控每个服务。
    
5. **模块化**：通过 unit 和 target 组成灵活的依赖树。
    
6. **统一接口**：通过 D-Bus 提供 API，命令行工具一致。
    
---
是否希望我接下来帮你画一个更详细的 **systemd 组件关系图（带层级与依赖箭头）**？  
可以用图形方式清晰展示 systemd、journald、logind、cgroups、targets、units 的关系。
## Systemd 命令速览
# 🧭 systemd 管理命令速查表（Cheat Sheet）
> 适用系统：Fedora / RHEL / CentOS / Ubuntu (≥15.04) / Debian (≥8) / Arch / openSUSE  
> 核心命令：`systemctl`、`journalctl`、`loginctl`、`hostnamectl`、`timedatectl`、`localectl` 等
---
## 🧩 一、服务管理（systemctl）
|操作|命令示例|
|---|---|
|启动服务|`systemctl start nginx`|
|停止服务|`systemctl stop nginx`|
|重启服务|`systemctl restart nginx`|
|重新加载配置|`systemctl reload nginx`|
|查看状态|`systemctl status nginx`|
|设置开机自启|`systemctl enable nginx`|
|禁止开机自启|`systemctl disable nginx`|
|立即启动并设置自启|`systemctl enable --now nginx`|
|查看所有活动的服务|`systemctl list-units --type=service`|
|查看所有已安装的服务|`systemctl list-unit-files --type=service`|
|屏蔽（禁止启动）服务|`systemctl mask nginx`|
|取消屏蔽服务|`systemctl unmask nginx`|
---
## 🧠 二、系统信息工具
|功能|命令|
|---|---|
|查看主机名及信息|`hostnamectl status`|
|设置主机名|`hostnamectl set-hostname server01`|
|查看/设置系统语言|`localectl status` / `localectl set-locale LANG=zh_CN.UTF-8`|
|查看/设置键盘布局|`localectl set-keymap us`|
|查看时间状态|`timedatectl status`|
|设置时区|`timedatectl set-timezone Asia/Shanghai`|
|启用 NTP 同步|`timedatectl set-ntp true`|
---
## 👥 三、用户登录与会话（loginctl）
|功能|命令|
|---|---|
|查看登录会话|`loginctl list-sessions`|
|查看用户信息|`loginctl show-user username`|
|终止用户会话|`loginctl terminate-session 3`|
|注销用户|`loginctl terminate-user username`|
|锁定当前会话|`loginctl lock-session`|
|解锁会话|`loginctl unlock-session`|
---
## 🧾 四、日志管理（journalctl）
|功能|命令|
|---|---|
|查看所有日志|`journalctl`|
|查看最近日志（实时）|`journalctl -f`|
|查看指定服务日志|`journalctl -u nginx`|
|查看最近 1 小时日志|`journalctl --since "1 hour ago"`|
|查看上次启动日志|`journalctl -b -1`|
|查看指定启动日志|`journalctl -b 0`（当前）/ `journalctl -b -2`（上上次）|
|显示错误日志|`journalctl -p err`|
|清理日志|`journalctl --vacuum-time=7d`（保留 7 天）|
---
## ⚙️ 五、启动与性能分析
|功能|命令|
|---|---|
|查看启动总耗时|`systemd-analyze time`|
|查看启动过程耗时排行|`systemd-analyze blame`|
|查看关键启动链|`systemd-analyze critical-chain`|
|检查 unit 文件语法|`systemd-analyze verify nginx.service`|
|检查配置差异|`systemd-delta`|
---
## 🧱 六、挂载与设备管理
|功能|命令|
|---|---|
|挂载设备|`systemd-mount /dev/sdb1 /mnt`|
|卸载设备|`systemd-umount /mnt`|
|检查虚拟化环境|`systemd-detect-virt`|
|查看 cgroup 树|`systemd-cgls`|
|查看实时资源使用|`systemd-cgtop`|
---
## 🧰 七、实用辅助工具
|功能|命令|
|---|---|
|以 systemd 方式运行命令|`systemd-run --unit=testjob --scope top`|
|比较修改后的配置|`systemd-delta`|
|管理临时文件|`systemd-tmpfiles --clean`|
|管理系统用户|`systemd-sysusers --dry-run`|
|直接向日志写入|`echo "hello"|
|阻止系统挂起|`systemd-inhibit --why="Backup running" rsync /data /backup`|
|DNS 解析调试|`resolvectl status` / `resolvectl query example.com`|
---
## 💡 八、常用状态与控制命令总结
```bash
# 查看系统状态
systemctl status
systemctl list-units --type=service
systemctl list-timers
# 重载配置（不重启服务）
systemctl daemon-reload
# 重启 systemd 管理器本身
systemctl daemon-reexec
# 查看 systemd 版本
systemd --version
```
---
## 📦 九、文件位置参考
|类型|路径|
|---|---|
|系统服务单元|`/usr/lib/systemd/system/`|
|用户自定义单元|`/etc/systemd/system/`|
|用户级单元|`~/.config/systemd/user/`|
|临时日志|`/run/log/journal/`|
|永久日志|`/var/log/journal/`|
---
是否希望我帮你把这份 **Cheat Sheet 导出为 PDF 或 Markdown 文件**？  
（适合打印或收藏离线使用）
## Systemd 管理工具总览
`systemd` 是核心的初始化系统和服务管理框架。围绕它有一整套 **管理工具**，用于控制服务、分析启动、管理会话、日志等。下面是 systemd 生态中最常用的管理工具总结 👇
---
## 🧩 一、服务与系统管理类
|工具|主要用途|常用命令示例|
|---|---|---|
|**systemctl**|管理 systemd 单元（unit），如服务、挂载点、设备、目标等。|`systemctl status nginx``systemctl start/stop/restart nginx``systemctl enable/disable nginx``systemctl list-units --type=service`|
|**systemd-analyze**|分析系统启动性能，查看启动时间分布。|`systemd-analyze time``systemd-analyze blame``systemd-analyze critical-chain`|
|**hostnamectl**|查看与设置主机名及相关信息。|`hostnamectl status``hostnamectl set-hostname server01`|
|**localectl**|管理系统语言与键盘布局。|`localectl status``localectl set-locale LANG=zh_CN.UTF-8`|
|**timedatectl**|管理系统时间、时区、NTP 同步。|`timedatectl status``timedatectl set-timezone Asia/Shanghai``timedatectl set-ntp true`|
|**loginctl**|管理用户登录会话、seat、多用户环境。|`loginctl list-sessions``loginctl show-session 2``loginctl terminate-user alice`|
|**systemd-run**|临时以 systemd 管理方式运行命令或创建临时服务。|`systemd-run --unit=myjob --scope top`|
---
## 🔧 二、日志与调试类
|工具|主要用途|常用命令示例|
|---|---|---|
|**journalctl**|查看和过滤 systemd 日志（替代传统 syslog）。|`journalctl -xe``journalctl -u nginx``journalctl --since "1 hour ago"`|
|**systemd-cgls**|显示 cgroup（控制组）层级树。|`systemd-cgls`|
|**systemd-cgtop**|类似 top，显示 cgroup 实时资源使用。|`systemd-cgtop`|
|**systemd-delta**|比较被修改的 systemd 配置与默认配置。|`systemd-delta`|
---
## 🧱 三、单元与配置相关工具
|工具|主要用途|常用命令示例|
|---|---|---|
|**systemd-analyze verify**|检查 unit 文件语法。|`systemd-analyze verify nginx.service`|
|**systemd-escape**|转义路径或名称为合法 unit 名。|`systemd-escape /home/user/mountpoint`|
|**systemd-cat**|将命令输出直接写入 systemd 日志。|`echo "test"|
|**systemd-tmpfiles**|管理 /tmp、/var/tmp 等临时文件的创建与清理。|`systemd-tmpfiles --create`|
|**systemd-sysusers**|管理系统用户和组（根据配置文件创建系统账号）。|`systemd-sysusers --dry-run`|
---
## ⚙️ 四、引导与挂载管理类
|工具|主要用途|常用命令示例|
|---|---|---|
|**systemd-boot**|简洁的 UEFI 启动管理器（替代 grub）。|`bootctl status``bootctl update`|
|**systemd-mount / systemd-umount**|临时挂载文件系统。|`systemd-mount /dev/sdb1 /mnt``systemd-umount /mnt`|
|**systemd-detect-virt**|检测系统是否运行在虚拟机或容器中。|`systemd-detect-virt`|
---
## 🧠 五、调试与恢复相关
|工具|主要用途|常用命令示例|
|---|---|---|
|**systemd-resolve**（或 `resolvectl`）|管理和调试 DNS 解析（由 `systemd-resolved` 提供）。|`resolvectl status``resolvectl query example.com`|
|**systemd-inhibit**|防止系统挂起、重启或关闭。|`systemd-inhibit --why="Backup running" rsync /data /backup`|
|**systemd-nspawn**|启动轻量级容器（类似 chroot 但更强大）。|`systemd-nspawn -D /srv/container`|
---
## 💡 补充说明
- 所有这些命令都属于 **systemd 工具集**，位于 `/usr/bin/` 目录下。
    
- 查看帮助文档：
    
    ```bash
    man systemctl
    man journalctl
    man loginctl
    ```
    
- 查询版本：
    
    ```bash
    systemd --version
    ```
    
---
是否希望我帮你整理一张 **systemd 管理命令速查表（Cheat Sheet）**？我可以输出为 Markdown、PDF 或命令行格式。
## Systemd Unit 文件
非常好 👍  
你已经完全理解了 systemd 的体系结构，所以我们现在可以深入到最实用的部分：**如何编写一个 systemd unit 文件**。
下面我会从 **语法结构 → Unit 类型 → 核心指令 → 实战示例 → 调试技巧** 全面讲解，确保你能独立编写、调试、优化一个 systemd 服务。
---
# 🧱 一、Unit 文件概念
`unit` 是 systemd 的基本管理单元，每个 unit 文件描述一个 **系统资源或服务的行为**。
它是一个纯文本文件，通常位于以下路径：
|路径|说明|
|---|---|
|`/etc/systemd/system/`|系统管理员定义的 unit（优先级最高）|
|`/lib/systemd/system/`|软件包提供的默认 unit|
|`~/.config/systemd/user/`|用户级 unit（非 root）|
文件名格式：
```
<name>.<type>
```
例如：
```
nginx.service
mybackup.timer
mnt-data.mount
```
---
# 🧩 二、Unit 文件的三大段落结构
每个 unit 文件通常包含以下三个部分：
```ini
[Unit]
# 描述、依赖关系、启动顺序等
[Service]
# 若类型是 service，这里定义启动方式、执行命令、守护策略
[Install]
# 定义安装目标（target）与启用策略
```
---
# 🧠 三、[Unit] 段：元信息与依赖管理
该段用于描述单元与系统中其他单元的关系。
|指令|说明|
|---|---|
|`Description=`|简要描述|
|`Documentation=`|文档链接（如 man 或 URL）|
|`After=`|定义启动顺序（在谁之后启动）|
|`Before=`|在谁之前启动|
|`Requires=`|强依赖（必须存在，否则失败）|
|`Wants=`|弱依赖（尽量启动，不影响主服务）|
|`Conflicts=`|互斥关系|
|`Condition...=`|条件判断（如 `ConditionPathExists=`）|
✅ **示例：**
```ini
[Unit]
Description=My Web Service
After=network.target
Wants=network-online.target
```
---
# ⚙️ 四、[Service] 段：定义服务行为（仅对 `.service` 类型有效）
这是最常见、最核心的一部分。  
用于定义如何启动、停止、重启守护进程。
### 常用字段
|指令|说明|
|---|---|
|`Type=`|服务类型（见下）|
|`ExecStart=`|启动命令（必须）|
|`ExecReload=`|重载命令（可选）|
|`ExecStop=`|停止命令（可选）|
|`Restart=`|失败后自动重启策略|
|`RestartSec=`|重启前等待时间|
|`User=` / `Group=`|以哪个用户身份运行|
|`WorkingDirectory=`|工作目录|
|`Environment=`|环境变量|
|`PIDFile=`|指定进程 PID 文件（可选）|
|`StandardOutput=` / `StandardError=`|日志输出重定向|
|`TimeoutStartSec=`|启动超时|
|`OOMPolicy=`|OOM 策略（如 stop / restart）|
|`CPUQuota=` / `MemoryLimit=`|cgroup 资源限制|
---
### 🔹 服务类型 Type=
`Type=` 定义了 systemd 如何判断服务“已就绪”。
|Type|说明|
|---|---|
|`simple`|默认类型，直接执行 `ExecStart`|
|`forking`|后台守护进程（如传统 daemon）|
|`oneshot`|只执行一次的任务（如脚本）|
|`notify`|程序通过 `sd_notify` 通知就绪（READY=1）|
|`idle`|延迟启动，等其他任务完成后运行|
✅ **示例：简单 Web 服务**
```ini
[Service]
Type=simple
ExecStart=/usr/local/bin/myserver --port 8080
Restart=on-failure
RestartSec=3
User=www-data
WorkingDirectory=/var/www/myserver
Environment=ENV=prod
```
✅ **示例：后台守护进程**
```ini
[Service]
Type=forking
PIDFile=/run/mydaemon.pid
ExecStart=/usr/sbin/mydaemon -D
ExecStop=/bin/kill -TERM $MAINPID
Restart=on-failure
```
✅ **示例：一次性任务（oneshot）**
```ini
[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh
RemainAfterExit=yes
```
> `RemainAfterExit=yes` 表示任务完成后仍视为“active”，适用于初始化脚本。
---
# 🧩 五、[Install] 段：定义如何启用
此段决定当你执行：
```bash
sudo systemctl enable myservice.service
```
时，symbolic link 会指向哪个 target。
|指令|说明|
|---|---|
|`WantedBy=`|软依赖目标（常见）|
|`RequiredBy=`|强依赖目标|
|`Alias=`|提供别名|
|`Also=`|同时启用其他单元|
✅ **示例：**
```ini
[Install]
WantedBy=multi-user.target
```
这意味着它会在系统进入 `multi-user.target`（即 runlevel 3）时自动启动。
---
# 🧩 六、完整示例：自定义 Web 服务
```ini
# /etc/systemd/system/myweb.service
[Unit]
Description=My Custom Web Server
After=network-online.target
Wants=network-online.target
[Service]
Type=simple
ExecStart=/usr/local/bin/myweb --config /etc/myweb/config.yml
WorkingDirectory=/var/www/myweb
User=www-data
Restart=on-failure
RestartSec=5
Environment=ENV=production
[Install]
WantedBy=multi-user.target
```
安装并启用：
```bash
sudo systemctl daemon-reload
sudo systemctl enable myweb.service
sudo systemctl start myweb.service
```
查看状态与日志：
```bash
systemctl status myweb.service
journalctl -u myweb.service -f
```
---
# 🧠 七、其他 Unit 类型简述
|类型|作用|
|---|---|
|`.socket`|监听套接字，自动激活对应 `.service`|
|`.path`|监控文件路径变化触发启动|
|`.timer`|定时启动 `.service`|
|`.mount`|挂载点定义（代替 /etc/fstab）|
|`.automount`|按需挂载|
|`.target`|一组服务的集合，类似运行级别|
|`.slice`|cgroup 资源分组控制|
|`.scope`|临时外部启动进程的封装（非 systemd 启动）|
✅ **Timer 示例：每小时运行备份脚本**
```ini
# /etc/systemd/system/backup.service
[Unit]
Description=Run backup job
[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh
[Install]
WantedBy=multi-user.target
```
```ini
# /etc/systemd/system/backup.timer
[Unit]
Description=Run backup hourly
[Timer]
OnCalendar=hourly
Persistent=true
[Install]
WantedBy=timers.target
```
---
# 🧩 八、调试与测试技巧
|命令|功能|
|---|---|
|`systemctl daemon-reload`|重新加载 unit 配置（修改后必须）|
|`systemctl cat <unit>`|查看完整配置（包括继承）|
|`systemd-analyze verify <unit>`|检查语法错误|
|`journalctl -u <unit>`|查看日志|
|`systemctl show <unit>`|查看运行时属性|
|`systemctl edit <unit>`|创建 drop-in 覆盖配置（推荐修改方式）|
---
# 🧩 九、常见陷阱与建议
✅ **最佳实践：**
1. 不直接修改 `/lib/systemd/system/` 下的文件  
    → 使用 `/etc/systemd/system/` 覆盖或 `systemctl edit`
    
2. 确保 `ExecStart` 命令绝对路径正确
    
3. 启动前执行 `systemctl daemon-reload`
    
4. 使用 `journalctl -xe` 调试失败原因
    
5. 服务程序必须避免 daemonize（若 `Type=simple`）
    
6. 用 `Restart=on-failure` 自动恢复意外崩溃的服务
    
---
是否希望我接下来帮你画一张图，展示一个 **`.service` 单元的生命周期与 systemd 交互流程图**（从 systemctl → manager → journald → cgroup）？  
那张图能直观看到 unit 是怎么被加载、启动、监控、停止的。
## 常见信号
在 Unix 和 Linux 系统中，信号是一种有限的异步通信机制，用于通知进程发生了某种事件。以下是一些常见的信号及其简要介绍：
### 1\. **SIGHUP (1)**
*   **名称**：挂起信号（Hangup）
*   **用途**：通常用于通知终端关闭。许多守护进程使用 SIGHUP 来重新加载配置文件或重新启动。
### 2\. **SIGINT (2)**
*   **名称**：中断信号（Interrupt）
*   **用途**：由用户从终端通过 `Ctrl+C` 组合键发送，用于中断一个进程。
### 3\. **SIGQUIT (3)**
*   **名称**：退出信号（Quit）
*   **用途**：由用户从终端通过 `Ctrl+\` 组合键发送，用于生成核心转储（core dump）并退出进程。
### 4\. **SIGILL (4)**
*   **名称**：非法指令信号（Illegal Instruction）
*   **用途**：当进程尝试执行非法或未定义的 CPU 指令时发送。
### 5\. **SIGABRT (6)**
*   **名称**：异常终止信号（Abort）
*   **用途**：由调用 `abort()` 函数的进程发送，通常用于指示严重错误。
### 6\. **SIGFPE (8)**
*   **名称**：浮点异常信号（Floating Point Exception）
*   **用途**：当进程执行的算术操作出现错误（如除以零或溢出）时发送。
### 7\. **SIGKILL (9)**
*   **名称**：杀死信号（Kill）
*   **用途**：强制终止进程。无法捕获、阻塞或忽略此信号。
### 8\. **SIGSEGV (11)**
*   **名称**：段错误信号（Segmentation Fault）
*   **用途**：当进程非法访问内存（如访问未分配的内存或尝试写入只读内存）时发送。
### 9\. **SIGPIPE (13)**
*   **名称**：管道破裂信号（Broken Pipe）
*   **用途**：当进程尝试向已被关闭的管道或套接字写入数据时发送。
### 10\. **SIGALRM (14)**
*   **名称**：定时器信号（Alarm）
*   **用途**：当定时器到期时发送，由 `alarm()` 函数设置的定时器触发。
### 11\. **SIGTERM (15)**
*   **名称**：终止信号（Termination）
*   **用途**：用于请求进程终止，可以被捕获并处理或忽略，是一种优雅的终止进程方式。
### 12\. **SIGUSR1 (10) 和 SIGUSR2 (12)**
*   **名称**：用户自定义信号 1 和 2（User-defined Signals）
*   **用途**：用户和应用程序自定义使用，行为由开发者定义。
### 13\. **SIGCHLD (17)**
*   **名称**：子进程状态变化信号（Child Status Change）
*   **用途**：当子进程停止或终止时发送给父进程。
### 14\. **SIGCONT (18)**
*   **名称**：继续执行信号（Continue）
*   **用途**：用于恢复一个已被停止（使用 SIGSTOP 或 SIGTSTP）进程的执行。
### 15\. **SIGSTOP (19)**
*   **名称**：停止执行信号（Stop）
*   **用途**：用于无条件地停止进程执行，无法捕获或忽略。
### 16\. **SIGTSTP (20)**
*   **名称**：终端停止信号（Terminal Stop）
*   **用途**：由用户从终端通过 `Ctrl+Z` 组合键发送，用于停止进程执行，可以捕获和处理。
### 17\. **SIGTTIN (21) 和 SIGTTOU (22)**
*   **名称**：后台读和写终端信号（Terminal Input/Output for Background Process）
*   **用途**：当后台进程尝试读写终端时发送，默认行为是停止进程。
### 18\. **SIGBUS (7)**
*   **名称**：总线错误信号（Bus Error）
*   **用途**：当进程发生内存访问错误时发送，如未对齐的内存访问。
## USR1
`USR1` 信号是一个用户自定义信号（用户信号 1），在 Unix 和 Linux 系统中，用户信号通常是由应用程序或用户定义的行为来处理的。`dd` 命令在设计时包含了对 `USR1` 信号的特殊处理，使得它在接收到该信号时，会输出当前的进度信息。 具体来说，当运行 `dd` 命令并发送 `USR1` 信号给其进程时，`dd` 会在标准错误输出中打印当前的 I/O 统计信息（例如，已经处理的字节数和速度）。这是一个实用的功能，特别是在 `dd` 长时间运行时，可以随时查看进度而不终止进程。
### `USR1` 信号的优点：
*   **非破坏性**：发送 `USR1` 信号不会中断或终止 `dd` 进程，它只是触发 `dd` 打印当前的进度信息。
*   **即时反馈**：可以在 `dd` 运行期间的任何时间点查看进度，而不需要修改原始命令或停止进程。 这种机制利用了 Unix 信号系统的灵活性，允许用户动态与运行中的进程交互，而无需事先配置或使用其他工具。
### 使用场景
`USR1` 信号可以用在许多其他场景中，通常用于触发进程执行某些用户定义的动作，而不终止或严重中断进程。以下是一些常见的应用场景：
#### 1\. **日志轮换**：
许多守护进程（如 web 服务器、数据库服务器等）使用 `USR1` 信号来触发日志文件轮换。在收到 `USR1` 信号时，这些进程会关闭当前日志文件并打开一个新的日志文件，通常是为了避免日志文件过大。
*   **Nginx**： `sudo kill -USR1 $(cat /var/run/nginx.pid)` Nginx 会在收到 `USR1` 信号时进行日志文件轮换。
#### 2\. **重新加载配置**：
一些应用程序使用 `USR1` 信号来触发重新加载配置文件，而无需完全重新启动进程。这对于需要频繁调整配置但不希望中断服务的场景非常有用。
*   **Apache HTTP Server**： `sudo apachectl -k graceful` Apache HTTP Server 可以在接收到 `USR1` 信号时以一种优雅的方式重新加载配置文件。
#### 3\. **自定义应用程序行为**：
开发人员可以在自己的应用程序中捕获 `USR1` 信号，并定义一组特定的动作。例如，可以用来生成调试信息、刷新缓存、更新统计数据等。
#### 4\. **进度报告和状态检查**：
类似于 `dd` 的用法，其他需要长时间运行的进程也可以利用 `USR1` 信号在不中断进程的情况下提供当前状态或进度报告。
### 如何在应用程序中处理 `USR1` 信号：
在编程中，可以使用信号处理机制来捕获和处理 `USR1` 信号。例如，在 Python 中：
```
import signal 
import os
import time
def handle_usr1(signum, frame):
	print(f"Received USR1 signal: {signum}")
    # 这里可以添加自定义的处理逻辑，例如打印状态信息  
    # 注册 USR1 信号处理程序 
    signal.signal(signal.SIGUSR1, handle_usr1)
    print(f"Process ID: {os.getpid()}")
    while True:
         print("Running...") 
         time.sleep(10)
```
运行上述代码后，可以在另一个终端发送 `USR1` 信号： `kill -USR1 <Python_script_PID>` 发送信号后，Python 脚本会调用 `handle_usr1` 函数并输出相应信息。 通过这种方式，`USR1` 信号可以在许多实际应用场景中用于动态控制和管理进程，而无需停止或重新启动它们。
## 其他
这些信号允许操作系统与进程之间进行简单而有效的通信，以处理错误、控制进程执行、进行进程间通信等。开发人员可以在程序中捕获和处理这些信号，以实现各种自定义行为。 这些方法可以帮助你在使用 `dd` 命令时实时查看进度。
1.  **使用 **​**​`status=progress`​**​ \*\* 选项\*\*（适用于较新的 `dd` 版本）：
```
dd if=/path/to/inputfile of=/path/to/outputfile bs=4M status=progress
```
1.  **使用 **​**​`pv`​**​ \*\* 工具\*\*（管道视图）： 先安装 `pv`：
```
sudo apt-get install pv   # 对于 Debian/Ubuntu
sudo yum install pv       # 对于 CentOS/RHEL
pv /path/to/inputfile | dd of=/path/to/outputfile bs=4M
```
1.  **使用 **​**​`kill -USR1`​**​ \*\* 信号\*\*： 如果 `dd` 已经在运行，可以向 `dd` 进程发送 `USR1` 信号来查看进度。首先找到 `dd` 的进程 ID（PID），然后发送信号：
```
ps aux | grep dd         # 找到 dd 的 PID
kill -USR1 <PID>
```
1.  **使用 GNU **​**​`ddrescue`​**​ \*\* 工具\*\*： `ddrescue` 是 `dd` 的增强版本，默认显示进度信息。安装并使用它：
```
sudo apt-get install gddrescue  # 对于 Debian/Ubuntu
sudo yum install ddrescue       # 对于 CentOS/RHEL
ddrescue /path/to/inputfile /path/to/outputfile
```
## SIGNAL (英文内容)
信号是一种简单且轻量级的进程间通信形式。是一种单向通知。可是是内核发给进程，一个进程发给另一个进程，一个进程发送给自己。
## 一些重要信号
| 信号名称    | 信号值 | 行为                                          |
| ------- | --- | ------------------------------------------- |
| SIGHUP  | 1   | 重启（Hang up or shut down and restart process |
| SIGINT  | 2   | 中断`<C-c>`                                   |
| SIGQUT  | 3   | 退出`<C-\>`                                   |
| SIGKILL | 9   | 强制终止                                        |
| SIGTERM | 15  | 终止，终端正常终止                                   |
| SIGCONT | 18  | 继续`fg/bg`                                   |
| SIGSTOP | 19  | 暂停`C-z`                                     |
| SIGTSTP | 20  |                                             |
*   1-31 31 个标准信号，命名是以“SIG”+后缀的形式
*   32-64 33 个实时信号，是以“SIGRTMIN+`<number>`"
## dd 执行进度
方法一：
```shell
watch -n 5 pkill -USR1 ^dd$
```
方法二：
```shell
watch -n 5 killall -USR1 dd
```
方法三：
```shell
# mac 用-INFO，linux 用 -USR1
while killall -USR1 dd; do sleep 5; done
```
方法四：
```shell
while (ps auxww |grep " dd " |grep -v grep |awk '{print $2}' |while read pid; do kill -USR1 $pid; done) ; do sleep 5; done
```
上述四种方法中使用三个命令：pkill、killall、kill向dd命令发送SIGUSR1信息，dd命令进程接收到信号之后就打印出自己当前的进度。# 区域设置
1.  编辑 `/etc/locale.gen` 设置区域支持
2.  运行 `locale-gen` 生成 Locale
3.  `~/$XDG_CONFIG_HOME/locale.conf`
4.  `locale.conf` 文件的优先级定义在 `/etc/profile.d/locale.sh`中
5.  `locale` 显示当前正在使用的 Locale 和相关环境变量
6.  查看已经生成的区域 `localedef --list-archive` 或 `localectl list-locales`
7.  `/etc/locale.conf` 中的 LANG 变量应为 `/etc/locale.gen` 中某个未注释的值# 用户权限管理完全指南
## 第一部分：UID 与 GID 基础
### UID（User Identifier） 
#### 含义
- UID 是用户标识符，在类 Unix 系统（如 Linux、macOS）中，每个用户都被分配一个唯一的整数值作为其 UID。系统通过这个 UID 来识别和区分不同的用户，而不是依赖于用户名。例如，当执行文件访问权限检查时，系统会根据文件的权限设置以及访问者的 UID 来决定是否允许访问。
#### 范围和用途
- 通常，UID 的范围从 0 开始。UID 为 0 的用户是超级用户（root 用户），具有系统的最高权限，可以执行任何操作。普通用户的 UID 一般从 500 或 1000 开始（不同系统有所不同）。系统服务和进程也会有对应的 UID，这些 UID 通常在较低的数值范围内，用于标识和管理系统进程的身份。
### GID（Group Identifier） 
#### 含义
- GID 是组标识符，类似于 UID，每个组在系统中都有一个唯一的整数值作为其 GID。组是一种将多个用户组织在一起的机制，通过组可以方便地管理和分配文件和资源的访问权限。例如，多个用户可能属于同一个项目组，他们可以共享该组的权限来访问项目相关的文件和目录。
#### 范围和用途
- 与 UID 类似，GID 也有一个范围，通常系统保留一些较低的 GID 用于系统组，而普通用户组的 GID 则从较高的数值开始分配。当创建一个新用户时，系统通常会为该用户创建一个与用户名相同的私有组，并将该用户添加到这个组中，同时该用户还可以被添加到其他共享组中。
---
## 第二部分：常用系统组详解
### 核心系统组
这些组通常在系统安装过程中自动创建，与系统核心功能和服务的权限管理息息相关。
#### 1. `root` 组 
- **GID**：通常为 0。 
- **用途**：这是系统中最强大的组，与 `root` 用户紧密相关。属于 `root` 组的用户或进程具有系统的最高权限，可以对系统进行任何更改，包括修改系统配置文件、安装和卸载软件等。
#### 2. `staff` 组 
- **GID**：在 macOS 中，`staff` 组的 GID 通常为 20。 
- **用途**：这是一个常见的普通用户组，大多数普通用户会被添加到这个组中。属于 `staff` 组的用户可以访问和使用系统提供的一些基本资源和服务，但没有像 `root` 组那样的高级权限。
#### 3. `wheel` 组 
- **GID**：通常为 10。 
- **用途**：在 Linux 系统中，`wheel` 组具有特殊的意义。默认情况下，只有属于 `wheel` 组的用户才能使用 `sudo` 命令以超级用户的身份执行命令。这是一种限制系统超级权限访问的安全机制。
#### 4. `users` 组 
- **GID**：通常为 100。 
- **用途**：这是一个通用的用户组，新创建的普通用户可能会被添加到这个组中。`users` 组主要用于提供一个基本的用户集合，方便进行一些通用的权限管理和资源共享。
#### 5. `adm` 组 
- **GID**：通常为 4。 
- **用途**：该组的成员通常具有访问系统日志文件的权限。系统日志文件包含了系统运行过程中的各种信息，对于系统管理员进行故障排查和监控系统状态非常重要。
#### 6. `sys` 组 
- **GID**：通常为 3。 
- **用途**：这个组与系统核心相关，属于 `sys` 组的用户或进程可以访问一些系统核心资源和设备文件，例如内核模块、系统设备等。
### sudo 与 wheel 组（权限提升）
- **sudo (Debian/Ubuntu 及其衍生版常用)**：属于这个组的用户可以使用 `sudo` 命令来获得临时的 root 权限。
- **wheel (CentOS/RHEL/Fedora 及其衍生版常用)**：功能与 `sudo` 组完全相同，只是历史沿袭的名称不同。
- **作用**：这是**管理权限的标准做法**。将需要执行管理任务的普通用户加入 `sudo` 或 `wheel` 组，这样他们就可以通过 `sudo` 来安全地执行特权命令，而无需知道 root 密码。
### 系统守护进程组
#### daemon
- 用于系统守护进程（服务）。这些进程通常以 `daemon` 用户或组的身份运行，以限制其权限，增强安全性。
### 终端和通信相关
#### tty
- 控制对终端设备 (`/dev/tty*`) 的访问。所有需要直接与终端交互的用户进程通常都属于这个组。
#### mail
- 用于管理邮件相关的软件和文件（如 `/var/mail`）。
### 无权限组
#### nogroup
- 一个**没有任何权限的组**。它的主要目的是给那些不需要任何文件访问权限的服务或进程使用，作为一种安全措施。例如，某些服务可能会以 `nobody` 用户和 `nogroup` 组的身份运行。
---
## 第三部分：硬件和设备访问组
现代 Linux 发行版（如 Ubuntu）通常使用这些组来为非特权用户授予对特定硬件的访问权限，而无需 root。
#### 1. `audio`
- 允许访问声音设备（声卡），用于播放和录制音频。
#### 2. `video`
- 允许直接访问视频捕获设备、2D/3D硬件加速（对于游戏和GPU计算很重要）。
#### 3. `plugdev`
- 允许成员挂载和卸载可移动设备（如U盘、外部硬盘）。用户加入此组后，通常就可以在图形界面中自动识别和挂载U盘。
#### 4. `cdrom`
- 允许用户直接使用光驱（CD/DVD），例如挂载光盘或烧录。
#### 5. `dialout`
- 允许直接访问串行端口（如 `/dev/ttyS0`, `/dev/ttyUSB0`）。常用于连接老式调制解调器、串口控制台或一些单片机（如 Arduino）。
#### 6. `input`
- 允许访问输入设备，在某些系统上用于配置键盘、鼠标等。
#### 7. `kvm`
- 允许用户使用基于内核的虚拟机（KVM）进行硬件加速的虚拟化。
#### 8. `docker`
- 如果你安装了 Docker，创建这个组。将用户加入 `docker` 组，该用户就可以直接运行 Docker 命令而无需 `sudo`。**请注意，这等同于授予了用户 root 权限**，因为 Docker 可以用于启动特权容器。
#### 9. `disk`
- 拥有对原始磁盘设备 (`/dev/sd*`, `/dev/hd*`) 的访问权限。这个组的权限很大，**通常只分配给需要操作磁盘分区的工具**（如 `fdisk`, `parted`），一般不会将普通用户加入此组。
---
## 第四部分：查看和管理用户组
### 如何查看用户所属的组
使用 `groups` 或 `id` 命令：
```bash
groups      # 查看当前用户属于哪些组
groups username  # 查看指定用户属于哪些组
id -Gn      # 另一种查看当前用户所属组的方式
```
### 如何查看系统上所有的组
组信息存储在 `/etc/group` 文件中。
```bash
cat /etc/group        # 查看所有组
less /etc/group       # 分页查看
getent group          # 另一种方式，也适用于LDAP等网络用户
```
---
## 第五部分：最佳实践与总结
### 总结表格
| 组名 | 主要用途 | 是否应添加普通用户 |
| :--- | :--- | :--- |
| **sudo** / **wheel** | 授予 `sudo` 权限 | **是**（针对管理员用户） |
| **plugdev** | 使用U盘等可移动设备 | **是**（桌面用户通常默认加入） |
| **audio**, **video** | 访问音频、视频设备 | **是**（桌面用户通常默认加入） |
| **docker** | 无需sudo使用Docker | **谨慎添加**（了解安全风险） |
| **adm** | 查看系统日志 | 按需添加（如给特定运维人员） |
| **root** | 完全的系统控制权 | **绝对不要** |
| **disk** | 直接访问磁盘设备 | **绝对不要** |
### 实践建议
1. **root 组的危险性**：通常只有 `root` 用户本身属于这个组。**强烈不建议将普通用户加入 `root` 组**，这是极大的安全风险。
2. **权限提升的标准做法**：将需要执行管理任务的普通用户加入 `sudo` 或 `wheel` 组，这样他们就可以通过 `sudo` 来安全地执行特权命令，而无需知道 root 密码。
3. **桌面用户的组配置**：对于桌面用户，系统通常会自动将您的主要用户添加到所有必要的硬件组（如 `audio`, `video`, `plugdev`, `sudo`），以便日常使用。
4. **服务器的组配置**：对于服务器，您应该只将需要权限的用户添加到 `sudo` 组，并谨慎分配其他组权限。
5. **Docker 使用谨慎**：了解加入 `docker` 组等同于获得 root 权限，应当非常谨慎地使用此权限。
---
**本指南涵盖了 Linux 用户权限管理的核心知识，帮助你理解和管理系统用户和组。**