# 基础算法

## 本篇导读

本篇是 Agent 开发算法系列的第 1 篇，主题为"基础算法"。在进入 RAG、推理决策、多 Agent 协作等高级话题之前，我们需要先打牢算法地基。很多看似"古老"的经典算法，在今天的 Agent 系统中依然扮演着关键角色：知识图谱的遍历依赖 BFS/DFS，规划与路径决策依赖 A*，节点重要性评估依赖 PageRank，关键词检索依赖 Trie，候选去重依赖 SimHash/MinHash。理解这些算法的原理、复杂度和适用场景，能让你在面对 Agent 工程中的检索、规划、过滤等问题时，快速选出合适的工具，而不是把所有问题都塞给 LLM。

本篇覆盖四大类共 11 个算法：搜索算法（BFS、DFS、A*、启发式搜索）、图算法（Dijkstra、拓扑排序、PageRank）、字符串匹配（KMP、Trie）、排序与去重（Top-K、SimHash、MinHash）。每个算法均按"原理—公式/伪代码—复杂度—Agent 应用—示例"五段式展开，力求既能作为学习材料，也能作为工程选型参考。

---

## 一、搜索算法

搜索算法是 Agent 在显式或隐式状态空间中寻找解路径的基础。无论是知识图谱遍历、任务规划，还是 RAG 中的文档召回路径分析，本质上都是在某个图结构上做搜索。

### 1.1 BFS（广度优先搜索）

#### 原理与核心思想

BFS（Breadth-First Search）从起始节点出发，逐层向外扩展：先访问起点，再访问起点的所有直接邻居（第 1 层），然后是第 2 层，依此类推。它使用一个先进先出（FIFO）的队列保存待访问节点，并使用一个集合记录已访问节点以避免重复。BFS 的核心性质是：在无权图（或等权图）中，它第一次到达目标节点时所走的路径就是最短路径（边数最少）。这一性质使 BFS 在"最少步数"类问题中几乎总是首选。

#### 关键公式与伪代码

```
BFS(start, target):
    queue = [start]
    visited = {start}
    while queue 非空:
        node = queue.popleft()
        if node == target: return 路径
        for neighbor in neighbors(node):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
```

状态数随深度指数增长时，第 $k$ 层的节点数上界为 $b^k$（$b$ 为分支因子）。

#### 复杂度分析

- 时间复杂度：$O(V + E)$，其中 $V$ 为节点数，$E$ 为边数，每个节点和每条边最多被访问一次。
- 空间复杂度：$O(V)$，队列与 visited 集合最多存全部节点。
- 完备性：在有限分支图上是完备的（一定能找到解）。
- 最优性：在无权图上最优（找到步数最少的解）。

#### Agent 开发中的应用场景

1. **知识图谱的多跳问答**：用户提问"和某实体距离两跳的所有相关实体"，BFS 天然适合做 $k$ 跳邻域查询，用于限定深度的子图召回，再交给 LLM 做答案生成。
2. **工具调用的状态探索**：在 ReAct 循环中，若把每个"观察-行动"对视为一个状态节点，BFS 可用于在浅层工具组合空间中寻找最短的工具调用序列。
3. **对话流程的最短路径**：在对话状态机中，BFS 能找到从当前对话状态到目标状态所需的最少交互轮数。
4. **RAG 召回的广度控制**：对多源知识库做并行召回时，BFS 的"逐层扩展"思想对应"先召回直接相关，再扩展到间接相关"的分层召回策略。

#### 简单示例

```python
from collections import deque, defaultdict

def bfs(graph, start, target):
    """在无权图上寻找从 start 到 target 的最短路径（边数最少）。"""
    queue = deque([start])
    visited = {start}
    parent = {start: None}
    while queue:
        node = queue.popleft()
        if node == target:
            # 回溯路径
            path = []
            cur = node
            while cur is not None:
                path.append(cur)
                cur = parent[cur]
            return path[::-1]
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                parent[neighbor] = node
                queue.append(neighbor)
    return None  # 不可达

# 知识图谱示例：实体之间的关系图
kg = {
    "Agent":   ["LLM", "Tool", "Memory"],
    "LLM":     ["Prompt", "FineTune"],
    "Tool":    ["FunctionCall", "API"],
    "Memory":  ["VectorDB", "Context"],
    "API":     ["REST", "GraphQL"],
}

# 查询：Agent 到 REST 的最短关系链
print(bfs(kg, "Agent", "REST"))
# 输出: ['Agent', 'Tool', 'API', 'REST']
```

### 1.2 DFS（深度优先搜索）

#### 原理与核心思想

DFS（Depth-First Search）同样从起始节点出发，但优先沿着一条路径尽可能深入，直到走到死路或已访问节点，再回溯到上一个分叉点继续探索。它使用后进先出（LIFO）的栈（或递归调用栈）来管理待访问节点。与 BFS 的"逐层铺开"不同，DFS 的特点是"一条路走到黑"。在树或 DAG 上，DFS 常用于：检测环、拓扑排序、寻找所有路径、连通分量分析等。DFS 不保证最短路径，但空间开销在某些场景下比 BFS 小（只需保存当前路径）。

#### 关键公式与伪代码

```
DFS(start):
    stack = [start]
    visited = set()
    while stack 非空:
        node = stack.pop()
        if node in visited: continue
        visited.add(node)
        for neighbor in neighbors(node):
            if neighbor not in visited:
                stack.append(neighbor)
```

递归形式更简洁：

```
DFS(node, visited):
    visited.add(node)
    for neighbor in neighbors(node):
        if neighbor not in visited:
            DFS(neighbor, visited)
```

#### 复杂度分析

- 时间复杂度：$O(V + E)$，与 BFS 同阶。
- 空间复杂度：$O(V)$（显式栈），递归实现的空间为 $O(h)$，$h$ 为搜索树高度，最坏 $O(V)$。
- 完备性：在有限图上完备；在无限状态空间中可能陷入无限深度而不完备（除非加深度限制）。
- 最优性：不保证最优。

#### Agent 开发中的应用场景

