- **iw 的定位**  
    iw 是基于 nl80211 接口的无线设备命令行配置工具，用来替换传统的 iwconfig。它支持新一代无线驱动程序，并随着内核的发展不断增加新特性
- **获取 iw**  
    iw 的源代码可以从 kernel.org 下载，也可从 Git 仓库获取，编译时需要 libnl（及其开发包）和 pkg-config 工具等依赖
## 基本用法
- **获取帮助**  
    运行 `iw help` 命令会列出 iw 所支持的所有命令及选项，帮助用户了解各命令功能
- **设备能力查询**  
    使用 `iw list` 命令可以显示所有无线设备的详细功能信息，如支持的频段、802.11 标准、信道信息等。
- **网络扫描**  
    通过 `iw dev wlan0 scan` 可扫描周围可用的无线网络，获取各网络的信号、频率及其他属性信息。
- **监听无线事件**  
    命令 `iw event` 用于实时监听无线设备的事件，如认证、关联、断开连接等。附加选项 `-f` 可显示详细帧信息，`-t` 可显示时间戳。
- **查看连接状态**  
    命令 `iw dev wlan0 link` 用于查询当前无线接口的连接状态。如果连接到 AP，会显示 AP 的 MAC 地址、SSID、频率、信号强度、传输速率等；未连接时会提示 “Not connected”。
## 网络连接与管理
- **建立基本连接**  
    iw 支持直接连接到开放网络或仅采用 WEP 加密的网络。
    - 例如：
        - 连接开放网络：`iw wlan0 connect foo`
        - 指定频率：`iw wlan0 connect foo 2432`
        - 对于 WEP 加密，还可以指定密钥参数。  
            对于 WPA/WPA2 加密网络，则建议使用 wpa_supplicant 进行连接管理
- **获取站点统计信息**  
    通过 `iw dev wlan1 station dump` 可以查看连接到无线设备的各个站点的统计信息，如收发字节数、数据包数、信号强度和传输速率。也可使用 `iw dev wlan1 station get <peer-MAC-address>` 针对特定对端进行查询
- **修改传输速率**  
    iw 允许用户修改设备的发送速率：
    - **传统速率**：  
        如 `iw wlan0 set bitrates legacy-2.4 12 18 24` 设置仅使用指定的 2.4 GHz 传统速率。
    - **HT MCS 速率**：  
        如 `iw dev wlan0 set bitrates mcs-5 4` 设定 5 GHz 下使用特定的 MCS 速率。  
        同时也提供了清除设置恢复默认的方法
- **设置发射功率**  
    `iw dev <devname> set txpower <auto|fixed|limit> [<tx power in mBm>]`
    `iw phy <phyname> set txpower <auto|fixed|limit> [<tx power in mBm>]`
    来调整无线设备的发射功率，注意单位为 mBm（1 mBm = 0.01 dBm）
- **省电设置**  
    可通过 `iw dev wlan0 set power_save on` 启用省电模式，并用 `iw dev wlan0 get power_save` 查询当前状态
## 接口管理与高级功能
- **添加和删除无线接口**  
    iw 允许创建多种类型的无线接口，包括：
    - **Monitor 接口**：例如 `iw phy phy0 interface add moni0 type monitor`
    - **Managed（站点）接口**：例如 `iw phy phy0 interface add wlan10 type managed`
    - **其他模式**：如 ibss、mesh、wds 等。  
        删除接口则使用 `iw dev <接口名> del`
- **定制 Monitor 接口**  
    可为 monitor 接口指定额外的标志，如 `none`, `fcsfail`, `plcpfail` 等，达到调试或数据采集的目的。例如：
    `iw dev wlan0 interface add fish0 type monitor flags none`
    这对于使用 tcpdump 等工具捕获特定数据帧特别有用
- **虚拟 vif 支持**  
    iw 也支持虚拟无线接口（VIF），详细说明请参阅专门的 vif 文档
- **更新国家法规域**  
    使用 `iw reg set alpha2` 命令可根据 ISO/IEC 3166 的国家代码设置无线设备的法规域，确保设备遵守当地无线电规定。
- **Mesh 与 WDS 支持**
    - **Mesh 网络**：  
        创建 Mesh 点接口命令示例：
        `iw phy phy0 interface add mesh0 type mp mesh_id mymesh`
        启动后，可通过 `iw dev mesh0 mpath dump` 查看 Mesh 路径。
    - **WDS 模式**：  
        先创建 WDS 接口：
        `iw phy phy0 interface add wds0 type wds`
        然后设置对端 MAC 地址：
        `iw dev wds0 set peer <MAC地址>`
    这两种模式均用于实现无线桥接或扩展网络
- **4 地址模式**  
    当需要在 AP 与客户端之间使用四地址帧（如实现某些桥接功能）时，可以通过添加 4addr 选项启用：
    `iw phy phy0 interface add sta0 type managed 4addr on`
    这对于某些特殊的网络场景（例如 WDS 替代方案）是必须的，但需要客户端和 AP 端均支持
- **数据包合并规则**  
    为减少广播或多播包的干扰及主机中断，iw 支持配置数据包合并（coalesce）规则。用户可以：
    - 启用合并功能：`iw phy phy0 enable coalesce.conf`（其中 coalesce.conf 指定规则参数，如延时、匹配模式和数据包模式）
    - 查看当前规则：`iw phy phy0 coalesce show`
    - 禁用合并功能：`iw phy phy0 coalesce disable`  
        此特性有助于降低系统功耗和处理负荷
## 总结
iw 命令作为 Linux 系统下现代无线设备的配置工具，涵盖了从设备信息查询、网络扫描、事件监听、连接状态查询，到高级的接口管理、功率控制、速率调整以及 Mesh/WDS/4地址模式和数据包合并等高级功能。它不仅替代了老旧的 iwconfig，而且以更灵活和全面的方式支持新一代无线网络应用，是无线网络管理和调试的重要工具。
该总结基于 Linux Wireless 官方文档中关于 iw 命令的详细说明[​][​]。