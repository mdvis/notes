# 05 - 规划与任务分解

## 本篇导读

在前面几篇中，我们讨论了 Agent 如何通过 ReAct、CoT、MCTS 等推理范式进行"思考"与"决策"。然而当 Agent 面对的不再是单步问答，而是"帮我重构这个模块并发布到测试环境""帮我调研某个赛道并产出竞品报告"这类动辄包含十几步、几十步操作的复杂任务时，单靠 LLM 的"一步一思"是远远不够的。原因有三：一是上下文窗口有限，长链条很容易遗忘初衷；二是步骤之间存在依赖与并行关系，串行执行既慢又易出错；三是缺乏可验证的中间状态，失败后难以定位与回滚。

解决这一类问题的关键，是把一个**模糊且庞大**的高层目标，逐层拆解为**清晰且可执行**的原子动作，并对这些动作之间的依赖、并行、顺序关系进行显式建模与调度。这正是经典人工智能中"规划（Planning）"领域的研究对象。本篇聚焦三类在 Agent 开发中最具落地价值的规划与任务分解技术：

- **HTN（层次任务网络）**：自顶向下、基于"方法"的任务分解框架，是当前 LangGraph、AutoGen 等多步 Agent 框架背后最直接的算法原型。
- **PDDL / 状态机**：基于形式化符号的规划方法，强调"状态-动作-前置/效果"的可验证建模，适合对正确性要求高、可解释性强的场景。
- **DAG 调度**：基于有向无环图的并行调度，是处理多步骤任务并行执行、缩短端到端时延、识别关键路径的核心手段。

掌握这三类算法后，你将能够把"一句话需求"转化为一张可执行、可调度、可观测的任务图，并通过代码落地为真正可运行的多步 Agent。本篇最后会给出一个把三者结合的简化示例，帮助建立整体认知。

---

## 一、HTN（层次任务网络，Hierarchical Task Network）

### 1.1 原理与核心思想

HTN（Hierarchical Task Network）是一种**自顶向下**的任务分解规划范式。它的核心思想可以用一句话概括：**不直接在"动作空间"里搜索解，而是通过"如何把高层任务展开成低层任务"的方法库，把一个抽象目标层层归约（reduction）为一组可直接执行的动作序列**。

这与人类解决复杂问题的方式高度一致。比如"做一顿晚饭"这个目标，我们并不会直接在一个包含"切菜、开火、倒油、放盐…"的巨大动作空间里搜索，而是先把它分解为"准备主食、准备荤菜、准备素菜、摆桌"几个子任务，再分别继续往下拆，直到落到"开火、倒油"这种可直接执行的原子动作。HTN 就是把这种"分层归约"的思考过程形式化。

HTN 与经典的状态空间搜索（如 STRIPS、A*）最大的区别在于：**搜索发生在"任务空间"而不是"动作空间"**。状态空间搜索需要从初始状态出发，在海量动作中试探哪一步能更接近目标，组合爆炸严重；而 HTN 通过预定义的"方法（Method）"库大幅缩减了分支因子——每一个复合任务只允许用有限几种方法去展开，搜索过程本质上是"在方法树上做选择"。这种把领域知识显式编码进规划器的做法，使得 HTN 在**结构化、可复用、领域明确**的任务上表现出极高的效率与可解释性，这也是它成为现代 Agent 任务分解算法原型的根本原因。

### 1.2 关键概念

HTN 的世界由四类对象构成：

1. **原子任务（Primitive Task / Action）**：可直接执行的动作，对应 Agent 中的一个工具调用或一次 LLM 调用。它具有**前提条件（precondition）**和**效果（effect）**，执行后会改变世界状态。
2. **复合任务（Compound Task / Abstract Task）**：抽象的高层任务，不能直接执行，必须通过某个"方法"展开为更细的子任务。例如"写一篇技术报告"就是复合任务。
3. **方法（Method）**：一个形如"在满足前提条件 X 的情况下，可以把复合任务 T 展开为子任务序列 [t1, t2, ..., tn]"的规则。一个复合任务通常有多种方法，规划器需要在其中选择。
4. **状态（State）**：一组描述世界的命题集合，原子任务执行后通过 effect 修改它。

HTN 规划的本质是：**给定一个初始状态、一个初始复合任务、一个方法库、一个原子任务库，寻找一个把初始任务完全展开为原子任务序列的方案**。