1. **知识图谱的深度遍历与环检测**：在构建或更新知识图谱时，用 DFS 检测实体关系是否存在环，避免 Agent 在推理时陷入循环引用。
2. **任务分解树的遍历**：HTN（层次任务网络）分解出的任务树，用 DFS 做后序遍历可以自然地得到"先完成子任务再完成父任务"的执行顺序。
3. **工具调用链的回溯搜索**：当某个工具调用失败时，DFS 的回溯机制可以尝试同一层级的其他工具，适合"试错-回退"型 Agent。
4. **ReAct 的深度推理**：在树形思维（Tree of Thoughts）中，DFS 是最自然的遍历方式——沿一条推理链深入，遇阻则回溯到上一节点换思路。

#### 简单示例

```python
def dfs_paths(graph, start, target, path=None):
    """寻找从 start 到 target 的所有路径（DFS 回溯）。"""
    if path is None:
        path = [start]
    if start == target:
        yield list(path)
        return
    for node in graph.get(start, []):
        if node not in path:  # 避免环路
            path.append(node)
            yield from dfs_paths(graph, node, target, path)
            path.pop()  # 回溯

kg = {
    "Agent": ["LLM", "Tool"],
    "LLM":   ["Prompt", "VectorDB"],
    "Tool":  ["VectorDB", "API"],
    "Prompt": ["VectorDB"],
}

# 找出 Agent 到 VectorDB 的所有路径
for p in dfs_paths(kg, "Agent", "VectorDB"):
    print(p)
# ['Agent', 'LLM', 'Prompt', 'VectorDB']
# ['Agent', 'LLM', 'VectorDB']
# ['Agent', 'Tool', 'VectorDB']
```

### 1.3 A* 算法

#### 原理与核心思想

A* 是结合了 Dijkstra（代价优先）和贪心最佳优先（目标优先）的启发式搜索算法。它为每个节点 $n$ 维护一个评估函数：

$$f(n) = g(n) + h(n)$$

其中 $g(n)$ 是从起点到 $n$ 的实际代价，$h(n)$ 是从 $n$ 到目标的启发式估计（预估代价）。A* 每次从开放集中取出 $f(n)$ 最小的节点扩展。当 $h(n)$ 是可采纳的（admissible，即永不高估真实代价）且一致的（consistent）时，A* 保证找到最优解。A* 是 Agent 路径规划与状态空间搜索的核心算法——它在"探索（向目标走）"和"利用（走已知低代价路径）"之间做了平衡。

#### 关键公式与伪代码

$$f(n) = g(n) + h(n), \quad g(n) = \text{已知代价}, \quad h(n) = \text{启发式估计}$$

```
A*(start, goal):
    open = priority_queue([(f=start_h, start)])
    g = {start: 0}
    came_from = {}
    while open 非空:
        current = open.pop_min()  # 取 f 最小者
        if current == goal: return 重建路径(came_from, current)
        for neighbor, step_cost in neighbors(current):
            tentative_g = g[current] + step_cost
            if tentative_g < g.get(neighbor, inf):
                came_from[neighbor] = current
                g[neighbor] = tentative_g
                f = tentative_g + h(neighbor)
                open.push((f, neighbor))
```

常见的启发式函数：
- 网格地图的曼哈顿距离：$h = |x_1 - x_2| + |y_1 - y_2|$（仅四向移动可采纳）
- 欧氏距离：$h = \sqrt{(x_1-x_2)^2 + (y_1-y_2)^2}$（任意方向可采纳）
- 地图上有障碍时可用 Dijkstra 预计算 landmark 距离作为 $h$

#### 复杂度分析

- 时间复杂度：最坏 $O(b^d)$，$b$ 为分支因子，$d$ 为解深度；启发式越准确，实际扩展节点越少。
- 空间复杂度：$O(b^d)$，需保存开放集与已扩展节点，是 A* 的主要瓶颈。
- 当 $h(n) = 0$ 时退化为 Dijkstra；当 $h(n)$ 高估时退化为贪心最佳优先（不保证最优）。

#### Agent 开发中的应用场景

1. **Agent 任务规划**：把"任务状态"作为节点，"工具调用"作为边，$g$ 是已消耗的 token/时间成本，$h$ 是预估的完成距离（例如用 LLM 给出"还差几步"的估计）。A* 可以在状态空间中找到代价最小的执行路径。
2. **多步工具组合优化**：当多个工具组合都能完成同一目标时，A* 能根据每步的实际代价（API 延迟、token 消耗）和启发式估计选出总成本最低的组合。
3. **RAG 的检索路径决策**：在多跳检索中，每跳选择哪个数据源可视为状态转移，A* 结合启发式（如向量相似度估计）能高效找到高质量多跳证据链。
4. **具身 Agent 的物理路径规划**：机器人 Agent 在环境中导航时，A* 及其变种（如 D* Lite、JPS）是标配。

#### 简单示例

```python
import heapq

def astar(grid, start, goal):
    """
    在二维网格上用 A* 寻路。
    grid: 0 可通行, 1 障碍
    start, goal: (row, col)
    """
    rows, cols = len(grid), len(grid[0])
    # 曼哈顿距离作为启发式
    def h(a, b): return abs(a[0]-b[0]) + abs(a[1]-b[1])

    open_heap = [(h(start, goal), 0, start)]
    g = {start: 0}
    came_from = {}
    while open_heap:
        _, _, current = heapq.heappop(open_heap)
        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return path[::-1]
        r, c = current
        for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
            nr, nc = r+dr, c+dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0:
                tentative_g = g[current] + 1
                neighbor = (nr, nc)
                if tentative_g < g.get(neighbor, float('inf')):
                    came_from[neighbor] = current
                    g[neighbor] = tentative_g
                    f = tentative_g + h(neighbor, goal)
                    heapq.heappush(open_heap, (f, tentative_g, neighbor))
    return None  # 无路径

grid = [
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0],
]
print(astar(grid, (0,0), (4,4)))
# 输出: [(0,0), (0,1), (0,2), (0,3), (0,4), (1,4), (2,4), (3,4), (4,4)]
```

### 1.4 启发式搜索

#### 原理与核心思想

