# Agent 开发算法详解（六）：记忆与状态管理

## 本篇导读

在 Agent 开发中，"记忆"决定了 Agent 能否在多轮交互中保持一致性、能否利用历史经验、能否处理超出上下文窗口的长任务。一个成熟的 Agent 记忆系统通常不是单一的存储结构，而是**三层架构**的协同工作：

1. **短期记忆（Short-Term Memory）**：即当前会话的上下文窗口，存放最近几轮的对话与中间状态。特点是访问快、容量小、随会话结束而消失，对应 LRU/LFU 这类淘汰算法。
2. **中期记忆（Mid-Term Memory）**：当短期记忆接近 token 上限时，通过摘要压缩把较早的对话凝练成一段摘要，腾出空间继续对话。对应滑动窗口 + 分层摘要算法。
3. **长期记忆（Long-Term Memory）**：把需要跨会话复用的事实、偏好、经验写入向量数据库，检索时按语义相似度召回。对应向量库的写入、更新、索引重建机制。

本篇将围绕这三层架构，讲解四个核心算法：**LRU、LFU、摘要压缩、向量数据库写入/更新**。每个算法都会给出原理、数据结构、复杂度分析、Agent 场景下的应用以及可运行的 Python 示例。目标是让读者读完之后，能够自己设计一个具备短期-中期-长期记忆协同的 Agent 记忆模块。

---

## 一、LRU（Least Recently Used）

### 1.1 原理与核心思想

LRU 是一种基于"时间局部性"假设的缓存淘汰策略：**最近被访问过的数据，未来大概率还会被访问；而很久没被访问的数据，未来被访问的概率较低**。当缓存满时，LRU 会淘汰最久未被访问的那一项。

这个假设在 Agent 短期记忆中非常成立：用户刚刚提到的一个实体、刚刚执行过的一个工具调用结果，在接下来的几轮对话中很可能会被再次引用（比如用户问"刚才那个文件叫什么名字"）。而几十轮之前的一次工具调用结果，基本不会再被提及，可以安全淘汰。

LRU 的关键在于精确记录每个缓存项的"最近访问时间"。直接给每项打一个时间戳虽然可行，但要在淘汰时找到时间戳最小的那一项，需要遍历或维护堆，效率不理想。工业界标准的实现是**哈希表 + 双向链表**，可以把访问和淘汰都做到 O(1)。

### 1.2 关键数据结构与伪代码

LRU 的经典实现依赖两个数据结构的配合：

- **哈希表（dict）**：`key -> 链表节点`，实现 O(1) 查找。
- **双向链表（DoublyLinkedList）**：按访问时间从新到旧排列，表头是最近访问的，表尾是最久未访问的。双向链表的好处是可以在 O(1) 时间内把任意节点从中间摘出来挪到表头。

核心操作：

```
get(key):
    if key not in hash_table:
        return NOT_FOUND
    node = hash_table[key]
    move_to_head(node)        # 把节点挪到表头，标记为"最近访问"
    return node.value

put(key, value):
    if key in hash_table:
        node = hash_table[key]
        node.value = value
        move_to_head(node)
    else:
        if size == capacity:
            tail = pop_tail()          # 淘汰表尾（最久未访问）
            del hash_table[tail.key]
            size -= 1
        new_node = Node(key, value)
        add_to_head(new_node)
        hash_table[key] = new_node
        size += 1
```

`move_to_head`、`pop_tail`、`add_to_head` 都是双向链表的基本操作，时间复杂度 O(1)。

### 1.3 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 |
|------|-----------|-----------|
| `get(key)` | O(1) | O(1) |
| `put(key, value)` | O(1) | O(1) |
| 整体空间 | — | O(n)，n 为缓存容量 |

哈希表和链表各存一份指针，常数因子约为 2，但渐进空间仍是 O(n)。

### 1.4 Agent 开发中的应用场景

1. **短期对话窗口管理**：Agent 维护一个固定大小的"近期消息缓存"，当对话轮数超过容量时淘汰最早的消息，保证上下文不会无限膨胀。
2. **工具调用结果缓存**：同一个工具在同一参数下的调用结果可以缓存一段时间，避免重复消耗（例如查询天气、查询股价这类时效性较强的结果可设较短 TTL 配合 LRU）。
3. **Embedding 缓存**：对相同文本重复计算 embedding 是浪费，用 LRU 缓存最近 N 条文本的向量，命中即返回。
4. **Prompt 模板缓存**：渲染好的 prompt 模板按使用频率保留，避免每次重新拼装。

### 1.5 Python 示例

#### 1.5.1 手写 LRU（哈希表 + 双向链表）

