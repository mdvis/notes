# 多 Agent 协作

## 本篇导读

在前几篇中，我们讨论的算法大多服务于**单个 Agent** 的决策与推理——从 RAG 检索、ReAct 循环到 MCTS 规划。然而，当任务规模扩大、专业能力分化、或需要并行处理时，单 Agent 架构会撞到上下文长度、工具调用并发度、角色混淆等天花板。此时**多 Agent 系统（Multi-Agent System, MAS）** 成为破局关键。

多 Agent 协作并非"多个 LLM 一起聊天"这么简单。它的核心挑战有三类：

1. **资源竞争与利益冲突**——当多个 Agent 同时需要调用同一工具、占用同一计算资源、或争取同一用户注意力时，如何分配才公平且高效？
2. **状态与决策一致性**——多个 Agent 各自看到局部信息、各自得出局部结论，如何合并出一个全局一致的结果？
3. **任务分解与角色匹配**——一个复杂任务如何被切分成适合不同 Agent 能力的子任务，并由谁调度？

对应这三类挑战，本篇讲解三大算法族：**博弈论**（解决利益分配）、**共识算法**（解决一致性）、**角色分工调度**（解决任务分解）。每个算法都包含原理、公式、Agent 开发应用场景与 Python 伪代码示例，帮助你在 AutoGen、CrewAI、MetaGPT 等框架中不仅会用、更能调优。

---

## 一、博弈论（Game Theory）

博弈论研究**多个理性决策者**在利益相互影响时的策略选择。在多 Agent 系统中，每个 Agent 都是一个"玩家"，其收益不仅取决于自身行动，也取决于其他 Agent 的行动。这正是博弈论天然适配的场景。

### 1.1 纳什均衡（Nash Equilibrium）

#### 原理与核心思想

纳什均衡由 John Nash 在 1950 年提出，是博弈论中最核心的解概念。其直觉是：在一场博弈中，如果每个玩家都知道其他玩家的策略，并且**没有任何玩家能通过单方面改变自己的策略来获得更高收益**，那么这组策略组合就构成纳什均衡。

换个说法：纳什均衡是一种"稳定状态"——所有人都对当前选择感到满意（给定他人选择的前提下），没有人有动力偏离。这种稳定性使得纳什均衡成为预测多 Agent 系统长期行为的强有力工具。

#### 关键概念与公式

**博弈的三要素**：

- 玩家集合 $N = \{1, 2, \dots, n\}$
- 每个玩家 $i$ 的策略集 $S_i$
- 每个玩家 $i$ 的收益函数 $u_i : S_1 \times S_2 \times \dots \times S_n \to \mathbb{R}$

**纯策略纳什均衡**定义：策略组合 $s^* = (s_1^*, s_2^*, \dots, s_n^*)$ 是纯策略纳什均衡，当且仅当对每个玩家 $i$：

$$
\forall s_i \in S_i, \quad u_i(s_i^*, s_{-i}^*) \geq u_i(s_i, s_{-i}^*)
$$

其中 $s_{-i}^*$ 表示除 $i$ 之外所有其他玩家的策略组合。

**混合策略**允许玩家以概率分布选择策略。设 $\sigma_i$ 是玩家 $i$ 的混合策略（$S_i$ 上的概率分布），则期望收益为：

$$
u_i(\sigma_i, \sigma_{-i}) = \sum_{s \in S} \left( \prod_{j=1}^{n} \sigma_j(s_j) \right) u_i(s)
$$

混合策略纳什均衡要求：对每个玩家 $i$，其均衡混合策略 $\sigma_i^*$ 在所有支持的概率大于 0 的纯策略上获得的期望收益**相等**，且不超过其他纯策略的收益。Nash 证明了**任意有限博弈都至少存在一个纳什均衡（纯策略或混合策略）**，这是纳什均衡成为通用分析工具的理论保障。

经典案例是**囚徒困境**：两个 Agent 都选择"背叛"是唯一纳什均衡，但双方收益都比"双方合作"更低——这揭示了个体理性可能导致集体非最优，是多 Agent 协作设计必须警惕的陷阱。

#### Agent 开发中的应用场景

1. **工具调用竞争**：多个 Agent 同时请求调用一个有 QPS 限制的 API。如果都"激进抢夺"导致超限被拒，反而都拿不到资源——典型的囚徒困境。设计时需要引入重复博弈或惩罚机制。
2. **任务竞价**：在分布式任务市场（如 AI Agent marketplace）中，多个 Agent 对任务报价，纳什均衡分析能预测合理的报价区间，避免"零和内卷"。
3. **策略选择建模**：在对抗性场景（如红队/蓝队 Agent、博弈型游戏 Agent）中，混合策略纳什均衡能指导 Agent 行为随机化，避免被对手预测。
4. **激励机制设计**：设计多 Agent 协作的奖励分配规则时，希望"诚实汇报"成为纳什均衡——这是激励相容的核心思路。

#### 简单示例

下面的 Python 伪代码演示如何用支撑枚举法求解两人博弈的纯策略纳什均衡：

