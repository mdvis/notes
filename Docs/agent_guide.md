# Agent 开发实战指南：RAG + 工具调用 + 联网搜索（三合一）

> 面向前端工程师转型 Agent 方向的实战指南。目标：做完即可达到 Agent 岗位面试水平。
> 全本地 Ollama 部署，零云模型成本。
> 所有依赖包均经过长期支持性核查，不含已 sunset 的 `langchain-community`。

---

## 第一部分：需求与技术选型

### 1.1 核心目标

把 RAG（检索增强）、Tool Use（工具调用）、联网搜索三件事合到一个 Agent 项目里，一次吃透 Agent 的三大核心能力，达到面试可讲、代码可写、原理可说清楚的水平。

### 1.2 选型标准（必须同时满足）

1. **主流**：社区大、文档全、面试官认得。
2. **短期不会被替代**：不是刚冒头的实验性项目，也不在被 sunset 列表里。
3. **主流稳定 > 好上手**：冲突时优先主流稳定。

### 1.3 技术决策清单（含依据 + 长期支持核查）

| 维度 | 选型 | 依据 | 不选替代品的理由 |
|---|---|---|---|
| 编程语言 | **Python** | AI/Agent 生态 90% 在 Python；Ollama、LangChain、向量库的 Python SDK 都是一等公民；Agent 岗位 JD 默认 Python | 不选 Node/TS：虽然你是前端，但 Agent 生态在 Python 端更完整、更新更快，TS 端方案多为 Python 的跟随者，面试也不认。前端身份在这里"能用就用不能用就抛弃" |
| Agent 框架 | **LangChain**（Python） | 当前最主流，生态最大，AI 辅助编程对它最熟，RAG/工具/搜索三件套都有现成集成，面试必问 | 不选 LlamaIndex：RAG 强但 Agent 能力弱于 LangChain，三合一场景吃亏；不选 LangGraph：是 LangChain 的演进，适合复杂多步状态机，新手直接上会陷进抽象里，等 LangChain 熟了再演进；不选 CrewAI/AutoGen：多 Agent 场景，你的三合一是单 Agent，过度设计 |
| LLM | **qwen3.5（Ollama 本地）** | 你已指定；qwen3 系列在 Ollama 上原生支持工具调用（tool_calls 格式），中文能力强 | 不选云模型：你明确要全本地零成本 |
| Embedding | **qwen3-embedding（Ollama 本地）** | 你已指定；Ollama v0.12.1 起内置，与 qwen3.5 同源，中英双语表现好 | 不选 bge/m3：换模型多一次调研成本，同源模型更省心 |
| 向量库 | **Chroma** | 本地优先（契合 Ollama 本地路线），开箱即用、自带持久化、社区教程最多 | 不选 FAISS：无内置持久化要自己管、API 偏底层；不选 Qdrant/Milvus：要起服务，单用户本地学习过度设计 |
| 联网搜索 | **Tavily（`langchain-tavily` 包）** | 专为 AI Agent 设计，返回结果已为 LLM 整理，免费额度 1000 次/月够学习；`langchain-tavily` 由 tavily-ai 团队官方维护 | 不选 DuckDuckGo：免费但限流严重、结果质量低；不选 SerpAPI：纯付费。**不用 `langchain-community` 里的 `TavilySearchResults`**：该包 2026-05 已被官方 sunset |
| 文档加载 | **`pypdf` 直接解析** | LangChain 官方在 sunset `langchain-community` 时明确建议"直接在应用代码里实现"；`pypdf` 是成熟独立库，配合 `langchain-core` 的 `Document` 封装即可 | 不用 `langchain_community.document_loaders.PyPDFLoader`：随 `langchain-community` 一起 sunset，长期不稳 |
| 分块策略 | **`RecursiveCharacterTextSplitter`（`langchain-text-splitters` 包）** | 独立稳定包，不在 sunset 范围；按段落递归切分，中文友好 | 先用默认，跑通后再考虑语义分块 |

### 1.4 包的长期支持说明（重点）

