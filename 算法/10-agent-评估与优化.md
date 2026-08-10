# 10｜评估与优化

## 本篇导读

前九篇我们依次拆解了 Agent 的核心算法骨架：从感知与记忆、检索与重排、规划与推理、工具调用与函数执行，到反思、多智能体协作、安全对齐与可观测性。这些模块决定了 Agent "能不能做"，但 "做得好不好" 以及 "如何持续做得更好" 则取决于评估与优化这一闭环。

评估与优化是 Agent 工程化落地的最后一公里，也是最容易被忽视的一公里。与传统 ML 模型不同，Agent 是多步决策系统，其输出不仅取决于单次推理，还取决于工具调用序列、中间状态、环境交互等。这意味着仅用 BLEU、ROUGE 这类静态指标无法刻画 Agent 真实能力，必须引入轨迹级、多维度、动态化的评估范式。

本篇聚焦四个关键算法：

1. **A/B Testing**：经典统计假设检验，用于在两个策略版本之间做严谨的"谁更好"判断，是离线/在线评估的基石。
2. **MAB（Multi-Armed Bandit）**：在探索与利用之间动态平衡，适合策略空间大、需要在线持续优化的场景，是 A/B Testing 的"进化版"。
3. **LLM-as-a-Judge**：用大模型自动评估大模型输出，大幅降低人工标注成本，是当下 Agent 评估事实上的主流方案。
4. **Trajectory Evaluation**：多步 Agent 轨迹评估，覆盖步骤正确率、路径效率、任务完成率等指标，是评估 Agent 真实能力的核心方法论。

掌握这四个算法，才能把 Agent 从"能 demo"推向"能上线"，并构建起数据驱动的持续优化飞轮。本篇结尾也会对整个算法系列做一次小结，帮助读者把十篇内容串联成完整的知识地图。

---

## 1. A/B Testing

### 1.1 原理与核心思想

A/B Testing（A/B 测试）是一种基于统计假设检验的对照实验方法：将用户流量随机划分为两组，分别施加策略 A（对照组）与策略 B（实验组），通过对比两组在某个关键指标上的表现差异，判断新策略是否在统计意义上显著优于旧策略。其哲学根基是"用数据说话"——不依赖直觉或单点案例，而是用足够大的样本量来消除随机噪声，从而做出可信决策。

在 Agent 场景中，A/B Testing 的对象通常不是页面按钮，而是 Prompt 版本、检索策略、模型选择、工具调用顺序等。例如对比"直接回答"与"先检索再回答"两种 Prompt 模板在问答准确率上的差异。核心思想是：在控制其他变量不变的前提下，只改变一个因素，通过随机分组让两组样本在统计上等价，从而把观测到的差异归因于该因素。

### 1.2 关键方法与流程

#### 假设检验

A/B Testing 的统计基础是假设检验：

- **零假设 H0**：策略 A 与策略 B 在指标上无差异（μ_A = μ_B）。
- **备择假设 H1**：策略 B 优于策略 A（μ_B > μ_A，单侧）或两者不相等（双侧）。

#### p-value 与显著性水平

p-value 表示在 H0 成立的前提下，观测到当前差异（或更极端差异）的概率。若 p-value 小于预设的显著性水平 α（通常取 0.05），则拒绝 H0，认为差异显著。

#### 置信区间

除了 p-value，还应报告效应量的置信区间，它不仅告诉你"是否显著"，还告诉你"差异有多大、方向是否稳定"。

#### 样本量计算

样本量不足会导致实验"看不出差异"（统计功效不足），样本量过大则浪费资源。样本量由四个参数决定：

- 基线转化率 p（当前策略的指标值）
- 最小可检测效应 MDE（希望检测到的最小差异）
- 显著性水平 α
- 统计功效 1−β（通常取 0.8）

对于两比例检验，每组所需样本量公式为：

$$
n = \frac{(z_{\alpha/2}\sqrt{2\bar{p}(1-\bar{p})} + z_{\beta}\sqrt{p(1-p) + (p+\delta)(1-p-\delta)})^2}{\delta^2}
$$

其中 $\bar{p} = p + \delta/2$，$\delta$ 为 MDE，$z_{\alpha/2}$、$z_{\beta}$ 为标准正态分位数。

#### 在线 A/B vs 离线评估

- **离线评估**：在固定的评测集上跑两个策略，对比指标。优点是快速、低成本、可重复；缺点是无法反映真实用户分布，容易过拟合评测集。
- **在线 A/B**：将新策略灰度发布到真实流量，对比线上指标（如点击率、留存、任务完成率）。优点是真实可信；缺点是周期长、有用户体验风险、需要流量分配基础设施。

