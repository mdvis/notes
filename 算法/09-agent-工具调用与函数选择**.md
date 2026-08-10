# 工具调用与函数选择

## 本篇导读

Agent 之所以被称为"智能体"而不是"聊天机器人"，核心区别就在于它能够**调用外部工具**完成 LLM 自身无法完成的任务——查数据库、调 API、执行代码、检索知识库。但工具一旦多起来，立即面临两个关键问题：

1. **怎么让 LLM 选对工具并正确传参？**——这就是 Function Calling 要解决的问题。
2. **工具数量爆炸时怎么办？**——把几百个工具的描述全塞进 Prompt 既贵又慢，还会让 LLM 选择困难。这时需要先用工程手段筛出 Top-K 候选，再交给 LLM 决策；甚至完全绕过 LLM，用语义路由直接分发。

本篇讲解 Agent 开发中工具调用与函数选择的三大核心算法：**Function Calling**、**Top-K 路由**、**语义路由**。它们构成了 Agent 工具使用能力的底层骨架——从"单工具精准调用"到"多工具高效筛选"再到"意图级别自动分发"，层层递进。掌握这三个机制，才能在面对几十上百个工具的真实场景时，设计出既准又快的工具选择链路。

---

## 一、Function Calling

### 1.1 原理与核心思想

Function Calling（函数调用）是指 LLM 根据用户意图，从预定义的工具集合中选择合适的工具，并以结构化格式输出调用参数的能力。其核心思想是：**让 LLM 负责理解意图和生成参数，让外部代码负责执行**——LLM 本身不执行任何副作用操作，只输出一个"调用意图"的 JSON，由 Agent 框架解析后调用真正的函数。

这个机制之所以重要，是因为它解决了 LLM 应用的两个根本痛点：

- **输出格式不可控**：传统 Prompt 工程让 LLM 输出 JSON 要靠"请严格返回 JSON 格式"这种软约束，模型经常违反。Function Calling 通过在模型训练阶段就引入"工具调用"的特殊 token 和损失函数，让模型学会在合适时机输出结构化的 `tool_calls` 字段，可靠性远高于 Prompt 约束。
- **无法触达外部世界**：LLM 的知识截止到训练数据，无法查实时数据、无法操作数据库、无法执行代码。Function Calling 把 LLM 变成"决策中枢"，真正的执行交给外部函数，从而打通了 LLM 与真实系统的边界。

本质上 Function Calling 是一种**结构化输出 + 工具协议**的组合：模型被训练成能识别"用户意图是否对应某个工具"，并在对应时生成符合该工具参数 schema 的结构化输出。

### 1.2 关键机制与流程

一个完整的 Function Calling 流程包含以下步骤：

1. **工具描述**：开发者用 JSON Schema 描述每个工具的名称、功能、参数类型。这份描述会作为上下文喂给 LLM。
2. **用户提问**：用户输入 query，Agent 把 query + 工具描述一起发给 LLM。
3. **LLM 决策**：LLM 判断是否需要调用工具。如果需要，输出 `tool_calls`（包含工具名和参数）；如果不需要，直接输出文本回答。
4. **执行工具**：Agent 框架解析 `tool_calls`，调用对应的 Python 函数，拿到返回结果。
5. **结果回填**：把工具返回结果作为 `tool` 角色消息追加到对话历史，再次发给 LLM。
6. **最终回答**：LLM 基于工具结果生成最终的自然语言回答。

### 1.3 工具描述：JSON Schema

工具描述是 Function Calling 的契约。OpenAI、Anthropic、大多数开源模型都采用 JSON Schema 风格来描述工具。下面是一个完整的工具描述示例：

```json
{
  "type": "function",
  "function": {
    "name": "get_weather",
    "description": "查询指定城市的实时天气。支持中国地级市及以上行政区域。返回温度、湿度、风力、天气状况。",
    "parameters": {
      "type": "object",
      "properties": {
        "city": {
          "type": "string",
          "description": "城市名称，中文或英文均可，例如 '北京' 或 'Shanghai'"
        },
        "unit": {
          "type": "string",
          "enum": ["celsius", "fahrenheit"],
          "default": "celsius",
          "description": "温度单位，默认摄氏度"
        },
        "date": {
          "type": "string",
          "format": "date",
          "description": "查询日期，格式 YYYY-MM-DD，默认今天"
        }
      },
      "required": ["city"],
      "additionalProperties": false
    }
  }
}
```

