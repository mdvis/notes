
网络配置工具

## 补充说明

**ip命令** 用来显示或操纵Linux主机的路由、网络设备、策略路由和隧道，是Linux下较新的功能强大的网络配置工具。

###  语法 

```shell
ip(选项)(对象)
Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }
       ip [ -force ] -batch filename
```

###  对象 

```shell
OBJECT := { link | address | addrlabel | route | rule | neigh | ntable |
       tunnel | tuntap | maddress | mroute | mrule | monitor | xfrm |
       netns | l2tp | macsec | tcp_metrics | token }
       
-V：显示指令版本信息；
-s：输出更详细的信息；
-f：强制使用指定的协议族；
-4：指定使用的网络层协议是IPv4协议；
-6：指定使用的网络层协议是IPv6协议；
-0：输出信息每条记录输出一行，即使内容较多也不换行显示；
-r：显示主机时，不使用IP地址，而使用主机的域名。
```

###  选项

```shell
OPTIONS := { -V[ersion] | -s[tatistics] | -d[etails] | -r[esolve] |
        -h[uman-readable] | -iec |
        -f[amily] { inet | inet6 | ipx | dnet | bridge | link } |
        -4 | -6 | -I | -D | -B | -0 |
        -l[oops] { maximum-addr-flush-attempts } |
        -o[neline] | -t[imestamp] | -ts[hort] | -b[atch] [filename] |
        -rc[vbuf] [size] | -n[etns] name | -a[ll] }
        
网络对象：指定要管理的网络对象；
具体操作：对指定的网络对象完成具体操作；
help：显示网络对象支持的操作命令的帮助信息。
```

###  实例 

```shell
ip link show                    # 显示网络接口信息
ip link set eth0 up             # 开启网卡
ip link set eth0 down            # 关闭网卡
ip link set eth0 promisc on      # 开启网卡的混合模式
ip link set eth0 promisc offi    # 关闭网卡的混合模式
ip link set eth0 txqueuelen 1200 # 设置网卡队列长度
ip link set eth0 mtu 1400        # 设置网卡最大传输单元
ip addr show     # 显示网卡IP信息
ip addr add 192.168.0.1/24 dev eth0 # 为eth0网卡添加一个新的IP地址192.168.0.1
ip addr del 192.168.0.1/24 dev eth0 # 为eth0网卡删除一个IP地址192.168.0.1

ip route show # 显示系统路由
ip route add default via 192.168.1.254   # 设置系统默认路由
ip route list                 # 查看路由信息
ip route add 192.168.4.0/24  via  192.168.0.254 dev eth0 # 设置192.168.4.0网段的网关为192.168.0.254,数据走eth0接口
ip route add default via  192.168.0.254  dev eth0        # 设置默认网关为192.168.0.254
ip route del 192.168.4.0/24   # 删除192.168.4.0网段的网关
ip route del default          # 删除默认路由
ip route delete 192.168.1.0/24 dev eth0 # 删除路由
```

**用ip命令显示网络设备的运行状态** 

```shell
[root@localhost ~]# ip link list
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 16436 qdisc noqueue
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast qlen 1000
    link/ether 00:16:3e:00:1e:51 brd ff:ff:ff:ff:ff:ff
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast qlen 1000
    link/ether 00:16:3e:00:1e:52 brd ff:ff:ff:ff:ff:ff
```

**显示更加详细的设备信息** 

```shell
[root@localhost ~]# ip -s link list
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 16436 qdisc noqueue
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    RX: bytes  packets  errors  dropped overrun mcast   
    5082831    56145    0       0       0       0      
    TX: bytes  packets  errors  dropped carrier collsns
    5082831    56145    0       0       0       0      
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast qlen 1000
    link/ether 00:16:3e:00:1e:51 brd ff:ff:ff:ff:ff:ff
    RX: bytes  packets  errors  dropped overrun mcast   
    3641655380 62027099 0       0       0       0      
    TX: bytes  packets  errors  dropped carrier collsns
    6155236    89160    0       0       0       0      
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast qlen 1000
    link/ether 00:16:3e:00:1e:52 brd ff:ff:ff:ff:ff:ff
    RX: bytes  packets  errors  dropped overrun mcast   
    2562136822 488237847 0       0       0       0      
    TX: bytes  packets  errors  dropped carrier collsns
    3486617396 9691081  0       0       0       0     
```