LangChain 生态 2026 年 5 月 22 日官方宣布 sunset `langchain-community` 包（[issue #674](https://github.com/langchain-ai/langchain-community/issues/674)），仓库已归档，不再接受新集成和功能。继续用它会出现你看到的 `DeprecationWarning`，且长期无维护。

**本指南的包策略**：只用以下三类，彻底避开 `langchain-community`：

1. **`langchain-core`**：LangChain 的稳定基础包，`Document`、`@tool`、`ChatPromptTemplate` 都在这里。永不会被 sunset（是整个生态的地基）。
2. **官方 partner 包**：`langchain-ollama`、`langchain-chroma`、`langchain-tavily`、`langchain-text-splitters`——每个由对应厂商/团队维护，独立发版，是官方推荐路径。
3. **成熟独立库**：`pypdf`（PDF 解析）、`python-dotenv`——不依赖 LangChain 生命周期。

### 1.5 最终依赖清单

```
langchain               # create_tool_calling_agent, AgentExecutor
langchain-core          # Document, @tool, ChatPromptTemplate（地基）
langchain-ollama        # ChatOllama + OllamaEmbeddings
langchain-chroma        # Chroma 向量库集成
langchain-tavily        # TavilySearch（官方，替代 langchain-community）
langchain-text-splitters # RecursiveCharacterTextSplitter（独立稳定包）
chromadb                # Chroma 底层引擎
pypdf                   # PDF 直接解析（替代 langchain-community 的 PyPDFLoader）
python-dotenv           # 管理 TAVILY_API_KEY
```

注意：**不要装 `langchain-community`**。装了会出现 deprecation 警告，且无长期维护。

---

## 第二部分：环境准备

### 2.1 安装 Ollama 并拉取模型

```bash
# 1. 装 Ollama（macOS）
brew install ollama
# 启动服务
ollama serve

# 2. 拉模型（本地已有可跳过）
ollama pull qwen3.5
ollama pull qwen3-embedding
```

**关键验证步骤（必做）**：确认 qwen3.5 在你的 Ollama 版本上支持工具调用。

```bash
ollama list                 # 查看本地模型
ollama show qwen3.5         # 看详情，确认 capabilities 里有 tools
```

如果输出里没有 tools 能力，说明该模型 tag 不支持工具调用——这是整个项目的地基，必须先确认。qwen3 系列 Instruct 版本支持，但不同 tag 可能有差异，以你本地 `ollama show` 实际输出为准。

### 2.2 Python 环境

```bash
# Python 3.10+（3.11 最佳）
python3 -m venv .venv
source .venv/bin/activate

pip install langchain langchain-core langchain-ollama langchain-chroma \
            langchain-tavily langchain-text-splitters chromadb \
            pypdf python-dotenv
```

### 2.3 Tavily API Key

去 [tavily.com](https://app.tavily.com/sign-in) 注册（免费 1000 次/月），拿到 Key，放进项目根目录 `.env`：

```
TAVILY_API_KEY=tvly-xxxxxxxxxxxx
```

`.gitignore` 必须包含：

```
.venv/
.env
chroma_db/
__pycache__/
```

---

## 第三部分：架构设计

### 3.1 整体架构

```
用户提问
   │
   ▼
┌──────────────────────────────────┐
│        Agent（qwen3.5 大脑）       │
│   决定：直接答 / 查知识库 / 联网 / 调工具  │
└──────────────────────────────────┘
   │            │            │
   ▼            ▼            ▼
 RAG 工具     搜索工具      其他自定义工具
 (本地知识)   (Tavily)      (如计算器等)
   │            │
   ▼            ▼
Chroma向量库   Tavily API
(qwen3-embedding)
   │
   ▼
本地文档（PDF/MD/TXT）
```

### 3.2 核心思路

Agent 不是三个功能拼一起，而是**让 LLM 当大脑，自己决定用哪个工具**。RAG 和联网搜索都封装成"工具"暴露给 Agent，Agent 根据问题自主选择：

- 问"公司请假制度"→ Agent 调 RAG 工具（查本地文档）
- 问"今天新闻"→ Agent 调联网搜索工具
- 问"3.14 乘以 2"→ Agent 调计算器工具（或直接答）

这就是 **Tool Use** 的本质：LLM 通过 function calling 决定调用哪个函数。三合一的关键是 **RAG 和搜索都变成 Tool**，而不是写一堆 if-else 路由。

---

## 第四部分：模块一 —— RAG 实现

### 4.1 RAG 五步流水线

```
加载文档 → 切块 → Embedding → 存入向量库 → 检索
```

### 4.2 步骤 1：加载文档（用 pypdf 直接解析）

不用 `langchain-community` 的 `PyPDFLoader`（已 sunset），用 `pypdf` 直接读，再用 `langchain-core` 的 `Document` 封装。这是官方推荐路径，且你完全掌控解析逻辑。

```python
# ingest.py 的一部分
from pypdf import PdfReader
from langchain_core.documents import Document
from pathlib import Path

def load_pdf(file_path: str) -> list[Document]:
    """读取单个 PDF，返回 LangChain Document 列表。"""
    reader = PdfReader(file_path)
    docs = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text.strip():  # 跳过空页
            docs.append(Document(
                page_content=text,
                metadata={"source": file_path, "page": i + 1},
            ))
    return docs

def load_directory(dir_path: str) -> list[Document]:
    """批量加载目录下所有 PDF。"""
    all_docs = []
    for pdf_file in Path(dir_path).glob("*.pdf"):
        all_docs.extend(load_pdf(str(pdf_file)))
    return all_docs

# 用法
documents = load_directory("./docs")
print(f"共加载 {len(documents)} 个文档块")
```

**要点**：
- `Document` 在 `langchain_core.documents`，是稳定基础类，`page_content` + `metadata` 两字段。
- `metadata` 一定要带来源和页码，检索时能溯源（面试加分点）。
- 想支持 Markdown/TXT？同理用 `Path.read_text()` 读，包成 `Document` 即可，不需要专门的 loader。

### 4.3 步骤 2：切块

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,        # 中文建议 500 字符起步
    chunk_overlap=50,      # 重叠防切断语义
    separators=["\n\n", "\n", "。", "！", "？", "，", " ", ""],  # 中文友好分隔符
)

splits = splitter.split_documents(documents)
print(f"切块后 {len(splits)} 个片段")
```

**坑**：
- `chunk_size` 太小→上下文断裂；太大→检索不精准。500 是中文起步值，跑通后调。
- `chunk_overlap` 别设 0，跨块信息会丢。
- 默认分隔符偏英文，加上中文标点 `。！？，` 切得更自然。

### 4.4 步骤 3+4：Embedding 并存入 Chroma

```python
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma

embeddings = OllamaEmbeddings(model="qwen3-embedding")

# 一次性完成 embedding 计算 + 持久化存储
vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=embeddings,
    persist_directory="./chroma_db",   # 持久化路径
    collection_name="my_knowledge",     # 集合名，方便管理多套知识库
)