要点说明：

- `description` 字段是 LLM 选择工具的关键依据，必须写清楚**这个工具做什么、什么时候该用、什么时候不该用**。描述写得模糊，LLM 就会选错。
- `parameters` 遵循 JSON Schema 规范，`required` 字段标明哪些参数必填。
- `enum` 可以约束参数取值范围，LLM 会遵守。
- `additionalProperties: false` 防止 LLM 编造不存在的参数。

### 1.4 OpenAI / Anthropic / 开源模型机制对比

三家模型厂商在 Function Calling 的实现上有明显差异：

| 维度 | OpenAI | Anthropic (Claude) | 开源模型（Qwen / Llama / Mistral） |
|---|---|---|---|
| 工具传递字段 | `tools` 参数，JSON Schema 风格 | `tools` 参数，但 schema 包在 `input_schema` 里 | 多数兼容 OpenAI 格式（通过 vLLM/Ollama） |
| 调用输出 | `message.tool_calls` 数组 | `content` 里 `tool_use` 类型的 content block | `tool_calls` 字段（OpenAI 兼容） |
| 并行调用 | 原生支持，一次可返回多个 tool_call | 原生支持 | 视模型而定，Qwen3 支持 |
| 强制调用 | `tool_choice: "required"` 或指定函数名 | `tool_choice: {"type": "tool", "name": "..."}` | 部分支持 |
| 工具结果回传 | `role: "tool"` 消息 | `role: "user"` 里 `tool_result` content block | `role: "tool"` 消息（OpenAI 兼容） |

Anthropic 的函数调用格式示例：

```python
# Anthropic 风格的工具定义
tools = [{
    "name": "get_weather",
    "description": "查询指定城市的实时天气",
    "input_schema": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "城市名称"}
        },
        "required": ["city"]
    }
}]

# 工具结果回传格式
response = client.messages.create(
    model="claude-sonnet-4-5",
    tools=tools,
    messages=[
        {"role": "user", "content": "北京天气怎么样"},
        # Claude 返回 tool_use block
        {"role": "assistant", "content": [
            {"type": "tool_use", "id": "toolu_01abc", "name": "get_weather",
             "input": {"city": "北京"}}
        ]},
        # 工具结果以 tool_result 形式回传
        {"role": "user", "content": [
            {"type": "tool_result", "tool_use_id": "toolu_01abc",
             "content": "温度 28°C，晴，湿度 45%"}
        ]}
    ]
)
```

### 1.5 单工具调用 vs 并行多工具调用

**单工具调用**：LLM 一次只返回一个 `tool_call`，Agent 执行后把结果回填，LLM 再决定下一步。流程简单、易于调试，但遇到"查北京和上海的天气再对比"这种场景就要串行两轮，延迟翻倍。

**并行多工具调用**：LLM 一次返回多个 `tool_call`，Agent 并发执行所有工具，把所有结果一起回填。延迟低，适合无依赖的批量调用。

```python
import asyncio
from openai import AsyncOpenAI

client = AsyncOpenAI()

# 定义两个工具
def get_weather(city: str) -> str:
    return f"{city} 28°C 晴"

def get_air_quality(city: str) -> str:
    return f"{city} AQI 42 优"

# 工具注册表
TOOL_REGISTRY = {
    "get_weather": get_weather,
    "get_air_quality": get_air_quality,
}

TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "查询城市天气",
            "parameters": {
                "type": "object",
                "properties": {"city": {"type": "string"}},
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_air_quality",
            "description": "查询城市空气质量",
            "parameters": {
                "type": "object",
                "properties": {"city": {"type": "string"}},
                "required": ["city"],
            },
        },
    },
]

async def run_agent(user_query: str):
    messages = [{"role": "user", "content": user_query}]

    # 第一轮：LLM 决定调用哪些工具
    resp = await client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=TOOLS_SCHEMA,
    )
    msg = resp.choices[0].message
    messages.append(msg)

    if not msg.tool_calls:
        return msg.content

    # 并行执行所有 tool_calls
    async def execute_tool(tool_call):
        fn = TOOL_REGISTRY[tool_call.function.name]
        args = json.loads(tool_call.function.arguments)
        result = fn(**args)
        return {
            "tool_call_id": tool_call.id,
            "role": "tool",
            "content": result,
        }

    tool_results = await asyncio.gather(
        *[execute_tool(tc) for tc in msg.tool_calls]
    )
    messages.extend(tool_results)

    # 第二轮：LLM 基于工具结果生成最终回答
    final = await client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=TOOLS_SCHEMA,
    )
    return final.choices[0].message.content
```

