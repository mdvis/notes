# 推理与决策算法

## 本篇导读

在 Agent 开发中，让大语言模型（LLM）从"被动回答问题"进化到"主动解决复杂任务"，核心瓶颈不在于模型本身的参数量，而在于**如何组织模型的推理过程**。一个具备强能力的 Agent，往往需要在不确定的环境中进行多步规划、工具调用、中间结果评估，并在必要时回溯重来。这就需要一套超越"单次 Prompt → 单次回答"的推理与决策框架。

本篇是 Agent 开发算法系列的第 4 篇，聚焦于**推理与决策算法**。我们将系统讲解六种主流范式：

- **Chain of Thought (CoT)** —— 最基础的思维链推理，让模型"想清楚再说话"
- **Self-Consistency CoT** —— 通过多路采样投票提升 CoT 的稳定性
- **ReAct** —— 推理与行动交替循环，是当前 Agent 的主流范式
- **Tree of Thoughts (ToT)** —— 将推理组织成树形结构，支持评估、剪枝与回溯
- **Graph of Thoughts (GoT)** —— 在 ToT 基础上扩展为图，允许思维节点合并与复用
- **MCTS（蒙特卡洛树搜索）** —— 在巨大决策空间中通过模拟寻找最优策略
- **Beam Search** —— 在多步规划中保留若干候选，兼顾效率与质量

这些算法并非互相替代，而是处于不同层次：CoT 是单次推理的增强；ReAct 是 Agent 与外部环境交互的循环骨架；ToT / GoT / MCTS / Beam Search 则是在"搜索空间"层面提升决策质量的策略。理解它们的原理、适用边界与工程取舍，是构建高可靠 Agent 的必备基础。

阅读本篇后，你应当能够：根据任务复杂度选择合适的推理范式，理解各范式在 Agent 框架中的落地方式，并能在自己的项目中实现或调优这些算法。

---

## 一、Chain of Thought (CoT)

### 1.1 原理与核心思想

Chain of Thought（思维链，简称 CoT）是一种 prompting 技术，其核心思想是：**让 LLM 在给出最终答案之前，先显式输出一段中间推理过程**。这段推理过程类似于人类在解数学题时打草稿、写步骤的行为——把一个复杂问题分解为若干可验证的中间步骤，从而降低模型直接跳到结论时出错的概率。

CoT 之所以有效，主要有三方面原因：第一，分解复杂问题可以让每一步的计算/推理负担更小，符合 LLM 在短跨度推理上表现更好的特性；第二，中间步骤为模型提供了"工作记忆"的扩展，把关键中间量写入上下文，避免在长距离推理中遗忘；第三，显式的推理链使得输出可解释、可调试，工程师可以定位模型在哪一步出错。

CoT 主要有两种形式：

- **Zero-shot CoT**：在 Prompt 末尾追加一句触发词，如"让我们一步一步思考"（Let's think step by step），无需提供示例，模型即可自发产生推理链。这种方式简单通用，但在高度专业领域效果有限。
- **Few-shot CoT**：在 Prompt 中提供若干"问题—推理链—答案"的示例，让模型学习期望的推理模式。这种方式效果更稳定，但需要精心设计示例。

在 Few-shot CoT 基础上，又衍生出 **Self-Consistency CoT**：对同一个问题多次采样（通常 temperature > 0）得到多条不同的推理链，再对最终答案进行多数投票（majority voting），从而抵消单条链路的随机误差。

### 1.2 工作流程

**Zero-shot CoT 流程：**

```
输入: 问题 Q
输出: 答案 A

1. 构造 Prompt = Q + "让我们一步一步思考"
2. 调用 LLM 生成回答 R（其中包含推理过程与最终答案）
3. 从 R 中抽取最终答案 A
```

**Few-shot CoT 流程：**

```
输入: 问题 Q，示例集 {(Q_i, C_i, A_i)}
输出: 答案 A

1. 构造 Prompt = 拼接所有示例 (Q_i -> C_i -> A_i) + Q
2. 调用 LLM 生成推理链 C 与答案 A
3. 返回 A（可选地返回 C 用于解释）
```

**Self-Consistency CoT 流程：**

```
输入: 问题 Q，采样次数 N
输出: 答案 A

1. 对 i = 1..N:
   a. 以较高 temperature 采样一条推理链 C_i 与答案 A_i
2. 对 {A_1, ..., A_N} 进行多数投票
3. 返回出现次数最多的答案 A
```

### 1.3 优缺点

**优点：**

- 实现极简，无需修改模型结构，仅在 Prompt 层面调整即可生效。
- 对数学、逻辑、多跳问答等需要多步推理的任务提升明显，研究表明在 GSM8K 等基准上可带来 10%~20% 以上的准确率提升。
- 推理链可解释，便于调试与人工审查。
- Self-Consistency 进一步显著降低方差，在算术任务上接近甚至超越更大参数量的模型。

**缺点：**

- 增加输出 token 数量，推理延迟与成本上升（Self-Consistency 更是成 N 倍增长）。
- 推理链并非保证正确，模型可能产生"看起来合理实则错误"的链路（hallucinated reasoning）。
- 对极简单问题（如事实检索）收益有限，甚至可能因过度推理而引入错误。
- Few-shot CoT 需要高质量示例，示例的推理风格会强烈影响输出，存在 Prompt 工程负担。

### 1.4 Agent 开发中的应用场景

在 Agent 系统中，CoT 通常不作为独立算法出现，而是作为**底层推理增强**嵌入到其他范式之中：

