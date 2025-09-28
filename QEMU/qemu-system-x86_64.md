## 一、基础配置
1. **`-m <size>`：指定内存大小**
   - 示例：`-m 4G` 或 `-m 4096`
   - 说明：为虚拟机分配内存，支持 `K`（KB）、`M`（MB）、`G`（GB）单位，默认单位为 MB。

2. **`-smp <cores>[,sockets=N][,threads=T][,maxcpus=M]`：指定 CPU 配置**
   - 示例：`-smp 4` 或 `-smp 4,sockets=2,threads=2,maxcpus=8`
   - 说明：设置 CPU 核心数、插槽数、线程数及最大可扩展核心数。

3. **`-machine <type>` 或 `-M <type>`：指定虚拟机架构**
   - 示例：`-machine q35,accel=kvm` 或 `-M pc,accel=kvm`
   - 说明：
     - 定义硬件架构：
       - `pc`：标准 PC 机型（基于 i440FX 芯片组）。
       - `q35`：现代 PC 架构（基于 Q35 芯片组，支持 PCIe）。
       - `virt`：虚拟化优化的通用机型（常见于 ARM 或 RISC-V）。
     - `accel=kvm` 启用 KVM 加速。
     - 使用 `-M help` 查看可用机型。
     - `-M` 是 `-machine` 的简写，两者功能相同。

4. **`-cpu <model>[,options]`：指定虚拟机模拟的 CPU 型号**
   - 示例：
     - `-cpu host`：使用宿主机的 CPU 特性（需 KVM 支持）。
     - `-cpu qemu64,+avx2`：使用 `qemu64` 模型并启用 AVX2 指令集。
     - `-cpu max`：启用所有 QEMU 支持的特性。
   - 说明：
     - 控制虚拟 CPU 的功能和性能。
     - 可选修饰符：`+feature` 或 `-feature`（启用或禁用特定 CPU 特性，如 `+vmx` 或 `-aes`）。
     - 使用 `-cpu help` 查看可用 CPU 模型。
     - 与 `-enable-kvm` 搭配时，建议用 `host` 以获得最佳性能。
## 二、存储设备
1. **`-hda/-hdb/-hdc/-hdd <file>`：挂载 IDE 硬盘镜像**
   - 示例：`-hda ubuntu.img`
   - 说明：模拟传统 IDE 接口硬盘，支持 `raw` 或 `qcow2` 格式。

2. **`-drive file=<file>,format=<fmt>,if=<interface>`：灵活配置磁盘**
   - 示例：`-drive file=disk.qcow2,format=qcow2,if=virtio`
   - 参数：
     - `file=`：镜像文件路径。
     - `format=`：镜像格式（如 `raw`、`qcow2`）。
     - `if=`：接口类型（如 `virtio`、`ide`、`scsi`）。
     - `cache=`：缓存策略（如 `none`、`writeback`）。
   - 说明：支持 VirtIO 高性能驱动，推荐用于现代虚拟机。

3. **`-cdrom <file>`：挂载光盘镜像**
   - 示例：`-cdrom ubuntu-25.04.iso`
   - 说明：将 ISO 文件挂载为虚拟光驱，常用于系统安装。

4. **`-snapshot`：临时模式运行**
   - 示例：`-drive file=disk.qcow2 -snapshot`
   - 说明：
     - 磁盘修改仅保存在内存中，退出后不影响原始镜像。
     - 适用于测试场景，避免破坏原始磁盘映像。
## 三、网络配置
1. **`-net nic,model=<type>`：创建虚拟网卡**
   - 示例：`-net nic,model=virtio`
   - 说明：指定网卡类型，`virtio` 为高性能半虚拟化驱动。

2. **`-net user[,hostfwd=<proto>:<host>:<port>-:<guest>:<port>]`：用户模式网络（NAT）**
   - 示例：`-net user,hostfwd=tcp::2222-:22`
   - 参数：
     - `hostfwd=`：端口转发（如宿主机 2222 端口转发到虚拟机 22 端口）。
     - `dns=`：自定义 DNS 服务器。
   - 说明：简单易用，适合无需复杂网络的场景。