启发式搜索（Heuristic Search）是一个比 A* 更广的概念：任何利用问题领域知识（启发式信息）来引导搜索方向、减少盲目扩展的算法都属于此类。A* 是其中最著名的代表，但启发式搜索还包括：贪心最佳优先（Greedy Best-First Search，只用 $h(n)$）、IDA*（迭代加深 A*，用深度限制节省内存）、加权 A*（Weighted A*，$f = g + W \cdot h$，$W > 1$ 时牺牲最优性换取速度）、Beam Search（保留固定数量的最优候选）等。核心思想是：用经验性的"距离估计"代替盲目的逐层扩展，把搜索资源集中到最有希望的方向。

#### 关键公式与伪代码

加权 A* 的评估函数：

$$f(n) = g(n) + W \cdot h(n), \quad W \geq 1$$

$W$ 越大越偏向贪心（速度更快，可能次优）；$W = 1$ 即标准 A*；$W = 0$ 退化为 Dijkstra。

Beam Search（束宽 $k$）伪代码：

```
BeamSearch(start, k):
    beam = [start]
    while 未到终止层:
        candidates = []
        for state in beam:
            candidates.extend(expand(state))
        beam = top_k(candidates, k)  # 只保留评分最高的 k 个
    return beam 中最优者
```

#### 复杂度分析

- 贪心最佳优先：时间 $O(b^m)$（$m$ 为最大深度），但实际常远低于此；不保证最优。
- IDA*：时间 $O(b^d)$，空间 $O(d)$，适合内存受限场景。
- 加权 A*：时间通常远小于 A*，但解的代价最多是最优解的 $W$ 倍。
- Beam Search：每层 $O(k \cdot b)$，空间 $O(k)$；$k$ 越大越接近最优但越慢。

#### Agent 开发中的应用场景

1. **LLM 推理路径搜索**：Tree of Thoughts（ToT）本质上就是启发式搜索——用 LLM 自评作为 $h(n)$，在每个思维节点上选择最有希望的分支继续展开，而不是穷举所有思路。
2. **Beam Search 用于多步规划**：Agent 生成多步执行计划时，每步保留 top-$k$ 个候选方案（按 LLM 评分或启发式代价排序），最终从 $k$ 条完整计划中选最优，平衡了质量与计算量。
3. **工具选择中的贪心策略**：当工具空间巨大时，贪心最佳优先根据"工具描述与当前任务的相关度"快速锁定候选工具，避免对全量工具做精确评估。
4. **加权 A* 在实时 Agent 中**：对延迟敏感的 Agent（如对话机器人），用 $W > 1$ 的加权 A* 牺牲少量最优性换取更快的响应。

#### 简单示例

```python
import heapq

def beam_search(start, expand_fn, score_fn, depth, k):
    """
    通用 Beam Search 框架。
    expand_fn(state) -> [next_states]
    score_fn(state) -> 越大越好
    """
    beam = [(score_fn(start), start)]
    for _ in range(depth):
        candidates = []
        for _, state in beam:
            for nxt in expand_fn(state):
                candidates.append((score_fn(nxt), nxt))
        if not candidates:
            break
        # 保留评分最高的 k 个
        beam = heapq.nlargest(k, candidates, key=lambda x: x[0])
    return beam[0][1]  # 返回最优终态

# 示例：Agent 生成多步计划，每步从若干候选中选 top-2
def expand(plan):
    if len(plan) >= 3:
        return []
    # 模拟每步有 3 个候选动作
    return [plan + [a] for a in ["search", "call_tool", "summarize"]]

def score(plan):
    # 简化评分：步数越少越好，"summarize" 作为终态加分
    s = -len(plan) * 0.5
    if plan and plan[-1] == "summarize":
        s += 2
    return s

best = beam_search([], expand, score, depth=3, k=2)
print(best)
# 输出: ['search', 'summarize'] 或类似短计划
```

---

## 二、图算法

图算法处理节点与边构成的结构化关系。Agent 系统中的知识图谱、工具依赖图、对话状态转移图都是图结构，图算法是分析与推理的基础工具。

### 2.1 最短路径（Dijkstra 算法）

#### 原理与核心思想

Dijkstra 算法求解单源最短路径问题：给定一个边带非负权重的图和起点，求起点到所有其他节点的最短距离。它维护一个已确定最短距离的集合 $S$ 和一个待确定集合，每轮从未确定节点中选出距离最小的纳入 $S$，并用它去松弛（relax）其邻居的距离估计。这一"贪心扩展"之所以正确，依赖于边权非负的前提——否则可能存在一条经过负权边的更短路径被错过。当所有边权相等时，Dijkstra 退化为 BFS。

#### 关键公式与伪代码

松弛操作：

$$\text{if } g(u) + w(u, v) < g(v): \quad g(v) = g(u) + w(u, v)$$

```
Dijkstra(start):
    dist = {v: inf for v in G}; dist[start] = 0
    pq = [(0, start)]  # 优先队列按 dist 排序
    while pq 非空:
        d, u = pq.pop_min()
        if d > dist[u]: continue  # 过期条目
        for v, w in neighbors(u):
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                pq.push((dist[v], v))
    return dist
```

#### 复杂度分析

- 时间复杂度：用二叉堆的优先队列实现为 $O((V + E) \log V)$；用斐波那契堆可达 $O(E + V \log V)$。
- 空间复杂度：$O(V)$。
- 限制：不能处理负权边（需用 Bellman-Ford）。

#### Agent 开发中的应用场景

1. **知识图谱上的加权推理路径**：当实体间关系有不同置信度（边权），Dijkstra 能找到从用户问题实体到答案实体的"最高置信度路径"，用于可解释的多跳推理。
2. **工具调用代价最小化**：把每个工具的执行代价（延迟、token、费用）作为边权，Dijkstra 可在工具依赖图中找到总代价最小的调用序列。
3. **多源知识融合**：当同一问题需要多个数据源协作时，用 Dijkstra 规划数据流转的最短（最低成本）路径。
4. **对话状态的最优转移**：在带权对话状态图中，Dijkstra 能找到从当前状态到目标状态成本最低的对话策略。

#### 简单示例