- **ReAct 的 Thought 部分**本质上就是一条微型 CoT，每一步行动前先推理。
- **ToT / GoT 的节点生成与评估**依赖 CoT 产生候选思维与打分。
- **工具调用前的意图解析**：在调用 Function 前用 CoT 拆解"我需要什么参数、该调用哪个工具"。
- **复杂问答 Agent**：如数学辅导、代码生成、法律分析等需要可验证推理过程的场景。
- **Self-Consistency** 适用于对正确率要求高、可容忍延迟的场景，如高风险决策、自动化评分。

### 1.5 简单示例

**Zero-shot CoT Prompt 示例：**

```
问题：小明有 12 个苹果，他给了小红 3 个，又从树上摘了 5 个，
然后妈妈又给他买了 7 个，最后他吃了 2 个。请问小明现在有几个苹果？

让我们一步一步思考。
```

模型输出（示意）：

```
1. 小明一开始有 12 个苹果。
2. 给了小红 3 个，剩下 12 - 3 = 9 个。
3. 从树上摘了 5 个，变成 9 + 5 = 14 个。
4. 妈妈买了 7 个，变成 14 + 7 = 21 个。
5. 吃了 2 个，最终 21 - 2 = 19 个。

所以小明现在有 19 个苹果。
```

**Few-shot CoT Prompt 示例：**

```
Q: 一个班有 40 个学生，男生比女生多 4 人，女生有多少人？
A: 设女生有 x 人，则男生有 x + 4 人。
   总人数 x + (x + 4) = 40，解得 2x = 36，x = 18。
   所以女生有 18 人。

Q: 商店打八折后商品售价 120 元，原价是多少？
A: 设原价为 p，则 0.8p = 120，p = 120 / 0.8 = 150。
   所以原价是 150 元。

Q: 一辆车 2 小时行驶了 160 公里，以同样速度 5 小时能行驶多少公里？
A:
```

**Self-Consistency CoT 的 Python 片段：**

```python
from collections import Counter

def self_consistency_qa(llm, question: str, n_samples: int = 8) -> str:
    answers = []
    for _ in range(n_samples):
        prompt = f"{question}\n\n让我们一步一步思考。最后用『答案是：X』的格式给出答案。"
        # temperature 设置较高以获得多样化推理链
        response = llm.generate(prompt, temperature=0.7)
        answer = extract_final_answer(response)  # 解析 "答案是：X"
        answers.append(answer)
    # 多数投票
    most_common, _ = Counter(answers).most_common(1)[0]
    return most_common
```

---

## 二、ReAct（Reason + Act 循环）

### 2.1 原理与核心思想

ReAct 是 Yao 等人在 2022 年提出的 Agent 推理范式，其名称是 **Re**ason + **Act** 的缩写。核心思想是：**让 LLM 在解决任务时交替进行"推理（Thought）"和"行动（Action）"**，每次行动后会获得环境的"观察（Observation）"，并将该观察反馈回上下文，作为下一轮推理的依据。

与纯 CoT 相比，ReAct 最大的突破在于**引入了外部环境交互**。CoT 的推理完全依赖模型内部知识，一旦遇到模型不知道的事实（如实时天气、最新新闻、数据库中的私有数据），就会产生幻觉。而 ReAct 通过 Action 调用外部工具（搜索引擎、数据库、计算器、API），把外部世界的真实信息注入推理过程，从而大幅扩展了 Agent 的能力边界。

一个完整的 ReAct 循环由三元组 **Thought / Action / Observation** 构成：

- **Thought（思考）**：模型对当前状态进行推理，决定下一步该做什么。这是一段自然语言推理，相当于一次小型 CoT。
- **Action（行动）**：模型输出一个结构化的动作，通常包括工具名称与输入参数，例如 `Search["Python 异步编程"]`。
- **Observation（观察）**：执行 Action 后从环境返回的结果，被追加到上下文中。

这个循环持续进行，直到模型判断已经获得足够信息，输出最终答案（Final Answer）为止。

**与 Function Calling 的关系：** ReAct 是一种**范式/提示策略**，而 Function Calling 是**模型原生支持的工具调用接口**。早期 ReAct 完全靠 Prompt 工程，让模型按 `Thought/Action/Observation` 格式输出文本，再由外部解析器提取 Action 执行。现代 LLM（如 GPT-4、Claude、GLM 等）原生支持 Function Calling，可以更可靠地输出结构化的工具调用 JSON。可以这样理解：Function Calling 是 ReAct 中 Action 环节的工程化实现，让 Action 的解析更稳定、更安全，但 ReAct 的"推理-行动-观察"循环骨架依然是 Agent 的核心。多数现代 Agent 框架（LangChain、LlamaIndex、AutoGen）都采用"Function Calling + ReAct 循环"的组合。

### 2.2 工作流程与伪代码

```
输入: 任务描述 T，可用工具集合 Tools，最大迭代次数 MAX_ITER
输出: 最终答案 A

1. 初始化上下文 context = [T]
2. for iter = 1 to MAX_ITER:
   a. Thought: LLM 基于当前 context 推理下一步行动
      -> 生成 thought_t
   b. 若 thought_t 表明已可回答: 跳到步骤 3
   c. Action: LLM 选择工具 tool_t 与参数 args_t
   d. Observation: 执行 tool_t(args_t)，得到 obs_t
   e. 将 (thought_t, action_t, obs_t) 追加到 context
3. Final Answer: LLM 基于 context 生成最终答案 A
4. 返回 A
```

**Python 风格伪代码：**