```python
import itertools
from typing import List, Tuple

def find_pure_nash(payoff_a: List[List[float]],
                   payoff_b: List[List[float]]) -> List[Tuple[int, int]]:
    """
    求解两人有限博弈的纯策略纳什均衡。
    payoff_a[i][j] 为玩家 A 选策略 i、玩家 B 选策略 j 时 A 的收益；
    payoff_b[i][j] 同理为 B 的收益。
    返回所有纯策略纳什均衡 (i, j) 的列表。
    """
    rows_a = len(payoff_a)
    cols_b = len(payoff_a[0])
    equilibria = []

    for i, j in itertools.product(range(rows_a), range(cols_b)):
        # 给定 B 选 j，A 是否愿意偏离？
        best_for_a = max(payoff_a[r][j] for r in range(rows_a))
        a_no_deviate = (payoff_a[i][j] == best_for_a)

        # 给定 A 选 i，B 是否愿意偏离？
        best_for_b = max(payoff_b[i][c] for c in range(cols_b))
        b_no_deviate = (payoff_b[i][j] == best_for_b)

        if a_no_deviate and b_no_deviate:
            equilibria.append((i, j))
    return equilibria


# 示例：囚徒困境
# 策略：0 = 合作，1 = 背叛
# 收益矩阵（越大越好）
A_payoff = [[3, 0], [5, 1]]   # A: [[C,C], [C,D], [D,C], [D,D]] -> [[3,0],[5,1]]
B_payoff = [[3, 5], [0, 1]]
print(find_pure_nash(A_payoff, B_payoff))  # 输出 [(1, 1)] —— 双方背叛是唯一均衡
```

### 1.2 拍卖机制（Auction Mechanisms）

#### 原理与核心思想

拍卖是经济学中研究最充分的资源分配机制之一。其本质是：一个资源（或一组资源）需要分配给若干竞标者中的一个，但**资源持有者不知道竞标者对资源的真实估值**。拍卖机制通过设计"竞标规则"和"分配与支付规则"，诱导竞标者如实报出自己的估值，从而实现资源的高效分配。

不同拍卖机制的差异主要体现在两点：

- **出价方式**：公开 ascending 还是 sealed-bid
- **支付规则**：支付自己的出价（first-price）还是支付第二高出价（second-price）

#### 关键概念与公式

**拍卖的基本要素**：

- 单个不可分物品 $M$
- $n$ 个竞标者，每人有真实估值 $v_i$（私有信息）
- 每人提交出价 $b_i$
- 分配函数 $x_i(b) \in \{0, 1\}$（是否把物品分给 $i$）
- 支付函数 $p_i(b)$（$i$ 需要支付的金额）
- 玩家 $i$ 的收益：$u_i = v_i \cdot x_i(b) - p_i(b)$

**英式拍卖（English Auction）**：价格从低开始 ascending，竞标者陆续退出，最后剩一人以当前价格获得物品。其均衡策略直观——一直出价直到价格达到自己的真实估值 $v_i$。最终胜者支付的价格近似等于**第二高的真实估值**。

**Vickrey 拍卖（第二价格密封拍卖）**：每人密封提交一个出价 $b_i$，最高出价者获得物品，但**支付第二高出价**：

$$
x_i^*(b) = \begin{cases} 1 & b_i = \max_j b_j \\ 0 & \text{otherwise} \end{cases}, \quad
p_i^* = \max_{j \neq i} b_j \text{ if } x_i^* = 1
$$

Vickrey 拍卖的关键性质——**激励相容**：对每个竞标者而言，**如实出价 $b_i = v_i$ 是占优策略**（dominant strategy）。证明直觉：无论他人如何出价，你的出价只决定你"赢不赢"，不改变你"赢的话付多少"（付第二高）。所以你只需考虑"是否愿意以第二高出价成交"——如实报 $v_i$ 即可。

**组合拍卖（Combinatorial Auction）**：当有多个互补资源（如工具 A 和工具 B 配合使用效果更高）时，竞标者对**资源组合**有估值 $v_i(S)$（$S$ 是资源子集）。胜者决定问题（WDP）是组合拍卖的核心优化问题：

$$
\max_{x_{i,S} \in \{0,1\}} \sum_{i} \sum_{S} v_i(S) \cdot x_{i,S}
\quad \text{s.t.} \quad \sum_{i} \sum_{S \ni k} x_{i,S} \leq 1, \; \forall k
$$

最后一个约束表示每个资源 $k$ 最多被分配给一个竞标者。WDP 是 NP-hard 问题，实际系统中常用近似算法（如贪心、LP 松弛）求解。

#### Agent 开发中的应用场景

1. **工具调度**：多个 Agent 同时请求调用昂贵的工具（如 GPU 推理、付费 API）。通过 Vickrey 拍卖机制，每个 Agent 报出自己对该工具调用的"真实价值"（可基于任务紧迫度、预期收益计算），系统按第二价格分配，避免 Agent 谎报。
2. **任务分发市场**：在 Multi-Agent marketplace 中，任务发布方作为拍卖方，Worker Agent 作为竞标者。组合拍卖特别适合"打包任务"——某些 Agent 偏好连续完成一组相关任务。
3. **预算分配**：多个 Agent 共享有限的 token 预算或 API 调用额度，拍卖机制能高效地把预算分配给"边际效用最高"的 Agent。
4. **云资源竞价**：Agent 系统在云上部署时，spot 实例的分配机制本质就是拍卖，理解拍卖理论有助于设计成本敏感的弹性调度策略。

#### 简单示例