```python
class Node:
    """双向链表节点"""
    def __init__(self, key=None, value=None):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LRUCache:
    """标准的哈希表 + 双向链表实现，get/put 均 O(1)"""

    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}                       # key -> Node
        # 使用哑节点 head / tail 简化边界处理
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _add_to_head(self, node: Node):
        """把节点插到表头（哑节点之后）"""
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def _remove_node(self, node: Node):
        """从链表中摘除任意节点"""
        node.prev.next = node.next
        node.next.prev = node.prev

    def _move_to_head(self, node: Node):
        """已有节点被访问，挪到表头"""
        self._remove_node(node)
        self._add_to_head(node)

    def _pop_tail(self) -> Node:
        """淘汰表尾（最久未访问的真实节点）"""
        node = self.tail.prev
        self._remove_node(node)
        return node

    def get(self, key):
        if key not in self.cache:
            return None
        node = self.cache[key]
        self._move_to_head(node)
        return node.value

    def put(self, key, value):
        if key in self.cache:
            node = self.cache[key]
            node.value = value
            self._move_to_head(node)
            return
        if len(self.cache) >= self.capacity:
            removed = self._pop_tail()
            del self.cache[removed.key]
        node = Node(key, value)
        self.cache[key] = node
        self._add_to_head(node)


# ---------- Agent 场景：短期消息缓存 ----------
class ShortTermMemory:
    """用 LRU 管理近期对话消息"""

    def __init__(self, capacity: int = 20):
        self.lru = LRUCache(capacity)

    def add_message(self, turn_id: int, message: str):
        self.lru.put(turn_id, message)

    def get_message(self, turn_id: int) -> str:
        return self.lru.get(turn_id)

    def recent_messages(self, k: int = 5):
        """取最近 k 条（从表头遍历）"""
        msgs = []
        node = self.lru.head.next
        while node is not self.lru.tail and len(msgs) < k:
            msgs.append((node.key, node.value))
            node = node.next
        return msgs


if __name__ == "__main__":
    mem = ShortTermMemory(capacity=3)
    mem.add_message(1, "用户：你好")
    mem.add_message(2, "Agent：你好，有什么可以帮你？")
    mem.add_message(3, "用户：查一下北京天气")
    # 再加一条，会淘汰 turn_id=1（最久未访问）
    mem.add_message(4, "Agent：北京今天 25 度，晴")
    print(mem.get_message(1))  # None，已被淘汰
    print(mem.get_message(3))  # "用户：查一下北京天气"
    print(mem.recent_messages(3))
    # [(4, 'Agent：北京今天 25 度，晴'), (3, '用户：查一下北京天气'), (2, 'Agent：你好，有什么可以帮你？')]
```

#### 1.5.2 使用 `functools.lru_cache`

Python 标准库已经提供了现成的 LRU 装饰器，适合缓存纯函数结果：

```python
import functools
import time


@functools.lru_cache(maxsize=128)
def embed(text: str) -> tuple:
    """模拟调用 embedding 模型，结果按 LRU 缓存"""
    # 实际中这里是调用 OpenAI / 本地模型
    time.sleep(0.1)  # 假装是网络请求
    # 简单演示：返回字符 ascii 的归一化向量
    return tuple(ord(c) / 256 for c in text[:8])


# 第一次调用会真正计算
v1 = embed("hello world")
# 第二次相同输入直接命中缓存，耗时几乎为 0
v2 = embed("hello world")
print(v1 == v2)  # True
print(embed.cache_info())  # CacheInfo(hits=1, misses=1, maxsize=128, currsize=1)
```

`functools.lru_cache` 适合缓存**纯函数**的结果（输入相同则输出相同），但不适合需要按语义淘汰、需要遍历全部内容的场景，这时候应该用上面的手写实现或 `collections.OrderedDict`。

#### 1.5.3 使用 `collections.OrderedDict`

更简洁的写法是借助 `OrderedDict` 的 `move_to_end` 和 `popitem(last=False)`：

```python
from collections import OrderedDict


class LRUCacheOD:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.od = OrderedDict()

    def get(self, key):
        if key not in self.od:
            return None
        self.od.move_to_end(key)  # 移到末尾表示"最近访问"
        return self.od[key]

    def put(self, key, value):
        if key in self.od:
            self.od.move_to_end(key)
        self.od[key] = value
        if len(self.od) > self.capacity:
            self.od.popitem(last=False)  # 弹出头部（最久未访问）
```

---

## 二、LFU（Least Frequently Used）

### 2.1 原理与核心思想

LFU 是一种基于"访问频次"的缓存淘汰策略：**当缓存满时，淘汰访问次数最少的那一项**；如果有多项频次相同，则在这些项中再按 LRU 规则淘汰最久未访问的。

LFU 的动机是：有些数据虽然很久没被访问，但历史上被访问过很多次，说明它是"热门数据"，未来还可能被访问；反之一个数据虽然刚被访问过一次，但历史上很少被访问，它更可能是冷数据。相比 LRU 只看"最近一次访问时间"，LFU 关注的是"长期访问热度"。

在 Agent 场景中，LFU 适合缓存**跨会话复用价值高的数据**：比如某个用户的偏好（"用户喜欢简洁的回答"）可能被反复引用，应该高优先级保留；而一次性的工具调用结果（查一次天气）访问频次低，可以优先淘汰。

### 2.2 关键数据结构与伪代码

LFU 的标准实现需要两个映射：

- `key -> Node`：节点映射，O(1) 查找。
- `freq -> DoublyLinkedList`：同一频次的所有节点组成一个双向链表，链表内部按 LRU 顺序排列（表头最旧，表尾最新）。