Agent 工程的典型实践是：离线评估做初筛（淘汰明显差的策略），在线 A/B 做终审（决定是否全量）。

### 1.3 优缺点

**优点**

- 统计严谨，结论可量化、可复现。
- 方法成熟、工具链完善（如 SciPy、Statsmodels）。
- 适用于任何可量化指标，通用性强。

**缺点**

- 只能对比两个（或少数几个）策略，无法处理大规模策略空间。
- 需要较大样本量，对低频长尾场景不友好。
- 实验周期内策略固定，无法根据中间结果动态调整。
- 在线 A/B 有用户体验风险，需要灰度与回滚机制。

### 1.4 Agent 开发中的应用场景

- **Prompt 版本对比**：对比"思维链 Prompt"与"直答 Prompt"在数学题准确率上的差异。
- **检索策略对比**：对比 BM25 与向量检索在 RAG 召回率上的差异。
- **模型选型**：对比 GLM-4 与其他模型在工具调用准确率上的差异。
- **工具调用顺序**：对比"先搜索后计算"与"先计算后搜索"两种 Agent 编排在复杂任务上的完成率。
- **安全策略**：对比两种拒答策略的安全覆盖率与误拒率。

### 1.5 简单示例

```python
import numpy as np
from scipy import stats

# 模拟两个 Prompt 版本在 1000 道题上的正确率
np.random.seed(42)
# 版本 A：基线，正确率约 0.70
results_a = np.random.binomial(1, 0.70, 1000)
# 版本 B：新 Prompt，正确率约 0.75
results_b = np.random.binomial(1, 0.75, 1000)

# 两比例 z 检验
success_a, n_a = results_a.sum(), len(results_a)
success_b, n_b = results_b.sum(), len(results_b)
p_a, p_b = success_a / n_a, success_b / n_b

# 合并比例
p_pool = (success_a + success_b) / (n_a + n_b)
se = np.sqrt(p_pool * (1 - p_pool) * (1 / n_a + 1 / n_b))
z_stat = (p_b - p_a) / se
p_value = 1 - stats.norm.cdf(z_stat)

print(f"版本 A 正确率: {p_a:.4f}")
print(f"版本 B 正确率: {p_b:.4f}")
print(f"提升: {(p_b - p_a) * 100:.2f}%")
print(f"z 统计量: {z_stat:.4f}")
print(f"p-value: {p_value:.4f}")
if p_value < 0.05:
    print("结论: 拒绝 H0，版本 B 显著优于版本 A")
else:
    print("结论: 无法拒绝 H0，差异不显著")


# 样本量计算（最小可检测效应 MDE = 3%）
def sample_size_for_proportion(p, delta, alpha=0.05, power=0.8):
    z_alpha = stats.norm.ppf(1 - alpha / 2)
    z_beta = stats.norm.ppf(power)
    p_bar = p + delta / 2
    numerator = (z_alpha * np.sqrt(2 * p_bar * (1 - p_bar))
                 + z_beta * np.sqrt(p * (1 - p) + (p + delta) * (1 - p - delta))) ** 2
    return int(np.ceil(numerator / delta ** 2))

n_per_group = sample_size_for_proportion(p=0.70, delta=0.03)
print(f"\n检测 3% 提升所需每组样本量: {n_per_group}")
```

**Prompt 模板示例（离线评估记录）**：

```
评测任务: 数学应用题（500 题）
策略 A（直答）: "请直接给出答案。"
策略 B（思维链）: "请一步步思考，最后给出答案。"
指标: 准确率、平均响应时长、平均 token 消耗
判定: 若 B 的准确率 - A 的准确率 > 2% 且 p < 0.05，则采纳 B
```

---

## 2. MAB（Multi-Armed Bandit，多臂老虎机）

### 2.1 原理与核心思想

多臂老虎机问题源自赌场场景：面前有 K 台老虎机（"臂"），每台以未知概率吐出奖励，玩家需要在有限次尝试中找到回报最高的那台。问题的核心矛盾是 **探索-利用困境（Exploration-Exploitation Dilemma）**：是继续探索没试过的机器（可能更好），还是利用已知最好的机器（保住收益）？

A/B Testing 是一种"先纯探索、再纯利用"的极端策略——实验期内所有臂等比例探索，实验结束后全量切到胜者。MAB 则采用动态平衡：边探索边利用，根据每一轮的反馈实时调整各臂的拉取概率，让收益更高的臂获得更多流量，同时保留少量探索以避免错失更优选项。这种"自适应"特性使 MAB 在策略空间大、反馈周期长、需要在线持续优化的场景中显著优于 A/B Testing。