```python
def vickrey_auction(bids: dict) -> tuple:
    """
    Vickrey 拍卖：最高出价者中标，支付第二高出价。
    bids: {agent_name: bid_value}
    返回 (winner, price_paid)
    """
    if not bids:
        return None, 0
    sorted_bids = sorted(bids.items(), key=lambda x: -x[1])
    winner = sorted_bids[0][0]
    if len(sorted_bids) == 1:
        # 只有一个竞标者，支付保留价（这里简化为 0）
        return winner, 0
    second_price = sorted_bids[1][1]
    return winner, second_price


# 多个 Agent 竞争一次 GPT-4 调用机会
bids = {
    "ResearchAgent": 0.85,   # 估值高，因为关键推理步骤
    "CodeAgent":     0.40,
    "SummaryAgent":  0.20,
}
winner, price = vickrey_auction(bids)
print(f"Winner: {winner}, pays: {price}")  # Winner: ResearchAgent, pays: 0.40

# 关键性质：每个 Agent 如实报出自己的估值是占优策略
# 即使 ResearchAgent 知道第二名只会出 0.40，它也不会谎报 0.41——
# 因为如果实际有别人出价 0.90，它就输掉了。
```

### 1.3 多 Agent 资源分配实战：博弈论综合应用

在真实的多 Agent 系统中，资源分配往往是**重复博弈**——同一组 Agent 会反复竞争资源。此时单次拍卖的纳什均衡分析不够，需要考虑：

- **触发策略（Trigger Strategy）**：Agent 如果发现自己被"恶意低价压价"，后续轮次会报复性地提高出价或退出协作。
- **贴现因子 $\delta$**：未来收益的折现率，影响 Agent 是否愿意"今日吃亏以换取长期合作"。
- **民间定理（Folk Theorem）**：在无限重复博弈中，只要 Agent 足够重视未来（$\delta$ 足够大），几乎任何"个体理性收益"都能作为均衡被支撑。

实践建议：在多 Agent 系统中引入**长期信誉机制**——记录每个 Agent 的历史出价与协作表现，作为后续资源分配的依据。这把单次博弈转化为重复博弈，能显著减少恶意行为。

---

## 二、共识算法（Consensus Algorithms）

### 2.1 多 Agent 协同决策的挑战

当多个 Agent 共同完成一个任务时（如多个分析师 Agent 评估同一项目、多个评审 Agent 判断代码质量），它们的输出可能不一致甚至冲突。共识算法（Consensus Algorithm）的目标就是：**让一组分布式节点（Agent）就某个值或状态达成一致**。

共识问题的难点在于：

- **异步通信**：消息可能延迟、乱序、丢失
- **节点故障**：某些 Agent 可能崩溃、无响应
- **恶意节点**：某些 Agent 可能发送错误信息（被劫持、prompt injection、幻觉）
- **最终一致性 vs 强一致性**：不同场景对"什么时候必须一致"要求不同

经典共识问题包括：

- **状态机复制**：所有 Agent 维护相同的状态序列
- **领导者选举**：选出一个协调 Agent
- **原子广播**：所有 Agent 以相同顺序收到相同消息

### 2.2 投票共识与 Quorum 机制

#### 原理与核心思想

最朴素的共识机制是**多数投票**：每个 Agent 给出自己的判断，最终以多数票为准。但简单多数投票在两个维度上不够：

1. **失败容忍度**：超过半数节点故障时系统瘫痪
2. **拜占庭节点**：恶意节点可以扰乱投票结果

**Quorum 机制**是对简单多数的精细化。核心思想：定义一个**法定数量** $Q$，任何决策必须由至少 $Q$ 个节点同意才生效。Quorum 的设计要在**可用性**和**一致性**之间权衡——$Q$ 越大一致性越强但可用性越低。

#### 关键概念与公式

设集群有 $N$ 个节点，故障节点数为 $F$：

**Crash-fault 模型下**（节点只会崩溃，不会作恶）：

- 多数派 Quorum：$Q = \lfloor N/2 \rfloor + 1$
- 系统可容忍 $F = N - Q = \lfloor (N-1)/2 \rfloor$ 个节点故障
- 典型代表：Paxos、Raft

**Byzantine-fault 模型下**（节点可能作恶）：

- 拜占庭 Quorum：$Q = \lceil 2N/3 \rceil + 1$（或更一般地 $Q > \frac{N + F}{2}$，其中 $F$ 是拜占庭节点数）
- 系统可容忍 $F = \lfloor (N-1)/3 \rfloor$ 个拜占庭节点
- 典型代表：PBFT、Tendermint

**Quorum 交集性质**：任意两个合法 Quorum 必有交集。这是保证一致性的关键——若两个 Quorum 没有交集，它们可能独立做出不一致决策。

#### Agent 开发中的应用场景

1. **多 Agent 结果聚合**：让 5 个 Analyst Agent 各自给出投资建议，要求至少 3 个一致才采纳——典型的 Crash-fault Quorum。
2. **代码审查投票**：多个 Code Reviewer Agent 评审同一 PR，至少 2 个 Approve 才合并。
3. **事实核查**：多个 Fact-checker Agent 验证同一陈述，多数一致才输出"已验证"。
4. **工具调用授权**：高敏感度操作（如删除数据库）需要 Quorum 个 Agent 同意才能执行。

#### 简单示例