```python
def react_agent(llm, task: str, tools: dict, max_iter: int = 10):
    context = [{"role": "user", "content": task}]
    for i in range(max_iter):
        # 1. 模型推理并决定下一步
        response = llm.generate(context, tools=tools)
        if response.is_final_answer:
            return response.content
        # 2. 执行工具调用
        tool_name = response.tool_call.name
        tool_args = response.tool_call.arguments
        observation = tools[tool_name](**tool_args)
        # 3. 把工具结果回灌进上下文
        context.append({"role": "assistant", "content": response.content})
        context.append({"role": "tool", "name": tool_name, "content": observation})
    return "达到最大迭代次数，未能给出答案。"
```

### 2.3 优缺点

**优点：**

- **可交互、可接地**：通过工具调用获取真实世界信息，从根本上缓解 LLM 幻觉问题。
- **可解释**：完整的 Thought/Action/Observation 轨迹便于调试与审计。
- **通用性强**：同一套循环可适配搜索、计算、数据库查询、代码执行等各类工具。
- **生态成熟**：几乎所有主流 Agent 框架都内置 ReAct 实现，工程落地成本低。

**缺点：**

- **延迟与成本**：多轮 LLM 调用导致延迟与 token 成本显著高于单次推理。
- **错误传播**：某一步的 Thought 或 Action 出错，可能误导后续所有步骤；Observation 噪声（如搜索结果质量差）也会污染推理。
- **循环终止不稳定**：模型可能陷入无意义的工具调用循环（如反复搜索同一关键词），需要设置最大迭代数与早停策略。
- **工具选择错误**：在工具数量多时，模型可能选错工具或构造错误参数，需要良好的工具描述与few-shot 示例。
- **上下文膨胀**：每轮 Observation 都会追加到上下文，长任务下上下文会迅速逼近窗口上限，需要摘要压缩策略。

### 2.4 Agent 开发中的应用场景

ReAct 是当前绝大多数 Agent 产品的**默认范式**，典型场景包括：

- **问答型 Agent**：结合搜索引擎/知识库，回答事实型、时效型问题（如客服、研究助手）。
- **工具编排型 Agent**：根据用户意图自动选择并调用多个 API（如旅行规划、日程管理）。
- **代码执行型 Agent**：如数据分析助手，ReAct 循环中包含"写代码→执行→看结果→改代码"的子循环。
- **多步检索 Agent**：复杂问题需要多次检索、交叉验证（如"对比 A 公司与 B 公司 2024 年财报利润率"）。
- **RAG 增强**：把检索-阅读作为 Action，多轮检索提升召回质量。

### 2.5 简单示例

**ReAct Prompt 模板示例（经典文本格式）：**

```
你是一个能使用工具的助手。请按以下格式回答问题：

Thought: 你对当前情况的推理
Action: 工具名称[参数]
Observation: 工具返回结果（由系统填入）
...（重复 Thought/Action/Observation 直到能回答）
Thought: 我现在知道答案了
Final Answer: 最终答案

可用工具：
- Search[q]: 在网上搜索 q，返回前 3 条结果摘要
- Calculator[expr]: 计算数学表达式 expr
- Lookup[key]: 在上一次搜索结果中查找关键词 key

问题：2024 年诺贝尔文学奖得主是哪国人？TA 的代表作有几部被翻译成中文？

Thought: 我需要先查出 2024 年诺贝尔文学奖得主是谁。
Action: Search[2024 诺贝尔文学奖得主]
Observation: 2024 年诺贝尔文学奖授予韩国作家韩江，代表作包括《素食者》《人类行为》《白》等。
Thought: 韩江是韩国人。现在我需要确认她的代表作中有几部被翻译成中文。
Action: Lookup[中文]
Observation: 结果中提到《素食者》《白》已有中文译本。
Thought: 我已经获得所需信息。
Final Answer: 2024 年诺贝尔文学奖得主韩江是韩国人，其代表作中至少《素食者》《白》等已被翻译成中文。
```

**基于 Function Calling 的 Python 片段：**

```python
import json

def search_tool(query: str) -> str:
    # 实际接入搜索 API
    return f"搜索结果: {query} 的相关内容..."

def calculator_tool(expression: str) -> str:
    try:
        return str(eval(expression))
    except Exception as e:
        return f"计算错误: {e}"

TOOLS = {
    "search": search_tool,
    "calculator": calculator_tool,
}

TOOL_SCHEMA = [
    {"type": "function", "name": "search",
     "description": "在网上搜索给定的查询词",
     "parameters": {"query": {"type": "string"}}},
    {"type": "function", "name": "calculator",
     "description": "计算数学表达式",
     "parameters": {"expression": {"type": "string"}}},
]

def react_loop(llm, question: str, max_iter: int = 8):
    messages = [{"role": "user", "content": question}]
    for _ in range(max_iter):
        resp = llm.chat(messages=messages, tools=TOOL_SCHEMA)
        if resp.tool_calls is None:
            return resp.content  # 模型直接给出最终答案
        messages.append(resp)
        for call in resp.tool_calls:
            result = TOOLS[call.name](**call.arguments)
            messages.append({"role": "tool", "tool_call_id": call.id, "content": result})
    return "超过最大迭代次数"
```

---

## 三、Tree of Thoughts (ToT)

### 3.1 原理与核心思想

Tree of Thoughts（思维树，简称 ToT）由 Yao 等人在 2023 年提出，是对 CoT 的进一步泛化。CoT 是一条线性的推理链，一旦某一步走错，整条链就废了；而 ToT 将推理过程组织成一棵**搜索树**，每个节点代表一个"思维状态"（partial solution），允许模型从多个候选思维中选优，并在发现死胡同后**回溯**到上游节点尝试其他分支。