### 2.2 关键方法

#### ε-Greedy

最简单的 MAB 算法：以概率 ε 随机探索一个臂，以概率 1−ε 选择当前平均奖励最高的臂（贪心）。

$$
a_t = \begin{cases} \text{随机臂} & \text{以概率 } \epsilon \\ \arg\max_a Q(a) & \text{以概率 } 1-\epsilon \end{cases}
$$

其中 $Q(a) = \frac{1}{N(a)}\sum_{i=1}^{N(a)} r_i$ 是臂 a 的平均奖励。ε 可固定，也可随时间衰减（前期多探索，后期多利用）。

#### UCB（Upper Confidence Bound）

UCB 的思想是"乐观面对不确定性"：对每个臂的奖励估计一个置信上界，选择上界最大的臂。奖励均值高或尝试次数少（不确定性大）的臂都会获得高优先级。

$$
a_t = \arg\max_a \left( Q(a) + c \sqrt{\frac{\ln t}{N(a)}} \right)
$$

其中 $t$ 是总轮次，$N(a)$ 是臂 a 被选次数，$c$ 是探索系数（通常取 $\sqrt{2}$）。第二项是探索奖励，$N(a)$ 越小该项越大，鼓励尝试冷门臂。

#### Thompson Sampling

基于贝叶斯思想：为每个臂的奖励分布维护一个先验（如 Beta 分布），每次观测后用贝叶斯更新得到后验；采样时从每个臂的后验中抽一个样本，选样本最大的臂。Thompson Sampling 在实践中往往优于 UCB，且对延迟反馈、批量更新等场景更鲁棒。

对于伯努利奖励（成功/失败），臂 a 的后验为 $\text{Beta}(\alpha_a, \beta_a)$，其中 $\alpha_a$ 是成功次数+1，$\beta_a$ 是失败次数+1。每次从每个臂的 Beta 分布采样，选最大者：

$$
\theta_a \sim \text{Beta}(\alpha_a, \beta_a), \quad a_t = \arg\max_a \theta_a
$$

#### 与 A/B Testing 对比

| 维度 | A/B Testing | MAB |
|------|-------------|-----|
| 流量分配 | 固定等分 | 动态调整 |
| 探索与利用 | 分阶段（先探索后利用） | 同时进行 |
| 收敛速度 | 慢（需等实验结束） | 快（实时优化） |
| 适合场景 | 需要严谨统计结论、策略少 | 策略多、需在线优化 |
| 可解释性 | 高（p-value、置信区间） | 中（概率分配） |

### 2.3 优缺点

**优点**

- 边探索边利用，累计收益高于 A/B Testing（减少"实验期"浪费）。
- 适合大规模策略空间，可同时对比数十乃至上百个臂。
- 在线自适应，能应对非平稳环境（用户偏好随时间变化）。
- Thompson Sampling 对延迟反馈和批量更新鲁棒。

**缺点**

- 统计严谨性弱于 A/B Testing，难以给出"是否显著"的结论。
- 收敛过程需要谨慎调参（ε、c），否则可能陷入次优臂。
- 难以处理协变量（用户特征）——这正是 Contextual Bandit 要解决的问题。
- 在线实现需要流量分配与反馈回流基础设施。

### 2.4 Agent 开发中的应用场景

- **Prompt 动态选择**：维护多个 Prompt 变体，根据用户反馈（点赞/点踩、是否继续追问）动态调整各 Prompt 的使用概率。
- **模型路由**：在多个 LLM 之间动态选择——简单问题用小模型，复杂问题用大模型，根据历史成功率自动学习路由策略。
- **检索策略选择**：BM25、向量检索、混合检索等策略中，根据查询类型动态选择表现最好的。
- **工具优先级**：当多个工具都能完成子任务时，根据历史成功率选择最优工具。

### 2.5 上下文老虎机（Contextual Bandit）

标准 MAB 假设每个臂的奖励分布与上下文无关，但实际中"最优臂"往往取决于用户特征或查询特征。Contextual Bandit 引入上下文特征 $x$，为每个臂学习一个奖励函数 $r_a(x)$，选择 $\arg\max_a r_a(x)$。常用算法包括 LinUCB（线性模型 + 置信上界）和基于神经网络的 Neural Bandit。

在 Agent 场景中，上下文可以是用户画像、查询意图分类、历史对话摘要等。例如：根据查询是"事实型"还是"推理型"动态选择不同的检索-生成策略，而不是对所有查询用同一套。

### 2.6 简单示例