```python
from typing import List, Dict

def quorum_consensus(views: Dict[str, str], n_total: int, f_byzantine: int) -> str | None:
    """
    多 Agent 投票共识（支持拜占庭容错）。
    views: {agent_name: vote}
    n_total: 集群总节点数
    f_byzantine: 需要容忍的拜占庭节点数
    返回达成共识的值，或 None 表示未达成。
    """
    # 拜占庭 Quorum 阈值: Q = 2F + 1
    quorum = 2 * f_byzantine + 1
    if n_total < 3 * f_byzantine + 1:
        raise ValueError(f"节点不足: 至少需要 {3*f_byzantine+1} 个节点容忍 {f_byzantine} 个拜占庭节点")

    tally = {}
    for vote in views.values():
        tally[vote] = tally.get(vote, 0) + 1

    for value, count in tally.items():
        if count >= quorum:
            return value
    return None


# 5 个 Reviewer Agent 评审同一 PR
reviews = {
    "ReviewerA": "approve",
    "ReviewerB": "approve",
    "ReviewerC": "approve",
    "ReviewerD": "reject",   # 可能是误判
    "ReviewerE": "approve",
}
# 容忍 1 个拜占庭节点 -> Quorum = 3
result = quorum_consensus(reviews, n_total=5, f_byzantine=1)
print(f"Consensus: {result}")  # Consensus: approve
```

### 2.3 PoA（Proof of Authority）共识

#### 原理与核心思想

Proof of Authority（权威证明）是一种基于**身份信任**的共识机制。与 PoW（工作量证明）依赖算力、PoS（权益证明）依赖代币质押不同，PoA 依赖**预先批准的权威节点**轮流产生决策。

PoA 的核心假设是：**节点的真实身份已知且经过验证**，作恶会损害其现实声誉或抵押保证金。这种"身份质押"提供了安全保证，省去了昂贵的计算或资本锁定。

#### 关键概念与模型

PoA 的基本流程：

1. **权威节点集合** $\mathcal{A} = \{a_1, a_2, \dots, a_m\}$：经过链上/链下认证的"议事团"
2. **轮流出块**：按顺序 $\sigma$ 让权威节点轮流产生决策（提案）
3. **签名背书**：其他权威节点对提案签名背书
4. **最终性**：当超过 $2/3$ 的权威节点签名时，提案最终确定

PoA 在多 Agent 场景下的对应：

- 权威节点 = "高级 Agent" 或 "专家 Agent"
- 提案 = 一个待采纳的决策（如"是否执行某工具调用"）
- 背书 = 其他专家 Agent 同意
- 最终性 = 决策不可逆地被执行

#### Agent 开发中的应用场景

1. **层级化多 Agent 系统**：在"专家 Agent 委员会 + Worker Agent"架构中，PoA 用于让专家 Agent 轮流主导关键决策，避免单点依赖。
2. **可追溯审计**：PoA 中每个决策都有签名链，便于追溯"谁在何时批准了什么"——这对合规性敏感场景（金融、医疗 Agent）至关重要。
3. **低延迟共识**：相比 PoW/PoS，PoA 不需要复杂计算或代币经济，适合需要快速决策的多 Agent 链上协调。

#### 简单示例

```python
import time

class PoAConsensus:
    def __init__(self, authorities: list):
        # 权威 Agent 列表（按顺序轮流）
        self.authorities = authorities
        self.m = len(authorities)
        self.turn = 0  # 当前出块者索引

    def propose(self, proposal: str, proposer: str) -> bool:
        """生成提案，需要当前轮到的权威节点提议"""
        expected = self.authorities[self.turn % self.m]
        if proposer != expected:
            return False
        return True

    def finalize(self, proposal: str, endorsements: set) -> tuple:
        """需要 2/3 以上权威节点背书才最终化"""
        threshold = (2 * self.m) // 3 + 1
        if len(endorsements) >= threshold:
            self.turn += 1
            return True, f"提案已最终化: {proposal}"
        return False, "背书不足"

# 3 个专家 Agent
experts = ["ExpertA", "ExpertB", "ExpertC"]
poa = PoAConsensus(experts)

proposer = experts[0]  # 轮到 A 提案
ok = poa.propose("deploy_agent_v2", proposer)
endorsements = {"ExpertA", "ExpertB"}  # 2/3 背书
finalized, msg = poa.finalize("deploy_agent_v2", endorsements)
print(msg)  # 提案已最终化: deploy_agent_v2
```

### 2.4 拜占庭容错（BFT）简介

#### 原理与核心思想

拜占庭容错（Byzantine Fault Tolerance, BFT）来自著名的"拜占庭将军问题"：若干将军围攻一座城，必须协同行动（同时进攻或同时撤退），但将军之间只能通过信使通信，且部分将军可能是叛徒（发送虚假信息）。问题是：**忠诚的将军们如何在有叛徒的情况下达成一致？**

Leslie Lamport 等人在 1982 年证明：在口头消息（不可签名）下，需要 $n \geq 3F + 1$ 个将军才能容忍 $F$ 个叛徒。如果消息可签名（数字签名），容忍能力可以更强。

#### 关键概念与模型

**实用拜占庭容错（PBFT, Practical BFT）**是经典实现，三阶段流程：