同时维护一个 `min_freq`，记录当前缓存中最小的访问频次，用于淘汰时快速定位。

```
get(key):
    if key not in key_map:
        return NOT_FOUND
    node = key_map[key]
    increase_freq(node)        # 把节点从 freq 链表挪到 freq+1 链表
    return node.value

put(key, value):
    if key in key_map:
        node = key_map[key]
        node.value = value
        increase_freq(node)
        return
    if size == capacity:
        # 淘汰 min_freq 链表的表头（最旧且频次最低）
        evicted = freq_map[min_freq].pop_head()
        del key_map[evicted.key]
        size -= 1
    node = Node(key, value, freq=1)
    key_map[key] = node
    freq_map[1].append_to_tail(node)
    min_freq = 1                # 新插入节点，最小频次必然是 1
    size += 1

increase_freq(node):
    f = node.freq
    freq_map[f].remove(node)
    if freq_map[f].is_empty():
        del freq_map[f]
        if min_freq == f:
            min_freq = f + 1    # 最小频次链表空了，最小频次 +1
    node.freq = f + 1
    freq_map[f + 1].append_to_tail(node)
```

### 2.3 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 |
|------|-----------|-----------|
| `get(key)` | O(1) | O(1) |
| `put(key, value)` | O(1) | O(1) |
| 整体空间 | — | O(n) |

注意 LFU 的 O(1) 依赖于"同频次链表内部按 LRU 排列"这一设计，否则在同频次中选最久未访问的项就需要额外开销。

### 2.4 LRU 与 LFU 对比

| 维度 | LRU | LFU |
|------|-----|-----|
| 淘汰依据 | 最近访问时间 | 访问频次 |
| 优点 | 实现简单，对突发访问友好 | 能识别长期热门数据 |
| 缺点 | 对"扫描式"访问不友好（一次大批量访问会把老热门数据全冲掉） | 老的"历史热门"数据难以被淘汰（频次累积效应） |
| 适用 Agent 场景 | 短期会话窗口（时间局部性强） | 跨会话的偏好/知识缓存（频次更有意义） |
| 变体 | LRU-K、ARC | LFU with aging（频次衰减） |

实际工程中，**短期记忆用 LRU，长期热点缓存用 LFU** 是常见的组合。也有一些混合策略（如 W-TinyLFU，用于 Caffeine 缓存库），通过 Count-Min Sketch 统计频次并做老化衰减，兼顾两者的优点。

### 2.5 Agent 开发中的应用场景

1. **用户偏好缓存**：跨会话保留"用户喜欢简洁回答""用户使用中文"这类高频引用的偏好。
2. **常用知识条目缓存**：FAQ 类 Agent 中被频繁查询的问答对，用 LFU 保留在内存中，减少向量库查询。
3. **工具描述缓存**：Agent 调用工具时需要把工具描述塞进 prompt，常用工具的描述可以常驻缓存。
4. **Prompt 片段缓存**：系统 prompt 中反复引用的片段按频次保留。

### 2.6 Python 示例

```python
from collections import defaultdict, OrderedDict


class Node:
    def __init__(self, key=None, value=None):
        self.key = key
        self.value = value
        self.freq = 0


class LFUCache:
    """O(1) 的 LFU 实现：freq_map[频次] -> OrderedDict(key -> Node)"""

    def __init__(self, capacity: int):
        self.capacity = capacity
        self.size = 0
        self.min_freq = 0
        self.key_map = {}                          # key -> Node
        self.freq_map = defaultdict(OrderedDict)   # freq -> OrderedDict(key -> Node)

    def _increase_freq(self, node: Node):
        f = node.freq
        del self.freq_map[f][node.key]
        if len(self.freq_map[f]) == 0:
            del self.freq_map[f]
            if self.min_freq == f:
                self.min_freq = f + 1
        node.freq += 1
        self.freq_map[node.freq][node.key] = node   # OrderedDict 末尾是最新

    def get(self, key):
        if key not in self.key_map:
            return None
        node = self.key_map[key]
        self._increase_freq(node)
        return node.value

    def put(self, key, value):
        if self.capacity <= 0:
            return
        if key in self.key_map:
            node = self.key_map[key]
            node.value = value
            self._increase_freq(node)
            return
        if self.size >= self.capacity:
            # 淘汰 min_freq 链表的表头（最旧）
            oldest_key, _ = self.freq_map[self.min_freq].popitem(last=False)
            del self.key_map[oldest_key]
            self.size -= 1
            if len(self.freq_map[self.min_freq]) == 0:
                del self.freq_map[self.min_freq]
        node = Node(key, value)
        node.freq = 1
        self.key_map[key] = node
        self.freq_map[1][key] = node
        self.min_freq = 1
        self.size += 1


# ---------- Agent 场景：跨会话偏好缓存 ----------
class PreferenceCache:
    """用 LFU 缓存高频引用的用户偏好"""

    def __init__(self, capacity: int = 100):
        self.lfu = LFUCache(capacity)

    def record(self, preference_key: str, value: str):
        self.lfu.put(preference_key, value)

    def lookup(self, preference_key: str):
        return self.lfu.get(preference_key)


if __name__ == "__main__":
    pref = PreferenceCache(capacity=3)
    pref.record("language", "zh-CN")
    pref.record("style", "concise")
    pref.record("tone", "friendly")

    # 多次访问 language，提升其频次
    pref.lookup("language")
    pref.lookup("language")

    # 再插入一条，capacity=3 触发淘汰
    # 此时 style/tone 频次为 1，language 频次为 3
    # min_freq=1 的链表中 style 最先插入，会被淘汰
    pref.record("format", "markdown")

    print(pref.lookup("style"))     # None，被淘汰
    print(pref.lookup("language"))  # "zh-CN"，保留
```