### 1.3 HTN 规划流程与伪代码

HTN 规划最经典的实现是**深度优先 + 前向模拟**的递归展开过程，也称为 SHOP（Simple Hierarchical Ordered Planner）风格。流程如下：

```
function HTN-Plan(state, tasks, methods, primitives):
    # tasks 是待展开的任务序列（列表）
    if tasks 为空:
        return []          # 所有任务都已被展开/执行，返回空计划

    current = tasks[0]
    rest   = tasks[1:]

    # 情况 1：当前任务是原子任务
    if current 是原子任务:
        if current.precondition 在 state 中成立:
            new_state = apply(current.effect, state)
            sub_plan = HTN-Plan(new_state, rest, methods, primitives)
            if sub_plan != FAILURE:
                return [current] + sub_plan
        return FAILURE

    # 情况 2：当前任务是复合任务
    for method in methods[current]:
        if method.precondition 在 state 中成立:
            new_tasks = method.subtasks + rest
            sub_plan = HTN-Plan(state, new_tasks, methods, primitives)
            if sub_plan != FAILURE:
                return sub_plan
    return FAILURE
```

这段伪代码的关键在于：复合任务被展开后，其子任务被**前置**到剩余任务队列的开头（`method.subtasks + rest`），从而形成自然的深度优先展开顺序。这也意味着 SHOP 风格的 HTN 隐式假设**子任务之间是顺序执行的**，子任务执行完后才回到原本的 `rest`。

### 1.4 优缺点

**优点：**

- **搜索空间小**：方法库大幅限制了分支因子，相比状态空间搜索往往能快几个数量级。
- **可解释性强**：每个展开步骤对应一条明确的"方法"，便于回溯与调试。
- **领域知识可复用**：方法库是独立于具体问题的资产，跨任务复用度高。
- **天然契合 Agent 任务分解**：复合任务对应"目标"，原子任务对应"工具调用"，结构上完美对应。

**缺点：**

- **方法库需要人工设计**：质量直接决定规划效果，缺乏方法时规划器会直接失败。
- **不保证完备性**：在方法不完备或前提条件过严时，可能存在解但 HTN 找不到。
- **顺序假设较强**：经典 SHOP 假设子任务顺序执行，表达复杂并行/条件分支需要扩展。
- **对动态环境适应性弱**：一旦状态偏离预期，可能需要重新规划。

### 1.5 Agent 开发中的应用场景

- **多步工具编排**：把"调研 + 写报告 + 发布"这类高层目标分解为可调用的工具序列。
- **Workflow 框架底层引擎**：LangGraph、AutoGen 中的"规划器-执行器"结构本质上是 HTN 的工程化实现。
- **可复用的 Skill 库**：每个"方法"对应一个可复用的 Skill，Skill 内部又可继续分解。
- **任务可解释性**：在 toB 场景中向用户展示"Agent 为什么这么做"——展开树就是天然的审计轨迹。

### 1.6 简单示例

下面用 Python 实现一个简化版 HTN 规划器，演示"写一篇技术报告"的分解过程。