ToT 的核心是将"推理"转化为"搜索"问题，并引入四个关键操作：

1. **思维分解（Decomposition）**：把任务拆成若干中间步骤，每一步产生一个思维节点。
2. **思维生成（Generation）**：在当前节点下，用 LLM 生成若干候选的下一步思维（可用 Few-shot 或采样）。
3. **状态评估（Evaluation）**：用一个评估函数（通常也是 LLM）对每个候选思维打分或分类（如"确定有效/可能有效/无效"，或 1~10 分）。
4. **搜索算法（Search）**：在思维树上进行搜索，常用 BFS 或 DFS，结合评估结果进行**剪枝**与**回溯**。

通过这四步，ToT 能够在需要前瞻与全局规划的任务上（如 24 点游戏、创意写作、填字游戏）大幅超越 CoT。

### 3.2 工作流程与伪代码

**ToT-BFS 流程（广度优先，保留每层最优 k 个节点）：**

```
输入: 问题 P，分支宽度 b，束宽 k，最大深度 D
输出: 最优解 S*

1. 根节点 root = {state: 初始问题, parent: None}
2. frontier = {root}
3. for depth = 1 to D:
   a. 候选集 candidates = {}
   b. for node in frontier:
      - 生成 b 个候选思维 {c_1, ..., c_b}  (LLM 生成)
      - 对每个 c_i 评估得分 v_i          (LLM 评估)
      - 将 (c_i, v_i, parent=node) 加入 candidates
   c. 从 candidates 中按得分选 top-k，作为新的 frontier
   d. 若 frontier 中存在已达终态且高分的节点: 返回该节点对应解
4. 返回 frontier 中得分最高节点对应的解
```

**ToT-DFS 流程（深度优先 + 回溯）：**

```
function DFS(node, depth, D):
    if depth >= D or is_terminal(node):
        return evaluate(node)
    best = -inf
    for c in generate_children(node):       # 生成候选思维
        v = DFS(c, depth + 1, D)            # 递归
        if v > best:
            best = v
            best_path = path_to(c)
    return best
```

### 3.3 优缺点

**优点：**

- **支持回溯与全局规划**：能在发现错误后切换分支，避免 CoT 的"一条路走到黑"。
- **适合需要前瞻的任务**：如博弈、谜题、长程规划，在这些任务上明显优于线性 CoT。
- **可解释性强**：整棵搜索树都是显式的，可审查哪些分支被剪掉、为什么。
- **灵活**：搜索深度、宽度、评估函数都可调，能适配不同任务复杂度。

**缺点：**

- **成本高昂**：每个节点都要调用 LLM 生成与评估，树越大调用次数越多，延迟与费用远超 CoT/ReAct。
- **评估函数是瓶颈**：LLM 评估本身可能不准，错误的打分会误导剪枝，剪掉本应保留的好分支。
- **实现复杂**：需要自己管理树结构、搜索算法、状态序列化，工程量大于 ReAct。
- **对简单任务过重**：如果任务本身线性可解，ToT 的收益无法覆盖其开销。

### 3.4 Agent 开发中的应用场景

ToT 适合**解空间大、需要试探与回溯**的 Agent 任务：

- **谜题与博弈类任务**：24 点、数独、填字、逻辑推理题。
- **长程规划**：多步骤任务规划，如旅行路线、实验设计、项目管理方案，需要在不同阶段评估方案优劣。
- **创意写作与方案生成**：先生成多个开头/大纲，评估后选最优继续展开，必要时回溯重写。
- **代码生成与调试**：在多个候选实现间评估、选择、回溯，对复杂算法题尤为有效。
- **Agent 决策中的"反思"机制**：把 ToT 的评估与回溯思想用于 Agent 自我纠错（如 Reflexion 框架）。

### 3.5 简单示例

**ToT 应用于 24 点游戏的 Prompt 思路：**

```
任务: 用 1,3,5,7 经过 +,-,*,/ 和括号得到 24。

每个状态是一个"当前可用数字集合"。
请生成 3 个可能的下一步运算，并对每个运算后得到的新状态评估
（评分 1~10，10 表示最有希望接近 24）。

当前状态: {1, 3, 5, 7}
```

模型生成候选（示意）：

```
候选 1: (5 - 1) = 4，新状态 {3, 4, 7}，评分 6
候选 2: (7 - 3) = 4，新状态 {1, 4, 5}，评分 7
候选 3: (5 + 7) = 12，新状态 {1, 3, 12}，评分 8
```

系统选评分最高的候选 3 继续展开，最终找到 `(5+7)*(3-1)=24`。

**ToT 调度的 Python 片段：**

```python
def tree_of_thoughts(llm, problem: str, b: int = 3, k: int = 3, max_depth: int = 5):
    frontier = [{"state": problem, "path": []}]
    for depth in range(max_depth):
        candidates = []
        for node in frontier:
            # 1. 生成 b 个候选思维
            thoughts = llm.generate_thoughts(node["state"], n=b)
            for t in thoughts:
                # 2. 评估每个候选
                score = llm.evaluate(t)
                candidates.append({"state": t, "path": node["path"] + [t], "score": score})
        # 3. 检查是否已达终态
        for c in candidates:
            if is_solution(c["state"]):
                return c["path"]
        # 4. 保留 top-k
        candidates.sort(key=lambda x: x["score"], reverse=True)
        frontier = candidates[:k]
    return frontier[0]["path"]  # 返回最优路径（即便未完全求解）
```