---

## 三、摘要压缩算法

### 3.1 原理与核心思想

当对话持续很多轮，总 token 数会超过 LLM 的上下文窗口。直接丢掉早期消息又会丢失关键信息（比如用户一开始设定的目标、提到的约束条件）。**摘要压缩**的核心思想是：把较早的若干轮对话用 LLM 总结成一段简短的摘要，用几百个 token 表达原本几千 token 的内容，从而在保留关键信息的同时腾出上下文空间。

围绕这个思想，工业界演化出三种主要做法：

1. **滑动窗口 + 摘要**：保留最近 N 轮原始消息，超过 N 的部分滚动地合并成一段摘要，摘要随着对话推进不断更新。
2. **分层摘要（Hierarchical Summarization）**：把对话按块切分，每块生成一段摘要；当摘要数量过多时，再对这些摘要生成更高一层的摘要，形成树状结构。
3. **Token 预算控制**：给定一个总 token 预算，动态决定保留多少原始消息、多少摘要、多少从向量库召回的历史片段，使总 token 不超限。

这三种做法通常组合使用：滑动窗口保证近期上下文精确，分层摘要保证长程信息不丢，token 预算保证不超限。

### 3.2 关键数据结构与公式

#### 3.2.1 滑动窗口 + 摘要

设原始消息序列为 `M = [m_1, m_2, ..., m_n]`，窗口大小为 `W`，摘要触发阈值为 `W + k`（即当消息数超过 `W + k` 时触发一次摘要）。

```
when len(M) > W + k:
    to_summarize = M[0 : k]            # 取最早的 k 条
    summary = LLM_summarize(current_summary, to_summarize)
    M = [summary_message] + M[k:]      # 用摘要替换这 k 条
```

最终送给 LLM 的上下文是 `[summary, m_{n-W+1}, ..., m_n]`，长度约为 `len(summary) + W`。

#### 3.2.2 分层摘要

设每层最多保留 `B` 个块，每个块最多 `C` 条消息：

- 第 0 层：原始消息按 `C` 条一组切块，每块生成一段第 1 层摘要。
- 第 1 层：当第 1 层摘要数量超过 `B` 时，每 `B` 段摘要合并生成一段第 2 层摘要。
- 以此类推，形成高度约 `log_B(n)` 的树。

检索时可以自顶向下逐层展开需要的部分，做到对数级别的定位。

#### 3.2.3 Token 预算控制

设总预算为 `T`，需要分配给三部分：

```
T = T_recent + T_summary + T_retrieved
```

其中：

- `T_recent`：最近 W 轮原始消息，约 `W * avg_tokens_per_turn`。
- `T_summary`：当前摘要的 token 数。
- `T_retrieved`：从向量库召回的 top-k 相关历史片段。

一种简单的动态分配策略：

```
T_retrieved = min(k * avg_chunk_tokens, T * 0.3)
T_recent    = min(W * avg_turn_tokens,  T * 0.5)
T_summary   = T - T_recent - T_retrieved
```

更精细的做法是把这三部分看作一个背包问题，按"每 token 的信息价值"排序分配，但工程上简单的比例分配通常已经够用。

### 3.3 复杂度分析

| 操作 | 时间复杂度 | 空间复杂度 |
|------|-----------|-----------|
| 单次摘要触发（滑动窗口） | O(k)（k 条消息送入 LLM） | O(W + len(summary)) |
| 分层摘要插入一条新消息 | O(log n) 次摘要调用（最坏情况） | O(n) 总计，但树高 O(log n) |
| Token 预算计算 | O(1) | O(1) |

注意摘要的"时间"主要是 LLM 调用耗时，而不是 CPU 计算。因此工程上通常把摘要做成**异步任务**：达到阈值时不立即阻塞对话，而是后台触发摘要，完成后原子替换上下文。

### 3.4 Agent 开发中的应用场景

1. **长对话压缩**：客服 Agent 与用户持续对话几十轮，靠滑动窗口 + 摘要把历史压在 token 预算内。
2. **多会话记忆延续**：一个用户跨多次会话与 Agent 交互，每次会话结束时生成一份会话摘要，下次会话开始时把摘要作为上下文注入。
3. **任务轨迹压缩**：长任务（比如 ReAct 多步推理）中，把前若干步的"思考-行动-观察"三元组摘要成"目前已完成 X、待完成 Y"，避免轨迹过长。
4. **RAG 上下文拼接**：检索回来的多个文档片段本身可能很长，先对每个片段生成短摘要，按摘要做二次筛选后再展开原文。

### 3.5 Python 示例

#### 3.5.1 滑动窗口 + 摘要