```python
import numpy as np

# 三种 Prompt 策略的真实成功率（未知）
true_rates = {"prompt_A": 0.60, "prompt_B": 0.75, "prompt_C": 0.68}
prompts = list(true_rates.keys())

# Thompson Sampling（Beta 分布）
alpha = {p: 1 for p in prompts}
beta = {p: 1 for p in prompts}

np.random.seed(0)
rounds = 2000
for t in range(1, rounds + 1):
    # 从每个臂的后验采样
    samples = {p: np.random.beta(alpha[p], beta[p]) for p in prompts}
    # 选采样值最大的臂
    chosen = max(samples, key=samples.get)
    # 模拟用户反馈
    reward = np.random.rand() < true_rates[chosen]
    # 贝叶斯更新
    if reward:
        alpha[chosen] += 1
    else:
        beta[chosen] += 1

print("各臂被选次数:")
for p in prompts:
    total = alpha[p] + beta[p] - 2
    est = alpha[p] / (alpha[p] + beta[p])
    print(f"  {p}: 选中 {int(total)} 次, 估计成功率 {est:.3f}, 真实 {true_rates[p]}")

# 输出会显示 prompt_B 获得最多流量，因为它的真实成功率最高
```

**UCB 算法示例**：

```python
import numpy as np

true_rates = {"A": 0.60, "B": 0.75, "C": 0.68}
arms = list(true_rates.keys())
counts = {a: 0 for a in arms}
rewards_sum = {a: 0.0 for a in arms}

np.random.seed(0)
for t in range(1, 2001):
    ucb = {}
    for a in arms:
        if counts[a] == 0:
            ucb[a] = float("inf")  # 每个臂至少试一次
        else:
            mean = rewards_sum[a] / counts[a]
            bonus = np.sqrt(2 * np.log(t) / counts[a])
            ucb[a] = mean + bonus
    chosen = max(ucb, key=ucb.get)
    reward = np.random.rand() < true_rates[chosen]
    counts[chosen] += 1
    rewards_sum[chosen] += reward

for a in arms:
    print(f"臂 {a}: 选中 {counts[a]} 次, 估计 {rewards_sum[a]/counts[a]:.3f}")
```

---

## 3. LLM-as-a-Judge

### 3.1 原理与核心思想

LLM-as-a-Judge 是指用一个（或多个）大语言模型作为"裁判"，自动评估另一个大模型输出的质量。其核心动机是：人工评估昂贵、缓慢、难以规模化，而传统 NLP 指标（BLEU、ROUGE）又无法捕捉语义质量；LLM 具备接近人类的语言理解能力，可以在大规模评测中近似替代人工打分。

这一范式在 Agent 评估中尤为重要：Agent 输出往往是长文本、多步骤、结构化（含工具调用），人工逐条标注成本极高，而 LLM 裁判可以在分钟级完成数千条样本的评估，并支持多维度细粒度评分。

### 3.2 评估维度

LLM-as-a-Judge 通常按多个维度独立打分，再综合成总分：

- **相关性（Relevance）**：输出是否切合用户意图，是否答非所问。
- **准确性（Accuracy）**：事实是否正确，是否存在幻觉。
- **流畅性（Fluency）**：语言是否通顺、可读。
- **完整性（Completeness）**：是否充分覆盖了用户问题，是否遗漏关键点。
- **安全性（Safety）**：是否违反安全策略（拒答、有害内容等）。
- **有用性（Helpfulness）**：对用户实际任务的推进程度。
- **工具使用合理性（Tool Usage）**：Agent 场景特有——是否选对工具、调用参数是否正确、是否过度调用。

### 3.3 成对比较 vs 单点评分

**单点评分（Pointwise）**：裁判对每条输出独立打分（如 1–5 分）。优点是快、可批量；缺点是绝对评分易受裁判自身偏好影响，不同样本间分数可比性弱。

**成对比较（Pairwise）**：裁判同时看两条输出，判断 A 更好、B 更好还是平局。优点是相对判断更稳定、更接近人类直觉；缺点是评估成本是 O(n²)，无法批量，需配合排序算法（如 Bradley-Terry 模型、Elo 评分）聚合出全局排名。

实践中常采用混合策略：先用单点评分做粗筛，再对头部候选做成对比较精排。也可采用 LLM-as-a-Judge + 人工抽检的"人机协同"模式，在效率与可信度间取得平衡。

### 3.4 评估的偏差与缓解

LLM 裁判并非中立，存在多种系统性偏差：

