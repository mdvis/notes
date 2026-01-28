**cBPF 和 eBPF 是 Linux 内核中同一技术路线的两个阶段**，它们都属于 **BPF（Berkeley Packet Filter）** 家族，但能力、架构和应用场景有巨大差异。

简单来说：

- **cBPF** = Classic BPF（经典 BPF） → 老版本，主要用于**包过滤**
- **eBPF** = extended BPF（扩展 BPF） → 现代版本，几乎完全取代了 cBPF，现在是内核里运行的通用“安全虚拟机”

### cBPF vs eBPF 核心对比

| 特性                  | cBPF (经典 BPF)                          | eBPF (扩展 BPF)                                      | 备注 |
|-----------------------|------------------------------------------|------------------------------------------------------|------|
| 出现时间              | 1992 年（tcpdump / libpcap）             | Linux 3.15 ~ 3.18 开始引入（2014 年左右）           | eBPF 从 3.18 开始大规模发展 |
| 寄存器数量            | 2 个 32 位寄存器（A 和 X）              | 10 个 64 位寄存器 + 1 个只读 frame pointer          | eBPF 更接近真实 CPU 架构 |
| 寄存器宽度            | 32 位                                    | 64 位（兼容 32 位子寄存器）                          | 支持指针、64 位运算 |
| 指令集                | 很小（基本跳转、算术、载入/存储）       | 大幅扩展（call 指令、原子操作、64 位 alu 等）       | eBPF 指令编码完全不同 |
| 堆栈大小              | 很小（几乎没有）                         | 512 字节                                             | 支持局部变量 |
| 是否支持循环          | 不支持                                   | 支持（5.3+ 内核，支持有界循环）                     | 早期 eBPF 也不支持循环 |
| 是否有状态            | 无状态（每次执行独立）                   | 支持（通过 **BPF Map** 实现持久化状态）              | 这是最大区别之一 |
| 与用户态交互          | 几乎没有                                 | 通过 **Map**（哈希表、数组、LRU、ring buffer 等）   | 强大数据交换能力 |
| Helper 函数           | 几乎没有                                 | 大量 kernel helper（几十到几百个）                   | 如 bpf_get_current_pid_tgid、bpf_trace_printk 等 |
| 主要用途（早期）      | 数据包过滤（tcpdump、防火墙、seccomp）   | 包过滤 + 追踪 + 网络 + 安全 + 调度 + ……             | eBPF 用途极广 |
| 加载方式              | setsockopt(SO_ATTACH_FILTER) 等          | bpf() 系统调用 + 多种 attach 类型                   | eBPF 有几十种程序类型 |
| 内核内部执行          | 有独立的 cBPF 解释器                     | 现代内核只运行 eBPF（cBPF 会被**透明转换为 eBPF**） | 4.x 以后内核统一为 eBPF |
| JIT 性能              | 有，但较弱                               | 更强（可达原生代码的 1.5~4 倍性能）                 | 尤其在网络处理上明显 |
| 验证器（Verifier）    | 简单                                     | 非常严格（路径敏感、内存安全、禁止非法访问）        | eBPF verifier 是核心安全保障 |

### 实际使用中的现状（2025–2026）

- **现代内核（4.x 及以上，尤其是 5.x/6.x）**：只运行 eBPF 字节码
  - 当你用 tcpdump、wireshark、seccomp 这些老工具时，内核会把 cBPF 代码**自动转换为 eBPF** 再执行
- **还能看到 cBPF 的地方**：
  - 老的 tcpdump 过滤表达式
  - seccomp 部分 filter（不过很多也逐步转向 eBPF）
  - 一些恶意软件（BPFDoor、Symbiote 等）还在用 cBPF，因为加载方式更简单（setsockopt）
- **真正强大的都是 eBPF**：
  - Cilium、Calico、Falco、Pixie、Katran、BCC、bpftrace、DeepFlow、Tetragon……
  - XDP、TC、socket filter、kprobe/uprobe、lsm、fentry/fexit、cgroup、sched 等几十种挂载点

### 一句话总结

- **cBPF**：上世纪 90 年代的经典包过滤器，能力非常有限，只适合简单无状态过滤
- **eBPF**：现代内核的安全可编程运行时，像是在内核里跑了一个“受限的微型用户态程序”，几乎可以挂钩内核任何地方，已成为云原生、可观测性、网络、安全等领域的基础设施级技术

如果你现在听到别人说“BPF”或“eBPF”，**99% 情况下指的都是现代的 eBPF**，很少再特意强调 cBPF 了（除非专门讨论历史或恶意软件检测）。

有具体想深入的场景吗？比如 XDP vs TC、Map 类型、CO-RE、verifier 报错处理等？可以继续问～