# 后续加载已有库（不用重算 embedding）
# vectorstore = Chroma(
#     persist_directory="./chroma_db",
#     embedding_function=embeddings,
#     collection_name="my_knowledge",
# )
```

**坑**：
- qwen3-embedding 有多个尺寸（0.6B/4B/8B），默认拉的可能是最小尺寸。内存够就用大尺寸，检索质量明显好。用 `ollama pull qwen3-embedding:8b` 指定。
- Chroma 新版**自动持久化**，不要手动调 `persist()`（会报警告）。老教程会让你调，别照抄。
- 重复跑 `ingest.py` 会重复入库。重灌前删掉 `chroma_db/` 目录，或代码里加存在判断。

### 4.5 步骤 5：检索（做成 Retriever）

```python
retriever = vectorstore.as_retriever(
    search_type="similarity",        # 先用最相似；跑通后可换 "mmr"
    search_kwargs={"k": 4},          # 取 top-4
)

# 测试检索
results = retriever.invoke("请假制度")
for doc in results:
    print(f"[来源:{doc.metadata['source']} 第{doc.metadata['page']}页]")
    print(doc.page_content[:100])
    print("---")
```

`k=4` 起步。换 `mmr`（最大边际相关性）能避免返回结果内容重复，进阶再试。

### 4.6 把 RAG 封装成工具（三合一关键一步）

RAG 不是直接用，而是包成 Tool 给 Agent 调。

```python
# tools.py 的一部分
from langchain_core.tools import tool

@tool
def search_knowledge_base(query: str) -> str:
    """从本地知识库检索相关信息。
    当问题涉及公司制度、文档内容、内部资料、已上传的文档时使用此工具。
    不适用于实时信息或最新新闻。"""
    docs = retriever.invoke(query)
    if not docs:
        return "知识库中没有找到相关内容。"
    return "\n\n".join(
        f"[来源:{d.metadata['source']} 第{d.metadata['page']}页]\n{d.page_content}"
        for d in docs
    )
```

**核心要点**：docstring 必须写清楚"什么情况下用这个工具"以及"什么情况不用"——LLM 靠它决定是否调用。写不好 docstring = Agent 不会用或乱用这个工具。这是面试必问的点。

---

## 第五部分：模块二 —— 工具调用（Tool Use）

### 5.1 工具定义

用 `@tool` 装饰器（最直观），函数名=工具名，docstring=工具描述，参数类型注解必须有。

```python
# tools.py
from langchain_core.tools import tool

@tool
def calculator(expression: str) -> str:
    """计算数学表达式。当需要精确数值计算时使用，如加减乘除、百分比等。
    参数 expression：数学表达式字符串，如 '3.14 * 2' 或 '100 * 0.15'。"""
    try:
        # eval 仅限数学表达式场景，生产环境换 ast.literal_eval 或 numexpr
        result = eval(expression, {"__builtins__": {}}, {})
        return str(result)
    except Exception as e:
        return f"计算失败: {e}"
```

**要点**：
- 工具名用英文（function calling 约定），描述可用中文（qwen 中文理解强）。
- 参数类型注解（`str`/`int`/`float`）必须有，LLM 靠它传参。
- 返回值统一用 `str` 最稳，dict 也行但 LLM 可能解析不好，新手统一返 str。
- 描述里说清楚参数含义和格式，LLM 传参会更准。

### 5.2 准备 LLM 并绑定工具

```python
# agent.py 的一部分
from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="qwen3.5",
    temperature=0,      # Agent 决策用，0 更稳定选对工具
    # num_ctx=8192,     # 如需更大上下文，取消注释调整
)
```

工具绑定放在组装阶段（第七部分）统一做，这里先理解 API：

```python
# 概念演示，实际在第七部分组装
llm_with_tools = llm.bind_tools([search_knowledge_base, calculator, tavily_search])
```

`bind_tools` 把工具 schema 注入 LLM 请求。qwen3.5 支持 Ollama 原生 `tool_calls` 格式，LangChain 自动处理。

### 5.3 验证 LLM 工具调用（调试技巧）

单独测 LLM 是否真能调工具，没跑通别急着组装 Agent：

```python
# 调试用：直接看 LLM 是否返回 tool_calls
llm_with_tools = llm.bind_tools([calculator])
response = llm_with_tools.invoke("帮我算一下 3.14 乘以 2")
print(response.tool_calls)   # 应该看到 [{'name': 'calculator', 'args': {'expression': '3.14 * 2'}}]
```

如果 `tool_calls` 为空或报错，先排查：
1. `ollama show qwen3.5` 确认支持 tools
2. Ollama 版本是否够新（v0.12+）
3. 工具 docstring 和参数注解是否齐全

---

## 第六部分：模块三 —— 联网搜索

### 6.1 接入 Tavily（用官方 `langchain-tavily` 包）

不用 `langchain-community` 的 `TavilySearchResults`（已 sunset），用 `langchain-tavily` 的 `TavilySearch`（tavily-ai 官方维护）。

```python
# tools.py 的一部分
import os
from dotenv import load_dotenv
from langchain_tavily import TavilySearch