---

## 四、Graph of Thoughts (GoT)

### 4.1 原理与核心思想

Graph of Thoughts（思维图，简称 GoT）由 Besta 等人在 2023 年提出，是对 ToT 的进一步泛化。ToT 把推理组织成**树**，而 GoT 把推理组织成**任意图**——允许思维节点之间任意连接，特别是支持**节点合并**与**节点复用**，从而打破树的层级限制。

GoT 的核心洞察是：许多真实任务中，不同的推理分支并非彼此独立，它们的中间结果可以**融合**产生更优的结论。例如，在写一篇文章时，可以先并行生成多个段落，再把它们合并成完整文章；在排序任务中，可以先分别排序子集，再归并。这些操作在树结构中难以表达，但在图结构中是自然的。

GoT 定义了一组思维变换操作：

- **聚合变换（Aggregation）**：将多个思维节点合并为一个，如 `{v1, v2, v3} -> v*`。
- **细化变换（Refinement）**：对一个思维节点进行迭代改进，如 `v1 -> v1' -> v1''`。
- **回溯变换（Backtracking）**：从当前节点回到上游节点，类似 ToT 的回溯。
- **循环变换（Looping）**：在同一个节点上反复精化，直到满足质量阈值。

通过这些操作，GoT 可以表达更丰富的推理模式，例如"多路生成 → 评估 → 归并 → 再精化"的复合流程。

### 4.2 工作流程与伪代码

```
输入: 问题 P，变换操作集合 O
输出: 最终解 S*

1. 初始化图 G = {root: P}
2. while 未达停止条件:
   a. 选择一个变换 op in O（可由策略决定，如评分驱动）
   b. 根据 op 选择图中的若干节点 {v_i}
   c. 执行变换:
      - 若 op = 聚合: 用 LLM 将 {v_i} 合并成新节点 v*
      - 若 op = 精化: 用 LLM 对 v_i 改进得 v_i'
      - 若 op = 回溯: 标记当前分支失败，回到上游
   d. 将新节点与边加入 G
   e. 评估新节点，必要时更新"最优节点"指针
3. 返回 G 中得分最高的节点作为 S*
```

**GoT 中的归并示例（排序任务）：**

```python
def got_sort(llm, numbers: list) -> list:
    # 1. 把数组分成若干子集，分别排序（生成多个思维节点）
    chunks = split_into_chunks(numbers, size=4)
    sorted_chunks = [llm_sort(c) for c in chunks]   # 多个并行节点
    # 2. 聚合：两两归并
    while len(sorted_chunks) > 1:
        merged = []
        for i in range(0, len(sorted_chunks), 2):
            if i + 1 < len(sorted_chunks):
                # 聚合变换：合并两个已排序子集
                merged.append(llm_merge(sorted_chunks[i], sorted_chunks[i+1]))
            else:
                merged.append(sorted_chunks[i])
        sorted_chunks = merged
    return sorted_chunks[0]
```

### 4.3 优缺点

**优点：**

- **表达力最强**：能自然刻画归并、迭代精化、回路等复杂推理模式，树与链都是它的特例。
- **支持思维复用**：同一中间结果可被多条路径使用，避免重复计算。
- **适合可分解-可归并任务**：如文档汇总、多源数据融合、模块化代码生成。
- **理论上更高效**：在某些任务上，归并策略比纯树搜索所需节点数更少。

**缺点：**

- **工程复杂度最高**：需要维护任意图结构、检测循环、处理节点依赖，远比 ToT 复杂。
- **成本与延迟高**：变换操作多、节点数多，LLM 调用次数大。
- **评估与调度更难**：在图上决定"下一步执行哪个变换"本身就是一个决策问题，需要额外策略。
- **收益任务相关**：只有在"可归并"特性的任务上才明显优于 ToT，对一般问答收益有限。

### 4.4 Agent 开发中的应用场景

GoT 适合**可分解且可归并**的复杂 Agent 任务：

- **长文档生成与改写**：先生成多段大纲/章节，再合并润色成完整文章。
- **多源信息融合**：Agent 从多个数据源/工具获取结果，归并成统一答案（如多专家会诊）。
- **模块化代码生成**：分别生成多个模块，再合并成完整程序，必要时对单个模块迭代精化。
- **复杂规划与方案设计**：把大任务拆成子任务并行规划，最后聚合。
- **多 Agent 协作的"思维层"**：多个 Agent 各自生成思维，由 GoT 层归并。

### 4.5 简单示例

**GoT 用于文章写作的 Prompt 思路：**

```
任务: 写一篇关于"AI Agent 推理算法"的综述文章。

步骤 1（多路生成）:
  分别生成三个段落草稿:
  - 节点 A: "CoT 与 ReAct 段落草稿"
  - 节点 B: "ToT 与 GoT 段落草稿"
  - 节点 C: "MCTS 与 Beam Search 段落草稿"

步骤 2（评估 + 精化）:
  对 A/B/C 分别评分，对得分低的进行一次精化得 A'/B'/C'

步骤 3（聚合变换）:
  将 A', B', C' 合并为一篇完整文章，并生成过渡段

步骤 4（整体精化）:
  对整篇文章再进行一次润色，得到最终稿
```

**GoT 调度的 Python 片段：**