- **位置偏差（Position Bias）**：在成对比较中，裁判倾向于偏好某一位置（通常是第一个）。缓解方法：交换位置评估两次，取一致结论。
- **冗长偏差（Verbosity Bias）**：裁判倾向于给更长的回答更高分，即便内容质量相当。缓解方法：在评分标准中明确长度要求，或对长度做归一化。
- **自我偏好（Self-Preference）**：裁判模型倾向于偏好与自己风格相似的输出。缓解方法：使用与被评估模型不同家族的裁判模型，或多个裁判模型集成。
- **格式偏差（Format Bias）**：裁判可能偏好 Markdown、列表等结构化格式。缓解方法：在 prompt 中明确"忽略格式差异，只评估内容质量"。
- **权威偏差（Authority Bias）**：裁判可能被"权威口吻"误导，对 confidently wrong 的回答给高分。缓解方法：要求裁判先做事实核查，或引入外部知识源辅助。

### 3.5 与人类评估的一致性

LLM-as-a-Judge 的可信度最终取决于与人类评估的一致性。常用度量：

- **准确率**：裁判与人类在二元判断上一致的比例。
- **Cohen's Kappa**：考虑随机一致性的修正版准确率。
- **Pearson / Spearman 相关系数**：衡量连续评分的线性或单调一致性。

研究表明，强裁判模型（如 GPT-4 级别）在成对比较上与人类的一致性可达 80%–90%，接近人类标注者之间的一致性水平。但一致性在不同任务上差异很大：事实型任务一致性高，主观性强的任务（创意写作、情感回复）一致性显著下降。

### 3.6 优缺点

**优点**

- 大规模、低成本、快速，可在分钟级评估数千样本。
- 支持多维度细粒度评分，可定制评估标准。
- 可反复执行，适合 CI/CD 集成。

**缺点**

- 存在系统性偏差，需针对性缓解。
- 对主观性任务一致性下降，仍需人工兜底。
- 裁判模型本身的能力上限限制了评估质量。
- 成本不可忽视——大规模评估的 API 调用费用可观。

### 3.7 Agent 开发中的应用场景

- **回归测试**：每次 Prompt 或模型更新后，用 LLM 裁判对固定评测集打分，监控质量回归。
- **A/B Testing 的指标生成器**：为在线实验提供离线指标，辅助决策。
- **强化学习奖励模型**：用 LLM 裁判的打分作为 RLHF 的奖励信号。
- **线上质量监控**：对生产环境 Agent 输出抽样评估，触发告警。
- **数据飞轮**：用裁判筛选高质量对话样本，反哺训练与few-shot示例库。

### 3.8 简单示例

```python
import json

# Pointwise 评分 Prompt 模板
POINTWISE_PROMPT = """你是一个严格的评估专家。请对以下 AI 助手的回答按 1-5 分打分。

用户问题: {question}
AI 回答: {answer}
参考答案: {reference}

评分维度:
- 准确性 (1-5): 事实是否正确，是否与参考答案一致
- 相关性 (1-5): 是否切题，是否答非所问
- 完整性 (1-5): 是否充分覆盖问题，是否遗漏关键点

请按以下 JSON 格式输出，不要输出其他内容:
{{"accuracy": <int>, "relevance": <int>, "completeness": <int>, "reason": "<简短理由>"}}
"""

# Pairwise 比较 Prompt 模板（含位置偏差缓解）
PAIRWISE_PROMPT = """你是一个评估专家。请比较以下两个 AI 助手对同一问题的回答。

用户问题: {question}
回答 A: {answer_a}
回答 B: {answer_b}

判断 A 更好、B 更好还是平局。判断标准: 准确性、相关性、完整性、流畅性。
忽略长度与格式差异，只评估内容质量。

输出 JSON: {{"winner": "A"|"B"|"tie", "reason": "<理由>"}}
"""

def evaluate_pairwise_symmetric(judge_llm, question, answer_a, answer_b):
    """交换位置评估两次，缓解位置偏差"""
    r1 = judge_llm(PAIRWISE_PROMPT.format(
        question=question, answer_a=answer_a, answer_b=answer_b))
    r2 = judge_llm(PAIRWISE_PROMPT.format(
        question=question, answer_a=answer_b, answer_b=answer_a))

    w1 = json.loads(r1)["winner"]
    # 交换位置后翻转胜负
    w2_map = {"A": "B", "B": "A", "tie": "tie"}
    w2 = w2_map[json.loads(r2)["winner"]]

    if w1 == w2:
        return w1  # 两次一致，可信
    return "tie"   # 不一致，判为平局


# 示例裁判调用（伪代码，需替换为实际 LLM 客户端）
def mock_judge(prompt):
    # 实际中替换为 judge_llm.complete(prompt)
    return '{"accuracy": 4, "relevance": 5, "completeness": 3, "reason": "事实正确但遗漏边界情况"}'

result = mock_judge(POINTWISE_PROMPT.format(
    question="RAG 中向量检索和 BM25 各有什么优劣?",
    answer="向量检索擅长语义匹配...",
    reference="参考答案..."
))
print("单点评分结果:", result)
```