1. **Pre-prepare**：主节点（Primary）提出提案并向所有副本广播
2. **Prepare**：副本验证提案并广播 Prepare 消息，每个节点收集到 $2F$ 个 Prepare 后进入 Commit 阶段
3. **Commit**：节点广播 Commit 消息，收到 $2F+1$ 个 Commit 后执行决策

PBFT 的关键参数：

- $N \geq 3F + 1$（节点总数下限）
- Quorum $= 2F + 1$（决策确认所需票数）
- 通信复杂度 $O(N^2)$（所有节点对所有消息签名）

#### Agent 开发中的应用场景

1. **对抗鲁棒的多 Agent 系统**：当系统中有可能被 prompt injection 攻击的 Agent，BFT 保证即使 $F$ 个 Agent 被攻破，整个系统仍能正确决策。
2. **高可信任务执行**：金融交易执行、医疗诊断建议等场景下，多 Agent 复核 + BFT 共识能将错误率降到可接受水平。
3. **跨组织 Agent 协作**：不同组织部署的 Agent 互不信任时，PBFT 提供无需信任第三方的共识机制。

#### 简单示例

```python
class PBFTNode:
    def __init__(self, name, is_primary=False):
        self.name = name
        self.is_primary = is_primary
        self.prepare_count = {}
        self.commit_count = {}

    def pre_prepare(self, proposal: str, all_nodes: list) -> dict:
        if not self.is_primary:
            return {}
        return {n.name: ("PREPARE", proposal) for n in all_nodes if n is not self}

    def receive_prepare(self, proposal, sender) -> bool:
        self.prepare_count[proposal] = self.prepare_count.get(proposal, 0) + 1
        # 简化: F=1, 需要 2F=2 个 Prepare
        return self.prepare_count[proposal] >= 2

    def receive_commit(self, proposal, sender) -> bool:
        self.commit_count[proposal] = self.commit_count.get(proposal, 0) + 1
        # 需要 2F+1 = 3 个 Commit 才最终化
        return self.commit_count[proposal] >= 3


# 4 个 Agent 节点，容忍 1 个拜占庭节点
nodes = [PBFTNode("N0", is_primary=True),
         PBFTNode("N1"), PBFTNode("N2"), PBFTNode("N3")]
primary = nodes[0]
proposal = "execute_refund"

# Pre-prepare: 主节点广播
msgs = primary.pre_prepare(proposal, nodes)
# Prepare 阶段
for n in nodes[1:]:
    n.receive_prepare(proposal, primary)
# Commit 阶段（假设 N3 是拜占庭，不响应）
committed = nodes[1].receive_commit(proposal, nodes[2])
print(f"Committed: {committed}")  # 仍可达成共识
```

### 2.5 多 Agent 结果聚合中的共识算法应用

在 RAG 增强的多 Agent 系统中，常见模式是"**多个 Agent 并行检索 + 共识聚合**"：

1. **答案聚合**：3 个 Agent 各自独立回答同一问题，使用 Quorum 投票选择最终答案（多数派容忍 1 个幻觉）。
2. **检索结果去重**：多 Agent 各自 RAG 检索，用集合交集作为"高置信度结果"，并集作为"候选池"。
3. **冲突消解**：当两个 Agent 给出相互矛盾的结论（如"该函数有 bug" vs "无 bug"），引入第三方 Agent 仲裁，或使用加权投票（按 Agent 历史准确率加权）。

实践建议：多 Agent 系统中**不要让所有 Agent 共享同一 prompt** —— 否则它们会犯同样的幻觉，共识失效。要让 Agent 使用不同的检索源、不同的角色视角、不同的推理路径，共识才有意义。

---

## 三、角色分工调度

### 3.1 基于图的任务分发

#### 原理与核心思想

复杂任务通常不是"一个 Agent 一次性完成"，而是被分解成有依赖关系的子任务，由不同 Agent 协作完成。**任务图（Task Graph）** 描述子任务之间的依赖，**角色图（Role Graph）** 描述 Agent 之间的能力。任务分发问题就是：**把任务图的每个节点分配给角色图的某个节点，使整体效率最大化、依赖满足**。

这是一个典型的**二分图匹配**问题的扩展——任务与角色之间是多对多关系（一个角色能干多种任务，一个任务也可能需要多角色协作），还要考虑时序依赖。

#### 关键概念与模型

**任务图** $G_T = (V_T, E_T)$：

- $V_T$：任务节点，每个任务 $t_i$ 有工作量 $w_i$、技能需求 $S_i$
- $E_T$：依赖边，$(t_i, t_j) \in E_T$ 表示 $t_j$ 依赖 $t_i$ 的输出

**角色图** $G_R = (V_R, E_R)$：

- $V_R$：Agent 角色，每个角色 $r_k$ 有技能集 $C_k$、并发度 $\rho_k$
- $E_R$：角色间的协作通路（通信成本）

**匹配目标**：找到一个映射 $m: V_T \to V_R$，使得：

$$
\min \sum_{t \in V_T} \text{finish\_time}(t)
$$

约束：

- 技能覆盖：$S_i \subseteq C_{m(t_i)}$
- 依赖满足：$(t_i, t_j) \in E_T \Rightarrow \text{finish}(t_i) < \text{start}(t_j)$
- 容量约束：同一时刻分给 $r_k$ 的任务数 $\leq \rho_k$