```python
from typing import Callable

# 状态用 dict 表示，简化起见
State = dict

# 原子任务：name, precondition 检查函数, effect 应用函数
class Primitive:
    def __init__(self, name: str, pre: Callable[[State], bool],
                 effect: Callable[[State], None]):
        self.name = name
        self.pre = pre
        self.effect = effect

# 方法：复合任务名 -> [(precondition, subtasks)]
class Method:
    def __init__(self, task: str, pre: Callable[[State], bool],
                 subtasks: list[str]):
        self.task = task
        self.pre = pre
        self.subtasks = subtasks

# 定义原子任务
def search_topic(s: State) -> bool:
    return True  # 总是可以执行

def do_search(s: State):
    s["material_collected"] = True

def write_draft(s: State) -> bool:
    return s.get("material_collected", False)

def do_write(s: State):
    s["draft_done"] = True

def review(s: State) -> bool:
    return s.get("draft_done", False)

def do_review(s: State):
    s["final_report"] = True

primitives = {
    "search":  Primitive("search",  search_topic, do_search),
    "draft":   Primitive("draft",   write_draft,  do_write),
    "review":  Primitive("review",  review,       do_review),
}

# 定义方法（复合任务 -> 展开方式）
methods = {
    "write_report": [
        Method("write_report",
               pre=lambda s: True,
               subtasks=["research", "compose", "qa"]),
    ],
    "research": [
        Method("research", pre=lambda s: True, subtasks=["search"]),
    ],
    "compose": [
        Method("compose", pre=lambda s: s.get("material_collected", False),
               subtasks=["draft"]),
    ],
    "qa": [
        Method("qa", pre=lambda s: s.get("draft_done", False),
               subtasks=["review"]),
    ],
}

# HTN 规划器（SHOP 风格）
def htn_plan(state: State, tasks: list[str]) -> list[str] | None:
    if not tasks:
        return []
    current, rest = tasks[0], tasks[1:]

    if current in primitives:               # 原子任务
        p = primitives[current]
        if p.pre(state):
            p.effect(state)
            sub = htn_plan(state, rest)
            return [current] + sub if sub is not None else None
        return None

    if current in methods:                  # 复合任务：尝试每个方法
        for m in methods[current]:
            if m.pre(state):
                new_tasks = m.subtasks + rest
                sub = htn_plan(state, new_tasks)
                if sub is not None:
                    return sub
        return None

    return None

if __name__ == "__main__":
    init_state: State = {}
    plan = htn_plan(init_state, ["write_report"])
    print("规划结果：", plan)
    print("最终状态：", init_state)
    # 输出：
    # 规划结果：['search', 'draft', 'review']
    # 最终状态：{'material_collected': True, 'draft_done': True, 'final_report': True}
```

可以看到，HTN 把"写报告"这个抽象目标，最终归约成了一个可直接执行的工具调用序列 `[search, draft, review]`，并且在每一步都自动检查了前提条件。这正是 Agent 多步编排的算法雏形。

---

## 二、PDDL（Planning Domain Definition Language）/ 状态机

### 2.1 原理与核心思想

PDDL（Planning Domain Definition Language）是经典符号规划领域的"标准语言"，源自 1998 年首届国际规划竞赛（IPC），至今仍是学术界与工业界描述规划问题的事实标准。它的核心思想是：**用一阶逻辑的子集，把"世界"建模为一组谓词（predicate），把"动作"建模为带有前提与效果的形式化算子（operator），然后交给一个通用规划器去搜索从初始状态到目标状态的合法动作序列**。

与 HTN 强调"怎么分解"不同，PDDL 强调的是"什么状态可达"。它不假设任何领域知识，只提供一套**领域无关**的描述语言和搜索机制，理论上能解决任意可形式化的问题。这种"声明式建模 + 通用求解器"的思路是符号 AI 的典型范式。

PDDL 把一个规划问题严格拆成两份文件：

- **Domain 文件**：描述"世界运行的规则"，包括谓词集合与动作模板，与具体问题无关，可被复用。
- **Problem 文件**：描述"具体问题实例"，包括初始状态、目标状态，复用某个 Domain。

这种 domain/problem 分离的设计是 PDDL 最大的工程价值——同一套领域规则可以为无数具体问题服务，就像数据库 schema 与具体记录的关系。

### 2.2 PDDL 语法结构

#### Domain 文件示例

```lisp
(define (domain logistics)
  (:requirements :strips :typing)
  (:types truck package location)

  (:predicates
    (at ?p - package ?l - location)      ;; 包裹 p 在地点 l
    (truck-at ?t - truck ?l - location)   ;; 卡车 t 在地点 l
  )

  ;; 动作模板：把包裹从 l1 运到 l2
  (:action deliver
    :parameters (?t - truck ?p - package ?l1 - location ?l2 - location)
    :precondition (and (at ?p ?l1) (truck-at ?t ?l1))
    :effect (and (not (at ?p ?l1))
                 (at ?p ?l2)
                 (not (truck-at ?t ?l1))
                 (truck-at ?t ?l2))))
```

#### Problem 文件示例

```lisp
(define (problem deliver-package)
  (:domain logistics)
  (:objects truck1 pkg1 depot downtown)
  (:init
    (at pkg1 depot)
    (truck-at truck1 depot))
  (:goal
    (at pkg1 downtown)))
```

把这两个文件交给一个 PDDL 规划器（如 Fast Downward、ENHSP），它会输出一个动作序列 `[deliver truck1 pkg1 depot downtown]` 作为解。

### 2.3 状态机（FSM）与 Agent 状态管理