并行调用的关键点：只对**无依赖**的工具并行。如果工具 B 的参数依赖工具 A 的返回结果（例如先查城市 id 再查天气），就必须串行。

### 1.6 错误处理与重试

工具调用失败的原因主要有三类：参数不合法、工具执行异常、LLM 幻觉（调用了不存在的工具）。健壮的 Agent 必须处理这些情况：

```python
import json
import logging

logger = logging.getLogger(__name__)

async def execute_tool_safely(tool_call, registry, max_retries=2):
    """带错误处理的工具执行，把错误回传给 LLM 让它自我修正"""
    fn_name = tool_call.function.name
    fn = registry.get(fn_name)

    # 情况 1：LLM 幻觉，调用了不存在的工具
    if fn is None:
        return {
            "tool_call_id": tool_call.id,
            "role": "tool",
            "content": f"Error: 工具 '{fn_name}' 不存在。"
                       f"可用工具: {list(registry.keys())}",
        }

    # 情况 2：参数解析失败
    try:
        args = json.loads(tool_call.function.arguments)
    except json.JSONDecodeError as e:
        return {
            "tool_call_id": tool_call.id,
            "role": "tool",
            "content": f"Error: 参数 JSON 解析失败: {e}。"
                       f"原始参数: {tool_call.function.arguments}",
        }

    # 情况 3：执行异常，带重试
    for attempt in range(max_retries + 1):
        try:
            result = fn(**args)
            return {
                "tool_call_id": tool_call.id,
                "role": "tool",
                "content": str(result),
            }
        except Exception as e:
            logger.warning(
                "工具 %s 第 %d 次执行失败: %s", fn_name, attempt + 1, e
            )
            if attempt == max_retries:
                return {
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "content": f"Error: 工具执行失败（重试 {max_retries} 次）: {e}",
                }

    # 不应到达
    return None
```

核心原则：**错误不要吞掉，要回传给 LLM**。把错误信息以 `tool` 角色消息的形式塞回对话历史，LLM 通常能自我修正——修正参数重新调用，或换一个工具。这比直接给用户报错体验好得多。

重试策略的注意点：

- **只对可重试错误重试**：网络超时、限流（429）可重试；参数不合法、工具不存在不要重试，重试也是错。
- **设置最大重试次数**：避免 LLM 陷入"调用失败-回传错误-再调用失败"的死循环。一般 2-3 次。
- **指数退避**：对网络类错误，重试间隔应指数增长（1s, 2s, 4s）。
- **兜底降级**：超过最大重试次数后，可以让 LLM 尝试其他工具，或直接告知用户"该功能暂时不可用"。

### 1.7 优缺点

**优点**：

- 结构化输出，可靠性远高于 Prompt 约束。
- LLM 只负责决策，不执行副作用，安全可控。
- 参数类型校验由 JSON Schema 保证，减少运行时错误。
- 支持并行调用，延迟可控。

**缺点**：

- 工具描述占用 context window，工具多了会爆上下文（这正是后面 Top-K 路由要解决的）。
- 依赖模型自身的工具调用能力，小模型经常选错工具或参数格式错误。
- 增加了交互轮次（至少两轮 LLM 调用），延迟比直接回答高。
- 调试链路长，出问题难定位是 LLM 决策错还是工具执行错。

### 1.8 Agent 开发中的应用场景