这是**调度问题**（受技能约束的任务调度），是 NP-hard 的，实际系统用启发式或贪心算法求解。

#### Agent 开发中的应用场景

1. **复杂工作流编排**：在 LangGraph、AutoGen 等框架中，任务图就是 DAG，每个节点是一个 Agent 调用。基于图的任务分发让框架能自动并行化无依赖节点。
2. **专家系统分工**：法律分析任务可分为"事实梳理"、"法条检索"、"案例比对"、"结论形成"，由四个专家 Agent 按依赖执行。
3. **CI/CD 自动化**：代码改动后自动触发"单元测试 Agent"、"安全扫描 Agent"、"文档生成 Agent"，它们的依赖关系形成 DAG。
4. **多模态处理**：一个文档处理任务需要 OCR Agent、版面分析 Agent、文本理解 Agent、图表提取 Agent，它们之间有严格依赖。

#### 简单示例

```python
from collections import defaultdict, deque

class Task:
    def __init__(self, name, skills_required, workload=1):
        self.name = name
        self.skills = set(skills_required)
        self.workload = workload
        self.deps = []  # 前置任务

class AgentRole:
    def __init__(self, name, skills, capacity=1):
        self.name = name
        self.skills = set(skills)
        self.capacity = capacity  # 并发度

def schedule_tasks(tasks: list, roles: list) -> dict:
    """
    基于依赖与技能匹配的贪心调度。
    返回 {task_name: (assigned_role, start_time)}
    """
    # 拓扑排序
    in_degree = {t.name: 0 for t in tasks}
    graph = defaultdict(list)
    task_map = {t.name: t for t in tasks}
    for t in tasks:
        for dep in t.deps:
            graph[dep].append(t.name)
            in_degree[t.name] += 1

    queue = deque([n for n, d in in_degree.items() if d == 0])
    assignment = {}
    finish_times = {}  # role_name -> 最早可用时间
    role_busy_until = defaultdict(int)

    while queue:
        task_name = queue.popleft()
        task = task_map[task_name]
        # 找到能完成此任务且最早可用的角色
        candidates = [r for r in roles if task.skills.issubset(r.skills)]
        if not candidates:
            raise ValueError(f"无角色能完成任务 {task_name}")
        # 选取最早可用的角色
        best_role = min(candidates, key=lambda r: role_busy_until[r.name])
        start = role_busy_until[best_role.name]
        # 等待依赖完成
        for dep in task.deps:
            dep_finish, _ = assignment[dep][1]
            start = max(start, dep_finish)
        finish = start + task.workload
        assignment[task_name] = (best_role.name, (start, finish))
        role_busy_until[best_role.name] = finish

        for next_task in graph[task_name]:
            in_degree[next_task] -= 1
            if in_degree[next_task] == 0:
                queue.append(next_task)

    return assignment


# 构建任务: 法律咨询流水线
t1 = Task("fact_extraction", ["NLP", "extraction"])
t2 = Task("law_search", ["retrieval", "legal"])
t3 = Task("case_match", ["retrieval", "legal"])
t4 = Task("conclusion", ["reasoning", "legal"], workload=2)
t4.deps = [t1.name, t2.name, t3.name]
t3.deps = [t2.name]
t2.deps = [t1.name]

roles = [
    AgentRole("ExtractorBot", ["NLP", "extraction"]),
    AgentRole("LegalBot", ["retrieval", "legal"], capacity=2),
    AgentRole("ReasonerBot", ["reasoning", "legal"]),
]
plan = schedule_tasks([t1, t2, t3, t4], roles)
for task, (role, (s, e)) in plan.items():
    print(f"{task} -> {role} @ [{s}, {e}]")
```

### 3.2 角色定义与能力匹配

#### 原理与核心思想

角色定义是多 Agent 系统的"组织设计"。好的角色定义需要回答三个问题：

1. **做什么**（职责）—— 这个角色负责哪些任务类型
2. **能做什么**（能力）—— 这个角色具备哪些技能、工具、知识
3. **如何与别人配合**（接口）—— 这个角色的输入输出格式

能力匹配的本质是**供需匹配**：任务的技能需求 $\subseteq$ 角色的能力供给。当任务复杂、角色多样时，这变成一个**带约束的匹配问题**，可以使用匈牙利算法（精确最优）或贪心算法（近似）求解。

#### 关键概念与模型

**角色画像**（Role Profile）通常包含：

- 技能向量 $\mathbf{c}_k \in \{0,1\}^{|S|}$（每个技能 0/1，或软标签 0-1）
- 工具集 $T_k$
- 知识库 $K_k$
- 性能指标（如准确率、平均延迟）$\mathbf{p}_k$

**任务需求向量** $\mathbf{s}_i$，匹配度可用**加权相似度**度量：

$$
\text{match}(t_i, r_k) = \frac{\mathbf{s}_i \cdot \mathbf{c}_k}{\|\mathbf{s}_i\| \cdot \|\mathbf{c}_k\|} \cdot \alpha_k
$$

其中 $\alpha_k$ 是角色的历史表现权重。

当任务需要多角色协作时（如"代码评审"需要 + "安全审计"），用**集合覆盖**思维：找到一个角色子集 $R' \subseteq V_R$ 使得 $\bigcup_{r \in R'} C_r \supseteq S_i$，并最小化角色数量或最大化整体匹配度。

