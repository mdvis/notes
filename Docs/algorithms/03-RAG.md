# RAG（检索增强生成）相关算法

## 本篇导读

如果说 LLM 是 Agent 的"大脑"，那么 RAG（Retrieval-Augmented Generation，检索增强生成）就是 Agent 的"长期记忆系统"。一个没有 RAG 能力的 Agent，只能依赖训练时固化在权重里的知识，面对私有数据、实时信息、长尾领域知识时必然力不从心；而一个设计良好的 RAG 链路，能让 Agent 在不重新训练模型的前提下，精准地"查阅"海量外部知识，再据此生成可靠的回答。

在 Agent 开发实践中，**约 90% 的落地项目都以 RAG 作为地基**：客服机器人需要检索知识库文档，代码助手需要检索代码仓库与 API 文档，分析型 Agent 需要检索历史报告与数据字典。即便是看似与 RAG 无关的 Function Calling 场景，其背后的工具描述检索、 Few-shot 示例选取，本质上也是检索问题。可以说，掌握 RAG 全链路的算法细节，是 Agent 工程师从"能跑起来"迈向"做得好"的关键分水岭。

本篇是 Agent 开发算法系列的第 3 篇，聚焦 RAG 链路上的三大核心算法模块：

1. **Chunking 策略**——决定"喂给检索器的知识颗粒"是否合理；
2. **检索算法**——决定"召回的候选集"是否覆盖了正确答案；
3. **Rerank 模型**——决定"最终送给 LLM 的上下文"是否精准。

本篇会重点讲透一条完整链路：**文档切分 → 向量化 → 检索（BM25 + 向量）→ 重排序 → 生成**。每个算法都会给出原理、关键公式/伪代码、Agent 开发中的应用场景，以及可直接参考的 Python 代码片段。

---

## 一、完整 RAG 链路概述

在深入各算法之前，先建立对整条 RAG 链路的整体认知。一条工程化的 RAG 链路通常分为**离线索引（Indexing）**和**在线查询（Querying）**两个阶段：

```
【离线索引阶段】
  原始文档（PDF/HTML/Markdown/…）
      │
      ▼
  ① Chunking 切分        ── 把长文档切成语义连贯的小块
      │
      ▼
  ② Embedding 向量化      ── 用 dense 模型把每个 chunk 编码成向量
      │                   ── 同时用 sparse 方式（如 BM25）建立倒排索引
      ▼
  ③ 写入向量库 + 倒排库   ── FAISS / Milvus / ES / …

【在线查询阶段】
  用户 Query
      │
      ▼
  ④ 双路召回              ── BM25 召回 Top-K1 ＋ Dense 向量召回 Top-K2
      │
      ▼
  ⑤ RRF 融合              ── 倒数排名融合，得到统一候选集
      │
      ▼
  ⑥ Rerank 重排序         ── Cross-Encoder 对候选精排，取 Top-N（N≪K）
      │
      ▼
  ⑦ Prompt 拼装 + LLM 生成 ── 把 Top-N 上下文塞进 prompt，生成最终回答
```

这条链路里每一步都有"坑"：切分不当会切断语义，向量化模型选错会导致语义召回失效，只用单路检索会漏召回，不做 Rerank 会把噪声上下文送给 LLM。下面我们逐步拆解每个环节的核心算法。

---

## 二、Chunking 策略

Chunking（文档切分）是 RAG 链路的第一道关卡，也是最容易被人忽视的一环。切分质量直接决定了检索上限——**如果正确答案所在的片段被切碎或与无关内容混在一起，再强的检索和重排序也救不回来**。

### 2.1 滑动窗口切分（Sliding Window Chunking）

#### 原理与核心思想

滑动窗口切分是最朴素也最常用的切分策略：以固定长度（按字符数或 token 数）在文档上滑动一个"窗口"，每次滑动一个固定步长（step），窗口内的文本即为一个 chunk。当步长小于窗口长度时，相邻 chunk 之间会产生**重叠（overlap）**，这一设计是为了避免在边界处把一句话或一个语义单元硬生生切断。

核心思想是用"规则的确定性"换"实现的简单性"：不需要理解文本内容，只要按字节/token 切即可，工程上极其稳定，适合作为 baseline。

#### 关键伪代码

```
输入：文档 text，窗口大小 window_size，步长 step
输出：chunk 列表 chunks

i ← 0
while i < len(text):
    chunk ← text[i : i + window_size]
    chunks.append(chunk)
    i ← i + step
    if i + window_size >= len(text):
        # 最后一块不足窗口也保留
        if i < len(text):
            chunks.append(text[i:])
        break
return chunks
```