load_dotenv()   # 加载 .env 里的 TAVILY_API_KEY

tavily_search = TavilySearch(
    max_results=3,           # 3~5 即可，太多撑爆上下文
    topic="general",         # general / news / finance，按需选
    # tavily_api_key=os.environ["TAVILY_API_KEY"],  # 不传则自动读环境变量
)
```

`TavilySearch` 本身就是 Tool 对象，可直接加入工具列表，不用再 `@tool` 包装。

### 6.2 单独测试

```python
# 调试：单独测搜索工具
result = tavily_search.invoke({"query": "2026 年 AI Agent 最新进展"})
print(result)
```

**坑**：
- 必须设环境变量 `TAVILY_API_KEY`，用 `python-dotenv` 的 `load_dotenv()` 加载。
- `max_results` 设 3~5，太多会撑爆上下文。
- 免费额度 1000 次/月，调试时别疯狂调用。
- `topic="news"` 适合时事，`topic="general"` 适合通用问题。

---

## 第七部分：组装完整 Agent

### 7.1 项目文件组织

```
ag/
├── .env                  # TAVILY_API_KEY
├── .gitignore
├── requirements.txt
├── docs/                 # RAG 源文档（PDF/MD/TXT）
├── chroma_db/            # 向量库持久化（gitignore）
├── ingest.py             # 文档加载+切块+入库（一次性脚本）
├── tools.py              # 所有工具定义（RAG/搜索/计算器）
└── agent.py              # 组装 Agent + 交互入口
```

### 7.2 tools.py 完整结构

```python
# tools.py
import os
from dotenv import load_dotenv
from langchain_core.tools import tool
from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings

load_dotenv()

# --- 初始化 retriever（依赖已灌好的 chroma_db）---
_embeddings = OllamaEmbeddings(model="qwen3-embedding")
_vectorstore = Chroma(
    persist_directory="./chroma_db",
    embedding_function=_embeddings,
    collection_name="my_knowledge",
)
retriever = _vectorstore.as_retriever(search_kwargs={"k": 4})

# --- 工具 1：RAG 知识库检索 ---
@tool
def search_knowledge_base(query: str) -> str:
    """从本地知识库检索相关信息。
    当问题涉及公司制度、文档内容、内部资料、已上传的文档时使用。
    不适用于实时信息或最新新闻。"""
    docs = retriever.invoke(query)
    if not docs:
        return "知识库中没有找到相关内容。"
    return "\n\n".join(
        f"[来源:{d.metadata['source']} 第{d.metadata['page']}页]\n{d.page_content}"
        for d in docs
    )

# --- 工具 2：计算器 ---
@tool
def calculator(expression: str) -> str:
    """计算数学表达式。当需要精确数值计算时使用。
    参数 expression：如 '3.14 * 2'。"""
    try:
        result = eval(expression, {"__builtins__": {}}, {})
        return str(result)
    except Exception as e:
        return f"计算失败: {e}"

# --- 工具 3：联网搜索 ---
from langchain_tavily import TavilySearch
tavily_search = TavilySearch(max_results=3, topic="general")

# --- 工具列表（供 agent.py 导入）---
all_tools = [search_knowledge_base, calculator, tavily_search]
```

### 7.3 ingest.py 完整结构

```python
# ingest.py（一次性运行，灌数据进 Chroma）
from pypdf import PdfReader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from pathlib import Path

def load_pdf(file_path: str) -> list[Document]:
    reader = PdfReader(file_path)
    docs = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text.strip():
            docs.append(Document(
                page_content=text,
                metadata={"source": file_path, "page": i + 1},
            ))
    return docs

def main():
    # 1. 加载
    documents = []
    for pdf_file in Path("./docs").glob("*.pdf"):
        documents.extend(load_pdf(str(pdf_file)))
    print(f"加载 {len(documents)} 页")

    # 2. 切块
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500, chunk_overlap=50,
        separators=["\n\n", "\n", "。", "！", "？", "，", " ", ""],
    )
    splits = splitter.split_documents(documents)
    print(f"切块后 {len(splits)} 片段")

    # 3+4. Embedding + 入库（自动持久化）
    embeddings = OllamaEmbeddings(model="qwen3-embedding")
    Chroma.from_documents(
        documents=splits,
        embedding=embeddings,
        persist_directory="./chroma_db",
        collection_name="my_knowledge",
    )
    print("入库完成。下次运行 agent.py 直接加载 ./chroma_db 即可。")

if __name__ == "__main__":
    main()