PDDL 描述的是"状态空间"，但在工程实践中，Agent 的状态管理更多以**有限状态机（Finite State Machine, FSM）**的形式落地。FSM 由四元组 `(S, E, δ, s0)` 描述：

- `S`：有限状态集合（如 `IDLE / PLANNING / EXECUTING / WAITING_TOOL / DONE / ERROR`）
- `E`：事件集合（如 `user_input / tool_done / tool_failed / timeout`）
- `δ: S × E → S`：状态转移函数
- `s0`：初始状态

FSM 的核心价值在于**显式化、可枚举、可校验**：每个状态下的合法事件集合是有限的，任何非法事件都能被立刻识别并拒绝，从而避免 Agent 进入未定义的"野状态"。在工程上，FSM 比自由文本驱动的"Agent 心智状态"更可靠、可测试、可观测，这也是为什么 LangGraph 把"图结构"作为一等公民来管理 Agent 流程。

FSM 与 PDDL 并不冲突——可以把 FSM 看作"动作集合已经固定、规划过程已经被人工预先固化"的简化版规划。当 Agent 行为足够复杂、动作组合空间巨大时，再升级为 PDDL 这种通用符号规划。

### 2.4 符号化规划的优缺点

**优点：**

- **形式化、可验证**：状态、前提、效果完全显式，可借助模型检测工具证明某些性质（如"是否一定可达""是否一定不违反约束"）。
- **领域无关**：一套规划器可以处理物流、调度、机器人等完全不同领域的问题。
- **可解释性极强**：解就是一个动作序列，每一步的前提与效果都可逐条对照检查。
- **完备性可证明**：在有限状态空间下，经典规划器（如 A* + 启发式）可以保证找到解或证明无解。

**缺点：**

- **建模成本高**：把真实业务形式化为谓词与动作模板需要大量专业知识，且容易遗漏边界条件。
- **封闭世界假设**：未声明为真的命题默认为假，在不确定的现实环境中容易"假失败"。
- **扩展性差**：状态空间随谓词数量呈指数增长，大规模问题需要分层、抽象等技巧才能求解。
- **对感知/执行噪声敏感**：现实世界状态往往不精确，一次工具失败就可能让整个状态失配。

### 2.5 Agent 开发中的应用场景

- **高可靠流程编排**：合规审计、合同审批、运维变更等"不能错"的流程，适合用 PDDL/FSM 显式建模。
- **Agent 状态管理**：用 FSM 管控 Agent 顶层生命周期，避免 LLM 自由发挥导致的失控。
- **多 Agent 协作的形式化验证**：把多个 Agent 的交互建模为联合状态机，验证死锁/活锁。
- **可审计的执行轨迹**：每一步状态转移都被记录，便于事后审计与回放。

### 2.6 简单示例

下面用一个 Python 实现的 FSM 来管理一个 Agent 的"问答 + 工具调用"生命周期。

```python
from enum import Enum, auto

class State(Enum):
    IDLE = auto()
    PLANNING = auto()
    CALLING_TOOL = auto()
    REPLYING = auto()
    ERROR = auto()

class AgentFSM:
    def __init__(self):
        self.state = State.IDLE
        # 转移表： (当前状态, 事件) -> 下一个状态
        self.transitions = {
            (State.IDLE,        "user_ask"):      State.PLANNING,
            (State.PLANNING,    "need_tool"):     State.CALLING_TOOL,
            (State.PLANNING,    "direct_answer"): State.REPLYING,
            (State.CALLING_TOOL,"tool_success"):  State.REPLYING,
            (State.CALLING_TOOL,"tool_fail"):     State.ERROR,
            (State.REPLYING,    "finish"):        State.IDLE,
            (State.ERROR,       "recover"):       State.IDLE,
        }

    def on_event(self, event: str) -> State:
        key = (self.state, event)
        if key not in self.transitions:
            raise RuntimeError(f"非法转移：状态={self.state} 事件={event}")
        self.state = self.transitions[key]
        return self.state

    def can_handle(self, event: str) -> bool:
        return (self.state, event) in self.transitions

if __name__ == "__main__":
    fsm = AgentFSM()
    for ev in ["user_ask", "need_tool", "tool_success", "finish"]:
        assert fsm.can_handle(ev), f"事件 {ev} 在 {fsm.state} 下非法"
        fsm.on_event(ev)
        print(f"事件 {ev:<14} -> 状态 {fsm.state.name}")
    # 输出：
    # 事件 user_ask       -> 状态 PLANNING
    # 事件 need_tool      -> 状态 CALLING_TOOL
    # 事件 tool_success   -> 状态 REPLYING
    # 事件 finish         -> 状态 IDLE
```