---

## 4. Trajectory Evaluation（多步 Agent 轨迹评估）

### 4.1 原理与核心思想

传统评估只看"最终答案对不对"，但 Agent 是多步决策系统：感知 → 规划 → 工具调用 → 观察 → 反思 → 再规划……最终答案只是这条轨迹的末端产物。两个 Agent 可能给出相同的最终答案，但一个走了三步直达，另一个绕了十步还调用错了两次工具——前者明显更优。

**轨迹评估（Trajectory Evaluation）** 的核心思想是：把 Agent 的执行过程当作评估对象，而不仅仅是结果。它关注三件事：

1. **步骤是否正确**：每一步的决策（选什么工具、传什么参数、是否该反思）是否合理。
2. **路径是否高效**：是否走了最短路径，是否有冗余或回退。
3. **任务是否完成**：最终是否达成了用户目标，部分完成还是完全完成。

这种评估范式与单点评估的根本区别在于"过程奖励 vs 结果奖励"。在 RL 中对应 Process Reward Model（PRM）与 Outcome Reward Model（ORM）之分——轨迹评估是 PRM 思想在评估侧的体现。

### 4.2 轨迹级评估指标

#### 步骤正确率（Step-level Accuracy）

对轨迹中每一步标注是否正确，计算正确步骤占比：

$$
\text{Step Accuracy} = \frac{\text{正确步骤数}}{\text{总步骤数}}
$$

需要定义"步骤正确"的标准——是工具选对？参数正确？还是中间推理合理？通常由人工或 LLM 裁判逐步判定。

#### 路径效率（Path Efficiency）

将 Agent 实际轨迹长度与"专家最短轨迹"长度对比：

$$
\text{Efficiency} = \frac{L_{\text{optimal}}}{L_{\text{actual}}}
$$

其中 $L$ 可以是步数、token 数、调用次数或时间。效率为 1 表示走了最短路径，越低表示绕路越多。

#### 最终任务完成率（Task Success Rate）

最关键也最难定义的指标——任务是否真正完成。常见做法是：

- **二元判定**：完成 / 未完成。
- **部分完成率**：按子目标完成比例打分（如完成了 3/5 个子任务）。
- **多维度判定**：结合答案正确性、工具使用合理性、是否触达终止条件等。

#### 工具调用指标

- **工具选择准确率**：选对工具的比例。
- **参数正确率**：调用参数与 ground truth 一致的比例。
- **调用冗余率**：不必要的重复调用占比。
- **错误恢复率**：出错后能否自我纠正。

#### 成本指标

- **平均 token 消耗**：每次任务消耗的 input + output token。
- **平均调用次数**：每次任务调用 LLM / 工具的次数。
- **平均延迟**：端到端响应时长。

### 4.3 中间步骤评估 vs 端到端评估

**端到端评估（End-to-End）** 只看最终结果，简单直接，但无法定位问题：是规划错了？工具调错了？还是反思没触发？

**中间步骤评估（Step-level）** 逐步骤打分，能精确定位失败环节，但标注成本高、需要明确定义每步的"正确"标准。

最佳实践是分层评估：

1. 先做端到端任务完成率，掌握整体水位。
2. 对失败案例做中间步骤评估，定位瓶颈环节。
3. 对成功案例抽样做效率评估，发现优化空间（如减少不必要的反思）。

这种分层方法既控制成本，又能产生可操作的优化信号。

### 4.4 Agent 评估基准介绍

#### AgentBench

由清华等机构提出，是首个系统化的 Agent 评测基准，覆盖 8 个不同环境：操作系统、数据库、知识图谱、卡片游戏、情景猜谜、家居模拟、网页购物、网页浏览。每个环境定义了多步任务，评估 Agent 在长程规划、工具使用、环境交互上的综合能力。指标以任务完成率为主。

#### ToolBench

聚焦工具调用能力，基于 RapidAPI 构建大规模工具使用任务。核心评估 Agent 能否在数千个真实 API 中选择合适的工具、组合调用完成复杂指令。指标包括工具选择准确率、参数填充正确率、任务完成率，以及 Pass@k 等通过率指标。

#### AppWorld

