# 强化学习（进阶）

## 本篇导读

本篇是 Agent 开发算法系列的第 8 篇，面向已经掌握 Agent 基本概念、希望深入理解底层强化学习（Reinforcement Learning, RL）算法的工程师。如果你只熟悉"提示词工程"或"函数调用"这一层，本篇会向下沉到数学与算法层面，讲清楚 Agent 究竟是如何**从环境反馈中学习最优行为**的。

本篇覆盖五个核心算法：Q-Learning、DQN、PPO、RLHF、Bandit。它们之间的脉络是——

- **Q-Learning** 是经典 RL 的基石，用一张 Q 表记录"在某个状态下采取某个动作的价值"；
- **DQN** 把 Q 表换成神经网络，让 RL 能处理高维状态空间（比如图像、文本）；
- **PPO** 是策略梯度家族中工程上最稳定的算法，是当前 RLHF 的默认选择；
- **RLHF** 把人类偏好转化为奖励信号，再用 PPO 微调语言模型，是 ChatGPT 等对齐技术的核心；
- **Bandit** 是 RL 的最简形式（只有一个状态），在 Agent 工具选择、A/B 测试等场景中极为常用。

阅读本篇建议具备：基本的概率论与微积分、Python 阅读能力、对 MDP（马尔可夫决策过程）的初步了解。文中公式使用 LaTeX 语法，关键概念会配 Python 伪代码以便理解。

---

## 一、Q-Learning

### 1.1 原理与核心思想

Q-Learning 是一种**无模型（model-free）**的**离策略（off-policy）**时序差分（TD）学习算法，由 Watkins 于 1989 年提出。它的核心思想非常直观：维护一张表格 $Q(s, a)$，记录在状态 $s$ 下采取动作 $a$ 之后，**期望累计获得的折扣回报**。Agent 在每个状态下选择 Q 值最大的动作，并通过与环境交互得到的真实回报不断修正这张表，最终收敛到最优动作价值函数 $Q^*$。