```python
from typing import List, Optional


class SlidingWindowSummarizer:
    """
    保留最近 W 条原始消息，超过阈值时把最早的一批合并成摘要。
    """

    def __init__(
        self,
        window_size: int = 10,
        summarize_batch: int = 5,
        summarizer=None,  # callable(text) -> str
    ):
        self.window_size = window_size       # 保留的原始消息数
        self.summarize_batch = summarize_batch  # 每次摘要合并几条
        self.summarizer = summarizer or self._dummy_summarizer
        self.summary: Optional[str] = None
        self.messages: List[str] = []

    @staticmethod
    def _dummy_summarizer(text: str) -> str:
        """占位：实际中替换成调用 LLM"""
        return f"[摘要] {text[:60]}..."

    def add_message(self, msg: str):
        self.messages.append(msg)
        # 超过窗口 + 一批，触发摘要
        if len(self.messages) > self.window_size + self.summarize_batch:
            to_summarize = self.messages[: self.summarize_batch]
            combined = "\n".join(to_summarize)
            if self.summary:
                combined = f"已有摘要：{self.summary}\n新增内容：{combined}"
            self.summary = self.summarizer(combined)
            self.messages = self.messages[self.summarize_batch:]

    def build_context(self) -> str:
        parts = []
        if self.summary:
            parts.append(f"=== 历史摘要 ===\n{self.summary}")
        if self.messages:
            parts.append("=== 近期对话 ===\n" + "\n".join(self.messages))
        return "\n\n".join(parts)


if __name__ == "__main__":
    sw = SlidingWindowSummarizer(window_size=3, summarize_batch=2)
    for i, msg in enumerate([
        "用户：帮我规划北京三日游",
        "Agent：好的，第一天故宫...",
        "用户：第二天想去长城",
        "Agent：第二天长城，建议早出发...",
        "用户：第三天呢",
        "Agent：第三天颐和园...",
        "用户：需要带什么",
        "Agent：建议带防晒和舒适鞋子...",
    ]):
        sw.add_message(msg)

    print(sw.build_context())
    # 输出会包含"历史摘要"（前几轮的压缩）+ "近期对话"（最近 3 条左右）
```

#### 3.5.2 分层摘要

```python
class HierarchicalSummarizer:
    """
    分层摘要：每层最多保留 B 个块，超过则向上合并生成更高层摘要。
    """

    def __init__(self, block_size: int = 5, max_blocks_per_level: int = 4, summarizer=None):
        self.block_size = block_size
        self.max_blocks = max_blocks_per_level
        self.summarizer = summarizer or (lambda x: f"[L? {x[:30]}...]")
        # levels[0] 是原始块摘要，levels[1] 是更高层，以此类推
        self.levels: List[List[str]] = [[]]

    def add_message(self, msg: str):
        # 简化：把每条消息当作一个块
        self.levels[0].append(msg)
        self._compact()

    def _compact(self):
        level = 0
        while level < len(self.levels) and len(self.levels[level]) > self.max_blocks:
            blocks = self.levels[level][: self.max_blocks]
            higher_summary = self.summarizer("\n".join(blocks))
            if level + 1 >= len(self.levels):
                self.levels.append([])
            self.levels[level + 1].append(higher_summary)
            self.levels[level] = self.levels[level][self.max_blocks:]
            level += 1

    def build_context(self) -> str:
        parts = []
        for i, level in enumerate(self.levels):
            if level:
                parts.append(f"=== 第 {i} 层摘要 ===\n" + "\n".join(level))
        return "\n\n".join(parts)


if __name__ == "__main__":
    hs = HierarchicalSummarizer(block_size=1, max_blocks_per_level=3)
    for i in range(10):
        hs.add_message(f"消息{i}：内容...")
    print(hs.build_context())
    # 会看到第 0 层有最近的几条，第 1 层是更早消息的摘要
```

#### 3.5.3 Token 预算控制

```python
class TokenBudgetAllocator:
    """
    按比例把 token 预算分配给：近期消息 / 摘要 / 检索片段。
    """

    def __init__(
        self,
        total_budget: int = 8000,
        recent_ratio: float = 0.5,
        retrieved_ratio: float = 0.3,
        # summary_ratio 默认 = 1 - recent - retrieved
    ):
        self.total = total_budget
        self.recent_ratio = recent_ratio
        self.retrieved_ratio = retrieved_ratio

    def allocate(self):
        t_recent = int(self.total * self.recent_ratio)
        t_retrieved = int(self.total * self.retrieved_ratio)
        t_summary = self.total - t_recent - t_retrieved
        return {
            "recent": t_recent,
            "summary": t_summary,
            "retrieved": t_retrieved,
        }

    def fit_recent(self, messages: List[str], avg_tokens_per_msg: int = 50) -> List[str]:
        """按近期预算裁剪消息列表"""
        budget = self.allocate()["recent"]
        max_msgs = budget // avg_tokens_per_msg
        return messages[-max_msgs:] if max_msgs > 0 else []


if __name__ == "__main__":
    alloc = TokenBudgetAllocator(total_budget=8000)
    print(alloc.allocate())
    # {'recent': 4000, 'summary': 1600, 'retrieved': 2400}
```