如果把上面这些状态和事件写成 PDDL 的谓词与动作，效果是完全等价的——FSM 是"动作集合已经固定"的简化版符号规划。理解了这一点，就能在简单场景用 FSM、复杂场景升级到 PDDL 之间做出合理选型。

---

## 三、DAG 调度（有向无环图调度）

### 3.1 原理与核心思想

当 Agent 把一个复杂任务分解成几十个原子子任务后，立刻会遇到一个工程问题：**这些子任务并不都是串行的**。有的子任务彼此独立，完全可以并行执行以缩短端到端时延；有的子任务之间存在严格依赖，必须等前置完成才能开始。如果只把任务列表丢给执行器串行跑，Agent 的响应时间会随着任务数线性增长，这在生产环境中常常不可接受。

DAG 调度（Directed Acyclic Graph Scheduling）就是解决这个问题的经典模型。它的核心思想是：**把每个子任务看作图中的一个节点，把"任务 A 必须在任务 B 之前完成"的依赖关系看作有向边 A → B，整张图构成一个有向无环图（DAG）；然后通过拓扑排序确定合法执行顺序，并在依赖被满足的前提下尽可能并行执行多个节点**。

DAG 的关键约束是"无环"——如果任务图里出现循环，说明存在"A 依赖 B、B 又依赖 A"这种逻辑矛盾，调度器会直接拒绝。这一性质也使得 DAG 调度天然具备**死锁检测**能力：只要构图阶段通过拓扑排序验证无环，运行时就绝不会因为循环依赖而死锁。

DAG 调度在现代分布式系统中无处不在：Airflow、Spark、Ray、Tekton、Kubernetes Job 的 DAG 调度器、LangGraph 的图执行引擎，底层都是同一套算法。对 Agent 开发者来说，理解 DAG 调度是构建高性能多步 Agent 的必备能力。

### 3.2 拓扑排序

拓扑排序（Topological Sort）是 DAG 调度的基础，它把图中的节点排成一个线性序列，使得对每条边 `u → v`，`u` 都在 `v` 之前出现。常用的两种实现：

**Kahn 算法（基于入度）**：

```
function TopologicalSort(G):
    计算每个节点的入度 in_degree[v]
    queue = [v for v in G if in_degree[v] == 0]
    result = []
    while queue 非空:
        u = queue.pop()
        result.append(u)
        for v in G.successors(u):
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)
    if len(result) != len(G.nodes):
        raise Error("图中存在环")
    return result
```

**DFS 后序逆序**：对图做 DFS，节点结束访问时入栈，最终栈顶到栈底就是拓扑序。

Kahn 算法的优势是**天然支持并行调度**：每一轮 `queue` 里同时有多个入度为 0 的节点，它们彼此独立，可以并发执行。这就是 DAG 并行调度的理论基础。

### 3.3 多步骤并行执行调度

把拓扑排序扩展为并行调度，只需做一个小改动：**不再一次只取一个节点，而是把每一轮入度为 0 的节点作为一个"批次（wave）"同时提交执行**，等这一批全部完成后再进入下一轮。这种策略称为"层级调度（level scheduling）"或"波次并行"。

```
function ScheduleParallel(G, executor):
    计算每个节点入度
    waves = []
    ready = [v for v in G if in_degree[v] == 0]
    while ready 非空:
        waves.append(ready)                     # 本批可并行执行
        results = executor.run_all(ready)        # 并行执行
        next_ready = []
        for u in ready:
            for v in G.successors(u):
                in_degree[v] -= 1
                if in_degree[v] == 0:
                    next_ready.append(v)
        ready = next_ready
    return waves
```

每个 wave 内部的节点彼此无依赖，可以丢到线程池/进程池/异步任务里并发跑；wave 之间是严格串行的。这样 Agent 的总执行时间近似等于"关键路径长度"而不是"任务总数 × 单任务耗时"。

### 3.4 关键路径

关键路径（Critical Path）是 DAG 中**从起点到终点的最长路径**，决定了整个任务图的最短完成时间下限。无论并行度多高，关键路径上的任务都必须串行执行，因此**优化关键路径是缩短端到端时延最有效的手段**。