```python
class GoTGraph:
    def __init__(self, root):
        self.nodes = {0: {"state": root, "parents": [], "score": None}}
        self.next_id = 1

    def aggregate(self, node_ids: list, llm) -> int:
        states = [self.nodes[i]["state"] for i in node_ids]
        merged = llm.merge(states)
        new_id = self.next_id
        self.nodes[new_id] = {"state": merged, "parents": node_ids, "score": llm.evaluate(merged)}
        self.next_id += 1
        return new_id

    def refine(self, node_id: int, llm) -> int:
        refined = llm.refine(self.nodes[node_id]["state"])
        new_id = self.next_id
        self.nodes[new_id] = {"state": refined, "parents": [node_id], "score": llm.evaluate(refined)}
        self.next_id += 1
        return new_id

    def best(self):
        return max(self.nodes.items(), key=lambda x: x[1]["score"] or -1)
```

---

## 五、MCTS（蒙特卡洛树搜索）

### 5.1 原理与核心思想

蒙特卡洛树搜索（Monte Carlo Tree Search, MCTS）是一种在巨大决策空间中寻找最优决策的启发式搜索算法，因 AlphaGo 击败李世石而声名大噪。其核心思想是：**通过大量随机模拟（rollout）来估计每个状态的潜在价值，并利用 UCT 公式平衡"探索"与"利用"，逐步构建一棵偏向高价值区域的搜索树**。

MCTS 不要求对状态空间有完整建模，只需能模拟环境即可，因此特别适合决策空间巨大、解析求解不可行的场景。在 Agent 语境下，MCTS 可用于在"工具调用序列"或"推理路径"空间中搜索最优策略。

MCTS 的核心是**四步循环**：

1. **选择（Selection）**：从根节点出发，按某种策略（通常是 UCT）逐层选择子节点，直到到达一个"未完全展开"的节点。
2. **扩展（Expansion）**：在该节点下创建一个或多个新子节点（对应未尝试的动作）。
3. **模拟（Simulation / Rollout）**：从新节点出发，用某种策略（常是随机策略或轻量策略）一直走到终态，得到一个回报值。
4. **回溯（Backpropagation）**：把模拟得到的回报沿路径回传，更新沿途所有节点的访问次数与平均价值。

**UCT（UCB applied to Trees）公式** 是选择步骤的关键，它平衡"利用高价值节点"与"探索低访问次数节点"：

$$
\text{UCT}(j) = \bar{X}_j + c \sqrt{\frac{\ln N_i}{N_j}}
$$

其中：
- $\bar{X}_j$ 是子节点 $j$ 的平均价值（利用项）；
- $N_i$ 是父节点 $i$ 的访问次数；
- $N_j$ 是子节点 $j$ 的访问次数；
- $c$ 是探索常数，通常取 $\sqrt{2}$，控制探索强度。

第一项鼓励选择历史回报高的节点（利用），第二项鼓励选择访问次数少的节点（探索），两者权衡使搜索既不陷入局部最优，也不浪费时间在劣质分支上。

### 5.2 工作流程与伪代码

```
输入: 根状态 s0，模拟预算 M，探索常数 c
输出: 最优动作 a*

1. root = Node(state=s0)
2. for m = 1 to M:
   a. Selection: 从 root 用 UCT 向下选择，直到叶子节点 leaf
   b. Expansion: 在 leaf 下创建一个新子节点 child（尝试一个未尝试动作）
   c. Simulation: 从 child 出发随机走到终态，得到回报 r
   d. Backpropagation: 把 r 沿 child -> leaf -> ... -> root 回传，
      更新每个节点 N += 1, W += r, \bar{X} = W / N
3. 返回 root 下访问次数最多（或平均价值最高）的子节点对应动作
```

**Python 风格伪代码：**

```python
import math

class Node:
    def __init__(self, state, parent=None):
        self.state = state
        self.parent = parent
        self.children = []
        self.visits = 0
        self.value = 0.0  # 累计回报

    def uct(self, c=1.414):
        if self.visits == 0:
            return float("inf")
        exploit = self.value / self.visits
        explore = c * math.sqrt(math.log(self.parent.visits) / self.visits)
        return exploit + explore

def mcts(root_state, iterations=1000, c=1.414):
    root = Node(root_state)
    for _ in range(iterations):
        # 1. Selection
        node = root
        while node.children and all(ch.visits > 0 for ch in node.children):
            node = max(node.children, key=lambda ch: ch.uct(c))
        # 2. Expansion
        if not is_terminal(node.state):
            action = pick_untried_action(node)
            child = Node(state=take_action(node.state, action), parent=node)
            node.children.append(child)
            node = child
        # 3. Simulation
        reward = rollout(node.state)
        # 4. Backpropagation
        while node is not None:
            node.visits += 1
            node.value += reward
            node = node.parent
    return max(root.children, key=lambda ch: ch.visits)
```

### 5.3 优缺点

**优点：**

- **适用于巨大决策空间**：不需要遍历整个空间，通过随机模拟聚焦有希望的区域。
- **anytime 算法**：可随时中断，迭代越多结果越好，便于在延迟与质量间权衡。
- **无需领域知识**：只需能模拟环境，不要求启发式评估函数（尽管有启发式会更好）。
- **理论保证**：随着模拟次数趋向无穷，MCTS 收敛到最优策略。

**缺点：**

- **模拟次数需求大**：在高分支因子场景下需要海量模拟，计算成本高。
- **依赖模拟器质量**：rollout 策略若与真实环境差异大，估计会有偏。
- **在 LLM Agent 中落地有挑战**：每次"模拟"本身可能就要调用 LLM，成本极高，需要设计轻量代理（如用小模型或启发式替代 rollout）。
- **探索常数 c 与奖励设计敏感**：需要针对任务调参。