- **RAG 检索**：把"检索知识库"封装成工具，LLM 自主决定是否检索、检索什么。
- **联网搜索**：Tavily / SerpAPI 等搜索工具，让 Agent 查实时信息。
- **数据库查询**：Text-to-SQL 工具，LLM 生成 SQL，工具执行并返回结果。
- **代码执行**：Python REPL 工具，让 Agent 跑代码做计算、画图。
- **API 编排**：多个内部 API 封装成工具，LLM 自主编排调用顺序。
- **多模态操作**：图像生成、文件读写、发邮件等。

---

## 二、Top-K 路由

### 2.1 原理与核心思想

当 Agent 拥有的工具数量从几个增长到几十、几百甚至上千个时，把所有工具描述全塞进 LLM 的 context window 会出三个严重问题：

1. **上下文爆炸**：每个工具的 JSON Schema 动辄几百 token，100 个工具就是几万 token，光工具描述就吃掉大半上下文，留给对话和推理的空间所剩无几。
2. **成本飙升**：每次 LLM 调用都要为这些工具描述付费，即使用户只问"今天天气"也要付 100 个工具的 input token 费用。
3. **选择困难**：研究表明，当候选工具超过 20-30 个时，LLM 的工具选择准确率显著下降——选项越多越容易选错，和人挑花眼是一个道理。

Top-K 路由的核心思想是：**先用一个轻量、廉价的检索步骤，从工具库里筛出与用户 query 最相关的 K 个候选工具（通常 K=3~10），只把这 K 个工具的描述喂给 LLM 做最终决策**。这样既控制了上下文长度和成本，又保证了 LLM 在小候选集上能做出准确选择。

本质上 Top-K 路由把"工具选择"拆成了两阶段：**粗排（召回）+ 精排（决策）**——这和搜索引擎、推荐系统的两阶段架构是同一个思路。粗排用廉价的向量相似度快速过滤，精排用昂贵的 LLM 做准确判断。

### 2.2 关键机制与流程

Top-K 路由的标准流程：

1. **工具库向量化**：离线把每个工具的 `name + description` 用 Embedding 模型编码成向量，存入向量库。
2. **Query 向量化**：用户提问时，把 query 用同一个 Embedding 模型编码。
3. **相似度检索**：在工具向量库里做 Top-K 检索，取与 query 向量最相似的 K 个工具。
4. **构造 Prompt**：只把这 K 个工具的 JSON Schema 塞进 LLM 的 `tools` 参数。
5. **LLM 决策**：LLM 在小候选集上做 Function Calling，选出最终要调用的工具。

```
用户 query
    │
    ▼
[Embedding 模型] ──► query 向量
    │
    ▼
[向量库 Top-K 检索] ──► K 个候选工具（如 K=5）
    │
    ▼
[构造 tools 参数] ──► 只含 K 个工具的 schema
    │
    ▼
[LLM Function Calling] ──► 最终选中的工具 + 参数
    │
    ▼
[执行工具] ──► 结果
```

### 2.3 代码示例