参数选择的常见经验：`window_size` 通常取 256~1024 token（中文场景偏小，英文场景偏大），`overlap` 取窗口大小的 10%~20%（如窗口 512、步长 384，重叠 128）。

#### Agent 开发中的应用场景

- **通用知识库问答**：文档格式杂乱、数量大，先用滑动窗口快速建立索引，验证 RAG 链路是否打通。
- **日志/对话记录检索**：这类内容本身没有清晰的段落结构，按长度切分反而更稳定。
- **作为 baseline 对照**：评估更复杂切分策略时，滑动窗口是最常被对照的基线。

#### Python 示例

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

text = "..."  # 你的长文档

# RecursiveCharacterTextSplitter 是滑动窗口的工程化增强版：
# 它会优先按 \n\n → \n → 。 → 空格 的层次尝试切分，
# 尽量让切点落在自然边界上，同时保证块长度不超过 chunk_size。
splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=64,        # 重叠 64 token，避免边界语义断裂
    separators=["\n\n", "\n", "。", "！", "？", "；", " ", ""],
    length_function=len,
)

chunks = splitter.split_text(text)
print(f"切分得到 {len(chunks)} 个 chunk，平均长度 {sum(len(c) for c in chunks)//len(chunks)}")
```

### 2.2 语义切分（Semantic Chunking）

#### 原理与核心思想

滑动窗口的根本问题是"对内容一无所知"——它可能把一个完整的论证拆成两半，也可能把毫不相关的两段拼进同一个窗口。语义切分（Semantic Chunking）的思路是：**让切分点落在"语义发生跳变"的位置**，而不是固定长度处。

具体做法是先把文档按句子粒度切成基础单元，然后用 Embedding 模型把每个句子编码成向量，计算相邻句子之间的语义相似度。当相邻句子的相似度低于某个阈值（或相似度序列出现明显断崖）时，就认为这里发生了话题切换，应当在此切分。这样得到的每个 chunk 内部语义是连贯的，跨 chunk 之间存在话题边界。

#### 关键公式/伪代码

设文档被切分为句子序列 $s_1, s_2, \dots, s_n$，每个句子的向量为 $\mathbf{v}_i$，则相邻句子的余弦相似度为：

$$
\text{sim}(i) = \cos(\mathbf{v}_i, \mathbf{v}_{i+1}) = \frac{\mathbf{v}_i \cdot \mathbf{v}_{i+1}}{\|\mathbf{v}_i\| \, \|\mathbf{v}_{i+1}\|}
$$

切分点判定的常用规则（基于百分位数的阈值法）：

$$
\text{cut after } s_i \iff \text{sim}(i) < \mu - k \cdot \sigma
$$

其中 $\mu$ 和 $\sigma$ 分别是相邻相似度序列的均值和标准差，$k$ 通常取 $0.5 \sim 2$（$k$ 越大切分越激进，chunk 越多越小）。

```
输入：文档 text，相似度阈值系数 k
输出：语义连贯的 chunk 列表

sentences ← split_into_sentences(text)
vectors   ← [embed(s) for s in sentences]
sims      ← [cosine(vectors[i], vectors[i+1]) for i in range(len(vectors)-1)]

threshold ← mean(sims) - k * std(sims)
chunks    ← []
buffer    ← [sentences[0]]
for i in range(len(sims)):
    buffer.append(sentences[i+1])
    if sims[i] < threshold:
        chunks.append(join(buffer))
        buffer ← []
return chunks
```

#### Agent 开发中的应用场景

- **技术文档/产品手册问答**：这类文档段落语义清晰，语义切分能完整保留一个功能点、一个 API 说明的完整性。
- **长篇报告/论文检索**：避免把"研究方法"和"实验结果"混在一个 chunk 里，提升检索后 LLM 的推理质量。
- **对上下文连贯性敏感的 Agent 任务**：如多跳推理、需要完整论据链的问答场景。

#### Python 示例

```python
# 使用 langchain-experimental 提供的 SemanticChunker
from langchain_experimental.text_splitter import SemanticChunker
from langchain_community.embeddings import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-zh-v1.5")

splitter = SemanticChunker(
    embeddings,
    # 当相邻句子相似度低于 "均值 - k*标准差" 时切分
    breakpoint_threshold_type="standard_deviation",
    breakpoint_threshold_amount=1.0,   # 即 k=1.0
    sentence_splitter=None,             # 默认按句号、问号、感叹号切句
)