```

### 7.4 agent.py 完整结构

```python
# agent.py（主入口）
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import create_tool_calling_agent, AgentExecutor
from tools import all_tools

# 1. LLM
llm = ChatOllama(model="qwen3.5", temperature=0)

# 2. Prompt（agent_scratchpad 占位符必须有）
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个能干的中国助手。根据问题决定：直接回答、查本地知识库、或联网搜索。能调用工具就调工具，不要编造。"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

# 3. 组装 Agent
agent = create_tool_calling_agent(llm, all_tools, prompt)
executor = AgentExecutor(
    agent=agent,
    tools=all_tools,
    verbose=True,      # 打印思考链路，调试必备
    max_iterations=5,  # 防止无限循环
)

# 4. 交互循环
if __name__ == "__main__":
    print("Agent 已就绪（输入 quit 退出）")
    while True:
        user_input = input("\n你: ").strip()
        if user_input.lower() in ("quit", "exit", "q"):
            break
        result = executor.invoke({"input": user_input})
        print(f"\nAgent: {result['output']}")
```

### 7.5 运行流程

```bash
# 1. 先灌数据（改了 docs/ 里的文档才重跑）
python ingest.py

# 2. 跑 Agent
python agent.py
```

测试三合一效果：
- 问"公司请假制度" → Agent 调 `search_knowledge_base`
- 问"今天有什么 AI 新闻" → Agent 调 `tavily_search`
- 问"15% 的 880 是多少" → Agent 调 `calculator`

---

## 第八部分：常见坑（重点看）

### 8.1 Ollama / qwen 相关

1. **模型不支持工具调用**：不是所有 tag 都支持 `tool_calls`。`ollama show qwen3.5` 确认。不支持整个项目起不来，这是第一道关。
2. **temperature**：Agent 决策设 `temperature=0`，更稳定选对工具。
3. **上下文长度**：RAG 结果 + 搜索结果 + 对话历史叠加可能超限。`k=4`、`max_results=3` 起步。
4. **首次调用慢**：本地模型首次推理要加载权重，慢是正常的，不是 bug。
5. **中文工具描述**：docstring 中文没问题，但工具名用英文（function calling 约定）。

### 8.2 LangChain 包相关

1. **绝对不要装 `langchain-community`**：已 sunset，会报 deprecation 警告且无维护。本指南所有替代方案已核查。
2. **包拆分**：`ChatOllama` 在 `langchain-ollama`，`Chroma` 在 `langchain-chroma`，`TavilySearch` 在 `langchain-tavily`，`RecursiveCharacterTextSplitter` 在 `langchain-text-splitters`，`Document`/`@tool`/`ChatPromptTemplate` 在 `langchain-core`。别用老教程的 `from langchain.embeddings import ...`（已废弃）。
3. **AgentExecutor 报错**：99% 是 prompt 缺 `{agent_scratchpad}`，或工具没 `bind_tools`。
4. **工具返回类型**：统一返 `str` 最稳。
5. **老 API 污染**：网上教程混用 v0.1 和 v0.2 API。认准 `create_tool_calling_agent` + `langchain-tavily` 这套新 API，遇到 `initialize_agent`/`ConversationChain`/`from langchain.embeddings` 直接跳过。

### 8.3 Chroma 相关

1. **持久化**：新版自动持久化，别手动调 `persist()`（会报警告）。
2. **重复入库**：重复跑 `ingest.py` 会重复入库。重灌前删 `chroma_db/`。
3. **改 embedding 模型**：换模型必须重建整个库（维度变了）。先定好模型再灌数据。

### 8.4 调试思路

- `verbose=True` 看 Agent 每步决策。
- 单独测每个工具：`search_knowledge_base.invoke("test")` 看返回。
- 单独测 LLM 工具调用：`llm.bind_tools([...]).invoke("...")` 看 `tool_calls` 是否返回。
- 三件套分别跑通再组装，别一上来写三合一。

---

## 第九部分：面试准备

### 9.1 必须能说清楚的概念

1. **RAG 全流程**：加载→切块→embedding→入库→检索→拼 prompt→生成。每步为什么这么做。
2. **chunk_size 怎么定**：trade-off（小=精准但断义，大=完整但噪音），结合实验数据说。
3. **Tool Use 原理**：LLM 输出结构化 `tool_calls`（函数名+参数），应用层执行后把结果喂回 LLM，LLM 再生成最终回答。这个循环要能画出来。
4. **为什么用 function calling 不用 ReAct**：原生支持、更稳、不依赖提示词工程。
5. **向量检索 vs 全文检索**：语义匹配 vs 关键词匹配，各自适用场景。
6. **embedding 维度**：qwen3-embedding 的维度，为什么换模型要重建库。
7. **Agent 循环**：LLM → 决策 → 调工具 → 观察结果 → 再决策 → ... → 最终回答。能讲清终止条件。
8. **为什么避开 langchain-community**：能讲出包 sunset 事件和官方 partner 包策略，体现你关注生态长期健康（加分点）。

### 9.2 项目讲法（STAR）

- **S**：想系统掌握 Agent 三大核心能力（RAG/工具/联网），用本地模型零成本实践。
- **T**：做一个三合一 Agent，面试可讲、代码可跑。
- **A**：用 LangChain + Ollama(qwen3.5) + Chroma + Tavily，把 RAG 和搜索都封装成 Tool，用 `create_tool_calling_agent` 让 LLM 自主决策路由。依赖只用官方 partner 包，避开已 sunset 的 `langchain-community`。
- **R**：跑通了本地知识问答 + 实时信息查询 + 工具调用的统一入口，理解了 Agent 决策循环。

### 9.3 可能被追问的问题

- "为什么不直接路由（if-else）而用 Agent？" → 你怎么提前穷举所有问题类型？Agent 让模型动态决策，可扩展。
- "Chroma 上生产行不行？" → 单机够用，生产换 Qdrant/Milvus，但接口不变（LangChain 抽象了）。
- "RAG 检索效果差怎么优化？" → 调 chunk_size、换 MMR、加 rerank、改 embedding 尺寸、query 改写。
- "本地模型工具调用不稳？" → 确认模型支持 tools、降 temperature、工具描述写清楚。
- "为什么不用 langchain-community？" → 2026-05 官方 sunset，仓库归档无维护；改用官方 partner 包（langchain-ollama/chroma/tavily）长期更稳。

---

## 第十部分：学习路径与里程碑

### 阶段 1：环境就绪
- [ ] Ollama 跑通，`ollama show qwen3.5` 确认支持 tools
- [ ] Python 虚拟环境 + 依赖装好（不装 langchain-community）
- [ ] Tavily Key 配好

### 阶段 2：单模块跑通
- [ ] `ingest.py` 灌 1 个 PDF，`retriever.invoke` 能返回相关段落
- [ ] `calculator` 定义好，`llm.bind_tools([calculator]).invoke(...)` 能看到 `tool_calls`
- [ ] `TavilySearch` 单独 `invoke` 能返回结果

### 阶段 3：双层理解（面试关键）
- [ ] 用 `chromadb` 原始 client 跑一遍：`PersistentClient` → `create_collection` → `add` → `query`，看清返回的 `distances`/`documents` 原始结构
- [ ] 用 `tavily-python` 原始 SDK 跑一遍：`TavilyClient.search()`，看清返回的 `results` 数组字段
- [ ] 对比原始返回 vs `langchain-chroma`/`langchain-tavily` 封装后的 Document/Tool，能说清包装层做了什么
- [ ] 能口述：collection 是什么、`add` 时谁算 embedding、`query` 返回什么、换框架怎么裸接

> 这一步是面试分水岭。只会包装层 = "会用框架的人"；懂原始层 = "换框架也能上手的人"。面试官必扒底层，详见附录 B 的选库心法和 9.3 的追问应对。

### 阶段 4：组装
- [ ] `tools.py` 汇总三个工具
- [ ] `agent.py` 用 `create_tool_calling_agent` 组装
- [ ] 交互循环跑通：问本地知识→走 RAG；问实时→走搜索

### 阶段 5：打磨（面试加分）
- [ ] 加多轮对话（`chat_history` 占位符）
- [ ] 加 rerank 提升检索质量
- [ ] 加流式输出（`agent_executor.stream`）
- [ ] 写 README，能 5 分钟讲清楚

---

## 附录：关键 API 速查（全部为长期支持版本）

```python
# === LLM（langchain-ollama）===
from langchain_ollama import ChatOllama
llm = ChatOllama(model="qwen3.5", temperature=0)
llm_with_tools = llm.bind_tools(tools)