```python
import heapq

def dijkstra(graph, start):
    """graph: {node: [(neighbor, weight), ...]}，返回起点到各节点最短距离。"""
    dist = {start: 0}
    pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist.get(u, float('inf')):
            continue
        for v, w in graph.get(u, []):
            nd = d + w
            if nd < dist.get(v, float('inf')):
                dist[v] = nd
                heapq.heappush(pq, (nd, v))
    return dist

# 工具调用依赖图：边权 = 调用代价（token 数）
tool_graph = {
    "Intent":   [("Retrieve", 50), ("Search", 80)],
    "Retrieve": [("Rerank", 100), ("Answer", 200)],
    "Search":   [("Rerank", 60)],
    "Rerank":   [("Answer", 30)],
}
print(dijkstra(tool_graph, "Intent"))
# {'Intent': 0, 'Retrieve': 50, 'Search': 80, 'Rerank': 140, 'Answer': 170}
# 说明：Intent -> Retrieve -> Rerank -> Answer 总代价 170，是最优路径
```

### 2.2 拓扑排序

#### 原理与核心思想

拓扑排序（Topological Sort）针对有向无环图（DAG），将所有节点排成一个线性序列，使得对每条有向边 $(u, v)$，$u$ 在序列中都出现在 $v$ 之前。它反映的是节点间的依赖/偏序关系：只有 $u$ 完成后才能开始 $v$。常见实现有两种：基于 DFS 的后序逆序，以及基于入度的 Kahn 算法（不断移除入度为 0 的节点）。拓扑排序是 DAG 调度的基础——只有图是 DAG 时排序才存在，若存在环则排序失败，这本身也是环检测的手段。

#### 关键公式与伪代码

Kahn 算法（基于入度）：

```
TopoSort(G):
    indegree = {v: 0 for v in G}
    for u in G:
        for v in G[u]: indegree[v] += 1
    queue = [v for v in G if indegree[v] == 0]
    order = []
    while queue 非空:
        u = queue.pop()
        order.append(u)
        for v in G[u]:
            indegree[v] -= 1
            if indegree[v] == 0: queue.append(v)
    if len(order) < |G|:  # 存在环
        raise Error("图中存在环")
    return order
```

#### 复杂度分析

- 时间复杂度：$O(V + E)$，每个节点入队出队一次，每条边在入度递减时处理一次。
- 空间复杂度：$O(V)$，存入度表和队列。
- 唯一性：DAG 的拓扑序不唯一；当且仅当图存在哈密顿路径时唯一。

#### Agent 开发中的应用场景

1. **多步 Agent 任务的执行编排**：当一个复杂任务被分解为多个有依赖关系的子任务（如"先检索再重排再生成"），拓扑排序给出合法的执行顺序，是 DAG 调度器（如 Airflow、LangGraph）的核心。
2. **工具依赖解析**：工具 A 的输出是工具 B 的输入，形成依赖 DAG。拓扑排序确定工具调用顺序，并能在编译期发现循环依赖（环）。
3. **知识图谱的分层处理**：本体（ontology）中的概念继承关系是 DAG，拓扑排序可按"父概念先于子概念"的顺序进行分层推理或批量物化。
4. **Prompt 模板的组合顺序**：当 Prompt 由多个可复用片段组合，且片段间有引用依赖时，拓扑排序决定拼接顺序。

#### 简单示例

```python
from collections import deque

def topo_sort(graph):
    """graph: {node: [successors]}，返回拓扑序列。"""
    indegree = {v: 0 for v in graph}
    for u in graph:
        for v in graph[u]:
            indegree[v] = indegree.get(v, 0) + 1
            indegree.setdefault(u, indegree[u])
    # 入度为 0 的节点入队
    queue = deque([v for v in indegree if indegree[v] == 0])
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in graph.get(u, []):
            indegree[v] -= 1
            if indegree[v] == 0:
                queue.append(v)
    if len(order) != len(indegree):
        raise ValueError("检测到环，无法拓扑排序")
    return order

# RAG 流水线依赖：retrieve -> rerank -> generate
pipeline = {
    "query_rewrite": ["retrieve_a", "retrieve_b"],
    "retrieve_a":    ["rerank"],
    "retrieve_b":    ["rerank"],
    "rerank":        ["generate"],
    "generate":      [],
}
print(topo_sort(pipeline))
# 输出: ['query_rewrite', 'retrieve_a', 'retrieve_b', 'rerank', 'generate']
```

### 2.3 PageRank

#### 原理与核心思想

PageRank 由 Google 创始人 Brin 和 Page 提出，用于衡量网页重要性。其核心假设是：一个节点的重要性等于所有指向它的节点"传递"过来的重要性之和，且每个节点将其重要性均分给它指向的所有邻居。直观上，被重要节点指向的节点也重要。PageRank 引入阻尼系数 $d$（通常 0.85），表示用户有 $d$ 的概率沿链接浏览、$1-d$ 的概率随机跳转到任意页面——这保证了即使存在悬挂节点（无出链）或连通性问题，算法也能收敛。

#### 关键公式与伪代码

迭代公式：

$$PR(p_i) = \frac{1-d}{N} + d \sum_{p_j \in M(p_i)} \frac{PR(p_j)}{L(p_j)}$$

其中 $N$ 是节点总数，$M(p_i)$ 是指向 $p_i$ 的节点集合，$L(p_j)$ 是 $p_j$ 的出链数，$d$ 是阻尼系数。迭代直至收敛（$\sum_i |PR^{(t+1)}(p_i) - PR^{(t)}(p_i)| < \epsilon$）。

```
PageRank(G, d=0.85, iters=100):
    N = |G|
    PR = {v: 1/N for v in G}
    for _ in range(iters):
        new_PR = {v: (1-d)/N for v in G}
        for u in G:
            for v in G[u]:
                new_PR[v] += d * PR[u] / out_degree(u)
        if 收敛: break
        PR = new_PR
    return PR
```

#### 复杂度分析

- 时间复杂度：每次迭代 $O(V + E)$，总迭代次数通常 50–100 次收敛。
- 空间复杂度：$O(V + E)$。
- 收敛性：在强连通且非周期图上保证收敛；阻尼系数保证任意有向图收敛。

#### Agent 开发中的应用场景