text = "..."  # 你的长文档
chunks = splitter.split_text(text)
print(f"语义切分得到 {len(chunks)} 个 chunk")
for i, c in enumerate(chunks):
    print(f"--- chunk {i} (len={len(c)}) ---")
    print(c[:120], "...")
```

如果不想依赖 langchain，也可以用 `sentence-transformers` 自行实现核心逻辑：

```python
from sentence_transformers import SentenceTransformer, util
import numpy as np
import re

model = SentenceTransformer("BAAI/bge-small-zh-v1.5")

def semantic_chunk(text, k=1.0):
    # 1. 切句
    sentences = [s.strip() for s in re.split(r"[。！？；\n]", text) if s.strip()]
    if len(sentences) <= 1:
        return [text]
    # 2. 编码并计算相邻相似度
    embs = model.encode(sentences, normalize_embeddings=True)
    sims = (embs[:-1] * embs[1:]).sum(axis=1)  # 已归一化，点积即余弦
    # 3. 动态阈值
    threshold = sims.mean() - k * sims.std()
    # 4. 按断点聚合
    chunks, buf = [], [sentences[0]]
    for i, s in enumerate(sentences[1:], start=1):
        buf.append(s)
        if sims[i-1] < threshold:
            chunks.append("".join(buf))
            buf = []
    if buf:
        chunks.append("".join(buf))
    return chunks
```

### 2.3 两种策略对比

| 维度 | 滑动窗口切分 | 语义切分 |
|------|--------------|----------|
| **实现复杂度** | 低，纯规则 | 中，需依赖 Embedding 模型 |
| **切分稳定性** | 高，结果可复现 | 受 Embedding 模型影响，有波动 |
| **语义连贯性** | 一般，可能在句子中间断开 | 好，切点落在话题边界 |
| **块长度可控性** | 强，严格遵循 chunk_size | 弱，块长度随内容波动，可能过长或过短 |
| **离线预处理成本** | 极低 | 较高，每句都要调 Embedding |
| **对长表格/代码的处理** | 容易把表格/代码块切坏 | 句子切分本身就难以处理代码 |
| **适用场景** | 通用 baseline、格式杂乱的语料、日志 | 结构化文档、技术手册、长文报告 |

工程实践中常见的折中方案是**"先结构后滑动"**：先按文档自身的结构（标题层级、段落、Markdown 的 `##`、HTML 的 `<section>`）做第一层切分，再对超长段落用滑动窗口做第二层兜底。这比纯滑动窗口保留了结构信息，又比纯语义切分成本低，是大多数生产系统的实际选择。

---

## 三、检索算法

检索算法负责从索引中召回与用户 Query 相关的候选 chunk。RAG 链路里最关键的两个流派是**稀疏检索（Sparse Retrieval，以 BM25 为代表）**和**稠密检索（Dense Retrieval，以向量近邻检索为代表）**，二者各有长短，工程上常将它们融合使用。

### 3.1 BM25 算法

#### 原理与核心思想

BM25（Best Matching 25）是信息检索领域最经典、最经久不衰的排序算法，由 Robertson 等人在 1990 年代提出，至今仍是 Elasticsearch、Lucene、OpenSearch 等搜索引擎的默认打分函数。它基于**词频（TF）**和**逆文档频率（IDF）**两大信号，并引入了两个关键饱和/归一化机制：

1. **词频饱和**：某个词在文档中出现得越多，相关性确实越高，但增长会逐渐饱和（避免一个词重复刷分）；
2. **文档长度归一化**：长文档天然更容易命中关键词，BM25 会对此做惩罚，使长短文档有可比性。

核心思想是：**一个词在当前文档出现得越频繁、在整个语料里越稀有、当前文档越短，就越能说明这个文档与 Query 相关**。

#### 关键公式

给定查询 $q$，包含若干词项 $t_1, t_2, \dots, t_n$，文档 $D$ 的 BM25 得分为：