```python
import json
import numpy as np
from openai import OpenAI

client = OpenAI()

# 假设有 50 个工具，这里只列几个示意
TOOL_LIBRARY = [
    {
        "name": "get_weather",
        "description": "查询指定城市的实时天气，包括温度、湿度、风力",
        "parameters": {"type": "object",
                       "properties": {"city": {"type": "string"}},
                       "required": ["city"]}
    },
    {
        "name": "search_news",
        "description": "搜索最新新闻资讯，按关键词检索",
        "parameters": {"type": "object",
                       "properties": {"keyword": {"type": "string"}},
                       "required": ["keyword"]}
    },
    {
        "name": "query_stock",
        "description": "查询股票实时行情，包括涨跌幅、成交量",
        "parameters": {"type": "object",
                       "properties": {"code": {"type": "string"}},
                       "required": ["code"]}
    },
    {
        "name": "create_calendar_event",
        "description": "在日历中创建日程事件，设置时间和提醒",
        "parameters": {"type": "object",
                       "properties": {"title": {"type": "string"},
                                      "time": {"type": "string"}},
                       "required": ["title", "time"]}
    },
    # ... 省略其他 46 个工具
]

# 步骤 1：离线把工具库向量化（实际中应持久化，不要每次重算）
def embed_tools(tools):
    texts = [f"{t['name']}: {t['description']}" for t in tools]
    resp = client.embeddings.create(
        input=texts,
        model="text-embedding-3-small"
    )
    return np.array([d.embedding for d in resp.data])

tool_vectors = embed_tools(TOOL_LIBRARY)  # shape: (50, 1536)

# 步骤 2-3：query 向量化 + Top-K 检索
def retrieve_topk_tools(user_query, k=5):
    resp = client.embeddings.create(
        input=user_query,
        model="text-embedding-3-small"
    )
    query_vec = np.array(resp.data[0].embedding)  # shape: (1536,)

    # 余弦相似度
    scores = tool_vectors @ query_vec / (
        np.linalg.norm(tool_vectors, axis=1) * np.linalg.norm(query_vec)
    )
    topk_idx = np.argsort(scores)[-k:][::-1]  # 取相似度最高的 K 个
    return [TOOL_LIBRARY[i] for i in topk_idx], scores[topk_idx]

# 步骤 4-5：用筛出来的 Top-K 工具做 Function Calling
def route_and_call(user_query, k=5):
    candidates, scores = retrieve_topk_tools(user_query, k)

    print(f"Top-{k} 候选工具及相似度:")
    for c, s in zip(candidates, scores):
        print(f"  {c['name']}: {s:.4f}")

    # 只把候选工具塞给 LLM
    tools_schema = [
        {"type": "function", "function": t} for t in candidates
    ]

    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": user_query}],
        tools=tools_schema,
    )

    msg = resp.choices[0].message
    if msg.tool_calls:
        tc = msg.tool_calls[0]
        print(f"\nLLM 选中: {tc.function.name}")
        print(f"参数: {tc.function.arguments}")
        return tc
    return msg.content

# 测试
route_and_call("北京今天冷不冷，要穿外套吗")
# 输出示例：
# Top-5 候选工具及相似度:
#   get_weather: 0.8732
#   search_news: 0.4123
#   ...
# LLM 选中: get_weather
# 参数: {"city": "北京"}
```

### 2.4 K 值怎么选

K 是 Top-K 路由的关键超参，需要在召回率和上下文成本之间权衡：

- **K 太小（如 K=1）**：相当于完全用向量检索做工具选择，绕过了 LLM 决策。快但容易漏——向量相似度不一定等于语义匹配，"北京穿什么"和"get_weather"的 embedding 相似度未必最高。
- **K 太大（如 K=20）**：退化为不路由，上下文又爆了。
- **经验值**：K=5~10 是多数场景的甜点区。工具总数少于 10 个时直接全塞给 LLM，不需要 Top-K。

### 2.5 优缺点

**优点**：

- 突破工具数量上限，支持几百上千工具的场景。
- 大幅降低 LLM 的 input token 成本（只传 K 个工具而非全部）。
- 提升 LLM 选择准确率（候选集小，选择更聚焦）。
- 向量检索是毫秒级，整体延迟增加可忽略。

**缺点**：

- 引入两阶段，如果 Top-K 召回阶段漏掉了正确工具，精排阶段无药可救——**召回率是上限**。
- 工具描述的 embedding 质量直接影响路由效果，描述写得差就路由错。
- 需要维护工具向量库，工具增删后要重新编码。
- 短 query（如"今天天气"） embedding 信息量少，路由可能不准。

### 2.6 Agent 开发中的应用场景

- **企业级 Agent**：内部有几百个 API/工具，必须 Top-K 路由才能用。
- **MCP（Model Context Protocol）工具集成**：MCP server 暴露大量工具，需要路由筛选。
- **多技能助手**：个人助手类 Agent 集成日历、邮件、搜索、文档、代码等几十个工具。
- **插件系统**：类似 ChatGPT Plugins，第三方插件数量庞大，必须路由。

### 2.7 提升召回率的技巧

- **工具描述增强**：不要只 embed `name + description`，可以加入"使用场景""示例 query"等辅助文本，让 embedding 更准确地捕捉工具语义。
- **混合检索**：除了向量检索，加一路 BM25 关键词检索，两路结果合并去重。工具名往往是强关键词信号（用户说"查天气"明显匹配 `get_weather`）。
- **Rerank**：向量检索取 Top-20，再用 Cross-Encoder rerank 模型精排到 Top-5，进一步提升准确率。
- **分层路由**：先按大类路由（天气类、股票类、日历类），再在类内做 Top-K。两级筛选更稳。