---

## 四、向量数据库写入/更新

### 4.1 原理与核心思想

长期记忆的核心是**向量数据库**：把每条需要长期保存的信息（一段对话摘要、一个用户偏好、一条知识）通过 embedding 模型转成向量，连同原文和元数据一起写入向量库；检索时把查询也转成向量，按相似度（通常是余弦相似度或内积）召回最相关的 top-k 条。

与普通数据库不同，向量库的核心难点在于"高维向量的近似最近邻搜索（ANN）"无法用传统的 B+ 树索引高效完成，需要专门的索引结构（HNSW、IVF-PQ 等）。因此写入和更新流程有一套独特的设计。

向量库写入/更新要回答四个关键问题：

1. **写入流程**：文本如何变成可检索的向量？
2. **更新策略**：当一条信息发生变化时，是追加新版本还是原地修改？
3. **删除与软删除**：如何处理过期或错误的信息？
4. **索引重建**：当数据量变化或索引参数需要调整时，如何在不中断服务的情况下重建索引？

### 4.2 关键数据结构与流程

#### 4.2.1 写入流程

```
写入一条记忆：
1. 文本预处理：清洗、切块（如果文本过长）
2. Embedding：调用 embedding 模型，文本 -> 向量 v ∈ R^d
3. 构造记录：{id, vector=v, text, metadata={user_id, timestamp, tags, ...}}
4. 写入向量库：插入到存储层，并更新 ANN 索引（HNSW/IVF 等）
5. （可选）写入关系型数据库：保存 id -> metadata 的映射，方便按元数据过滤
```

伪代码：

```python
def write_memory(text: str, metadata: dict):
    vec = embed(text)
    record = {
        "id": generate_id(),
        "vector": vec,
        "text": text,
        "metadata": metadata,
    }
    vector_db.insert(record)
    relational_db.insert(record["id"], metadata)
    return record["id"]
```

#### 4.2.2 更新策略

- **追加更新（Append-only）**：不修改原记录，写入一条新记录，标记 `version += 1`，并把旧记录标记为 `superseded_by = new_id`。优点是可审计、可回滚；缺点是存储膨胀，需要定期清理。
- **原地更新（In-place Update）**：直接修改原记录的 vector 和 text。优点是存储紧凑；缺点是 ANN 索引（特别是 HNSW 这类图索引）对原地更新支持不好，频繁更新会导致索引性能退化。

工程上通常采用**追加 + 异步合并**：平时追加写入保证性能，后台任务定期把同一逻辑 id 的多个版本合并成一条，并重建受影响的索引片段。

#### 4.2.3 删除与软删除

- **软删除**：在 metadata 里加 `deleted=True` 标记，检索时过滤掉。优点是可恢复、对索引友好（不需要立即从图索引中摘除节点）；缺点是存储不立即释放。
- **硬删除**：从存储和索引中真正移除。对 HNSW 来说，摘除节点会破坏图结构，通常需要标记后等下次重建索引时才真正清理。

#### 4.2.4 索引重建机制

向量库的索引在以下情况下需要重建：

- 数据量增长到原索引参数不再适用（比如 IVF 的 `nlist` 需要调大）。
- 频繁更新导致图索引碎片化，查询召回率下降。
- 切换 embedding 模型（向量维度或语义空间变化）。

重建策略：

- **全量重建**：停服或切到副本，用全量数据重新构建索引。简单但有时间窗口。
- **双写切换（Blue-Green）**：新索引在后台构建，构建期间双写新旧两个索引，构建完成后原子切换读流量到新索引，最后下线旧索引。这是生产环境的主流做法。
- **增量重建**：对 HNSW 这类图索引，可以只重建受影响的子图，但实现复杂。

#### 4.2.5 主流向量库对比

| 向量库 | 索引算法 | 部署形态 | 更新支持 | 适用场景 |
|--------|---------|---------|---------|---------|
| **FAISS** | IVF-PQ、HNSW、Flat | 库（嵌入式） | 原地更新有限，通常需重建 | 单机、研究原型、离线检索 |
| **Milvus** | IVF-PQ、HNSW、DiskANN | 分布式服务 | 支持动态插入/删除，自动索引构建 | 大规模生产、多租户 |
| **Chroma** | HNSW | 嵌入式 / 轻量服务 | 支持动态更新 | 原型开发、轻量应用 |
| **Pinecone** | 专有（基于 FAISS/PSG） | 托管 SaaS | 支持向量更新（upsert） | 免运维、快速上线 |
| **Weaviate** | HNSW | 服务 | 支持动态更新，内置模块化 | 需要 GraphQL 接口、混合检索 |
| **Qdrant** | HNSW | 服务 | 支持动态更新，强过滤 | 注重过滤性能、Rust 实现 |

选型经验：

- **原型阶段**：Chroma 或 FAISS，零运维。
- **中等规模生产**：Qdrant 或 Weaviate，单机或小集群即可。
- **大规模生产**：Milvus，支持水平扩展和多副本。
- **不想运维**：Pinecone，托管服务按量付费。

### 4.3 复杂度分析

以 HNSW（最常用的图索引）为例：