# === Embedding + 向量库（langchain-ollama + langchain-chroma）===
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
embeddings = OllamaEmbeddings(model="qwen3-embedding")
vectorstore = Chroma.from_documents(splits, embeddings, persist_directory="./chroma_db")
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# === 文档加载（pypdf 直接解析，不用 langchain-community）===
from pypdf import PdfReader
from langchain_core.documents import Document

# === 分块（langchain-text-splitters，独立稳定包）===
from langchain_text_splitters import RecursiveCharacterTextSplitter

# === 工具定义（langchain-core 地基包）===
from langchain_core.tools import tool

# === 联网搜索（langchain-tavily 官方包，替代 langchain-community）===
from langchain_tavily import TavilySearch

# === Agent（langchain 核心）===
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate
```

---

## 附录 B：Agent 开发常见文件格式与解析库

> **统一原则**：用成熟独立库解析原始文件 → 提取文本 → 包成 `langchain_core.documents.Document`（带 `metadata` 记录来源）→ 交给 `RecursiveCharacterTextSplitter` 切块。全程不用 `langchain-community`（已 sunset），不用任何 LangChain 专用的 Loader 包装类。
>
> 选库标准与正文一致：主流、稳定、独立维护、不绑死 LangChain 生命周期。每个库都是该格式的"行业默认选择"，即使将来换框架（比如换 LlamaIndex 或裸写）这些库照样能用。

### B.1 总览表

| 格式 | 扩展名 | 推荐库 | 安装 | 备注 |
|---|---|---|---|---|
| PDF | `.pdf` | `pypdf` | `pip install pypdf` | 纯 Python，零依赖；正文已用 |
| Markdown | `.md` | 内置 + `markdown-it-py` | `pip install markdown-it-py` | 文本即内容，可选结构感知切分 |
| 纯文本 | `.txt` | 内置 `pathlib` | 无需 | 最简单，直接读 |
| HTML / 网页 | `.html` / URL | `trafilatura` | `pip install trafilatura` | 自动提取正文，去导航/广告 |
| CSV | `.csv` | `pandas` | `pip install pandas` | 表格数据，一行一文档 |
| Excel | `.xlsx` / `.xls` | `pandas` + `openpyxl` | `pip install pandas openpyxl` | 经 pandas 调 openpyxl |
| JSON | `.json` | 内置 `json` | 无需 | 看结构，一条记录一文档 |
| Word | `.docx` | `python-docx` | `pip install python-docx` | 只支持新格式 .docx，不支持老 .doc |
| PowerPoint | `.pptx` | `python-pptx` | `pip install python-pptx` | 按页提取文本 |

> 图片（`.png`/`.jpg`）属于多模态范畴，需要视觉模型或 OCR（`pytesseract` + `Pillow`），不属于文本解析，本附录不展开。qwen3.5 若支持视觉，可直接走多模态；否则用 OCR 把图片转文本再入库。

### B.2 通用封装模式

所有格式最终都汇成 `list[Document]`，再统一切块入库。建议在 `ingest.py` 里为每种格式写一个 `load_xxx()` 函数，主函数按扩展名分发：

```python
# ingest.py 的加载分发逻辑（示意）
from pathlib import Path
from langchain_core.documents import Document