1. **知识图谱节点重要性排序**：对大规模知识图谱跑 PageRank，识别"枢纽实体"——这些实体往往是高频被引用的核心概念，Agent 检索时应优先召回或作为推理锚点。
2. **RAG 文档权重计算**：文档间的引用/链接关系构成图，PageRank 给出文档的全局权威性，可作为召回时与向量相似度相乘的先验权重。
3. **工具/MCP 服务可信度评估**：工具间若存在"调用链"关系，PageRank 可识别被广泛依赖的核心工具，用于路由优先级和故障影响分析。
4. **对话实体显著性**：在多轮对话中，用实体共现关系建图并跑 PageRank，能找出对话中"话题中心"实体，指导上下文压缩时保留哪些实体。

#### 简单示例

```python
def pagerank(graph, d=0.85, iters=100, tol=1e-6):
    """
    graph: {node: [out_neighbors]}
    返回各节点的 PageRank 值。
    """
    nodes = set(graph.keys())
    for u in graph:
        for v in graph[u]:
            nodes.add(v)
    N = len(nodes)
    out_deg = {u: len(graph.get(u, [])) for u in nodes}
    PR = {v: 1 / N for v in nodes}

    for _ in range(iters):
        new_PR = {v: (1 - d) / N for v in nodes}
        # 处理悬挂节点（无出链）：其 PR 均分给所有节点
        dangling = sum(PR[u] for u in nodes if out_deg[u] == 0)
        for v in nodes:
            new_PR[v] += d * dangling / N
        for u in nodes:
            if out_deg[u] > 0:
                for v in graph.get(u, []):
                    new_PR[v] += d * PR[u] / out_deg[u]
        if sum(abs(new_PR[v] - PR[v]) for v in nodes) < tol:
            break
        PR = new_PR
    return PR

# 知识图谱：实体间的引用关系
kg = {
    "Agent":    ["LLM", "RAG", "Tool"],
    "LLM":      ["Agent", "Transformer"],
    "RAG":      ["Agent", "VectorDB"],
    "Tool":     ["Agent"],
    "VectorDB": ["RAG"],
    "Transformer": ["LLM"],
}
pr = pagerank(kg)
for entity, score in sorted(pr.items(), key=lambda x: -x[1]):
    print(f"{entity}: {score:.4f}")
# Agent 作为枢纽实体，PageRank 最高，检索时应优先关注
```

---

## 三、字符串匹配

字符串匹配算法在 Agent 中虽不如向量检索"时髦"，但在关键词召回、意图分类、敏感词过滤、工具名匹配等场景中仍是最高效、最可解释的手段。

### 3.1 KMP 算法

#### 原理与核心思想

KMP（Knuth-Morris-Pratt）算法解决的是：在长文本 $T$ 中查找模式串 $P$ 的所有出现位置。朴素做法在失配时把文本指针回退一位、模式指针归零，最坏 $O(|T| \cdot |P|)$。KMP 的关键洞察是：模式串自身的结构蕴含了失配后该跳到哪里的信息——通过预处理出一张"部分匹配表"（next 数组，也称失败函数/前缀函数），在失配时模式指针可以"智能回跳"到已有匹配的最长真前缀位置，而文本指针永不回退。这使得总比较次数线性于文本长度。

#### 关键公式与伪代码

next 数组定义：$next[i]$ 为 $P[0..i]$ 的最长相等真前缀与真后缀长度。

$$next[i] = \max\{k \mid P[0..k-1] = P[i-k+1..i],\ 0 \leq k < i\}$$

```
BuildNext(P):
    next = [0] * len(P)
    k = 0
    for i in 1..len(P)-1:
        while k > 0 and P[i] != P[k]: k = next[k-1]
        if P[i] == P[k]: k += 1
        next[i] = k
    return next

KMP(T, P):
    next = BuildNext(P)
    matches = []
    k = 0
    for i in 0..len(T)-1:
        while k > 0 and T[i] != P[k]: k = next[k-1]
        if T[i] == P[k]: k += 1
        if k == len(P):
            matches.append(i - len(P) + 1)
            k = next[k-1]
    return matches
```

#### 复杂度分析

- 预处理（建 next 数组）：$O(|P|)$ 时间与空间。
- 匹配：$O(|T|)$，文本指针只前进不回退。
- 总计：$O(|T| + |P|)$，远优于朴素法的 $O(|T| \cdot |P|)$。

#### Agent 开发中的应用场景

1. **敏感词/合规过滤**：Agent 输出在送回用户前，需经过敏感词过滤。KMP 对大规模敏感词表（用多模式版本 Aho-Corasick 更佳，KMP 是其基础）能在线性时间内完成扫描，是内容安全防线的常用算法。
2. **工具名与参数的精确匹配**：当用户输入包含工具全名或固定指令时，KMP 能快速定位，比正则更可控、比向量检索更精确，适合"硬规则"型路由。
3. **Prompt 模板中的占位符替换**：在模板里查找 `{{slot}}` 等占位符并替换为实际值，KMP 可高效完成多次匹配。
4. **日志与轨迹分析**：在 Agent 执行轨迹中查找特定的错误模式串（如某异常堆栈特征），KMP 适合做流式扫描。

#### 简单示例

```python
def build_next(p):
    """构建 KMP 的 next 数组（部分匹配表）。"""
    nxt = [0] * len(p)
    k = 0
    for i in range(1, len(p)):
        while k > 0 and p[i] != p[k]:
            k = nxt[k - 1]
        if p[i] == p[k]:
            k += 1
        nxt[i] = k
    return nxt

def kmp_search(text, pattern):
    """返回 pattern 在 text 中所有出现位置的起始下标。"""
    if not pattern:
        return []
    nxt = build_next(pattern)
    matches = []
    k = 0
    for i in range(len(text)):
        while k > 0 and text[i] != pattern[k]:
            k = nxt[k - 1]
        if text[i] == pattern[k]:
            k += 1
        if k == len(pattern):
            matches.append(i - len(pattern) + 1)
            k = nxt[k - 1]
    return matches

# 在 Agent 输出中检测敏感词
agent_output = "请访问 http://malicious.example.com 获取更多信息"
pattern = "malicious.example.com"
positions = kmp_search(agent_output, pattern)
print(f"敏感词位置: {positions}")  # [13]
```

### 3.2 Trie 树

#### 原理与核心思想