#### Agent 开发中的应用场景

1. **角色配置文件**：在 CrewAI 中，每个 Agent 有 role、goal、backpack（工具），就是上述角色画像的实例化。
2. **动态角色加载**：根据当前任务的需求向量，从角色池中选择最匹配的几个 Agent 加载，降低上下文成本。
3. **能力扩展建议**：当某个任务没有合适的角色能完成（匹配度低），系统提示用户创建新角色或为现有角色增加工具。

#### 简单示例

```python
import numpy as np

class Role:
    def __init__(self, name, skills_vector, tools, accuracy=1.0):
        self.name = name
        self.c = np.array(skills_vector)  # 能力向量
        self.tools = tools
        self.alpha = accuracy  # 历史表现权重

def match_score(task_skills, role):
    if np.linalg.norm(task_skills) == 0 or np.linalg.norm(role.c) == 0:
        return 0
    cos = np.dot(task_skills, role.c) / (np.linalg.norm(task_skills) * np.linalg.norm(role.c))
    return cos * role.alpha

def select_roles(task_skills, roles, threshold=0.5):
    """为任务选择最匹配的角色，返回按匹配度降序的列表"""
    scored = [(r, match_score(task_skills, r)) for r in roles]
    scored = [(r, s) for r, s in scored if s >= threshold]
    return sorted(scored, key=lambda x: -x[1])

# 技能词典: [NLP, retrieval, legal, reasoning, code, security]
roles = [
    Role("LegalAnalyst", [0.8, 0.7, 0.95, 0.7, 0, 0], ["law_search"]),
    Role("CodeReviewer", [0.6, 0.5, 0, 0.5, 0.95, 0.8], ["linter", "sast"]),
    Role("Researcher",   [0.9, 0.9, 0.4, 0.7, 0.3, 0.2], ["web_search"]),
]
# 任务需求: 法律+推理
task_needs = np.array([0.4, 0.3, 0.9, 0.7, 0, 0])
best = select_roles(task_needs, roles)
for r, s in best:
    print(f"{r.name}: score={s:.3f}")
# LegalAnalyst: 0.83
```

### 3.3 主流多 Agent 框架的协作模式对比

#### AutoGen: Group Chat（群聊模式）

**原理**：模拟一群人在群聊中讨论。一个 GroupChatManager 作为协调者，决定下一个发言的 Agent。

**核心组件**：

- `AssistantAgent`：参与讨论的 Agent
- `GroupChatManager`：管理发言顺序
- `speaker_selection_method`：选择下一个发言者的策略
  - `"auto"`：让 LLM 决定
  - `"round_robin"`：轮流
  - `"manual"`：外部指定
  - `"random"`：随机

**适用场景**：开放式讨论、头脑风暴、复杂问题求解。优势是灵活，劣势是发言顺序依赖 LLM 判断，可能不稳定。

#### CrewAI: 角色链（Sequential & Hierarchical）

**原理**：把任务组织成 process（顺序或层级），每个 Agent 在 process 中有明确角色。

**核心模式**：

- **Sequential Process**：Agents 按顺序依次处理同一 task，前一个的输出是后一个的输入
- **Hierarchical Process**：一个 Manager Agent 总览任务，把子任务分发给 Worker Agents

**适用场景**：流水线式任务（如"调研 -> 起草 -> 审校 -> 发布"），层级管理时让 Manager 决定谁做什么。

#### MetaGPT: SOP（Standard Operating Procedure）

**原理**：借鉴软件工程中的标准作业流程，把多 Agent 协作编码为**预定义的 SOP**。每个 Agent 有岗位（如产品经理、架构师、工程师），按 SOP 的步骤流转文档（如 PRD、设计文档、代码）。

**核心机制**：

- **角色定义**：每个 Agent 有 Profile、Goal、Constraints
- **Action**：可执行的动作（写 PRD、写代码、跑测试）
- **State**：当前流程状态，决定下一步该谁、做什么
- **Message**：Agent 间通信的载体，携带结构化文档

**适用场景**：成熟的工程化流程（如软件项目开发、研究报告撰写），优势是流程可重复、可审计，劣势是灵活性较低。

#### 对比表

| 维度 | AutoGen Group Chat | CrewAI 角色链 | MetaGPT SOP |
|------|-------------------|---------------|-------------|
| 协作模式 | 对等讨论 | 顺序/层级 | 流程编码 |
| 决策中心 | Manager 决定发言者 | Manager 分派任务 | SOP 预定义 |
| 灵活性 | 高（LLM 动态） | 中（结构化） | 低（流程固化） |
| 可重复性 | 低 | 中 | 高 |
| 适用规模 | 3-7 个 Agent | 3-10 个 Agent | 5+ 个 Agent，流程化 |
| 典型场景 | 创意讨论 | 流水线 | 软件工程、报告 |

### 3.4 集中式调度 vs 去中心化调度

#### 集中式调度（Centralized）

**原理**：有一个**主控 Agent**（Orchestrator / Planner / Supervisor），负责：

- 任务分解
- 子任务分配
- 结果聚合
- 异常处理

其他 Agent 都是 Worker，只响应主控的指令。

**优势**：

- 全局视图，能优化整体调度
- 易于实现和调试
- 决策一致性强

**劣势**：