def load_file(file_path: str) -> list[Document]:
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":   return load_pdf(file_path)
    if ext == ".md":    return load_markdown(file_path)
    if ext == ".txt":   return load_text(file_path)
    if ext == ".html":  return load_html(file_path)
    if ext == ".csv":   return load_csv(file_path)
    if ext in (".xlsx", ".xls"): return load_excel(file_path)
    if ext == ".json":  return load_json(file_path)
    if ext == ".docx":  return load_docx(file_path)
    if ext == ".pptx":  return load_pptx(file_path)
    raise ValueError(f"不支持的格式: {ext}")
```

下面逐个给出每个 `load_xxx` 的实现。

### B.3 PDF（`pypdf`）

正文第四部分已详述，这里只列要点：

```python
from pypdf import PdfReader
from langchain_core.documents import Document

def load_pdf(file_path: str) -> list[Document]:
    reader = PdfReader(file_path)
    docs = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text.strip():
            docs.append(Document(page_content=text,
                                 metadata={"source": file_path, "page": i + 1}))
    return docs
```

**坑**：
- 扫描件 PDF（图片版）`extract_text()` 返回空，需 OCR（`pytesseract`）。
- 复杂表格/排版可能提取乱序，`pypdf` 对排版还原一般。要求高时换 `pypdfium2`（更快、渲染更准）或 `pdfplumber`（表格识别强）。

### B.4 Markdown（内置 / `markdown-it-py`）

Markdown 本身就是文本，直接读即可。若想按标题层级切分（保留结构），用 `langchain-text-splitters` 的 `MarkdownHeaderTextSplitter`。

```python
from pathlib import Path
from langchain_core.documents import Document

def load_markdown(file_path: str) -> list[Document]:
    text = Path(file_path).read_text(encoding="utf-8")
    return [Document(page_content=text, metadata={"source": file_path})]
```

结构感知切分（进阶，保留标题层级到 metadata）：

```python
from langchain_text_splitters import MarkdownHeaderTextSplitter

md_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=[("#", "h1"), ("##", "h2"), ("###", "h3")]
)
# md_docs = md_splitter.split_text(text)  # 返回带 h1/h2/h3 metadata 的 Document
```

**坑**：Markdown 里代码块、表格被字符切分器可能切断；`MarkdownHeaderTextSplitter` 按标题切更安全。

### B.5 纯文本（内置）

```python
from pathlib import Path
from langchain_core.documents import Document

def load_text(file_path: str) -> list[Document]:
    text = Path(file_path).read_text(encoding="utf-8")
    return [Document(page_content=text, metadata={"source": file_path})]
```

**坑**：注意编码，中文文件优先 `encoding="utf-8"`，老文件可能是 GBK。

### B.6 HTML / 网页（`trafilatura`）

`trafilatura` 专为网页正文提取设计，自动去掉导航栏、广告、页脚，比 `BeautifulSoup` 手写规则省心得多，是 RAG 爬网页的主流选择。

```python
import trafilatura
from langchain_core.documents import Document

def load_html(file_path: str) -> list[Document]:
    html = Path(file_path).read_text(encoding="utf-8")
    text = trafilatura.extract(html) or ""
    return [Document(page_content=text, metadata={"source": file_path})]

def load_url(url: str) -> list[Document]:
    html = trafilatura.fetch_url(url)
    text = trafilatura.extract(html) or ""
    return [Document(page_content=text, metadata={"source": url})]