Trie（前缀树/字典树）是一种专门处理字符串集合的树形结构：根节点为空，每条边代表一个字符，从根到某节点的路径拼成一个字符串。共享前缀的字符串在 Trie 中共享同一段路径，这使得"前缀匹配"和"全词匹配"都能在 $O(L)$ 时间内完成（$L$ 为查询串长度），与词表大小无关。Trie 的核心优势是前缀共享带来的空间效率，以及对"以某前缀开头的所有词"这类查询的高效支持。变种包括压缩 Trie（Patricia/Radix Tree，合并单链路）、后缀树、双数组 Trie（用两个一维数组紧凑编码，工程上常用）。

#### 关键公式与伪代码

```
Trie:
    root = Node()  # 每个节点有 children: dict 和 is_end: bool

Insert(word):
    node = root
    for ch in word:
        if ch not in node.children:
            node.children[ch] = Node()
        node = node.children[ch]
    node.is_end = True

Search(word):
    node = root
    for ch in word:
        if ch not in node.children: return False
        node = node.children[ch]
    return node.is_end

StartsWith(prefix):
    # 同 Search 但返回是否到达（不要求 is_end）
    node = root
    for ch in prefix:
        if ch not in node.children: return False
        node = node.children[ch]
    return True
```

#### 复杂度分析

- 插入/查找/前缀查询：$O(L)$，$L$ 为字符串长度，与词表规模无关。
- 空间：$O(\sum_i |s_i|)$ 最坏情况下无共享前缀；实际共享越多越省。
- 相比哈希表：哈希表查找也是 $O(L)$（算哈希）但不支持前缀查询；Trie 是前缀查询的最优结构之一。

#### Agent 开发中的应用场景

1. **关键词检索与召回**：传统 BM25/倒排索引用于长文召回，而 Trie 适合"用户输入前缀即给候选"的实时搜索框、工具名补全、命令自动补全等交互场景。
2. **意图分类的规则匹配**：把每条意图的关键词/模板插入 Trie，用户输入流式扫描 Trie 即可高效判断命中哪些意图，是轻量级意图路由的利器。
3. **多模式敏感词匹配**：把所有敏感词建成一棵 Trie（或 AC 自动机），扫描文本时可在一次遍历中找出全部命中的敏感词，远优于对每个词单独 KMP。
4. **工具/技能名称的快速路由**：Agent 注册大量工具时，用 Trie 按工具名前缀做一级路由，缩小候选集再交给语义匹配，兼顾速度与准确率。

#### 简单示例

```python
class TrieNode:
    __slots__ = ("children", "is_end")
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.is_end

    def starts_with(self, prefix):
        return self._walk(prefix) is not None

    def _walk(self, s):
        node = self.root
        for ch in s:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node

    def suggest(self, prefix):
        """返回所有以 prefix 开头的词（前缀补全）。"""
        node = self._walk(prefix)
        results = []
        if not node:
            return results
        self._dfs(node, prefix, results)
        return results

    def _dfs(self, node, path, results):
        if node.is_end:
            results.append(path)
        for ch, child in node.children.items():
            self._dfs(child, path + ch, results)

# 工具名自动补全
trie = Trie()
for tool in ["search_web", "search_docs", "search_code",
             "send_email", "summarize"]:
    trie.insert(tool)

print(trie.suggest("search"))
# ['search_web', 'search_docs', 'search_code']
print(trie.search("send_email"))   # True
print(trie.starts_with("summ"))    # True
```

---

## 四、排序与去重

在海量候选场景下（召回结果、工具候选、生成样本），排序与去重是控制成本、提升质量的关键。Top-K 选最重要的，SimHash/MinHash 去除相似冗余。

### 4.1 Top-K 算法

#### 原理与核心思想

Top-K 问题：从 $N$ 个元素中选出最大（或最小）的 $K$ 个。朴素做法是全部排序后取前 $K$，$O(N \log N)$；但当 $K \ll N$ 时可以更优。最常用的方法是维护一个大小为 $K$ 的最小堆：遍历每个元素，若堆未满直接入堆，若堆满且当前元素大于堆顶则替换堆顶并下沉。这样堆中始终保存已见过的最大的 $K$ 个元素。最终堆顶就是第 $K$ 大。该方法只需 $O(N \log K)$ 时间和 $O(K)$ 空间，尤其适合流式数据（无法全部载入内存）和实时排序场景。另一思路是 Quickselect（快速选择），基于快排的 partition，平均 $O(N)$ 但需随机访问全部数据。

#### 关键公式与伪代码

最小堆法：

```
TopK(stream, k):
    heap = []  # 最小堆，大小 k
    for x in stream:
        if len(heap) < k:
            heappush(heap, x)
        elif x > heap[0]:
            heapreplace(heap, x)  # 弹出堆顶，压入 x
    return sorted(heap, reverse=True)  # 从大到小
```

#### 复杂度分析

- 时间：堆方法 $O(N \log K)$；Quickselect 平均 $O(N)$，最坏 $O(N^2)$（可用中位数优化到最坏 $O(N)$）。
- 空间：堆方法 $O(K)$；Quickselect $O(1)$ 额外空间（原地）。
- 流式适用性：堆方法天然支持流式数据，Quickselect 需要全部数据就绪。

#### Agent 开发中的应用场景

1. **RAG 召回结果的截断**：向量检索常返回 top-100 候选，但 LLM 上下文有限，用 Top-K（结合 rerank 分数）只保留最相关的 5–10 条，是 RAG 标准流程的关键一环。
2. **工具/技能路由的候选筛选**：当注册工具很多时，先按 embedding 相似度做 top-K 粗筛（如 top-5），再让 LLM 在小集合上精确决策，既省 token 又保准确率。
3. **多步规划的候选保留**：Beam Search 每一步本质上就是做 Top-K——从当前所有扩展候选中保留评分最高的 $K$ 条路径。
4. **日志/轨迹的异常排序**：从海量 Agent 执行轨迹中按异常分数取 top-K，优先人工复核最可疑的案例。

#### 简单示例