| 操作 | 时间复杂度 | 说明 |
|------|-----------|------|
| 写入一条 | O(log n) | 在多层图中逐层插入 |
| 查询 top-k | O(log n) | 搜索复杂度与图高相关 |
| 原地更新一条 | O(log n) 摘除 + O(log n) 插入 | 但会导致图碎片化 |
| 全量索引重建 | O(n log n) | 全量插入 n 条 |
| 硬删除一条 | 标记 O(1)，实际清理延迟到重建 | 图索引不支持高效摘除 |

空间复杂度：HNSW 的索引额外开销约为 O(n * M)，其中 M 是每个节点的邻居数，典型值 16-48。

### 4.4 Agent 开发中的应用场景

1. **长期记忆存储**：把每次会话的摘要写入向量库，下次会话开始时按当前查询召回相关历史。
2. **用户画像**：从对话中抽取的偏好、事实（"用户是 Python 工程师""用户在北京"）写入向量库，按相似度召回注入 prompt。
3. **工具使用经验**：记录"某类问题用某个工具效果最好"的经验，未来遇到相似问题时召回。
4. **知识库检索（RAG）**：文档切块后写入向量库，Agent 回答问题时检索相关片段。
5. **错误案例库**：把历史上失败的工具调用记录下来，未来避免重复犯错。

### 4.5 Python 示例

#### 4.5.1 使用 Chroma 实现长期记忆

```python
import chromadb
from chromadb.utils import embedding_functions


class LongTermMemory:
    """
    基于 Chroma 的长期记忆：写入、检索、软删除、更新。
    """

    def __init__(self, collection_name: str = "agent_memory", persist_path: str = "./mem_db"):
        self.client = chromadb.PersistentClient(path=persist_path)
        # 使用默认的 embedding 函数（实际中可换成 OpenAI / bge 等）
        self.embed_fn = embedding_functions.DefaultEmbeddingFunction()
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            embedding_function=self.embed_fn,
            metadata={"hnsw:space": "cosine"},
        )

    def write(self, text: str, metadata: dict | None = None) -> str:
        """写入一条长期记忆"""
        import uuid
        mem_id = str(uuid.uuid4())
        self.collection.add(
            ids=[mem_id],
            documents=[text],
            metadatas=[{"deleted": False, **(metadata or {})}],
        )
        return mem_id

    def search(self, query: str, top_k: int = 5, user_id: str | None = None):
        """按语义相似度检索，自动过滤已软删除的"""
        where = {"deleted": False}
        if user_id:
            where["user_id"] = user_id
        results = self.collection.query(
            query_texts=[query],
            n_results=top_k,
            where=where,
        )
        return [
            {"id": rid, "text": doc, "metadata": meta, "distance": dist}
            for rid, doc, meta, dist in zip(
                results["ids"][0],
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0],
            )
        ]

    def soft_delete(self, mem_id: str):
        """软删除：标记 deleted=True，检索时自动过滤"""
        self.collection.update(
            ids=[mem_id],
            metadatas=[{"deleted": True}],
        )

    def upsert(self, mem_id: str, text: str, metadata: dict | None = None):
        """原地更新：修改已有记录的文本和元数据（向量会自动重算）"""
        self.collection.upsert(
            ids=[mem_id],
            documents=[text],
            metadatas=[{"deleted": False, **(metadata or {})}],
        )


if __name__ == "__main__":
    mem = LongTermMemory()

    # 写入几条记忆
    mid1 = mem.write("用户是 Python 工程师，偏好简洁代码", {"user_id": "u1", "tags": "profile"})
    mid2 = mem.write("用户在北京，时区 UTC+8", {"user_id": "u1", "tags": "profile"})
    mid3 = mem.write("上次会话讨论了 Agent 记忆系统设计", {"user_id": "u1", "tags": "session_summary"})

    # 检索
    for hit in mem.search("用户的技术背景", top_k=2, user_id="u1"):
        print(hit["text"], "| distance =", hit["distance"])

    # 更新
    mem.upsert(mid1, "用户是资深 Python 工程师，偏好简洁代码和类型注解", {"user_id": "u1", "tags": "profile"})

    # 软删除
    mem.soft_delete(mid3)
    print(mem.search("上次讨论了什么", top_k=2, user_id="u1"))
    # mid3 不会出现在结果中
```

#### 4.5.2 追加 + 异步合并的更新策略

```python
import time
from typing import Dict, List


class VersionedMemory:
    """
    追加写入 + 后台合并：同一逻辑 id 可有多个版本，查询时只返回最新版。
    """

    def __init__(self, backend: "LongTermMemory"):
        self.backend = backend
        # logical_id -> [physical_id, physical_id, ...]
        self.versions: Dict[str, List[str]] = {}

    def write_new(self, logical_id: str, text: str, metadata: dict | None = None):
        """追加一个新版本，旧版本软删除"""
        if logical_id in self.versions:
            for old_pid in self.versions[logical_id]:
                self.backend.soft_delete(old_pid)
        new_pid = self.backend.write(text, {"logical_id": logical_id, **(metadata or {})})
        self.versions[logical_id] = [new_pid]
        return new_pid

    def search(self, query: str, top_k: int = 5):
        return self.backend.search(query, top_k=top_k)


# 使用示例
# vm = VersionedMemory(LongTermMemory())
# vm.write_new("user_profile", "用户是 Python 工程师")
# vm.write_new("user_profile", "用户是资深 Python 工程师，偏好类型注解")  # 旧版自动软删除
```