### 5.4 Agent 开发中的应用场景

MCTS 在 Agent 中的落地通常是把"工具调用序列"视为决策动作序列：

- **复杂工具编排**：在工具组合空间巨大时，用 MCTS 搜索最优调用顺序（如多步数据分析、多步 SQL 生成）。
- **代码生成与测试**：把代码生成视为决策过程，用 MCTS 探索不同实现路径，用单元测试通过率作为回报。
- **博弈型 Agent**：如下棋 Agent、对抗式谈判 Agent。
- **长程规划**：在多步骤、多约束的规划任务中（如物流调度、实验设计），用 MCTS 评估不同规划路径。
- **LLM + MCTS 的推理增强**：如 AlphaCode 风格的"生成-评估-搜索"流程，把 MCTS 作为外层搜索器，LLM 作为生成与评估器。

### 5.5 简单示例

**MCTS 用于 Agent 工具选择（简化示意）：**

```python
def agent_mcts_search(llm, task: str, tools: list, iterations=200):
    root = Node(state={"task": task, "history": []})
    for _ in range(iterations):
        node = root
        # Selection
        while node.fully_expanded() and node.children:
            node = max(node.children, key=lambda n: n.uct())
        # Expansion: 选择一个未尝试的工具
        action = node.untried_action(tools)
        child = node.expand(action)
        # Simulation: 用小模型快速走完剩余步骤
        reward = quick_rollout(llm, child.state, tools)
        # Backpropagation
        child.backprop(reward)
    best_first_action = max(root.children, key=lambda n: n.visits).action
    return best_first_action

def quick_rollout(llm, state, tools):
    # 用轻量策略把任务走到终点，返回一个 0~1 的回报
    while not is_done(state):
        action = llm.cheap_sample_action(state, tools)
        state = apply(state, action)
    return score(state)
```

**UCT 选择逻辑对应公式：**

$$
\text{next} = \arg\max_{j \in \text{children}(i)} \left( \frac{W_j}{N_j} + c \sqrt{\frac{\ln N_i}{N_j}} \right)
$$

其中 $W_j$ 是子节点 $j$ 的累计回报，$N_j$ 是其访问次数。

---

## 六、Beam Search

### 6.1 原理与核心思想

Beam Search（束束搜索）是一种在生成任务中常用的**受限广度优先搜索**。它保留固定数量（beam width $k$）的最优候选序列，每一步对每个候选扩展若干后续，再从所有扩展结果中按得分保留 top-$k$，如此迭代直到结束。

Beam Search 是贪心搜索与穷举搜索的折中：

- **贪心搜索**：每步只保留得分最高的 1 个候选，速度快但容易陷入局部最优。
- **穷举搜索**：保留所有候选，能找到全局最优但指数爆炸。
- **Beam Search**：保留 $k$ 个候选，复杂度随步数线性增长，质量优于贪心，开销远小于穷举。

在 Agent 语境下，Beam Search 常用于**多步规划**：在每一步生成若干候选动作，保留 top-$k$ 继续展开，从而在规划空间中寻找较优的多步策略。

**与 ToT 的对比：** ToT 通常带有"评估函数"和"回溯"能力，且可使用 DFS；Beam Search 一般不回溯，只前向保留 $k$ 个最优。Beam Search 更轻量、更易并行，但缺少纠错能力。可以理解为：Beam Search 是 ToT 的"无回溯 + 固定宽度"特例。

**与贪心搜索的对比：** 贪心是 $k=1$ 的 Beam Search；$k>1$ 时 Beam Search 通过保留多个候选降低单步误判的风险。

### 6.2 工作流程与伪代码

```
输入: 初始状态 s0，束宽 k，最大步数 D，得分函数 score
输出: 最优序列 seq*

1. beams = [{state: s0, path: [], score: 0}]
2. for step = 1 to D:
   a. candidates = []
   b. for b in beams:
      for action a in expand(b.state):
         new_state = take_action(b.state, a)
         new_score = b.score + score(new_state, a)
         candidates.append({state: new_state, path: b.path + [a], score: new_score})
   c. beams = top_k(candidates, k)            # 按得分保留 k 个
   d. 若 beams 中已有终态: 跳出
3. 返回 beams 中得分最高的序列
```

**Python 风格伪代码：**

```python
import heapq

def beam_search(start, expand_fn, score_fn, k=5, max_steps=10):
    beams = [(0.0, start, [])]  # (累计得分, 状态, 路径)
    for _ in range(max_steps):
        candidates = []
        for score, state, path in beams:
            for action, new_state in expand_fn(state):
                new_score = score + score_fn(new_state, action)
                candidates.append((new_score, new_state, path + [action]))
        if not candidates:
            break
        # 保留 top-k
        beams = heapq.nlargest(k, candidates, key=lambda x: x[0])
        if all(is_terminal(s) for _, s, _ in beams):
            break
    return max(beams, key=lambda x: x[0])
```

### 6.3 优缺点

**优点：**

- **简单高效**：实现门槛低，复杂度 $O(k \cdot D \cdot b)$（$b$ 为分支因子），远低于穷举。
- **可并行**：每个 beam 的扩展相互独立，易于分布式执行。
- **质量优于贪心**：通过保留多候选降低单步错误的影响。
- **anytime 特性**：可随时停止并返回当前最优。

**缺点：**