3. **`-netdev <type>,id=<name>`：高级网络后端**
   - 示例：`-netdev tap,id=mynet0,ifname=tap0,script=no,downscript=no`
   - 说明：支持 TAP 桥接等高级网络，需配合 `-device` 使用。

4. **`-device <device>,netdev=<name>`：绑定网络设备**
   - 示例：`-device virtio-net-pci,netdev=mynet0`
   - 说明：将网络后端与具体设备（如 `virtio-net-pci`）关联。

5. **`-nic <model>[,options]`：配置网络接口卡（NIC）和网络后端**
   - 示例：
     - `-nic user,hostfwd=tcp::2222-:22`：用户模式网络，SSH 转发到 2222 端口。
     - `-nic virtio-net-pci,netdev=net0 -netdev tap,id=net0`：使用 VirtIO 和 TAP 网络。
   - 说明：
     - 简化网络设置，替代旧的 `-net` 和 `-netdev` 组合。
     - 用户模式适合简单场景，TAP 适合高级网络配置。
## 四、显示与输入
1. **`-vga <type>`：指定显卡类型**
   - 示例：`-vga virtio`
   - 说明：定义虚拟显卡，`virtio` 支持高分辨率显示。

2. **`-display <backend>`：选择显示后端**
   - 示例：
     - `-display sdl`：使用 SDL 窗口。
     - `-display gtk`：使用 GTK 界面。
     - `-display vnc=:1`：通过 VNC 显示（端口 5901）。
     - `-display none`：无图形界面。
   - 说明：根据需求选择图形输出方式。

3. **`-vnc <address>`：启用 VNC 远程控制**
   - 示例：`-vnc 0.0.0.0:1`
   - 说明：通过 VNC 客户端连接（端口为 `5900 + N`）。

4. **`-nographic`：禁用图形界面**
   - 说明：将串口重定向到终端，适合无头服务器环境。

5. **`-audiodev <driver>,id=<name>[,options]`：定义音频后端**
   - 示例：`-audiodev pa,id=snd0 -device sb16,audiodev=snd0`
   - 参数：
     - `pa`：PulseAudio（Linux）。
     - `alsa`：ALSA（Linux）。
     - `sdl`：SDL 音频。
     - `id=`：音频设备的标识符。
   - 说明：
     - 用于虚拟机的声音输出或输入。
     - 需配合 `-device` 将音频设备附加到虚拟机。
## 五、启动与 BIOS
1. **`-boot <order>`：指定启动顺序**
   - 示例：`-boot order=c,menu=on`
   - 参数：
     - `order=`：启动设备顺序（`a`=软盘，`c`=硬盘，`d`=光驱，`n`=网络）。
     - `menu=on`：显示启动菜单。
   - 说明：控制虚拟机启动优先级。

2. **`-bios <file>`：自定义 BIOS 文件**
   - 示例：`-bios OVMF.fd`
   - 说明：指定 UEFI 固件（如 OVMF），用于现代系统。

3. **`-kernel <file>`：直接加载并启动内核映像**
   - 示例：`-kernel /boot/vmlinuz-linux`
   - 说明：
     - 跳过传统引导加载程序（如 GRUB）。
     - 通常与 `-initrd` 和 `-append` 一起使用。

4. **`-initrd <file>`：指定初始 RAM 磁盘**
   - 示例：`-initrd /boot/initramfs-linux.img`
   - 说明：
     - 为内核提供启动时所需的模块和文件。
     - 需与 `-kernel` 搭配使用。

5. **`-append "parameters"`：传递内核启动参数**
   - 示例：`-append "root=/dev/vda1 console=ttyS0"`
   - 参数：
     - `root=`：指定根文件系统（如 `root=/dev/sda1`）。
     - `console=`：设置控制台输出（如 `console=ttyS0`）。
   - 说明：
     - 类似于 GRUB 的命令行参数。
     - 与 `-kernel` 和 `-initrd` 配合使用。
## 六、高级功能
1. **`-enable-kvm`：启用 KVM 加速**
   - 示例：`-enable-kvm -cpu host`
   - 说明：
     - 利用宿主机硬件虚拟化支持（Intel VT-x 或 AMD-V），大幅提升性能。
     - 仅适用于 Linux 宿主机，且需加载 KVM 内核模块（`kvm-intel` 或 `kvm-amd`）。
	 