---

## 五、三层记忆架构的协同

把前面四个算法组合起来，就构成了 Agent 的三层记忆系统。下面用一个统一的示例展示它们如何协同工作。

```python
class AgentMemorySystem:
    """
    三层记忆协同：
    - 短期：LRU 管理最近 W 轮原始消息
    - 中期：滑动窗口 + 摘要压缩
    - 长期：向量库存储跨会话记忆
    """

    def __init__(
        self,
        short_term_capacity: int = 20,
        window_size: int = 10,
        summarize_batch: int = 5,
        long_term_db_path: str = "./agent_mem",
    ):
        self.short_term = LRUCache(short_term_capacity)
        self.summarizer = SlidingWindowSummarizer(
            window_size=window_size,
            summarize_batch=summarize_batch,
        )
        self.long_term = LongTermMemory(persist_path=long_term_db_path)
        self.turn_counter = 0

    def add_user_message(self, text: str, user_id: str):
        self.turn_counter += 1
        self.short_term.put(self.turn_counter, ("user", text))
        self.summarizer.add_message(f"用户：{text}")

    def add_agent_message(self, text: str):
        self.turn_counter += 1
        self.short_term.put(self.turn_counter, ("agent", text))
        self.summarizer.add_message(f"Agent：{text}")

    def build_prompt_context(self, query: str, user_id: str, token_budget: int = 8000):
        # 1. 从长期记忆召回相关历史
        allocator = TokenBudgetAllocator(total_budget=token_budget)
        budget = allocator.allocate()
        retrieved = self.long_term.search(query, top_k=3, user_id=user_id)

        # 2. 中期记忆（摘要）
        summary_ctx = self.summarizer.summary or ""

        # 3. 短期记忆（最近几轮原文）
        recent = self.short_term.recent_messages(k=budget["recent"] // 50)
        recent_ctx = "\n".join(f"{role}：{msg}" for _, (role, msg) in recent)

        # 4. 拼装
        parts = []
        if retrieved:
            parts.append("=== 相关历史记忆 ===\n" + "\n".join(h["text"] for h in retrieved))
        if summary_ctx:
            parts.append(f"=== 会话摘要 ===\n{summary_ctx}")
        if recent_ctx:
            parts.append(f"=== 近期对话 ===\n{recent_ctx}")
        return "\n\n".join(parts)

    def persist_session_summary(self, user_id: str):
        """会话结束时把摘要写入长期记忆"""
        if self.summarizer.summary:
            self.long_term.write(
                self.summarizer.summary,
                {"user_id": user_id, "tags": "session_summary"},
            )


# 使用示例
# ams = AgentMemorySystem()
# ams.add_user_message("帮我设计一个记忆系统", "u1")
# ams.add_agent_message("好的，可以从三层架构入手...")
# ctx = ams.build_prompt_context("记忆系统设计", "u1")
# ams.persist_session_summary("u1")
```

### 三层协同的要点

1. **写入流向**：原始消息先进短期记忆；短期满后摘要进中期记忆；会话结束时中期摘要落盘到长期记忆。
2. **读取流向**：每次构建 prompt 时，从长期记忆按语义召回相关片段，加上中期摘要，再加上短期原文，拼成完整上下文。
3. **淘汰与更新**：短期用 LRU 淘汰，中期用滑动窗口滚动摘要，长期用软删除 + 追加更新保留可审计性。
4. **Token 预算**：三层各自占多少 token 由预算分配器动态决定，保证总 token 不超过模型上下文窗口。

---

## 小结

本篇围绕 Agent 记忆系统的三层架构，讲解了四个核心算法：

- **LRU** 用哈希表 + 双向链表实现 O(1) 的短期记忆淘汰，适合管理会话窗口内的近期消息。Python 中既可以用 `functools.lru_cache` 快速缓存纯函数，也可以手写或用 `OrderedDict` 实现定制化逻辑。
- **LFU** 按访问频次淘汰，能识别长期热门数据，适合跨会话的偏好/知识缓存。与 LRU 不是互斥而是互补：短期看时间、长期看频次。
- **摘要压缩** 通过滑动窗口 + 分层摘要 + token 预算控制，把无限增长的对话压缩到有限的上下文窗口内。工程上要注意把摘要做成异步任务，避免阻塞对话。
- **向量数据库** 承担长期记忆的存储与检索，核心是 embedding 写入、ANN 索引、更新/删除策略和索引重建。选型上要根据规模和运维能力在 FAISS、Milvus、Chroma、Pinecone、Qdrant、Weaviate 之间权衡。

掌握这些算法之后，就能设计出一个具备**短期-中期-长期协同**的 Agent 记忆模块：既能记住当前会话的细节，又能压缩中期上下文，还能跨会话召回长期经验。下一篇将讲解多 Agent 协作中的博弈与共识算法。