```python
import heapq

def top_k(stream, k):
    """用最小堆从流式数据中选出最大的 k 个（降序返回）。"""
    heap = []
    for x in stream:
        if len(heap) < k:
            heapq.heappush(heap, x)
        elif x > heap[0]:
            heapq.heapreplace(heap, x)
    return sorted(heap, reverse=True)

# RAG 场景：从 100 条召回结果（按相关度评分）中取 top-5
scores = [0.12, 0.87, 0.45, 0.91, 0.33, 0.78, 0.95, 0.61, 0.84, 0.29,
          0.55, 0.73, 0.88, 0.40, 0.67, 0.82, 0.50, 0.71, 0.93, 0.36]
# ... 模拟更多
import random
scores += [random.random() for _ in range(80)]

top5 = top_k(scores, 5)
print("Top-5 相关度:", [round(s, 3) for s in top5])
# 输出示例: Top-5 相关度: [0.97, 0.95, 0.93, 0.91, 0.89]
```

### 4.2 SimHash

#### 原理与核心思想

SimHash 由 Charikar 提出，是一种局部敏感哈希（LSH）算法，用于快速估计两个文档的相似度并支持海量去重。与传统哈希（追求雪崩效应，输入微小变化导致输出完全不同）相反，SimHash 是"局部敏感"的：相似输入产生相似的哈希值。其流程是：对文档中的每个特征（词/词组）计算一个普通哈希（$k$ 位 0/1 串）并赋予权重，然后按位累加——哈希位为 1 则加权重、为 0 则减权重，得到一个 $k$ 维整数向量；最终每一位按符号二值化（正为 1，负为 0）得到 $k$ 位 SimHash 指纹。两篇文档的相似度可用其 SimHash 的汉明距离衡量：距离越小越相似，通常认为 64 位指纹汉明距离 $\leq 3$ 即近似重复。

#### 关键公式与伪代码

设特征集合为 $\{(f_i, w_i)\}$，$h(f_i)$ 为 $k$ 位哈希：

$$V_j = \sum_i w_i \cdot \text{sign}(h(f_i)_j), \quad \text{sign}(1)=+1,\ \text{sign}(0)=-1$$

$$\text{SimHash}(x)_j = \begin{cases} 1, & V_j > 0 \\ 0, & V_j \leq 0 \end{cases}$$

相似度（汉明距离越小越相似）：

$$D(x, y) = \text{popcount}(\text{SimHash}(x) \oplus \text{SimHash}(y))$$

```
SimHash(features):  # features: [(token, weight)]
    V = [0] * k
    for token, w in features:
        h = hash(token) & ((1<<k) - 1)  # k 位
        for j in 0..k-1:
            V[j] += w if (h >> j) & 1 else -w
    fingerprint = 0
    for j in 0..k-1:
        if V[j] > 0:
            fingerprint |= (1 << j)
    return fingerprint
```

#### 复杂度分析

- 计算单文档指纹：$O(T \cdot k)$，$T$ 为特征数，$k$ 为位数（常取 64）。
- 比较两指纹：$O(1)$（一次异或 + popcount）。
- 海量去重：直接两两比较是 $O(N^2)$；工程上把 64 位指纹分成 4 段各 16 位建倒排索引，候选必在某一段完全相同，从而把比较降到近 $O(N)$。

#### Agent 开发中的应用场景

1. **召回结果去重**：RAG 多路召回（向量库 + BM25 + 知识图谱）常返回内容高度重叠的文档，用 SimHash 对文档正文建指纹，汉明距离小于阈值的判为重复，仅保留一条，避免 LLM 上下文被冗余信息占满。
2. **对话历史去重**：长对话中用户可能反复问相似问题，用 SimHash 对历史问答去重，压缩上下文窗口。
3. **生成样本过滤**：在多候选生成（如 Beam Search 产出多条回复）时，用 SimHash 去除语义/文本高度相似的候选，增加最终选择多样性。
4. **网页/文档库去重**：构建 Agent 知识库时，入库前对全库做 SimHash 去重，避免重复文档污染检索结果和统计指标。

#### 简单示例

```python
import hashlib

def tokenize(text):
    # 简化：按字符 bigram，中文场景常用
    return [text[i:i+2] for i in range(len(text) - 1)]

def simhash(text, k=64):
    """计算文本的 k 位 SimHash 指纹。"""
    V = [0] * k
    for token in tokenize(text):
        h = int(hashlib.md5(token.encode()).hexdigest(), 16)
        w = 1  # 简化等权；实际可用 TF-IDF
        for j in range(k):
            V[j] += w if (h >> j) & 1 else -w
    fp = 0
    for j in range(k):
        if V[j] > 0:
            fp |= (1 << j)
    return fp

def hamming(a, b):
    return bin(a ^ b).count("1")

# Agent 召回文档去重
docs = [
    "如何使用 Agent 进行任务规划",
    "如何用 Agent 做任务规划",      # 与上句高度相似
    "向量数据库的选型对比",          # 完全不同
    "Agent 任务规划的实现方法",      # 与第 1 句较相似
]
fps = [simhash(d) for d in docs]

threshold = 10  # 汉明距离阈值
kept = []
for i, d in enumerate(docs):
    is_dup = any(hamming(fps[i], fps[j]) <= threshold for j in kept)
    if not is_dup:
        kept.append(i)

print("去重后保留:", [docs[i] for i in kept])
# 预期: 保留第 1、3 条（第 2、4 条被判为重复）
```

### 4.3 MinHash

#### 原理与核心思想

MinHash 由 Broder 提出，最初用于大规模网页去重，核心是估计两个集合的 Jaccard 相似度：

$$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$

直接计算需存储完整集合，开销大。MinHash 的巧妙之处在于：对集合 $A$ 应用一个随机排列 $\pi$，定义 $\text{minhash}_\pi(A) = \min_{a \in A} \pi(a)$（排列后最小的元素）。可以证明：

$$P(\text{minhash}_\pi(A) = \text{minhash}_\pi(B)) = J(A, B)$$

即"两集合 MinHash 相等的概率等于它们的 Jaccard 相似度"。于是用 $k$ 个独立的随机排列生成 $k$ 个 MinHash 值组成签名，两签名相等的比例就是 Jaccard 的无偏估计。配合 LSH（局部敏感哈希）分桶，可在海量集合中近线性时间找到相似对。与 SimHash 侧重整体文档相似度不同，MinHash 更适合"集合型"相似度（如 shingle 集合、用户行为集合）。