- **不回溯**：一旦某步的候选全部偏离最优，后续无法纠正，存在"早熟"风险。
- **beam 宽度敏感**：$k$ 太小易丢掉好分支，$k$ 太大成本高，需调参。
- **打分函数关键**：局部打分若不能反映全局质量，会误导选择。
- **缺乏多样性**：候选之间可能高度相似，导致 beam 浪费在近似重复上（可用多样性惩罚缓解）。

### 6.4 Agent 开发中的应用场景

Beam Search 在 Agent 中主要用于**多步规划与生成**：

- **任务规划**：Agent 在执行前生成若干候选规划，保留 top-$k$ 继续细化，选最优执行。
- **代码生成**：在 AST 或 token 层面保留多个候选实现，结合测试得分选优。
- **机器翻译 / 文本生成**：经典用途，在 token 层做 Beam Search 提升生成质量。
- **对话策略选择**：生成多个候选回复，按"有用性/安全性"打分保留最优。
- **工具调用路径规划**：与 ToT 类似但更轻量，适合对延迟敏感的场景。

### 6.5 简单示例

**Beam Search 用于 Agent 多步规划的 Prompt 思路：**

```
任务: 把"用户问题"分解为最多 3 步的执行计划。

第 1 步候选:
  A1: 搜索相关资料
  A2: 查询本地知识库
  A3: 直接调用计算器

对每个候选打分（0~1，越大约好）:
  A1: 0.7  A2: 0.6  A3: 0.4

保留 top-2: A1, A2

第 2 步（基于 A1）候选:
  A1->B1: 摘要搜索结果   0.8
  A1->B2: 再次搜索细化   0.5
第 2 步（基于 A2）候选:
  A2->B3: 直接回答       0.6
  A2->B4: 结合外部搜索   0.7

合并后保留 top-2: A1->B1(0.8), A2->B4(0.7)

... 最终返回得分最高的规划路径。
```

**Python 片段：**

```python
def agent_beam_plan(llm, task: str, k: int = 3, max_steps: int = 3):
    beams = [{"plan": [], "state": task, "score": 0.0}]
    for _ in range(max_steps):
        expanded = []
        for b in beams:
            for action, new_state, step_score in llm.expand_actions(b["state"]):
                expanded.append({
                    "plan": b["plan"] + [action],
                    "state": new_state,
                    "score": b["score"] + step_score,
                })
        if not expanded:
            break
        beams = sorted(expanded, key=lambda x: x["score"], reverse=True)[:k]
        if all(is_done(b["state"]) for b in beams):
            break
    return max(beams, key=lambda x: x["score"])["plan"]
```

---

## 七、各算法对比与选型指南

| 算法 | 结构 | 是否回溯 | 是否外部交互 | 典型成本 | 适用场景 |
|------|------|---------|-------------|---------|---------|
| CoT | 线性链 | 否 | 否 | 低 | 单轮复杂推理 |
| Self-Consistency | 多链投票 | 否 | 否 | 中（N 倍） | 高准确率要求 |
| ReAct | 循环 | 否（可加重试） | 是 | 中 | 工具调用、接地问答 |
| ToT | 树 | 是 | 可选 | 高 | 前瞻/回溯型任务 |
| GoT | 图 | 是 | 可选 | 很高 | 可归并的复杂任务 |
| MCTS | 树 + 模拟 | 是（隐式） | 可选 | 很高 | 巨大决策空间 |
| Beam Search | 受限广度 | 否 | 可选 | 中 | 多步规划、生成 |

**选型建议：**

1. **先问"任务是否需要外部信息"**：需要 → ReAct 为骨架；不需要 → CoT 家族。
2. **再问"任务是否需要前瞻/回溯"**：需要 → ToT 或 MCTS；不需要 → CoT/Beam Search。
3. **再问"任务是否可分解并归并"**：是 → GoT；否 → ToT。
4. **再问"对延迟与成本的容忍度"**：紧 → Beam Search / CoT；宽 → MCTS / GoT。
5. **工程上**：多数 Agent 项目从 ReAct 起步，遇到瓶颈再引入 ToT/MCTS 做关键决策点增强，GoT 多用于特殊可归并场景。

---

## 小结

推理与决策算法是 Agent 从"能聊"走向"能干"的核心。本篇介绍的六种范式，可以按"推理组织形式"与"搜索空间维度"两个轴来理解：

- **CoT** 是单条链路的推理增强，是所有范式的基础组件；
- **ReAct** 把链路扩展为"推理-行动-观察"循环，引入外部环境，是 Agent 的主流骨架；
- **ToT / GoT** 把链路扩展为树/图，引入评估、剪枝、回溯与归并，应对需要全局规划的任务；
- **MCTS** 在巨大决策空间中通过模拟与 UCT 平衡探索-利用，是搜索型决策的通用工具；
- **Beam Search** 以固定宽度在生成/规划空间中保留多候选，是轻量而实用的折中方案。

需要强调的是，这些算法并非互斥，现代 Agent 系统往往是**多层组合**：外层是 ReAct 循环，关键决策点嵌入 ToT/MCTS，单步推理用 CoT，多步规划用 Beam Search，长文档生成用 GoT 归并。理解每种算法的原理与边界，才能在工程中做出合理的组合与取舍。

最后提醒读者：算法的复杂度并不等于收益。一个经过良好设计的 ReAct + CoT 方案，往往胜过一个调参粗糙的 MCTS。在引入更重的搜索算法之前，务必先确认瓶颈确实在"搜索"而非"Prompt 设计""工具质量"或"上下文管理"。算法是放大器，它放大的是你工程基础的好坏。