$$
\text{BM25}(q, D) = \sum_{t \in q} \text{IDF}(t) \cdot \frac{f(t, D) \cdot (k_1 + 1)}{f(t, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}
$$

其中各符号含义：

- $f(t, D)$：词项 $t$ 在文档 $D$ 中的频次（TF）；
- $|D|$：文档 $D$ 的长度（token 数或字数）；
- $\text{avgdl}$：语料库中所有文档的平均长度；
- $k_1$：词频饱和参数，取值范围通常 $[1.2, 2.0]$，默认 $1.2$；$k_1$ 越大，TF 的影响越接近线性增长；
- $b$：文档长度归一化参数，取值范围 $[0, 1]$，默认 $0.75$；$b=1$ 表示完全按长度归一化，$b=0$ 表示不做长度归一化；
- $\text{IDF}(t)$：词项 $t$ 的逆文档频率，常用计算公式为：

$$
\text{IDF}(t) = \ln\left( \frac{N - n(t) + 0.5}{n(t) + 0.5} + 1 \right)
$$

其中 $N$ 是语料库文档总数，$n(t)$ 是包含词项 $t$ 的文档数。加 $0.5$ 是拉普拉斯平滑，避免 $n(t)=0$ 或 $n(t)=N$ 时分母为 0 或 IDF 为负；最外层 $+1$ 保证 IDF 恒为正。

#### BM25 与 TF-IDF 对比

经典 TF-IDF 的打分函数可简化为：

$$
\text{TF-IDF}(t, D) = f(t, D) \cdot \log\frac{N}{n(t)}
$$

与 BM25 相比，TF-IDF 有三个明显短板：

| 维度 | TF-IDF | BM25 |
|------|--------|------|
| **词频增长** | 线性，TF 越大分数无限增长 | 有上界饱和（受 $k_1$ 控制），更符合人类相关性直觉 |
| **文档长度** | 不做归一化，长文档占便宜 | 通过 $b$ 参数归一化，长短文档公平 |
| **平滑处理** | 无平滑，稀有词权重爆炸 | 有 $0.5$ 平滑，鲁棒性更强 |

一句话总结：**BM25 是 TF-IDF 的"工程化加强版"**，在几乎所有实际检索任务上都优于 TF-IDF，这也是它至今仍是搜索引擎默认打分的原因。

#### Agent 开发中的应用场景

- **关键词命中优先的检索**：如代码符号检索、产品型号检索、专有名词检索——这类场景 dense 检索常常失效（"gpt-3.5-turbo" 这种 token 在向量空间里没有稳定的语义），而 BM25 能精准命中。
- **作为混合检索的稀疏路**：与 dense 检索互补，BM25 负责"字面匹配"，dense 负责"语义匹配"。
- **低成本冷启动**：不需要训练任何模型，建好倒排索引即可使用。

#### Python 示例

```python
# 用 rank_bm25 库实现最简 BM25 检索
from rank_bm25 import BM25Okapi

docs = [
    "RAG 是检索增强生成的缩写",
    "Agent 开发需要掌握 RAG 全链路",
    "BM25 是经典的稀疏检索算法",
    "向量检索基于 Embedding 模型",
]
# 中文需要先分词，英文按空格切即可
import jieba
tokenized_docs = [list(jieba.cut(d)) for d in docs]

bm25 = BM25Okapi(tokenized_docs)

query = "RAG 算法是什么"
tokenized_query = list(jieba.cut(query))
scores = bm25.get_scores(tokenized_query)

for doc, score in sorted(zip(docs, scores), key=lambda x: -x[1]):
    print(f"{score:.4f}  {doc}")
```

生产环境更推荐直接用 Elasticsearch/OpenSearch 或 Python 的 `bm25s` 库（比 rank_bm25 快一个数量级）：

```python
import bm25s
import jieba

docs = ["RAG 是检索增强生成", "Agent 开发需要 RAG", "BM25 是稀疏检索"]
tokenized = bm25s.tokenize([" ".join(jieba.cut(d)) for d in docs], stopwords="zh")
retriever = bm25s.BM25()
retriever.index(tokenized)

query_token = bm25s.tokenize(" ".join(jieba.cut("RAG 是什么")), stopwords="zh")
results, scores = retriever.retrieve(query_token, k=2)
print(results, scores)
```

### 3.2 混合检索（Hybrid Retrieval：sparse + dense 融合）

#### 原理与核心思想

BM25（稀疏检索）擅长字面匹配，但在同义词、改写、跨语言场景下会漏召回——用户问"怎么退款"，文档里写的是"如何申请退货"，BM25 可能完全召回不到。Dense 检索（基于 Embedding 的向量近邻检索）正好相反，它捕捉的是语义相似性，"退款"和"退货"在向量空间里很近，能召回，但对罕见的专有名词、代码符号、数字编号却常常失效。

**混合检索的核心思想是"两路召回 + 融合排序"**：让 BM25 和 Dense 各自召回 Top-K，再用一个融合策略把两路结果合并成一个统一排序。这样既能覆盖字面匹配，又能覆盖语义匹配，召回率显著高于任何单路。

融合策略里最常用、最稳定的是 **RRF（Reciprocal Rank Fusion，倒数排名融合）**，它的优点是**不需要分数校准**——BM25 分数和余弦相似度量纲完全不同，直接加权会很敏感，而 RRF 只看每路结果里的"排名"，与具体分数无关。

#### 关键公式

设候选文档 $d$ 在第 $i$ 路检索结果中的排名为 $\text{rank}_i(d)$（排名从 1 开始），RRF 的融合得分为：

$$
\text{RRF}(d) = \sum_{i=1}^{M} \frac{1}{k + \text{rank}_i(d)}
$$

其中 $M$ 是检索路数（混合检索里通常 $M=2$），$k$ 是平滑常数，默认取 $60$。$k$ 越大，头部排名的差异被压缩得越平，越能突出"多路都召回"的文档；$k$ 越小，越突出排名靠前的单路结果。

为什么 RRF 有效？因为它本质上是在给"被多路同时召回"的文档加权——一个文档如果在 BM25 和 Dense 里都进了前 5，它的 RRF 分数会是 $\frac{1}{60+5} + \frac{1}{60+5} \approx 0.031$，而一个只在单路排第 1 的文档只有 $\frac{1}{60+1} \approx 0.016$，前者显著更高。

#### Agent 开发中的应用场景

- **生产级 RAG 的标配**：几乎所有商业 RAG 系统（Azure AI Search、Cohere、Vercel AI SDK）都默认提供混合检索选项。
- **多源知识库问答**：文档里既有自然语言说明（dense 强），又有代码/表格/编号（sparse 强），必须双路召回。
- **对召回率敏感的 Agent 任务**：如多跳问答、需要证据链的场景，漏召回会导致 LLM 直接"幻觉"。

#### Python 示例

```python
import jieba
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer, util

# ---------- 离线索引 ----------
docs = [
    "RAG 通过检索外部知识增强 LLM 生成质量",
    "Agent 开发中 RAG 是基础能力",
    "BM25 基于词频和逆文档频率打分",
    "Dense 检索依赖 Embedding 向量近邻",
    "混合检索融合稀疏与稠密两路结果",
]

# sparse 索引
tokenized = [list(jieba.cut(d)) for d in docs]
bm25 = BM25Okapi(tokenized)

# dense 索引
model = SentenceTransformer("BAAI/bge-small-zh-v1.5")
doc_embs = model.encode(docs, normalize_embeddings=True)

# ---------- 在线查询 ----------
query = "RAG 是什么"
q_tokens = list(jieba.cut(query))
q_emb = model.encode([query], normalize_embeddings=True)

# 两路各召回 Top-5
K = 5
bm25_scores = bm25.get_scores(q_tokens)
bm25_rank = sorted(range(len(docs)), key=lambda i: -bm25_scores[i])[:K]

hits = util.dot_score(q_emb, doc_embs)[0]
dense_rank = hits.topk(k=K).indices.tolist()

# ---------- RRF 融合 ----------
def rrf_fusion(ranks, k=60):
    scores = {}
    for rank_list in ranks:
        for position, doc_id in enumerate(rank_list, start=1):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + position)
    return sorted(scores, key=lambda i: -scores[i])

final_order = rrf_fusion([bm25_rank, dense_rank])
print("RRF 融合后的排序：")
for i in final_order:
    print(f"  {docs[i]}")
```

### 3.3 Re-ranking（重排序）：Cross-Encoder 原理

#### 原理与核心思想

Bi-Encoder（双塔模型，即常规的 Embedding 模型）在离线阶段把 query 和 doc **分别**编码成向量，在线检索时只做向量近邻计算，速度极快，能支持百万级文档的检索。但"分别编码"意味着 query 和 doc 之间没有任何交互——它们各自被压缩成一个向量，丢失了词级别的细粒度匹配信息。

Cross-Encoder（交叉编码器）走的是另一条路：把 query 和 doc **拼接在一起**喂给一个 Transformer，让模型在 [CLS] token 上做自注意力交互，直接输出一个相关性分数。因为 query 和 doc 在每一层 Attention 里都能"看到彼此"，Cross-Encoder 的排序精度远高于 Bi-Encoder。

但代价是：Cross-Encoder 必须对**每一个 (query, doc) 对**做一次前向推理，无法离线预计算，因此不能用来做全库检索，只能用来对**少量候选**做精排。这正是 RAG 链路里"先召回 Top-K（比如 50），再 Rerank 到 Top-N（比如 5）"这一设计的原因。

#### Cross-Encoder 与 Bi-Encoder 对比

| 维度 | Bi-Encoder（双塔） | Cross-Encoder（交叉编码器） |
|------|--------------------|-----------------------------|
| **输入形式** | query 和 doc 分别编码 | query 与 doc 拼接后联合编码 |
| **交互层级** | 无交互（仅向量级点积） | 每层 Attention 都做 token 级交互 |
| **精度** | 中等 | 高（通常能提升 5~15 个点 nDCG） |
| **速度** | 极快，向量可预计算，支持百万级库 | 慢，每对都要前向，仅适合 N≤100 候选 |
| **离线成本** | doc 向量预计算一次 | 无离线阶段 |
| **典型用途** | 一阶段召回 | 二阶段精排（Rerank） |

工程上的分工是固定的：**Bi-Encoder 负责"从百万里捞一百"，Cross-Encoder 负责"从一百里挑五个"**。两者是互补关系而非替代关系。

#### Agent 开发中的应用场景

- **RAG 链路的精排环节**：几乎所有对回答质量有要求的 RAG 系统都会在召回后加 Rerank。
- **多轮对话的上下文选取**：从历史对话片段中精排最相关的几条作为上下文。
- **Few-shot 示例选取**：从示例池里召回 Top-K 后，用 Cross-Encoder 挑出与当前任务最匹配的 N 个示例。

---

## 四、Rerank 模型

理论上任何 Cross-Encoder 都可以做 Rerank，但在工程实践中，工程师通常直接使用经过大规模检索数据训练、专门针对 Rerank 任务优化的现成模型。下面介绍两个最主流的选择。

### 4.1 Cohere Rerank

#### 介绍

Cohere Rerank 是商业 Rerank 服务的标杆，由 Cohere 公司提供。它的优势在于：

- **多语言支持**：`rerank-multilingual-v3.0` 支持 100+ 语言，中文表现优秀；
- **无需自托管**：直接调用 API，不用部署 GPU；
- **持续迭代**：模型版本持续更新，精度持续提升；
- **与 Cohere 生态联动**：与 Cohere Embed、Cohere Generate 组成完整 RAG 链路。

缺点是需要联网、按调用量计费、数据需要出境，对部分合规敏感场景不适用。

#### 实际调用示例

```python
import cohere

co = cohere.Client("YOUR_COHERE_API_KEY")

query = "RAG 的检索阶段有哪些算法"
docs = [
    "RAG 链路包含 Chunking、Embedding、检索、Rerank、生成五个阶段",
    "BM25 是经典的稀疏检索算法，基于 TF 和 IDF",
    "Cross-Encoder 通过联合编码 query 和 doc 实现精排",
    "滑动窗口切分按固定长度切分文档",
    "Embedding 模型把文本编码成稠密向量",
]

results = co.rerank(
    model="rerank-multilingual-v3.0",
    query=query,
    documents=docs,
    top_n=3,
    return_documents=True,
)

print(f"Query: {query}\n")
for hit in results.results:
    print(f"  rank={hit.index}  score={hit.relevance_score:.4f}")
    print(f"  doc: {hit.document.text}")
    print()
```

### 4.2 bge-reranker

#### 介绍

bge-reranker 是智源研究院（BAAI）开源的 BGE 系列中的 Rerank 模型，在国内 RAG 项目中几乎是无脑首选。它的特点：

- **开源免费**：可自托管，数据不出境，合规友好；
- **中文表现强**：在 C-MTEB 等中文榜单上长期领先；
- **多规格**：提供 `bge-reranker-base`（轻量）、`bge-reranker-large`（平衡）、`bge-reranker-v2-m3`（多语言最新版）等多个尺寸；
- **与 BGE Embedding 配套**：召回用 `bge-large-zh`，精排用 `bge-reranker-large`，是国内 RAG 的"黄金组合"。

#### 实际调用示例

```python
from sentence_transformers import CrossEncoder

# 加载 bge-reranker（首次运行会自动下载权重）
reranker = CrossEncoder("BAAI/bge-reranker-large", max_length=512)

query = "RAG 的检索阶段有哪些算法"
docs = [
    "RAG 链路包含 Chunking、Embedding、检索、Rerank、生成五个阶段",
    "BM25 是经典的稀疏检索算法，基于 TF 和 IDF",
    "Cross-Encoder 通过联合编码 query 和 doc 实现精排",
    "滑动窗口切分按固定长度切分文档",
    "Embedding 模型把文本编码成稠密向量",
]

# 构造 (query, doc) 对，直接得到相关性分数
pairs = [[query, d] for d in docs]
scores = reranker.predict(pairs)

# 按分数降序排列
ranked = sorted(zip(docs, scores), key=lambda x: -x[1])
print(f"Query: {query}\n")
for doc, score in ranked[:3]:
    print(f"  score={score:.4f}  doc: {doc}")
```

bge-reranker 也可以用 `FlagEmbedding` 官方库调用，功能更全（支持指令式 query、支持多文档批处理）：

```python
from FlagEmbedding import FlagReranker

reranker = FlagReranker("BAAI/bge-reranker-large", use_fp16=True)
pairs = [[query, d] for d in docs]
scores = reranker.compute_score(pairs, normalize=True)  # normalize 后分数落到 [0,1]
```

### 4.3 两种模型的选择建议

| 维度 | Cohere Rerank | bge-reranker |
|------|---------------|--------------|
| **部署方式** | API 调用 | 自托管（需 GPU 或 CPU 推理） |
| **成本模型** | 按调用计费 | 固定算力成本 |
| **数据合规** | 数据出境 | 数据完全在内网 |
| **中文精度** | 优秀 | 优秀，部分榜单更优 |
| **接入速度** | 几行代码即可 | 需下载模型、配推理环境 |
| **适用场景** | 快速验证、海外业务、SaaS | 国内生产环境、合规敏感场景 |

工程经验：**原型阶段用 Cohere 快速验证链路，生产环境再切换到 bge-reranker 自托管**，两者 API 形态接近，迁移成本低。

---

## 五、完整 RAG 链路实战

下面把前面所有环节串起来，给出一份可运行的完整 RAG 链路代码，对应流程：**文档切分 → 向量化 → 检索（BM25 + 向量）→ RRF 融合 → Rerank → LLM 生成**。

```python
"""
完整 RAG 链路示例
依赖：pip install rank_bm25 sentence-transformers jieba openai
"""
import jieba
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer, CrossEncoder, util
from openai import OpenAI

# ============ 1. 原始文档 ============
raw_docs = [
    "RAG（检索增强生成）通过在生成前检索外部知识，缓解 LLM 的幻觉问题。"
    "典型链路包括切分、向量化、检索、重排序、生成五个阶段。",
    "Chunking 策略决定知识颗粒度。滑动窗口简单稳定，语义切分能保留话题完整性，"
    "工程上常采用'先结构后滑动'的折中方案。",
    "BM25 是基于词频与逆文档频率的经典稀疏检索算法，公式中包含 k1 和 b 两个关键参数，"
    "分别控制词频饱和与文档长度归一化。",
    "Dense 检索依赖 Embedding 模型把文本编码为稠密向量，再用向量近邻检索召回。"
    "它能捕捉语义相似性，但对罕见专有名词较弱。",
    "混合检索用 RRF 融合 BM25 与 Dense 两路结果，兼顾字面匹配与语义匹配，"
    "是生产级 RAG 的标配。",
    "Rerank 用 Cross-Encoder 对候选精排，精度高于 Bi-Encoder 但速度慢，"
    "因此只对 Top-K 候选做精排，常见模型有 Cohere Rerank 和 bge-reranker。",
]

# ============ 2. Chunking（这里用滑动窗口做演示）============
def sliding_window(text, chunk_size=128, overlap=32):
    chunks = []
    i = 0
    while i < len(text):
        chunks.append(text[i:i+chunk_size])
        if i + chunk_size >= len(text):
            break
        i += chunk_size - overlap
    return chunks

chunks = []
for d in raw_docs:
    chunks.extend(sliding_window(d))
print(f"[Chunking] 切分得到 {len(chunks)} 个 chunk")

# ============ 3. 建立索引（sparse + dense）============
# sparse 索引
tokenized = [list(jieba.cut(c)) for c in chunks]
bm25 = BM25Okapi(tokenized)

# dense 索引
embedder = SentenceTransformer("BAAI/bge-small-zh-v1.5")
chunk_embs = embedder.encode(chunks, normalize_embeddings=True)

# ============ 4. 双路召回 + RRF 融合 ============
def hybrid_retrieve(query, k=10, rrf_k=60):
    # BM25 路
    q_tokens = list(jieba.cut(query))
    bm25_scores = bm25.get_scores(q_tokens)
    bm25_rank = sorted(range(len(chunks)), key=lambda i: -bm25_scores[i])[:k]
    # dense 路
    q_emb = embedder.encode([query], normalize_embeddings=True)
    hits = util.dot_score(q_emb, chunk_embs)[0]
    dense_rank = hits.topk(k=k).indices.tolist()
    # RRF 融合
    scores = {}
    for rank_list in [bm25_rank, dense_rank]:
        for pos, doc_id in enumerate(rank_list, start=1):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (rrf_k + pos)
    return sorted(scores, key=lambda i: -scores[i])

# ============ 5. Rerank 精排 ============
reranker = CrossEncoder("BAAI/bge-reranker-large", max_length=512)

def rerank(query, candidates, top_n=3):
    pairs = [[query, chunks[i]] for i in candidates]
    scores = reranker.predict(pairs)
    ordered = sorted(zip(candidates, scores), key=lambda x: -x[1])
    return [i for i, _ in ordered[:top_n]]

# ============ 6. 拼装 Prompt + LLM 生成 ============
def generate(query, context_chunks):
    context = "\n\n".join(f"[{i+1}] {c}" for i, c in enumerate(context_chunks))
    prompt = f"你是一个严谨的 Agent 算法助手。请根据以下检索到的资料回答问题，"
             f"如果资料不足请明确说明。\n\n参考资料：\n{context}\n\n问题：{query}\n\n回答："
    client = OpenAI(base_url="https://api.deepseek.com/v1", api_key="YOUR_KEY")
    resp = client.chat.completions.create(
        model="deepseek-chat",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
    )
    return resp.choices[0].message.content

# ============ 7. 跑一遍完整链路 ============
query = "RAG 链路里为什么需要 Rerank？"

candidates = hybrid_retrieve(query, k=10)
print(f"[召回] RRF 融合后 Top-10 候选索引: {candidates}")

top_ids = rerank(query, candidates, top_n=3)
print(f"[Rerank] 精排后 Top-3:")
for i in top_ids:
    print(f"  - {chunks[i][:80]}...")

top_chunks = [chunks[i] for i in top_ids]
answer = generate(query, top_chunks)
print(f"\n[生成] 最终回答：\n{answer}")
```

这份代码虽然只有一百多行，但已经覆盖了一条生产级 RAG 链路的所有关键环节。把它替换成 Elasticsearch + Milvus + Cohere Rerank + GPT-4，就是企业里真正在跑的架构。

---

## 六、小结

本篇围绕 RAG 链路的三大核心算法模块展开：

1. **Chunking 策略**是检索质量的天花板。滑动窗口简单稳定，适合做 baseline；语义切分能保留话题完整性，适合结构化文档。生产环境推荐"先结构后滑动"的折中方案——切分质量直接决定后续所有环节的上限，值得花时间反复打磨。

2. **检索算法**是 RAG 的召回保障。BM25 用词频饱和（$k_1$）和文档长度归一化（$b$）两个参数把 TF-IDF 工程化到极致，至今仍是稀疏检索的默认选择；但单路检索总有盲区，**混合检索（BM25 + Dense）+ RRF 融合**是生产级 RAG 的事实标准，RRF 的妙处在于只看排名不看分数，天然规避了量纲校准问题。

3. **Rerank 模型**是精度的最后一道关卡。Cross-Encoder 通过让 query 和 doc 在 Attention 层做 token 级交互，精度远超 Bi-Encoder，但速度限制它只能用于少量候选的精排。Cohere Rerank 适合快速验证，bge-reranker 是国内生产环境的无脑首选。

把这三个环节串起来，就是一条完整的 RAG 链路：**文档切分 → 向量化 → 双路召回 → RRF 融合 → Rerank 精排 → LLM 生成**。这条链路看起来朴素，但每一个环节都有大量的调参空间：chunk_size 取多大、overlap 留多少、BM25 的 $k_1$ 和 $b$ 怎么调、dense 和 sparse 各召回多少、RRF 的 $k$ 取多少、Rerank 取 Top-N 还是 Top-5、上下文拼装顺序是"相关度优先"还是"证据链优先"……这些细节的累积差异，最终决定了 Agent 回答质量的鸿沟。

下一篇我们会进入 Agent 的核心循环——**ReAct 推理范式与 Function Calling**，那是 Agent 真正"动起来"的部分。但在那之前，请确保你真的理解了本篇的 RAG 链路：因为 ReAct 的每一步"Act"，背后几乎都站着一次检索。