#### 关键公式与伪代码

签名生成：

$$\text{Sig}(A)[i] = \min_{a \in A} \pi_i(a), \quad i = 1, \dots, k$$

相似度估计：

$$\hat{J}(A, B) = \frac{1}{k} \sum_{i=1}^{k} \mathbb{1}[\text{Sig}(A)[i] = \text{Sig}(B)[i]]$$

```
MinHash(set, hash_fns):  # hash_fns: k 个哈希函数
    sig = [inf] * k
    for x in set:
        for i, h in enumerate(hash_fns):
            sig[i] = min(sig[i], h(x))
    return sig

EstimateJaccard(sigA, sigB):
    return sum(a == b for a, b in zip(sigA, sigB)) / len(sigA)
```

#### 复杂度分析

- 签名生成：$O(k \cdot |S|)$，$k$ 为哈希函数个数（常 100–200），$|S|$ 为集合大小。
- 估计相似度：$O(k)$。
- LSH 分桶找相似对：近 $O(N)$（取决于分桶策略），远优于 $O(N^2)$ 两两比较。
- 精度：$k$ 越大估计方差越小，标准差约 $O(1/\sqrt{k})$。

#### Agent 开发中的应用场景

1. **大规模文档/网页去重**：构建 Agent 知识库时，把每篇文档转为 shingle（$k$-gram）集合，用 MinHash + LSH 快速找出近似重复文档，是 SimHash 的互补方案——尤其当文档以"集合相似度"衡量更合适时（如用户查询集合、点击行为集合）。
2. **用户会话聚类**：把每个会话视为"提过的问题/访问过的工具"集合，MinHash 估计会话间相似度，用于会话聚类、用户画像、冷启动推荐。
3. **候选工具集去重**：多个 Agent 实例各自返回候选工具集，用 MinHash 快速判断哪些返回结果高度重叠，避免重复执行同一工具。
4. **RAG 多源召回融合**：不同数据源召回的文档集用 MinHash 估计重叠度，动态调整各源权重（重叠多则降权冗余源）。

#### 简单示例

```python
import random

def minhash_signature(s, k, seed=0):
    """对集合 s 生成 k 个 MinHash 值组成的签名。"""
    rnd = random.Random(seed)
    # 用 (a*x + b) mod P 形式的哈希函数族
    P = (1 << 61) - 1  # 梅森素数
    params = [(rnd.randint(1, P - 1), rnd.randint(0, P - 1)) for _ in range(k)]
    sig = [float('inf')] * k
    for x in s:
        hx = hash(x) & ((1 << 32) - 1)  # 把元素映射到整数域
        for i, (a, b) in enumerate(params):
            val = (a * hx + b) % P
            if val < sig[i]:
                sig[i] = val
    return sig

def estimate_jaccard(sig_a, sig_b):
    """由 MinHash 签名估计 Jaccard 相似度。"""
    return sum(a == b for a, b in zip(sig_a, sig_b)) / len(sig_a)

# 把文档转为 3-gram 字符集合
def shingles(text, k=3):
    return {text[i:i+k] for i in range(len(text) - k + 1)}

doc1 = "Agent 任务规划与执行"
doc2 = "Agent 任务规划与调度"   # 高度相似
doc3 = "向量数据库选型指南"      # 完全不同

s1 = shingles(doc1)
s2 = shingles(doc2)
s3 = shingles(doc3)

K = 128
sig1 = minhash_signature(s1, K)
sig2 = minhash_signature(s2, K)
sig3 = minhash_signature(s3, K)

print(f"doc1 vs doc2 估计 Jaccard: {estimate_jaccard(sig1, sig2):.3f}")  # 较高，如 0.6+
print(f"doc1 vs doc3 估计 Jaccard: {estimate_jaccard(sig1, sig3):.3f}")  # 接近 0
```

---

## 五、本篇小结

本篇覆盖了 Agent 开发中最常用的 11 个基础算法，它们虽然经典，但在今天的 LLM 时代依然是工程地基：

- **搜索算法**（BFS/DFS/A*/启发式搜索）解决"在状态空间中找路径"的问题。BFS 适合无权图的最短步数查询，DFS 适合深度遍历与回溯，A* 在有代价和目标估计时给出最优路径，启发式搜索（Beam Search、加权 A*）在延迟敏感场景下平衡质量与速度。在 Agent 中，它们支撑着知识图谱多跳问答、任务规划、工具调用链搜索、Tree of Thoughts 推理等核心能力。

- **图算法**（Dijkstra/拓扑排序/PageRank）处理结构化关系。Dijkstra 在加权图上找最低成本路径，拓扑排序给出 DAG 的合法执行顺序并检测环，PageRank 评估节点全局重要性。它们是知识图谱推理、流水线编排、文档/工具权威性评估的底层工具。

- **字符串匹配**（KMP/Trie）提供精确、可解释、低成本的匹配能力。KMP 做线性时间单模式匹配，Trie 支持前缀查询与多模式匹配。在敏感词过滤、工具名路由、意图规则匹配、命令补全等"硬规则"场景，它们比向量检索更可控。

- **排序与去重**（Top-K/SimHash/MinHash）控制成本、保证质量。Top-K 从海量候选中截断最相关的少数，SimHash 用局部敏感哈希做文档级近似去重，MinHash 估计集合型 Jaccard 相似度并配合 LSH 做海量去重。在 RAG 多路召回融合、上下文压缩、候选多样性保证中不可或缺。

一个实践建议：在面对 Agent 工程问题时，先判断它属于"搜索/规划""关系分析""精确匹配"还是"筛选/去重"中的哪一类，再从本篇工具箱中选取对应算法，往往比直接堆 LLM 调用更高效、更可解释、更可控。后续篇章将在此基础上进入 NLP/Embedding、RAG 全链路、推理决策等更贴近 LLM 的主题。

下一篇我们将进入 **NLP 与 Embedding 相关算法**，包括 Word2Vec、BERT Embedding、相似度计算、HNSW/IVF-PQ 向量检索等，这些是 RAG 与语义理解的地基。