---

## 三、语义路由（Semantic Routing）

### 3.1 原理与核心思想

语义路由（Semantic Routing）是指**基于 Embedding 相似度，把用户 query 直接分发到对应的处理逻辑，不经过 LLM 决策**。它和 Top-K 路由的区别在于：Top-K 路由筛出候选后仍交给 LLM 做 Function Calling；语义路由则完全绕过 LLM，用向量相似度直接决定走哪条路。

核心思想是：**如果一个分类决策可以用"query 与预定义意图的向量相似度"解决，就不必劳驾 LLM**——向量检索是毫秒级且几乎零成本，而 LLM 调用至少几百毫秒且按 token 付费。对于意图明确、路由目标固定的场景，语义路由是更轻、更快、更便宜的方案。

语义路由本质上是把"意图分类"问题转化为"向量最近邻搜索"问题：预先为每个意图定义若干条示例 query（称为 utterance），编码成向量；用户 query 来了，编码后找最近的意图向量，相似度超过阈值就路由到该意图。

### 3.2 与规则路由（关键词/正则）对比

传统路由用的是关键词匹配或正则：

```python
def rule_based_route(query):
    if "天气" in query or "温度" in query:
        return "weather_agent"
    elif "股票" in query or "行情" in query:
        return "stock_agent"
    elif re.search(r"\b(book|预订|订)\b", query):
        return "booking_agent"
    else:
        return "default_agent"
```

规则路由的问题：

- **脆弱**：用户说"今天要不要带伞"匹配不到"天气"关键词，但其实是在问天气。
- **维护成本高**：意图多了，关键词列表爆炸，且不同意图的关键词会冲突（"股票行情"和"天气预报"都含"行情/预报"歧义）。
- **无法处理同义表达**："今天冷吗""穿什么""气温如何"都是问天气，关键词穷举不现实。

语义路由的优势：

- **鲁棒**：基于 embedding，"今天要不要带伞"和"查询天气"的向量相似度很高，能正确路由。
- **零规则维护**：加新意图只需加几条示例 utterance，不用改代码。
- **泛化能力强**：同义、近义、口语化表达都能覆盖。

规则路由也并非一无是处：它对**精确指令**（如"/weather"、"查询股票"）和**结构化输入**（如"订单号 XYZ123"）依然高效可靠，且完全可解释。生产实践中常常**规则 + 语义混合**：先用规则匹配精确指令，匹配不到再走语义路由。

### 3.3 语义路由器（semantic-router 库）实现原理

`semantic-router` 是开源的语义路由库，其核心实现非常简洁。原理如下：

1. **定义路由（Route）**：每个路由有一个名字、一组示例 utterance（称为 utterances）、一个阈值。
2. **编码**：用 Embedding 模型把所有 utterance 编码成向量，构成该路由的"语义空间"。
3. **路由决策**：用户 query 编码后，与所有路由的所有 utterance 计算相似度，取最高分。如果最高分超过该路由的阈值，就路由到该路由；否则走默认路由。

```python
from semantic_router import Route
from semantic_router.layer import RouteLayer
from semantic_router.encoders import OpenAIEncoder

# 步骤 1：定义路由
weather_route = Route(
    name="weather",
    utterances=[
        "今天天气怎么样",
        "北京气温多少度",
        "要不要带伞",
        "穿什么衣服合适",
        "明天会下雨吗",
        "what's the weather today",
        "is it going to rain",
    ],
    score_threshold=0.5,  # 阈值：相似度低于此分数不路由
)

stock_route = Route(
    name="stock",
    utterances=[
        "查询股票行情",
        "茅台今天涨了吗",
        "A股大盘走势",
        "000001 股价多少",
        "stock market today",
        "how is the stock performing",
    ],
    score_threshold=0.5,
)

chitchat_route = Route(
    name="chitchat",
    utterances=[
        "你好",
        "你是谁",
        "讲个笑话",
        "thanks",
        "hello there",
    ],
    score_threshold=0.3,  # 闲聊阈值可以低一些
)

# 步骤 2：构建路由层（内部会编码所有 utterance）
encoder = OpenAIEncoder()
rl = RouteLayer(encoder=encoder, routes=[weather_route, stock_route, chitchat_route])

# 步骤 3：路由决策
result = rl("今天出门需要带伞吗")
print(result.name)  # 输出: weather

result = rl("贵州茅台今天表现怎么样")
print(result.name)  # 输出: stock

result = rl("你是用什么模型做的")
print(result.name)  # 输出: chitchat

result = rl("请帮我重构这段代码的单元测试")
print(result.name)  # 输出: None  （没超过任何路由阈值，走兜底）
```