关键路径常用**最长路径算法**计算（在 DAG 上可以在线性时间内完成）：

```
function CriticalPath(G):
    topo = TopologicalSort(G)
    dist[v] = 0  for all v
    for u in topo:                # 按拓扑序处理
        for v in G.successors(u):
            dist[v] = max(dist[v], dist[u] + weight(u, v))
    return max(dist)
```

`weight(u, v)` 通常是 `u` 的执行耗时。计算出关键路径后，可以重点优化路径上的节点（比如换更快的工具、合并步骤、缓存结果），而对非关键路径上的节点则不必过度优化——它们本来就有"空闲时间窗口"。

### 3.5 优缺点

**优点：**

- **显式表达依赖**：依赖关系一目了然，避免隐式假设。
- **自动并行**：拓扑排序自动找出可并行的批次，无需手工编排。
- **死锁免疫**：构图时检测环即可杜绝循环依赖死锁。
- **可观测性强**：执行过程可以画出甘特图，便于性能分析与瓶颈定位。

**缺点：**

- **需要任务可静态分析**：依赖关系必须能在执行前确定，运行时动态发现的依赖无法纳入。
- **调度粒度难把握**：粒度太粗并行度不够，太细则调度开销侵蚀收益。
- **容错需额外设计**：节点失败后的重试、回滚、部分降级需要调度器显式支持。
- **不处理条件分支**：经典 DAG 假设所有节点都执行，"if-else"式条件分支需要扩展为动态 DAG 或带守卫的节点。

### 3.6 在多步骤 Agent 任务并行中的应用

- **并行工具调用**：Agent 一次规划出多个独立子任务（如"同时检索 3 个数据源"），用 DAG 调度并发执行。
- **多步 RAG 流水线**：检索、重排、摘要、校验等步骤构造成 DAG，按依赖关系并行调度。
- **多 Agent 协作**：多个子 Agent 之间的依赖关系建模为 DAG，由顶层调度器协调。
- **关键路径优化**：识别端到端时延瓶颈，针对性优化（如把串行 LLM 调用换为批量调用）。

### 3.7 简单示例

下面实现一个支持并行批次执行的 DAG 调度器，并演示其在 Agent 任务并行中的应用。

```python
from collections import defaultdict, deque
from concurrent.futures import ThreadPoolExecutor

class DAG:
    def __init__(self):
        self.nodes = set()
        self.edges = defaultdict(list)   # u -> [v, ...]
        self.in_degree = defaultdict(int)

    def add_node(self, name: str):
        self.nodes.add(name)
        self.in_degree.setdefault(name, 0)

    def add_edge(self, u: str, v: str):
        # 检查是否引入环（简化版：执行时再统一检查）
        self.edges[u].append(v)
        self.in_degree[v] += 1

    def topological_waves(self) -> list[list[str]]:
        """返回每一批可并行执行的节点列表（Kahn 算法分层版）。"""
        in_deg = dict(self.in_degree)
        ready = deque([n for n in self.nodes if in_deg[n] == 0])
        waves = []
        while ready:
            wave = list(ready)
            waves.append(wave)
            ready.clear()
            for u in wave:
                for v in self.edges[u]:
                    in_deg[v] -= 1
                    if in_deg[v] == 0:
                        ready.append(v)
        if sum(len(w) for w in waves) != len(self.nodes):
            raise RuntimeError("DAG 中存在环，无法调度")
        return waves

    def critical_path_length(self, weight: dict[str, float]) -> float:
        """计算关键路径长度（每个节点耗时由 weight 给出）。"""
        topo = [n for wave in self.topological_waves() for n in wave]
        dist = {n: 0.0 for n in self.nodes}
        for u in topo:
            for v in self.edges[u]:
                dist[v] = max(dist[v], dist[u] + weight[u])
        return max(dist[n] + weight[n] for n in self.nodes) if self.nodes else 0.0


def execute_dag(dag: DAG, task_fn, workers: int = 4):
    """按 wave 并行执行 DAG 中的任务。"""
    waves = dag.topological_waves()
    with ThreadPoolExecutor(max_workers=workers) as ex:
        for i, wave in enumerate(waves):
            print(f"[Wave {i}] 并行执行: {wave}")
            list(ex.map(task_fn, wave))


if __name__ == "__main__":
    # 构造一个 Agent 任务 DAG：
    #          search_web ─┐
    #                       ├─→ merge_results ─→ draft_report ─→ review
    #          search_kb ──┘                       ↑
    #                                          format_check
    dag = DAG()
    for n in ["search_web", "search_kb", "merge_results",
              "draft_report", "format_check", "review"]:
        dag.add_node(n)
    dag.add_edge("search_web",   "merge_results")
    dag.add_edge("search_kb",    "merge_results")
    dag.add_edge("merge_results", "draft_report")
    dag.add_edge("format_check", "draft_report")  # 另一条独立分支汇入
    dag.add_edge("draft_report", "review")

    print("拓扑分层：", dag.topological_waves())

    weights = {"search_web": 1.0, "search_kb": 0.8, "merge_results": 0.5,
               "draft_report": 2.0, "format_check": 0.3, "review": 1.0}
    print("关键路径长度：", dag.critical_path_length(weights))

    import time
    def task_fn(name):
        time.sleep(weights[name] * 0.05)   # 模拟耗时
        print(f"  完成 {name}")

    execute_dag(dag, task_fn, workers=4)
    # 输出示例：
    # 拓扑分层： [['search_web', 'search_kb', 'format_check'], ['merge_results'], ['draft_report'], ['review']]
    # 关键路径长度： 4.5
    # [Wave 0] 并行执行: ['search_web', 'search_kb', 'format_check']
    #   完成 search_kb ...
    #   完成 format_check ...
    #   完成 search_web ...
    # [Wave 1] 并行执行: ['merge_results']
    # ...
```