- 主控是性能瓶颈（上下文容易爆炸）
- 单点故障——主控崩溃则整个系统瘫痪
- 扩展性差，规模大时主控不可承压

**典型框架**：LangGraph（图结构 + 主控节点）、CrewAI（Hierarchical Mode）、OpenAI Swarm（Orchestrator pattern）。

#### 去中心化调度（Decentralized）

**原理**：没有中央控制，Agent 之间通过消息总线或点对点通信自行协调。每个 Agent 自主决策"做什么、和谁合作"。

**优势**：

- 无单点故障
- 扩展性好
- 适应动态环境

**劣势**：

- 协调复杂，可能死锁或活锁
- 全局一致性难以保证
- 调试和追踪困难

**典型模式**：

- **发布订阅**（pub/sub）：Agent 订阅感兴趣的话题，发布消息到总线
- **合约网协议**（Contract Net Protocol, CNP）：一个 Agent 作为"招标方"发布任务，其他 Agent 作为"投标方"响应，招标方选择最优
- **黑板模式**（Blackboard）：共享一块"黑板"，所有 Agent 读写，通过观察黑板上的变化决定自己下一步

#### 混合架构

实践中，**纯集中式和纯去中心化都是极端**。常见的是混合架构：

- 顶层集中调度（解决"做什么"）
- 底层去中心化协作（解决"怎么做"）
- 关键决策用 Quorum 共识（保障可靠性）

例如：一个 Planner Agent 制定高层计划，但每个子任务的执行由若干 Worker Agent 用合约网协议自治协调；遇到争议时，由一个专家 Agent 委员会用 BFT 共识裁决。

#### 简单示例

```python
class Orchestrator:
    """集中式调度器"""
    def __init__(self, workers):
        self.workers = workers

    def execute(self, task: str):
        subtasks = self.decompose(task)
        results = {}
        for sub in subtasks:
            worker = self.pick_worker(sub)
            results[sub] = worker.run(sub)
        return self.aggregate(results)

    def decompose(self, task):
        # 简化: 用 LLM 拆解任务
        return [f"{task}.step1", f"{task}.step2"]

    def pick_worker(self, sub):
        # 根据技能匹配
        return self.workers[0]

    def aggregate(self, results):
        return "\n".join(f"- {k}: {v}" for k, v in results.items())


class Blackboard:
    """去中心化黑板模式"""
    def __init__(self):
        self.data = {}
        self.subscribers = defaultdict(list)

    def write(self, key, value, writer):
        self.data[key] = value
        for callback in self.subscribers[key]:
            callback(key, value, writer)

    def subscribe(self, key, callback):
        self.subscribers[key].append(callback)


# 集中式
orch = Orchestrator(workers=[type("W", (), {"run": lambda self, t: f"done({t})"})()])
print(orch.execute("build_agent"))

# 去中心化
bb = Blackboard()
def on_new_finding(key, value, writer):
    print(f"[{writer}] wrote {key}={value}, triggering review")
bb.subscribe("raw_data", on_new_finding)
bb.write("raw_data", "sample", "ExplorerAgent")
```

---

## 小结

多 Agent 协作是把"单 Agent 强大推理"扩展为"组织级智能"的关键技术，但它的复杂性远超单 Agent。本篇讨论的三大算法族各自应对一个核心挑战：

**博弈论**应对**利益冲突**。当多个 Agent 共享有限资源（工具、预算、注意力）时，纳什均衡分析能预测它们的策略行为；Vickrey 拍卖提供"激励相容"的分配机制，让 Agent 如实报价；重复博弈理论则告诉我们如何用长期信誉机制抑制恶意行为。在 AutoGen 的 Group Chat 中，Agent 间竞争"发言权"本质上就是博弈，理解纳什均衡有助于设计稳定的发言选择策略。

**共识算法**应对**一致性挑战**。多 Agent 各自看到局部信息、得出局部结论，要让它们的输出合并为可靠的全局结论，需要 Quorum 投票、PoA 轮值、BFT 容错等机制。在 RAG 增强的多 Agent 系统中，让 3-5 个 Agent 用不同检索源独立回答，再用 Quorum 投票聚合，是把"幻觉率"从个位数百分比降到千分位的最有效手段之一。但要警惕——**共识只在 Agent 之间足够"独立"时才有效**，共享 prompt 或共享检索源会让共识沦为幻觉的回声。

**角色分工调度**应对**任务分解**。复杂任务被建模为任务图（DAG），通过技能匹配分配给角色图中的 Agent，由调度器（集中式或去中心化）协调执行。AutoGen、CrewAI、MetaGPT 三大框架的差异本质上是"组织架构"的差异：群聊式、角色链式、SOP 式——分别对应"灵活讨论"、"流水线作业"、"标准流程"三种典型工作场景。选择框架时先想清楚你的任务更像哪种组织模式，再选框架。

最后要强调的是，多 Agent 系统的工程复杂度远高于单 Agent——调试困难、错误传播、token 成本爆炸、协调开销过大都是常见陷阱。**"先单 Agent 跑通，再考虑多 Agent"** 是务实建议：当你发现单 Agent 的上下文窗口不够、需要并行不同专业能力、或需要相互审查降低幻觉时，再引入多 Agent 架构。多 Agent 不是"更高级的 Agent"，而是"分工的多个 Agent"——它解决的是规模与专业度问题，而非"智能"本身。