`semantic-router` 内部的相似度计算：默认用 cosine 相似度，每个路由取 query 与该路由所有 utterance 相似度的**最大值**（max pooling）作为该路由的得分。这样设计是因为一条 query 只需与路由里某一条示例足够像即可路由，不必与所有示例都像。

### 3.4 多分类与阈值控制

语义路由有两个关键问题要处理好：

**问题 1：多分类（一个 query 可能匹配多个路由）**

默认情况下语义路由是"硬路由"——只选得分最高的一个路由。但有些场景需要"软路由"或多路由触发：

- 用户说"查一下北京天气，顺便看看今天茅台股票怎么样"——同时匹配 weather 和 stock 两个路由。
- 意图检测 + 兜底分类——既想知道主意图，又想知道是不是闲聊。

解法：取 Top-N 路由，对每个超过阈值的路由都触发对应处理逻辑：

```python
def route_multi(query, route_layer, top_n=3):
    """返回所有超过阈值的路由，按得分降序"""
    query_vec = route_layer.encoder([query])[0]
    scores = []
    for route in route_layer.routes:
        # 该路由所有 utterance 的最大相似度
        max_score = max(
            cosine_sim(query_vec, utt_vec)
            for utt_vec in route.utterance_vectors
        )
        if max_score >= route.score_threshold:
            scores.append((route.name, max_score))
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:top_n]

# 多路由触发示例
matches = route_multi("北京天气怎么样，顺便看看茅台股价", rl)
# 输出: [("weather", 0.82), ("stock", 0.71)]
# 两个路由都触发，可以并行调用两个 Agent
```

**问题 2：阈值控制**

阈值是语义路由最敏感的参数：

- **阈值太高**：很多合理 query 被拒，路由命中率低，用户体验差。
- **阈值太低**：不相关的 query 也被路由过去，错误分发。
- **不同路由需要不同阈值**：闲聊类意图的 utterance 表达多样，阈值要低一些（0.3-0.4）；专业类意图（如股票查询）的 utterance 比较规范，阈值可以高一些（0.5-0.7）。

调阈值的方法：

1. **准备评测集**：收集 (query, 正确路由) 对，覆盖各种表达方式。
2. **遍历阈值**：从 0.2 到 0.8 步长 0.05，计算每个阈值下的精确率、召回率、F1。
3. **选 F1 最高的阈值**：或根据业务偏重（更怕误路由还是怕漏路由）选精确率/召回率更高的点。
4. **分路由调优**：每个路由单独调阈值，不要全局一刀切。

### 3.5 优缺点

**优点**：

- 极快（向量检索毫秒级），几乎零成本。
- 不依赖 LLM，无 token 消耗。
- 对自然语言变体鲁棒，远胜关键词匹配。
- 路由逻辑清晰，易于调试和迭代（加 utterance 即可）。

**缺点**：

- **不适合需要参数提取的场景**：语义路由只做"走哪条路"的分类，不负责从 query 里提取参数（如城市名、日期）。参数提取还是要靠 LLM 或 NLU 模块。
- **召回受 utterance 覆盖度限制**：示例 utterance 没覆盖到的表达方式可能路由不准。
- **多意图 query 处理弱**：用户一句话包含多个意图时，硬路由只能选一个。
- **阈值调优麻烦**：需要评测集，且不同路由、不同 embedding 模型阈值不一样。

### 3.6 Agent 开发中的应用场景