**显示核心路由表** 

```shell
[root@localhost ~]# ip route list 
112.124.12.0/22 dev eth1  proto kernel  scope link  src 112.124.15.130
10.160.0.0/20 dev eth0  proto kernel  scope link  src 10.160.7.81
192.168.0.0/16 via 10.160.15.247 dev eth0
172.16.0.0/12 via 10.160.15.247 dev eth0
10.0.0.0/8 via 10.160.15.247 dev eth0
default via 112.124.15.247 dev eth1
```

**显示邻居表** 

```shell
[root@localhost ~]# ip neigh list
112.124.15.247 dev eth1 lladdr 00:00:0c:9f:f3:88 REACHABLE
10.160.15.247 dev eth0 lladdr 00:00:0c:9f:f2:c0 STALE
```

**获取主机所有网络接口**

```shell
ip link | grep -E '^[0-9]' | awk -F: '{print $2}'
```


以下是 `ip` 命令的用法总结（基于 Arch Linux 手册页）：
## **1. 命令格式**
`ip [OPTIONS] OBJECT COMMAND`
- **OBJECT**: 要操作的对象（如 `address`, `route`, `link`, `neighbor` 等）。
- **COMMAND**: 对对象的操作（如 `show`, `add`, `delete` 等）。
- **OPTIONS**: 全局选项（如 `-4` 仅 IPv4，`-6` 仅 IPv6，`-s` 显示统计信息）。
## **2. 常用对象与命令**
### **地址管理（`address`/`addr`）**
- **查看地址**
    `ip addr show [dev <interface>]`
- **添加/删除地址**
```
ip addr add <IP>/<mask> dev <interface>
ip addr del <IP>/<mask> dev <interface>
```
- **示例**
    `ip addr add 192.168.1.10/24 dev eth0`
### **链路管理（`link`）**
- **查看网络接口**
    `ip link show`
- **启用/禁用接口**
```
ip link set <interface> up
ip link set <interface> down
```
- **修改接口属性**（如 MAC 地址）
    `ip link set <interface> address <MAC>`
### **路由管理（`route`）**
- **查看路由表**
    `ip route show`
- **添加/删除路由**
```
    ip route add <目标网络>/<掩码> via <网关> dev <接口>
    ip route del <目标网络>/<掩码>
```
- **默认网关**
   `ip route add default via <网关IP>`
- **示例**
  `ip route add 10.0.0.0/24 via 192.168.1.1 dev eth0`
### **邻居表（ARP/NDP，`neighbor`/`neigh`）**
- **查看 ARP 缓存**
  `ip neighbor show`
- **添加/删除条目**
```
ip neighbor add <IP> lladdr <MAC> dev <接口>
ip neighbor del <IP> dev <接口>
```
### **隧道管理（`tunnel`）**
- 创建/管理 IP 隧道（如 GRE、IPIP）
`ip tunnel add <名称> mode <类型> local <IP> remote <IP>`
### **统计信息（`-s` 选项）**
- 显示详细统计信息（如流量、错误包数）
`ip -s link show <接口>`
`ip -s -s addr  # 更详细统计`
## **3. 常用选项**

| 选项   | 作用        |
| ---- | --------- |
| `-4` | 仅 IPv4 操作 |
| `-6` | 仅 IPv6 操作 |
| `-s` | 显示统计信息    |
| `-j` | JSON 格式输出 |
| `-c` | 彩色输出      |
## **4. 示例场景**
1. **查看所有接口信息**
    `ip addr show`
2. **临时禁用网络接口**
  `ip link set eth0 down`
3. **添加静态路由**
    `ip route add 172.16.0.0/16 via 10.0.0.1`
4. **查看 ARP 表**
    `ip neighbor show`
## **5. 帮助信息**
- 查看对象的支持命令：
```
    ip <OBJECT> help
    # 例如：ip route help
```
通过 `man ip` 或 `ip help` 可查看完整文档。