```

**坑**：
- `trafilatura.extract` 可能返回 `None`（正文识别失败），用 `or ""` 兜底。
- 需要保留链接/表格等结构时，加参数 `trafilatura.extract(html, include_tables=True, include_links=True)`。
- 若需爬整站，配合 `trafilatura.spider` 或独立的 `crawl4ai`。

### B.7 CSV（`pandas`）

表格数据的常见做法：**一行一文档**，把每行拼成自然语言，列名作 metadata。

```python
import pandas as pd
from langchain_core.documents import Document

def load_csv(file_path: str) -> list[Document]:
    df = pd.read_csv(file_path)
    docs = []
    for i, row in df.iterrows():
        content = "\n".join(f"{col}: {val}" for col, val in row.items())
        docs.append(Document(page_content=content,
                             metadata={"source": file_path, "row": int(i)}))
    return docs
```

**坑**：
- 一行一文档适合行数多、每行信息独立的表（如产品列表、FAQ）。
- 若表是统计型（几行几列汇总数据），整表拼成一个 Document 更好，别按行拆。

### B.8 Excel（`pandas` + `openpyxl`）

```python
import pandas as pd
from langchain_core.documents import Document

def load_excel(file_path: str) -> list[Document]:
    # 一个 Excel 可能有多个 sheet
    sheets = pd.read_excel(file_path, sheet_name=None, engine="openpyxl")
    docs = []
    for sheet_name, df in sheets.items():
        for i, row in df.iterrows():
            content = "\n".join(f"{col}: {val}" for col, val in row.items())
            docs.append(Document(page_content=content,
                                 metadata={"source": file_path,
                                           "sheet": sheet_name, "row": int(i)}))
    return docs
```

**坑**：
- `engine="openpyxl"` 用于 `.xlsx`；老 `.xls` 用 `engine="xlrd"`（需另装 `xlrd`）。
- 多 sheet 用 `sheet_name=None` 全读，返回 `{sheet名: DataFrame}` 字典。

### B.9 JSON（内置 `json`）

JSON 结构多变，策略看数据：数组就一条一文档，嵌套就拍平或序列化。

```python
import json
from langchain_core.documents import Document

def load_json(file_path: str) -> list[Document]:
    with open(file_path, encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, list):
        # 数组：每条记录一个文档
        return [Document(page_content=json.dumps(item, ensure_ascii=False),
                         metadata={"source": file_path, "index": i})
                for i, item in enumerate(data)]
    # 单对象：整体一个文档
    return [Document(page_content=json.dumps(data, ensure_ascii=False),
                     metadata={"source": file_path})]
```

**坑**：
- `json.dumps` 记得 `ensure_ascii=False`，否则中文变 `\uXXXX`。
- 若 JSON 里有大段文本字段（如 `{"content": "..."}`），建议只取该字段做 `page_content`，其余字段做 metadata，别把整个 JSON 硬塞。

### B.10 Word（`python-docx`）

```python
from docx import Document as DocxDocument
from langchain_core.documents import Document

def load_docx(file_path: str) -> list[Document]:
    doc = DocxDocument(file_path)
    # 按段落拼接，也可按页/节拆
    text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    return [Document(page_content=text, metadata={"source": file_path})]
```

**坑**：
- 只支持 `.docx`（Office 2007+），老 `.doc` 不支持，需先用 LibreOffice 或 `antiword` 转。
- 表格内容不在 `paragraphs` 里，要单独遍历 `doc.tables`（按单元格取 `cell.text`）。

### B.11 PowerPoint（`python-pptx`）

```python
from pptx import Presentation
from langchain_core.documents import Document

def load_pptx(file_path: str) -> list[Document]:
    prs = Presentation(file_path)
    docs = []
    for i, slide in enumerate(prs.slides):
        texts = []
        for shape in slide.shapes:
            if shape.has_text_frame:
                texts.append(shape.text_frame.text)
        content = "\n".join(t for t in texts if t.strip())
        if content:
            docs.append(Document(page_content=content,
                                 metadata={"source": file_path, "slide": i + 1}))
    return docs
```

**坑**：
- 一页 slide 一个 Document，metadata 带页码，检索时能定位。
- 图片、图表里的文字提不出来，需 OCR。

### B.12 选库决策小结

遇到新格式时，按这个顺序判断：

1. **纯文本类**（md/txt/log/csv/json）→ 优先内置或 `pandas`，别引额外库。
2. **二进制文档类**（pdf/docx/pptx/xlsx）→ 用该格式的行业默认库（pypdf/python-docx/python-pptx/openpyxl），这些都是各自格式的标准 Python 库，长期稳定。
3. **网页类**（html/url）→ `trafilatura` 一把梭，别手写 BeautifulSoup 规则。
4. **扫描件/图片**→ OCR（`pytesseract`）或多模态模型，单列场景，不混进文本流水线。

**核心心法**：解析库选"即使不用 LangChain 也能独立用"的成熟库，解析和框架解耦。这样 LangChain 的 API 再怎么变，你的加载逻辑一行不用改。

---

**最后一句**：三件套分别跑通是底线，组装是量变到质变。先把每个工具单独 `invoke` 跑通，再交给 Agent 统一调度。遇到问题先 `verbose=True` 看 Agent 决策链路，90% 的问题都在工具描述写得不够清楚。