可以看到，原本串行需要 5.6 秒（各任务耗时之和）的流程，通过 DAG 调度压缩到了接近关键路径长度 4.5 秒。这就是 DAG 调度给 Agent 带来的核心价值。

---

## 四、三者结合：一个统一视角

把上面三类算法放在一起，可以看到它们各自解决了 Agent 任务分解的不同侧面：

| 算法 | 解决的核心问题 | 输入 | 输出 | 何时使用 |
|------|----------------|------|------|----------|
| HTN | "怎么把高层目标拆成低层任务" | 抽象目标 + 方法库 | 原子任务序列 | 任务结构明确、领域知识丰富 |
| PDDL/FSM | "每一步合法吗？状态可达吗？" | 状态 + 动作模型 | 合法的动作计划 / 状态转移 | 对正确性、可验证性要求高 |
| DAG 调度 | "这些任务怎么并行执行最快" | 任务图 + 依赖关系 | 并行执行批次 + 关键路径 | 子任务数量多、依赖关系复杂 |

一个成熟的 Agent 系统通常按"**HTN 拆解 → FSM 守护 → DAG 调度**"的顺序组合使用：

1. 先用 HTN 把用户目标展开为一组带依赖关系的原子任务；
2. 用 FSM 管理整体执行流程的状态（PLANNING / EXECUTING / ERROR / DONE），保证状态合法转移；
3. 把 HTN 产出的任务图交给 DAG 调度器并行执行，并按关键路径优化端到端时延；
4. 任何一步失败时，通过 FSM 的 ERROR 状态触发重规划或回滚。

这三者的组合，正是 LangGraph、AutoGen、CrewAI 等现代 Agent 框架在算法层面的"骨架"。理解了它，再去看这些框架的源码就会清晰得多。

---

## 五、小结

本篇围绕"如何把复杂 Agent 任务拆解为可执行子任务"这一工程命题，介绍了三类经典算法：

- **HTN** 通过"方法库"把抽象目标层层归约为原子动作，是 Agent 任务分解最直接的算法原型，适合领域知识丰富、任务结构明确的场景。
- **PDDL / 状态机** 用形式化的"状态-动作-前提-效果"建模世界，提供可验证、可解释、可审计的规划能力，适合对正确性要求严格的场景。
- **DAG 调度** 通过拓扑排序与关键路径分析，在依赖约束下最大化并行度，是多步 Agent 缩短端到端时延的核心手段。

理解这三类算法后，你已经具备了把"一句话需求"转化为"可执行、可调度、可观测任务图"的全套工具。本系列下一篇将进入"记忆与状态管理"主题，讨论 Agent 如何在长对话与跨会话中维护与检索信息——那是另一类与规划正交、但同样关键的能力。