- **多 Agent 分发**：用户 query 进来先语义路由到 weather_agent / stock_agent / chitchat_agent 等子 Agent，再由子 Agent 用 Function Calling 处理。
- **意图识别前置过滤**：先语义路由判断是否需要调用工具，纯闲聊直接 LLM 回答，工具类 query 才进入 Function Calling 流程，节省成本。
- **RAG 路由**：多个知识库时，语义路由决定查哪个知识库（产品文档库 / HR 政策库 / 技术文档库）。
- **兜底降级**：LLM 不可用时，语义路由作为廉价 fallback 维持基本服务。
- **A/B 实验分流**：按语义把 query 分到不同实验组。

### 3.7 规则 + 语义混合路由（生产推荐）

生产环境推荐用混合路由，取两者之长：

```python
def hybrid_route(query):
    # 第一层：精确规则匹配（快、准、可解释）
    if query.startswith("/"):
        return route_by_command(query)  # 如 /weather, /stock

    # 第二层：正则匹配结构化输入
    if re.match(r"^\d{6}$", query):  # 6 位股票代码
        return "stock_agent"

    # 第三层：语义路由（处理自然语言）
    semantic_result = semantic_route(query)
    if semantic_result is not None:
        return semantic_result

    # 第四层：兜底走 LLM 决策
    return "llm_fallback"
```

这种分层结构既保证了精确指令的零延迟和可解释性，又覆盖了自然语言的多样性，最后还有 LLM 兜底处理长尾 query。

---

## 四、三种机制的关系与选型

把三种机制放在一起看，它们构成了 Agent 工具选择的完整频谱：

| 机制 | 决策者 | 延迟 | 成本 | 适合工具数 | 适合场景 |
|---|---|---|---|---|---|
| Function Calling | LLM | 高（秒级） | 高（token 费） | <10 个 | 工具少、需要参数提取 |
| Top-K 路由 | 向量检索 + LLM | 中（检索毫秒 + LLM 秒级） | 中（K 个工具的 token） | 几十~上千 | 工具多、需要 LLM 精准决策 |
| 语义路由 | 向量检索 | 低（毫秒级） | 极低（无 LLM） | 任意（按意图分组） | 意图明确、无需参数提取 |

选型建议：

1. **工具少于 10 个**：直接 Function Calling，全塞给 LLM，简单可靠。
2. **工具 10~50 个**：Top-K 路由，K 取 5~10。
3. **工具超过 50 个**：先语义路由分大类，类内再 Top-K + Function Calling。
4. **不需要参数提取的纯分发场景**：语义路由，绕过 LLM。
5. **追求极致性能/成本**：语义路由 + 规则混合，LLM 只做兜底。

实际生产 Agent 往往是多层组合：**规则路由 → 语义路由 → Top-K 路由 → Function Calling**，层层过滤，每一层只处理自己擅长的 query，最后把真正复杂的留给 LLM。

---

## 五、小结

工具调用与函数选择是 Agent 把"想"变成"做"的关键一跃。本篇讲了三个层层递进的机制：

- **Function Calling** 是基础——让 LLM 能选工具、能传参、能基于结果继续推理。它的可靠性来自模型训练阶段的结构化输出能力，是所有工具调用链路的最终决策环节。
- **Top-K 路由** 是扩展——当工具数量爆炸时，用向量检索先粗排再精排，把"几百个工具里选一个"降维成"5 个工具里选一个"，既省 token 又提准确率。两阶段架构是处理大规模候选集的通用范式。
- **语义路由** 是轻量替代——当决策本身只需要"分类"不需要"参数提取"时，完全用向量相似度替代 LLM，毫秒级响应、零 token 成本。它和规则路由互补，构成 Agent 的前置分发层。

真正的生产级 Agent 不会只依赖其中一种，而是根据工具规模、延迟要求、成本预算，把三者组合成分层路由架构。理解每种机制的适用边界，比记住它们的实现细节更重要——技术选型的本质是在准确率、延迟、成本三角里找平衡点。

下一篇将讲解 Agent 的评估与优化算法，包括 A/B Testing、LLM-as-a-Judge、Trajectory Evaluation 等，敬请期待。