模拟真实应用环境（如邮件、日历、文件管理），要求 Agent 通过多步 API 调用完成日常办公任务。强调真实性与多步性——任务往往需要 10+ 步 API 调用才能完成，且步骤间存在严格依赖。评估指标为任务完成率与中间步骤正确率。

#### 其他基准

- **WebArena**：真实网页交互任务（购物、论坛、CMS），评估网页操作 Agent。
- **SWE-bench**：真实 GitHub issue 修复任务，评估代码 Agent 的端到端工程能力。
- **GAIA**：通用 AI 助手能力评测，强调多步推理与工具使用，难度分层。

这些基准的共同特点是：任务多步化、环境真实化、评估自动化（通过可执行测试或环境状态判定），代表了 Agent 评估从"单点 QA"走向"轨迹级任务"的趋势。

### 4.5 优缺点

**优点**

- 反映 Agent 真实能力，避免"答案对但过程糟"的误判。
- 能精确定位失败环节，为优化提供可操作信号。
- 与 RL 训练范式天然契合（PRM 思想）。
- 同时评估质量与成本，贴近生产需求。

**缺点**

- 标注成本高，需要定义每步的"正确"标准。
- 评估复杂——同一任务可能有多条合法轨迹，"最优路径"难定义。
- 自动化评估依赖 LLM 裁判或可执行测试，并非所有任务都有后者。
- 基准任务与生产任务可能存在分布偏差，需谨慎外推。

### 4.6 Agent 开发中的应用场景

- **回归测试**：每次代码/Prompt 更新后跑基准子集，监控轨迹质量是否退化。
- **瓶颈定位**：通过中间步骤评估找出"哪一步最容易出错"，针对性优化。
- **模型对比**：对比不同 LLM 在同一基准上的轨迹指标，辅助选型。
- **RL 训练奖励**：用步骤级评估生成 PRM 信号，训练更强 Agent。
- **生产监控**：线上抽样轨迹做评估，结合成本指标触发告警。

### 4.7 简单示例

```python
# 定义一条 Agent 轨迹
trajectory = [
    {"step": 1, "action": "search", "args": {"query": "GLM-4 上下文长度"}, "correct": True},
    {"step": 2, "action": "tool_call", "args": {"tool": "calculator", "expr": "128000 / 1000"}, "correct": True},
    {"step": 3, "action": "tool_call", "args": {"tool": "calculator", "expr": "128 + 1"}, "correct": False, "reason": "无意义计算"},
    {"step": 4, "action": "reflect", "args": {"note": "上一步计算错误，撤销"}, "correct": True},
    {"step": 5, "action": "answer", "args": {"text": "GLM-4 上下文长度为 128K tokens"}, "correct": True},
]

# 专家最短轨迹长度（参考）
OPTIMAL_LENGTH = 3  # search -> calculate -> answer

def evaluate_trajectory(traj, optimal_length):
    total = len(traj)
    correct_steps = sum(1 for s in traj if s.get("correct", False))
    step_accuracy = correct_steps / total

    # 路径效率（按步数）
    efficiency = optimal_length / total

    # 最终任务完成（最后一步是 answer 且 correct）
    task_success = traj[-1]["action"] == "answer" and traj[-1].get("correct", False)

    # 工具调用指标
    tool_calls = [s for s in traj if s["action"] == "tool_call"]
    tool_correct = sum(1 for s in tool_calls if s.get("correct", False))
    tool_accuracy = tool_correct / len(tool_calls) if tool_calls else 0

    # 成本指标
    total_tokens = sum(len(str(s["args"])) for s in traj)  # 简化估算

    return {
        "step_accuracy": round(step_accuracy, 3),
        "path_efficiency": round(efficiency, 3),
        "task_success": task_success,
        "tool_accuracy": round(tool_accuracy, 3),
        "total_steps": total,
        "est_tokens": total_tokens,
    }

result = evaluate_trajectory(trajectory, OPTIMAL_LENGTH)
print("轨迹评估结果:")
for k, v in result.items():
    print(f"  {k}: {v}")

# 输出示例:
#   step_accuracy: 0.8
#   path_efficiency: 0.6
#   task_success: True
#   tool_accuracy: 0.5
#   total_steps: 5
#   est_tokens: 187
```

**LLM 裁判逐步骤评估 Prompt 模板**：

```
你是 Agent 轨迹评估专家。请对以下轨迹中的每一步判断是否"正确"。

判断标准:
- 工具选择是否合理（是否选了最适合当前子任务的工具）
- 参数是否正确（是否传入了符合工具 schema 的参数）
- 是否必要（是否为冗余或无意义操作）
- 反思是否有效（是否真正纠正了错误）

用户任务: {task}
轨迹:
{trajectory_json}

请输出 JSON 数组，每个元素: {{"step": <int>, "correct": <bool>, "reason": "<str>"}}
```