2. `-usbdevice <设备类型>`
	- **tablet**：虚拟平板设备，能改善鼠标在虚拟机中的响应情况。
	- **host:**：用于将宿主机的 USB 设备直接传递给虚拟机，需指定设备的厂商 ID 和产品 ID。
	- **disk:**：模拟一个 USB 存储设备，例如可以将一个文件作为虚拟的 USB 磁盘挂载到虚拟机。
```bash
qemu-system-x86_64 -m 2048 -hda ubuntu.img -usb -usbdevice host:046d:c077
```
这里的 `046d:c077` 是 USB 设备的厂商 ID 和产品 ID，你可以通过 `lsusb` 命令在宿主机上查找到
```bash
qemu-system-x86_64 -m 2048 -hda ubuntu.img -usb -usbdevice disk:path/to/your/image.img
```

2. **`-usb`：启用 USB 控制器支持**
   - 示例：`-usb -device usb-mouse`
   - 说明：
     - 允许添加 USB 设备。
     - 支持 USB 1.1 或更高版本（取决于机器类型）。

3. **`-device usb-host,vendorid=<id>,productid=<id>`：直通物理 USB 设备**
   - 示例：`-device usb-host,vendorid=0x1234,productid=0x5678`
   - 说明：将宿主机的 USB 设备直接分配给虚拟机。

4. **`-daemonize`：后台运行**
   - 说明：将 QEMU 转为守护进程，脱离终端运行。

5. **`-monitor <type>`：启用 QEMU 监控器**
   - 示例：
     - `-monitor stdio`：通过当前终端交互。
     - `-monitor unix:/tmp/qemu-monitor.sock,server,nowait`：通过 UNIX 套接字通信。
   - 说明：
     - 支持动态管理（如保存快照、热插拔设备）。
     - 输入 `help` 查看可用命令。

6. **`-serial <type>`：串口输出**
   - 示例：`-serial stdio`
   - 说明：将串口日志输出到终端，适合调试内核。

7. **`-virtfs local,path=<host_path>,mount_tag=<tag>,security_model=<model>`：通过 9p 协议挂载宿主机目录**
   - 示例：`-virtfs local,path=/home/share,mount_tag=hostshare,security_model=passthrough`
   - 参数：
     - `path=`：宿主机目录路径。
     - `mount_tag=`：虚拟机内的挂载标识。
     - `security_model=`：安全模式（`mapped-xattr`、`passthrough` 或 `none`）。
   - 说明：
     - 实现文件共享。
     - 虚拟机内需加载 9p 驱动并挂载（如 `mount -t 9p hostshare /mnt`）。
## 七、完整示例
 典型 Linux 虚拟机启动：
```bash
qemu-system-x86_64 \
  -m 8G -smp 4 -machine q35,accel=kvm \
  -drive file=os.qcow2,format=qcow2,if=virtio \
  -cdrom install.iso \
  -nic user,hostfwd=tcp::2222-:22 \
  -vga virtio -display gtk \
  -boot order=c,menu=on \
  -enable-kvm
```
## 八、使用建议与常见问题
1. 参数选择建议
	- **性能优先**：
	  - 使用 `if=virtio`（磁盘/网络驱动）和 `-enable-kvm`。
	  - 选择 `qcow2` 镜像格式（支持快照和动态分配）。
	- **安全性**：
	  - 通过 `-snapshot` 测试未知镜像，避免修改原始文件。
	- **调试内核**：
	  - 结合 `-kernel <vmlinuz>`、`-initrd <initrd.img>` 和 `-append "root=/dev/sda1 console=ttyS0"`。
	  - 使用 `-serial stdio` 输出日志。
2. 常见问题
- **如何启用网络？**
   - 用户模式：`-nic user` + 端口转发。
   - 桥接模式：配置 TAP 设备（如 `-nic tap`），可能需 `sudo` 权限。
- **如何提升性能？**
   - 使用 KVM（`-enable-kvm`）和 VirtIO 驱动（`if=virtio`）。
   - 选择 `qcow2` 镜像格式。
- **如何调试内核？**
   - 使用 `-serial stdio` 输出日志。
   - 直接加载内核和 initrd 文件进行启动。