"Q"即 Quality（质量），衡量的是某个状态-动作对的长期价值。Q-Learning 的妙处在于：它不需要知道环境的转移概率和奖励函数（即"model-free"），只需要能与环境交互、观察到 $(s, a, r, s')$ 这样的转移样本即可。这一点对真实世界中的 Agent 尤为重要——绝大多数 Agent 面对的环境都是未知的、复杂的、难以建模的。

Q-Learning 属于"离策略"算法，意味着产生行为的策略（行为策略，常用 ε-greedy）和被评估/更新的策略（目标策略，纯 greedy）可以不同。这种解耦让算法能够"一边探索一边学习最优策略"，是它能在实践中收敛的关键。

### 1.2 关键公式与算法

#### 马尔可夫决策过程（MDP）

RL 问题通常被建模为 MDP，由五元组 $(S, A, P, R, \gamma)$ 描述：

- $S$：状态集合
- $A$：动作集合
- $P(s' | s, a)$：状态转移概率
- $R(s, a)$：奖励函数
- $\gamma \in [0, 1)$：折扣因子，衡量未来奖励的当前价值

Agent 的目标是找到一个策略 $\pi(a|s)$，使得期望累计折扣回报最大化：

$$
G_t = R_{t+1} + \gamma R_{t+2} + \gamma^2 R_{t+3} + \cdots = \sum_{k=0}^{\infty} \gamma^k R_{t+k+1}
$$

#### 贝尔曼方程

**状态价值函数** $V^\pi(s)$ 和**动作价值函数** $Q^\pi(s, a)$ 分别定义为：

$$
V^\pi(s) = \mathbb{E}_\pi \left[ G_t | S_t = s \right]
$$

$$
Q^\pi(s, a) = \mathbb{E}_\pi \left[ G_t | S_t = s, A_t = a \right]
$$

它们满足**贝尔曼方程**——将价值函数递归地分解为"即时奖励 + 下一状态的价值"：

$$
Q^\pi(s, a) = \mathbb{E} \left[ R_{t+1} + \gamma Q^\pi(S_{t+1}, A_{t+1}) \mid S_t = s, A_t = a \right]
$$

最优动作价值函数 $Q^*(s, a)$ 满足**贝尔曼最优方程**：

$$
Q^*(s, a) = \mathbb{E} \left[ R_{t+1} + \gamma \max_{a'} Q^*(S_{t+1}, a') \mid S_t = s, A_t = a \right]
$$

#### TD 更新规则

Q-Learning 用**时序差分（TD）**方法逼近贝尔曼最优方程。每观测到一个转移 $(s, a, r, s')$，就按下式更新：

$$
Q(s, a) \leftarrow Q(s, a) + \alpha \left[ r + \gamma \max_{a'} Q(s', a') - Q(s, a) \right]
$$

其中：
- $\alpha \in (0, 1]$ 是学习率
- $r + \gamma \max_{a'} Q(s', a')$ 称为 **TD 目标**
- $\delta = r + \gamma \max_{a'} Q(s', a') - Q(s, a)$ 称为 **TD 误差**

直觉上：Agent 用"实际拿到的奖励 + 对下一状态的最优估值"作为新估计，与旧估计做差，再按学习率 $\alpha$ 调整。这就像你预估某条路要 30 分钟，实际走了 25 分钟就到了，于是把对该路的估值向下修正一些。

#### Q 表

Q-Learning 用一张表格存储所有 $(s, a)$ 对的 Q 值：

| 状态 \ 动作 | $a_1$ | $a_2$ | $a_3$ |
|---|---|---|---|
| $s_1$ | 1.2 | 0.5 | -0.3 |
| $s_2$ | 0.8 | 2.1 | 0.0 |
| ... | ... | ... | ... |

这限制了 Q-Learning 只能处理**状态空间和动作空间都离散且有限**的问题。对于连续或高维状态（例如图像、文本），Q 表无法穷举，这正是 DQN 要解决的。

#### ε-贪心策略

为了平衡**探索（Exploration）**与**利用（Exploitation）**，Q-Learning 通常使用 ε-greedy 策略：

$$
\pi(a|s) = \begin{cases}
1 - \epsilon + \frac{\epsilon}{|A|}, & a = \arg\max_{a'} Q(s, a') \\
\frac{\epsilon}{|A|}, & \text{otherwise}
\end{cases}
$$

即以概率 $\epsilon$ 随机探索一个动作，以概率 $1-\epsilon$ 选择当前 Q 值最大的动作。$\epsilon$ 通常从一个较大值（如 1.0）衰减到一个小值（如 0.05），让 Agent 早期多探索、后期多利用。

### 1.3 优缺点

**优点：**

- 算法简单，收敛性有理论保证（在满足一定条件下收敛到 $Q^*$）；
- off-policy 特性使得可以重用历史经验，样本效率高；
- 不需要环境模型，适用面广；
- 概念清晰，是理解所有后续 RL 算法的基础。

**缺点：**

- 只能处理离散、有限的状态和动作空间（受限于 Q 表）；
- 在高维状态下，"维度灾难"使得 Q 表不可行；
- 对超参数（学习率、ε 衰减、折扣因子）较为敏感；
- 假设状态满足马尔可夫性，部分可观测场景下效果会变差。

### 1.4 Agent 开发中的应用场景

- **离散状态的工具选择 Agent**：例如一个只能调用 5 个工具的简单 Agent，可以把"当前用户意图"离散化为状态，把"选择哪个工具"作为动作，用 Q-Learning 学习最优工具调用策略。
- **对话状态跟踪与策略学习**：把对话轮次的状态编码为离散值，动作是系统回复模板，用 Q-Learning 学习对话策略。
- **教学与原型**：在理解 RL 的阶段，Q-Learning 是构建 Agent 学习循环的最直观起点，能帮助工程师建立"状态-动作-奖励"的心智模型。

### 1.5 简单示例

下面是 Q-Learning 在一个网格世界（GridWorld）中学习最短路径的伪代码：

```python
import numpy as np

# 环境：4x4 网格，目标在右下角，每步 reward=-1，到达终点 reward=0
n_states = 16
n_actions = 4  # 上下左右
Q = np.zeros((n_states, n_actions))

alpha = 0.1     # 学习率
gamma = 0.95    # 折扣因子
epsilon = 1.0   # 初始探索率
epsilon_min = 0.05
epsilon_decay = 0.995
n_episodes = 1000

def env_step(state, action):
    # 返回 (next_state, reward, done)
    ...

for episode in range(n_episodes):
    state = env_reset()
    done = False
    while not done:
        # ε-greedy 选动作
        if np.random.rand() < epsilon:
            action = np.random.randint(n_actions)
        else:
            action = np.argmax(Q[state])

        next_state, reward, done = env_step(state, action)

        # TD 更新
        td_target = reward + gamma * np.max(Q[next_state]) * (1 - done)
        td_error = td_target - Q[state, action]
        Q[state, action] += alpha * td_error

        state = next_state

    # 探索率衰减
    epsilon = max(epsilon_min, epsilon * epsilon_decay)

# 学到最优策略：在每个状态取 argmax Q[state]
```

注意 `td_target` 中乘以 `(1 - done)` 的细节——终止状态下没有未来回报，TD 目标就是即时奖励本身。这是工程实现中常见的小技巧。

---

## 二、DQN（Deep Q-Network）

### 2.1 原理与核心思想

DQN 由 DeepMind 于 2013 年提出，2015 年发表于 Nature，是深度强化学习（Deep RL）的里程碑。它的核心贡献是把 Q-Learning 中的 Q 表替换为一个**神经网络** $Q_\theta(s, a)$，让 RL 第一次能够处理高维状态空间——比如 Atari 游戏的原始像素帧（$84 \times 84 \times 4$ 的输入），并在多个游戏上达到甚至超越人类水平。

为什么需要神经网络？因为现实世界中的状态（图像、文本、传感器读数）几乎都是高维连续的，无法用表格穷举。神经网络可以**泛化**：即使没见过的状态，也能通过相似性给出合理的 Q 值估计。这把"查表"问题变成了"函数逼近"问题。

但把神经网络和 Q-Learning 直接结合会遇到两个严重问题：

1. **样本相关性高**：连续的转移 $(s_t, a_t, r_t, s_{t+1})$ 之间高度相关，神经网络拟合这种序列数据会很不稳定；
2. **目标不稳定**：TD 目标 $r + \gamma \max_{a'} Q(s', a')$ 用的网络参数 $\theta$ 本身就在不断更新，相当于"追一个移动的靶子"，容易发散。

DQN 用两个工程技巧解决了这两个问题：**经验回放（Experience Replay）**和**目标网络（Target Network）**。

### 2.2 关键公式与算法

#### Q 函数的神经网络逼近

用一个参数为 $\theta$ 的神经网络近似 $Q^*(s, a)$：

$$
Q_\theta(s, a) \approx Q^*(s, a)
$$

通常网络的输入是状态 $s$，输出是所有动作的 Q 值向量 $[Q(s, a_1), Q(s, a_2), \ldots, Q(s, a_{|A|})]$，这样一次前向传播就能得到所有动作的估值，效率远高于"每个动作单独算一次"。

#### 损失函数

DQN 的训练目标是最小化 TD 误差的平方：

$$
L(\theta) = \mathbb{E}_{(s,a,r,s') \sim \mathcal{D}} \left[ \left( r + \gamma \max_{a'} Q_{\theta^-}(s', a') - Q_\theta(s, a) \right)^2 \right]
$$

其中：
- $\mathcal{D}$ 是经验回放缓冲区（replay buffer），存储历史转移 $(s, a, r, s')$；
- $\theta^-$ 是**目标网络**的参数，定期从 $\theta$ 同步，而不是每步都更新；
- $y = r + \gamma \max_{a'} Q_{\theta^-}(s', a')$ 是相对稳定的 TD 目标。

#### 经验回放（Experience Replay）

Agent 每次与环境交互得到的转移 $(s, a, r, s')$ 都存入一个固定大小的缓冲区 $\mathcal{D}$。训练时从 $\mathcal{D}$ 中**随机采样一个小批量（mini-batch）**用于梯度下降。

经验回放带来三个好处：
- **打破相关性**：随机采样使得同一批次内的样本近似独立同分布，满足 SGD 的假设；
- **提高样本效率**：一条经验可以被多次学习，而不是用完即弃；
- **平滑数据分布**：让训练更稳定。

#### 目标网络（Target Network）

DQN 维护两个网络：
- **主网络** $Q_\theta$：每步都用梯度下降更新；
- **目标网络** $Q_{\theta^-}$：参数 $\theta^-$ 每隔 $N$ 步从 $\theta$ 硬拷贝一次（$\theta^- \leftarrow \theta$），中间保持不变。

这样 TD 目标 $y$ 在两次同步之间是固定的，相当于"把靶子定住一小段时间再打"，显著提升训练稳定性。

#### 完整算法流程

1. 用随机权重初始化主网络 $\theta$，目标网络 $\theta^- \leftarrow \theta$；
2. 初始化经验回放缓冲区 $\mathcal{D}$；
3. for episode = 1, 2, ...:
   - 观察初始状态 $s$；
   - for t = 1, 2, ...:
     - 用 ε-greedy 选动作 $a$，观察 $(r, s')$；
     - 把 $(s, a, r, s')$ 存入 $\mathcal{D}$；
     - 从 $\mathcal{D}$ 随机采样一个 mini-batch；
     - 计算 TD 目标 $y = r + \gamma \max_{a'} Q_{\theta^-}(s', a')$（终止状态 $y = r$）；
     - 对 $L(\theta) = \mathbb{E}[(y - Q_\theta(s, a))^2]$ 做一步梯度下降；
     - 每 $N$ 步同步 $\theta^- \leftarrow \theta$；
     - $s \leftarrow s'$。

### 2.3 优缺点

**优点：**

- 突破了 Q 表的状态空间限制，能处理图像、文本等高维输入；
- 经验回放与目标网络让训练在工程上稳定可行；
- off-policy，可重用历史数据，样本效率较高；
- 是后续 Rainbow、Dueling DQN、A3C 等众多算法的基础。

**缺点：**

- 训练仍然不够稳定，对超参数（学习率、网络结构、回放缓冲区大小、目标网络同步频率）敏感；
- 仍然只适合**离散动作空间**（连续动作需要 DDPG/SAC 等变体）；
- Q 值过估问题（max 操作会放大噪声），后续 Double DQN 专门解决；
- 样本效率仍不如 model-based 方法，真实环境交互成本高时不适用。

### 2.4 Agent 开发中的应用场景

- **视觉 Agent**：输入是图像（如游戏画面、UI 截图），输出是离散操作（点击、移动），DQN 可以端到端学习"看图决策"。
- **推荐 Agent**：状态是用户的历史行为序列编码，动作是候选物品集合（离散），奖励是用户点击/停留时长，DQN 可以学习推荐策略。
- **对话系统的策略优化**：状态是对话上下文的向量表示，动作是预定义的回复动作，DQN 可以学习多轮对话中的最优回复策略。
- **工具调用 Agent 的离线训练**：把历史工具调用日志作为经验回放缓冲区，用 DQN 学习"在什么状态下调用什么工具最有效"。

### 2.5 简单示例

下面是 DQN 核心逻辑的伪代码（PyTorch 风格）：

```python
import torch
import torch.nn as nn
import torch.optim as optim
import random
from collections import deque

class QNetwork(nn.Module):
    def __init__(self, state_dim, n_actions):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 128),
            nn.ReLU(),
            nn.Linear(128, n_actions)
        )
    def forward(self, s):
        return self.net(s)

# 主网络与目标网络
policy_net = QNetwork(state_dim, n_actions)
target_net = QNetwork(state_dim, n_actions)
target_net.load_state_dict(policy_net.state_dict())
target_net.eval()

optimizer = optim.Adam(policy_net.parameters(), lr=1e-3)
replay_buffer = deque(maxlen=100_000)
batch_size = 64
gamma = 0.99
epsilon = 1.0
target_update_freq = 500
step = 0

def select_action(state):
    if random.random() < epsilon:
        return random.randrange(n_actions)
    with torch.no_grad():
        return policy_net(state).argmax(dim=1).item()

def learn():
    if len(replay_buffer) < batch_size:
        return
    batch = random.sample(replay_buffer, batch_size)
    s, a, r, s_next, done = zip(*batch)
    s = torch.cat(s)
    a = torch.tensor(a)
    r = torch.tensor(r, dtype=torch.float32)
    s_next = torch.cat(s_next)
    done = torch.tensor(done, dtype=torch.float32)

    # 当前 Q 值
    q_values = policy_net(s).gather(1, a.unsqueeze(1)).squeeze(1)
    # TD 目标（用目标网络）
    with torch.no_grad():
        max_q_next = target_net(s_next).max(dim=1)[0]
        td_target = r + gamma * max_q_next * (1 - done)
    loss = nn.functional.mse_loss(q_values, td_target)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

# 训练循环
for episode in range(n_episodes):
    state = env_reset()
    done = False
    while not done:
        action = select_action(state)
        next_state, reward, done = env_step(action)
        replay_buffer.append((state, action, reward, next_state, done))
        state = next_state
        learn()
        step += 1
        if step % target_update_freq == 0:
            target_net.load_state_dict(policy_net.state_dict())
```

关键点：`policy_net` 用于选动作和训练，`target_net` 只用于计算 TD 目标，定期同步。`gather` 是按动作索引取出对应 Q 值的常用写法。

---

## 三、PPO（Proximal Policy Optimization）

### 3.1 原理与核心思想

PPO 由 OpenAI 于 2017 年提出，是**策略梯度（Policy Gradient）**家族中工程上最稳定的算法之一。与 Q-Learning/DQN 学习"价值函数"不同，PPO 直接学习"策略函数" $\pi_\theta(a|s)$——给定状态，直接输出动作的概率分布。这种思路更适合**连续动作空间**和**随机策略**场景。

策略梯度方法的基本思想是：**好的动作让它未来更可能被选中，差的动作让它更不可能被选中**。具体地，沿着"让期望回报增大"的方向更新参数 $\theta$。但朴素策略梯度有两个工程痛点：

1. **步长难调**：更新太大，策略崩溃；更新太小，学习太慢；
2. **样本利用率低**：on-policy 方法要求每次更新都用"当前策略新采集"的样本，用完即弃，成本极高。

PPO 的核心贡献是用一个**裁剪目标函数（Clipped Surrogate Objective）**把更新幅度限制在一个"信任域"内，既保证了训练稳定性，又允许对同一批样本做多次小批量更新（epoch 训练），显著提升了样本利用率。正是这种"稳定 + 易用"的组合，让 PPO 成为 OpenAI、Anthropic、DeepMind 等公司在 RLHF 中事实上的默认算法。

### 3.2 关键公式与算法

#### 策略梯度定理

设 $J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}[R(\tau)]$ 为策略 $\pi_\theta$ 的期望累计回报，则：

$$
\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta} \left[ \sum_{t=0}^{T} \nabla_\theta \log \pi_\theta(a_t | s_t) \cdot A^{\pi_\theta}(s_t, a_t) \right]
$$

其中 $A^{\pi}(s, a) = Q^\pi(s, a) - V^\pi(s)$ 是**优势函数（Advantage Function）**，衡量动作 $a$ 相对于平均水平好多少。直觉上：如果 $A > 0$，这个动作比平均好，应该提高它的概率；如果 $A < 0$，应该降低。$\nabla_\theta \log \pi_\theta$ 是"提高这个动作对数概率"的梯度方向。

#### 重要性采样与比率

PPO 是 on-policy 算法，但为了重复利用样本，它用**重要性采样**把"在旧策略 $\pi_{\theta_{\text{old}}}$ 下采的样本"用于更新"新策略 $\pi_\theta$"。新旧策略的概率比率为：

$$
r_t(\theta) = \frac{\pi_\theta(a_t | s_t)}{\pi_{\theta_{\text{old}}}(a_t | s_t)}
$$

如果直接用 $r_t(\theta) \cdot A_t$ 作为目标，理论上可以重用旧样本，但当 $\theta$ 偏离 $\theta_{\text{old}}$ 太远时，估计的方差会爆炸、偏差会增大。

#### Clipped Surrogate Objective

PPO 把目标函数裁剪到 $[1-\epsilon, 1+\epsilon]$ 区间，防止更新过大：

$$
L^{\text{CLIP}}(\theta) = \mathbb{E}_t \left[ \min \left( r_t(\theta) A_t, \; \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon) A_t \right) \right]
$$

直觉理解：
- 当 $A_t > 0$（好动作）：希望 $r_t$ 越大越好，但被 $1+\epsilon$ 封顶——不让它无限增大导致策略崩溃；
- 当 $A_t < 0$（差动作）：希望 $r_t$ 越小越好，但被 $1-\epsilon$ 兜底——不让它过度抑制。

`min` 操作确保取的是更保守（更小）的那一项，相当于"自动选择惩罚更新的那一侧"。$\epsilon$ 通常取 0.1 ~ 0.3。

#### 完整目标函数

PPO 实际优化的是三项之和：

$$
L^{\text{PPO}}(\theta) = L^{\text{CLIP}}(\theta) - c_1 L^{\text{VF}}(\theta) + c_2 S[\pi_\theta](s_t)
$$

- $L^{\text{VF}}$ 是价值函数的均方误差（同时训练一个 critic 估计 $V(s)$）；
- $S[\pi_\theta]$ 是策略的**熵**，鼓励探索，避免策略过早收敛到确定性策略；
- $c_1, c_2$ 是系数。

#### 优势估计：GAE

实际中优势函数用 **GAE（Generalized Advantage Estimation）** 估计，权衡偏差和方差：

$$
\hat{A}_t = \sum_{l=0}^{\infty} (\gamma \lambda)^l \delta_{t+l}
$$

其中 $\delta_t = r_t + \gamma V(s_{t+1}) - V(s_t)$ 是 TD 误差，$\lambda \in [0, 1]$ 是 GAE 参数（通常取 0.95）。

### 3.3 优缺点

**优点：**

- 训练稳定，对超参数相对鲁棒，是工业界最常用的 on-policy 策略梯度算法；
- 支持连续和离散动作空间；
- 通过多 epoch 复用样本，样本效率优于纯 on-policy 方法；
- 实现相对简单，调参成本低于 TRPO。

**缺点：**

- 仍是 on-policy，样本效率不及 off-policy 方法（如 SAC、DQN 系列）；
- 在大规模分布式训练中需要小心同步策略新旧参数；
- 对初始化和奖励尺度敏感，工程上需要配合归一化；
- 不适合"奖励极其稀疏"的任务。

### 3.4 为什么 PPO 成为 RLHF 默认算法

PPO 在 RLHF 中被广泛采用，并非因为它在所有指标上最优，而是因为它在**稳定性、样本效率、实现复杂度**三者之间取得了工程上的最佳平衡：

- **稳定**：裁剪目标避免了策略崩溃——这对在人类反馈上训练超大语言模型尤其关键，一次崩溃可能浪费数十万美元的算力；
- **可并行**：on-policy 特性使得可以并行采集多份 rollout，适配大规模 GPU 集群；
- **生态成熟**：OpenAI、HuggingFace TRL、DeepSpeed-Chat 等都提供了 PPO 的参考实现，工程师可以直接复用；
- **可控**：裁剪阈值 $\epsilon$ 给了工程师一个清晰的"更新幅度旋钮"，便于调参。

### 3.5 简单示例

PPO 的核心更新逻辑（伪代码）：

```python
import torch
import torch.nn as nn

class ActorCritic(nn.Module):
    def __init__(self, state_dim, n_actions):
        super().__init__()
        self.shared = nn.Sequential(
            nn.Linear(state_dim, 64), nn.Tanh(),
            nn.Linear(64, 64), nn.Tanh()
        )
        self.actor = nn.Linear(64, n_actions)   # 输出动作 logits
        self.critic = nn.Linear(64, 1)          # 输出 V(s)

    def forward(self, s):
        h = self.shared(s)
        return self.actor(h), self.critic(h)

policy = ActorCritic(state_dim, n_actions)
optimizer = torch.optim.Adam(policy.parameters(), lr=3e-4)
clip_eps = 0.2
n_epochs = 10
gamma = 0.99
lam = 0.95

def compute_gae(rewards, values, dones, next_value):
    advantages = []
    gae = 0
    for t in reversed(range(len(rewards))):
        delta = rewards[t] + gamma * next_value * (1 - dones[t]) - values[t]
        gae = delta + gamma * lam * (1 - dones[t]) * gae
        advantages.insert(0, gae)
        next_value = values[t]
    return advantages

# 收集一批 rollout（用旧策略）
states, actions, rewards, dones, log_probs_old, values = collect_rollout(policy)
next_value = policy(states[-1])[1].item()
advantages = compute_gae(rewards, values, dones, next_value)
advantages = (advantages - np.mean(advantages)) / (np.std(advantages) + 1e-8)
returns = [a + v for a, v in zip(advantages, values)]

# 多 epoch 复用这批样本
for epoch in range(n_epochs):
    for batch in iterate_minibatches(states, actions, log_probs_old, advantages, returns):
        s, a, lp_old, adv, ret = batch
        logits, v = policy(s)
        dist = torch.distributions.Categorical(logits=logits)
        log_probs = dist.log_prob(a)
        ratio = torch.exp(log_probs - lp_old)

        # Clipped Surrogate Objective
        surr1 = ratio * adv
        surr2 = torch.clamp(ratio, 1 - clip_eps, 1 + clip_eps) * adv
        actor_loss = -torch.min(surr1, surr2).mean()
        critic_loss = ((v - ret) ** 2).mean()
        entropy = dist.entropy().mean()
        loss = actor_loss + 0.5 * critic_loss - 0.01 * entropy

        optimizer.zero_grad()
        loss.backward()
        nn.utils.clip_grad_norm_(policy.parameters(), 0.5)
        optimizer.step()
```

注意 `ratio = exp(log π_new - log π_old)` 这个等价写法，比直接相除数值更稳定。

---

## 四、RLHF（Reinforcement Learning from Human Feedback）

### 4.1 原理与核心思想

RLHF 是 ChatGPT、Claude、GPT-4 等现代对齐语言模型背后的核心技术。它的根本动机是：**很多人类偏好无法用规则或奖励函数显式写出**。"回答是否有帮助、是否无害、是否诚实"这类标准，本质上是模糊的、主观的、难以量化的。与其手写奖励函数，不如让人类标注员对模型输出做偏好比较，再从比较数据中**学一个奖励模型**，最后用 RL（通常是 PPO）优化策略。

RLHF 的思想最早可追溯到 InstructGPT（2022），其核心洞察是：监督微调（SFT）只能学到"模仿人类示范"，而 RLHF 能学到"人类偏好的相对排序"，从而超越人类示范的上限。

### 4.2 关键公式与算法：三阶段流程

RLHF 通常分为三个阶段：

#### 阶段一：SFT（Supervised Fine-Tuning，监督微调）

用一个高质量的人工示范数据集 $\{(x, y^*)\}$ 对预训练语言模型做监督微调：

$$
L_{\text{SFT}}(\theta) = -\mathbb{E}_{(x, y^*)} \left[ \log p_\theta(y^* | x) \right]
$$

这一步让模型学会"按指令格式回答问题"，但它只是模仿人类示范，未必符合偏好的细微差异。

#### 阶段二：Reward Model 训练

让 SFT 模型对一批 prompt $x$ 生成多个候选回答 $\{y_1, y_2, \ldots\}$，让人类标注员对这些回答做**两两比较**（哪个更好），得到偏好数据集 $\{(x, y_w, y_l)\}$，其中 $y_w$ 是更好的回答，$y_l$ 是较差的回答。

奖励模型 $r_\phi(x, y)$ 通常以 SFT 模型为骨架，把最后一个 token 的隐状态映射成一个标量奖励。训练目标是**Bradley-Terry 模型**下的偏好概率：

$$
P(y_w \succ y_l | x) = \frac{\exp(r_\phi(x, y_w))}{\exp(r_\phi(x, y_w)) + \exp(r_\phi(x, y_l))}
$$

对应负对数似然损失：

$$
L_{\text{RM}}(\phi) = -\mathbb{E}_{(x, y_w, y_l)} \left[ \log \sigma \left( r_\phi(x, y_w) - r_\phi(x, y_l) \right) \right]
$$

其中 $\sigma$ 是 sigmoid 函数。直觉上：让"好回答"的奖励比"差回答"的奖励尽可能大。

#### 阶段三：PPO 微调

用训练好的奖励模型作为环境的奖励来源，用 PPO 优化策略 $\pi_\theta$。每个 prompt $x$ 下，策略生成回答 $y$，奖励模型给出 $r_\phi(x, y)$。为了防止策略"钻牛角尖"（为了让奖励最大化而生成奇怪的回答），通常会加一个 **KL 惩罚**，约束 $\pi_\theta$ 不要偏离 SFT 模型 $\pi_{\text{ref}}$ 太远：

$$
R_{\text{total}}(x, y) = r_\phi(x, y) - \beta \log \frac{\pi_\theta(y | x)}{\pi_{\text{ref}}(y | x)}
$$

$$
= r_\phi(x, y) - \beta \, D_{\text{KL}}(\pi_\theta(\cdot | x) \| \pi_{\text{ref}}(\cdot | x))
$$

$\beta$ 是 KL 系数。PPO 的目标就是最大化 $\mathbb{E}_{x, y \sim \pi_\theta}[R_{\text{total}}(x, y)]$。

完整 RLHF 流程可以概括为：

$$
\text{Pretrained LM} \xrightarrow{\text{SFT}} \pi_{\text{SFT}} \xrightarrow{\text{RM training}} r_\phi \xrightarrow{\text{PPO + KL}} \pi_{\text{RLHF}}
$$

### 4.3 与 DPO（Direct Preference Optimization）对比

DPO（2023, Stanford）是 RLHF 的一个重要替代方案。它的核心洞察是：**人类的偏好比较数据本身已经隐含了奖励信号，没必要显式训练一个奖励模型，再跑 PPO**。DPO 通过数学推导，直接从偏好数据导出一个策略优化的闭式目标：

$$
L_{\text{DPO}}(\theta) = -\mathbb{E}_{(x, y_w, y_l)} \left[ \log \sigma \left( \beta \log \frac{\pi_\theta(y_w | x)}{\pi_{\text{ref}}(y_w | x)} - \beta \log \frac{\pi_\theta(y_l | x)}{\pi_{\text{ref}}(y_l | x)} \right) \right]
$$

直觉上：让 $\pi_\theta$ 相对于 $\pi_{\text{ref}}$ 提高 $y_w$ 的概率、降低 $y_l$ 的概率。

| 维度 | RLHF (PPO) | DPO |
|---|---|---|
| 训练阶段 | 三阶段（SFT → RM → PPO） | 两阶段（SFT → 直接偏好优化） |
| 是否需要显式 RM | 是 | 否 |
| 是否在线 RL | 是（需要策略采样） | 否（纯监督学习形式） |
| 工程复杂度 | 高（需 4 个模型同时加载：策略、价值、RM、参考） | 低（只需策略与参考模型） |
| 算力成本 | 高 | 低 |
| 探索能力 | 强（可发现新行为） | 弱（受限于偏好数据覆盖） |
| 超参敏感度 | 高（PPO 调参难） | 低 |
| 典型应用 | ChatGPT、GPT-4 对齐 | Llama-3-Instruct、Zephyr 等开源模型 |

实践上：算力充足、追求极致效果时用 RLHF；资源受限、追求快速迭代时用 DPO。两者并非互斥——业界已有 RLHF + DPO 混合方案。

### 4.4 优缺点

**优点：**

- 把模糊的人类偏好转化为可优化的奖励信号，是当前最有效的对齐方法之一；
- 三阶段流程解耦清晰，每个阶段可独立调优；
- 能让模型超越人类示范的上限（不再只是模仿）。

**缺点：**

- 整体流程长、工程复杂，PPO 阶段尤其难调；
- 奖励模型可能有偏差，导致策略"奖励黑客"（reward hacking）——为了刷高奖励生成奇怪内容；
- 偏好数据成本高，且标注员之间一致性有限；
- KL 约束只是软约束，过于强大时模型仍可能漂移。

### 4.5 Agent 开发中的应用场景

- **对话 Agent 对齐**：让 Agent 的回答更符合"有帮助、无害、诚实"标准，是 RLHF 最典型的应用。
- **工具调用 Agent 的偏好优化**：让人类标注员比较"哪种工具调用顺序更高效"，用 RLHF 优化工具使用策略。
- **代码生成 Agent**：让人类比较代码片段的可读性、正确性、风格，用 RLHF 微调代码模型。
- **多 Agent 协作中的角色对齐**：让 Agent 学会扮演特定角色（如客服、研究员），通过偏好反馈对齐行为风格。

### 4.6 简单示例

RLHF 阶段三（PPO）的最小伪代码：

```python
# 4 个模型：policy, ref (frozen), reward_model (frozen), value (critic)
policy = SFTModel(...)
ref = SFTModel(...).eval()  # 冻结
reward_model = RewardModel(...).eval()  # 冻结
value = ValueHead(...)
optimizer = Adam(list(policy.parameters()) + list(value.parameters()), lr=5e-6)
beta = 0.1  # KL 系数

def rollout(prompt):
    # 1. 用 policy 生成回答
    response = policy.generate(prompt)
    # 2. 计算 reward
    r = reward_model(prompt, response)
    # 3. 计算 KL 惩罚
    log_ratio = log_prob(policy, response, prompt) - log_prob(ref, response, prompt)
    kl = log_ratio  # 单步 KL 近似
    reward = r - beta * kl
    return response, reward, log_ratio

for step in range(n_steps):
    prompts = sample_prompts(batch_size)
    responses, rewards, log_ratios_old = zip(*[rollout(p) for p in prompts])
    advantages = compute_gae(rewards, value_values, ...)
    # PPO 更新（参考上一节）
    ...
```

关键点：`reward = r - beta * (log π_θ - log π_ref)`，KL 项通过"两个模型的对数概率差"在线估计，不需要显式计算 KL 散度。

---

## 五、Bandit 算法（多臂老虎机）

### 5.1 原理与核心思想

多臂老虎机（Multi-Armed Bandit, MAB）是强化学习的最简形式——**只有一个状态**，反复在 $K$ 个动作（"摇臂"）之间选择，每个动作 $a$ 有一个未知分布的奖励 $R(a)$。目标是在 $T$ 轮内最大化累计奖励，同时学习每个臂的期望奖励。

它本质上是一个纯粹的**探索-利用权衡（Exploration-Exploitation Tradeoff）**问题：
- **利用**：选当前看起来最好的臂，但可能错过真正最优的臂；
- **探索**：试试其他臂，但可能浪费本轮的奖励。

MAB 的"后悔"（regret）定义为：

$$
\text{Regret}(T) = T \cdot \mu^* - \mathbb{E}\left[\sum_{t=1}^{T} R_{a_t}\right]
$$

其中 $\mu^* = \max_a \mathbb{E}[R(a)]$ 是最优臂的期望奖励。好算法的后悔应是**对数增长**（$O(\log T)$），即随时间增长越来越慢。

在 Agent 开发中，MAB 是"在已知状态空间内做选择"的极简但强大工具——比如选哪个工具、选哪个 prompt 模板、A/B 测试哪个 UI。

### 5.2 关键算法

#### 5.2.1 ε-Greedy

最简单的 MAB 算法，与 Q-Learning 中的 ε-greedy 完全一致：

- 以概率 $\epsilon$ 随机选一个臂（探索）；
- 以概率 $1-\epsilon$ 选当前平均奖励最高的臂（利用）。

更新规则：用样本均值估计每个臂的奖励：

$$
\hat{\mu}_a \leftarrow \hat{\mu}_a + \frac{1}{N(a)} (r - \hat{\mu}_a)
$$

其中 $N(a)$ 是臂 $a$ 被选中的次数。

ε-greedy 的后悔是 $O(\log T)$（前提是 $\epsilon$ 衰减），但常数项较大，且 $\epsilon$ 的设置需要人工调。

#### 5.2.2 UCB（Upper Confidence Bound）

UCB 的思想是：**对每个臂的"乐观估计"做选择**。如果某个臂还没怎么试过，它的置信区间上界就很高，值得探索；如果一个臂已经试了很多次，它的估计已经很准，置信区间很窄，就靠真实估计值参与比较。

最常用的是 UCB1：

$$
a_t = \arg\max_a \left[ \hat{\mu}_a + c \sqrt{\frac{\ln t}{N(a)}} \right]
$$

- 第一项 $\hat{\mu}_a$ 是利用（exploitation）；
- 第二项 $c \sqrt{\frac{\ln t}{N(a)}}$ 是探索奖励，$N(a)$ 越小该项越大；
- $c$ 是探索系数，通常取 $\sqrt{2}$；
- $\ln t$ 让算法"对时间增长不过度敏感"。

UCB 是**确定性算法**（给定历史，选择唯一），理论后悔 $O(\log T)$，且无需调 $\epsilon$。

#### 5.2.3 Thompson Sampling

Thompson Sampling（汤普森采样）是基于贝叶斯思想的随机算法：

1. 为每个臂 $a$ 维护一个奖励分布的**后验** $p(\mu_a | \text{history})$；
2. 每轮从每个后验中**采样**一个 $\tilde{\mu}_a$；
3. 选 $\tilde{\mu}_a$ 最大的那个臂；
4. 观察奖励，用贝叶斯更新后验。

对于伯努利奖励（成功/失败），后验是 Beta 分布：

$$
\mu_a \sim \text{Beta}(\alpha_a, \beta_a)
$$

其中 $\alpha_a$ 是成功次数+1，$\beta_a$ 是失败次数+1。更新就是简单地累加计数：

```python
# 选臂
sampled = [np.random.beta(alpha[a], beta[a]) for a in range(K)]
a = argmax(sampled)
# 观察奖励 r ∈ {0, 1}
if r == 1: alpha[a] += 1
else:      beta[a]  += 1
```

Thompson Sampling 的后悔也是 $O(\log T)$，但实践中往往优于 UCB，原因是它自然地处理了不确定性，且对噪声更鲁棒。

#### 三者对比

| 算法 | 随机性 | 后悔 | 调参 | 适用场景 |
|---|---|---|---|---|
| ε-Greedy | 部分 | $O(\log T)$（衰减 ε） | 需调 ε | 简单基线 |
| UCB1 | 确定性 | $O(\log T)$ | 需调 c | 理论保证强 |
| Thompson Sampling | 随机 | $O(\log T)$ | 几乎无需 | 实践效果最佳 |

### 5.3 Agent 开发中的应用场景

- **工具选择**：Agent 有多个可用工具（搜索、计算器、数据库查询等），用 Bandit 学习"在什么类型的请求下选哪个工具成功率最高"。由于状态简单（或可上下文无关），MAB 比 DQN 更轻量。
- **Prompt 模板选择**：同一任务下有多个 prompt 模板，用 Bandit 自动选择哪个模板在历史中表现最好。
- **A/B 测试**：MAB 是 A/B 测试的自然泛化——传统 A/B 测试是"先探索一段时间再利用"，而 MAB 是"边探索边利用"，能动态把流量倾斜到效果更好的变体。
- **推荐系统的冷启动**：新物品没有历史数据时，用 Bandit 平衡"探索新物品"与"推荐已知热门"。
- **Agent 的探索-利用权衡**：在 RLHF 之外，Agent 在线服务时面对"用已知好策略 vs 尝试新行为"，Bandit 提供了一个轻量级的解法。

### 5.4 简单示例

下面是三种 MAB 算法的最小实现对比：

```python
import numpy as np

K = 5                  # 臂数
T = 1000               # 总轮数
true_means = np.random.rand(K)

# ---------------- ε-Greedy ----------------
epsilon = 0.1
est_means = np.zeros(K)
counts = np.zeros(K)
for t in range(T):
    if np.random.rand() < epsilon:
        a = np.random.randint(K)
    else:
        a = np.argmax(est_means)
    r = 1 if np.random.rand() < true_means[a] else 0
    counts[a] += 1
    est_means[a] += (r - est_means[a]) / counts[a]

# ---------------- UCB1 ----------------
est_means = np.zeros(K)
counts = np.zeros(K)
c = np.sqrt(2)
# 先每个臂试一次
for a in range(K):
    r = 1 if np.random.rand() < true_means[a] else 0
    counts[a] = 1
    est_means[a] = r
for t in range(K, T):
    ucb = est_means + c * np.sqrt(np.log(t + 1) / counts)
    a = np.argmax(ucb)
    r = 1 if np.random.rand() < true_means[a] else 0
    counts[a] += 1
    est_means[a] += (r - est_means[a]) / counts[a]

# ---------------- Thompson Sampling ----------------
alpha = np.ones(K)   # Beta(1,1) = 均匀分布
beta = np.ones(K)
for t in range(T):
    samples = np.random.beta(alpha, beta)
    a = np.argmax(samples)
    r = 1 if np.random.rand() < true_means[a] else 0
    if r == 1:
        alpha[a] += 1
    else:
        beta[a] += 1
```

工程上，Thompson Sampling 因为实现简单、效果稳定、无需调参，是 Agent 中最常用的 MAB 算法。

---

## 六、小结

本篇从经典 RL 到现代深度 RL，再到 RLHF，最后回到最简形式的 Bandit，串起了 Agent 从环境反馈中学习的核心算法谱系：

- **Q-Learning** 用 Q 表学习最优动作价值，是理解 RL 的起点，但受限于离散状态；
- **DQN** 用神经网络 + 经验回放 + 目标网络突破维度限制，让 RL 走入深度学习时代；
- **PPO** 用裁剪目标让策略梯度训练稳定可控，成为工业界的事实标准；
- **RLHF** 把人类偏好转化为奖励信号，用 PPO 对齐语言模型，是 ChatGPT 等现代 Agent 的对齐基石；DPO 作为轻量替代，正在快速普及；
- **Bandit** 是 RL 的最简形式，在工具选择、A/B 测试等"单状态"场景中极为实用。

几条贯穿始终的工程经验：

1. **稳定性 > 最优性**。从 Q-Learning 的 TD 误差、DQN 的目标网络、PPO 的裁剪，到 RLHF 的 KL 惩罚，每个算法的工程化都在于"让训练不发散"——一个不稳定的算法再优雅也无法落地。
2. **探索-利用是永恒主题**。ε-greedy、UCB 的置信区间、Thompson Sampling 的后验采样、PPO 的熵正则——它们都是同一问题的不同解法。在 Agent 开发中，何时探索新行为、何时利用已知好策略，是设计决策的核心。
3. **样本效率决定成本**。off-policy（Q-Learning、DQN）能重用历史数据，on-policy（PPO）不能但更稳定；RLHF 在线采样成本极高，DPO 用纯监督形式绕开 RL，是样本效率与稳定性的工程权衡。
4. **奖励设计是 Agent 的灵魂**。Q-Learning 假设奖励来自环境，RLHF 让奖励从人类偏好中学习——从"手写奖励"到"学习奖励"，这是 Agent 从"专用工具"走向"通用智能"的关键一跃。

下一篇将进入 Agent 的高级主题，讨论如何把这些算法整合到完整的 Agent 系统中。