---

## 5. 四种方法的协同：构建 Agent 评估与优化飞轮

单独看，四种方法各有侧重；合起来，它们构成一个完整的评估与优化闭环：

1. **LLM-as-a-Judge** 提供低成本、可规模化的评估能力，是整个飞轮的"发动机"——没有它，其他三种方法都因标注成本无法运转。
2. **Trajectory Evaluation** 定义了"评估什么"——不只是最终答案，而是多步决策过程，这是 Agent 评估区别于传统 LLM 评估的核心。
3. **A/B Testing** 提供了严谨的"谁更好"判断，在关键决策（如全量上线）前给出统计可信的结论。
4. **MAB** 提供了"持续优化"能力，在策略空间大、需要在线学习的场景中动态平衡探索与利用。

一个典型的优化流程是：

- 离线阶段：用 LLM-as-a-Judge + Trajectory Evaluation 在固定基准上筛选候选策略。
- 在线阶段：用 MAB 在真实流量中动态调整策略权重，持续学习。
- 关键决策点：用 A/B Testing 做严谨对比，决定是否全量切换。
- 持续监控：用 LLM-as-a-Judge 对线上输出抽样评估，结合成本指标触发告警与回滚。

这个闭环让 Agent 评估从"上线前一次性测试"走向"全生命周期持续优化"，是把 Agent 从 demo 推向生产级产品的关键工程能力。

---

## 系列小结：Agent 算法知识地图

至此，Agent 开发算法系列十篇已全部完成。回望整个系列，我们可以把 Agent 的算法骨架梳理为一条清晰的脉络：

**感知与记忆**（第 1 篇）是 Agent 的"输入端"——决定 Agent 如何理解用户意图、如何从历史对话中召回相关信息。Embedding、向量检索、记忆衰减等算法构建了 Agent 的"长期记忆"。

**检索与重排**（第 2 篇）是 Agent 的"知识端"——决定 Agent 如何从外部知识库中获取高质量上下文。BM25、向量检索、混合检索、Cross-Encoder 重排构成了 RAG 的核心管线。

**规划与推理**（第 3 篇）是 Agent 的"大脑"——决定 Agent 如何把复杂目标分解为可执行步骤。CoT、ToT、ReAct、Plan-and-Execute 等范式定义了 Agent 的思考方式。

**工具调用与函数执行**（第 4 篇）是 Agent 的"双手"——决定 Agent 如何与外部世界交互。Function Calling、工具选择、参数填充、错误恢复是 Agent 落地的工程基础。

**反思与自我修正**（第 5 篇）是 Agent 的"元认知"——决定 Agent 能否从错误中学习。Self-Refine、Reflexion 等算法让 Agent 具备"做得不好就重做"的能力。

**多智能体协作**（第 6 篇）是 Agent 的"社会化"——决定多个 Agent 如何分工协作。角色分工、消息传递、辩论与投票等机制让 Agent 系统应对单 Agent 难以处理的复杂任务。

**强化学习与反馈**（第 7 篇）是 Agent 的"学习机制"——决定 Agent 如何从环境反馈中持续改进。RLHF、PRM、PPO 等算法是 Agent 进化的训练范式。

**安全与对齐**（第 8 篇）是 Agent 的"护栏"——决定 Agent 如何在能力增强的同时保持安全可控。红队测试、Constitutional AI、安全分类器等是 Agent 上线的必要保障。

**可观测性与调试**（第 9 篇）是 Agent 的"仪表盘"——决定 Agent 在生产环境中如何被监控与诊断。Trace、Span、因果分析、归因方法是 Agent 运维的核心工具。

**评估与优化**（第 10 篇，本篇）是 Agent 的"反馈闭环"——决定 Agent 如何被科学评估、如何持续优化。A/B Testing、MAB、LLM-as-a-Judge、Trajectory Evaluation 构成了数据驱动的优化飞轮。

把这十篇串联起来，可以看到一个完整的 Agent 工程能力栈：从感知到记忆，从规划到执行，从反思到协作，从学习到安全，从可观测到评估优化。每一个环节都有成熟的算法支撑，每一个环节也都有开放的研究问题。Agent 技术仍在快速演进，但底层算法原理是相对稳定的——掌握这十篇内容，就掌握了 Agent 工程的"第一性原理"，足以在技术浪潮中保持判断力与创造力。

愿这份系列文档成为你 Agent 工程之路的可靠参考。下一步，把这些算法读到代码里、跑到生产中、迭代出属于你自己的 Agent。
