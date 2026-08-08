# 02 - NLP / Embedding 相关算法

## 本篇导读

如果说 LLM 是 Agent 的"大脑"，那么 Embedding 与向量检索就是 Agent 的"记忆系统"和"语义感知系统"。一个 Agent 能不能根据用户意图从海量知识中精准捞回相关片段、能不能在长期记忆里找到过去类似经验、能不能把不同表述的同一意图归并到一起，本质上都取决于这一层的算法选型与调参。

本篇是 Agent 开发算法系列的第 2 篇，聚焦 NLP / Embedding 这一底层地基，覆盖四大模块：

1. **向量化算法**：从最早的 Word2Vec，到上下文相关的 BERT Embedding，再到面向语义检索优化的 Sentence-BERT，串起"词向量 → 句向量"的演化脉络。
2. **相似度计算**：余弦相似度、点积、欧氏距离——看起来简单的三个公式，在 Agent 里却分别对应 RAG 检索、注意力打分、聚类去重等不同场景，选错就出问题。
3. **向量检索算法**：HNSW、IVF-PQ、LSH——这是 RAG 系统能不能"毫秒级返回 Top-K"的关键，也是面试必问、生产必调的部分。
4. **分词 / Tokenization**：BPE 与 WordPiece——LLM 分词器的底层机制，直接决定 Token 数量、上下文窗口利用率、中文成本。

每个算法都按"**原理 → 公式/伪代码 → 复杂度 → Agent 场景 → Python 示例**"五段式展开。读完这一篇，你应该能回答：为什么 RAG 默认用 HNSW 而不是 LSH？为什么 Sentence-BERT 比 BERT 原生 [CLS] 更适合做语义检索？为什么 GPT 系列选 BPE 而不是 WordPiece？带着这些问题往下读。

---

## 一、向量化算法

### 1.1 Word2Vec（CBOW 与 Skip-gram）

#### 原理与核心思想

Word2Vec 由 Tomas Mikolov 等人在 2013 年提出，核心思想是 Distributed Representation（分布式表示）：**用一个低维稠密向量（通常 100~300 维）来表示一个词，让语义相近的词在向量空间中距离也相近**。这是对早期 one-hot 编码的根本性颠覆——one-hot 维度等于词表大小、所有词彼此正交、无法表达语义关系；而 Word2Vec 把词压缩到一个能被几何距离度量的连续空间里，"king - man + woman ≈ queen" 这类语义算术才成为可能。

Word2Vec 有两种模型结构：

- **CBOW（Continuous Bag-of-Words）**：用上下文词预测中心词。比如句子"今天 天气 真 不错"，给定上下文 `["今天", "天气", "不错"]` 预测中心词 `"真"`。CBOW 把上下文词向量做平均再送入分类器，训练速度较快，对高频词表现好。
- **Skip-gram**：用中心词预测上下文词。反过来，给定 `"真"` 预测它周围可能出现的词。Skip-gram 对每个中心词都要做多次预测，训练慢但能更好地捕捉低频词和远距离语义关系，工程实践中更常用。

两种模型都依赖一个关键假设——**Distributional Hypothesis（分布假设）**：一个词的语义由它的上下文分布决定。"银行"和"钱庄"从不出现在同一句话，但它们出现的上下文高度重叠，于是向量也会接近。

#### 关键公式与伪代码

Skip-gram 的训练目标是最大化给定中心词 $w_t$ 时窗口内上下文词 $w_{o}$ 的条件概率：

$$
\max_\theta \; \frac{1}{T} \sum_{t=1}^{T} \sum_{-c \le j \le c, j \ne 0} \log p(w_{t+j} \mid w_t; \theta)
$$

其中 $c$ 是窗口大小，$p(w_o \mid w_t)$ 用 softmax 定义：

$$
p(w_o \mid w_t) = \frac{\exp(\mathbf{v}'_o {}^\top \mathbf{v}_t)}{\sum_{w \in V} \exp(\mathbf{v}'_w {}^\top \mathbf{v}_t)}
$$

$\mathbf{v}_t$ 是中心词的 input 向量，$\mathbf{v}'_o$ 是上下文词的 output 向量。分母要遍历整个词表 $V$，$|V|$ 通常 10 万到几十万，直接算 softmax 代价极高。工程上用两种加速：

- **Negative Sampling（负采样）**：把多分类转成二分类，随机采 $k$ 个负样本，目标变成：
  $$
  \log \sigma(\mathbf{v}'_o {}^\top \mathbf{v}_t) + \sum_{w \in \mathcal{N}_-} \log \sigma(-\mathbf{v}'_w {}^\top \mathbf{v}_t)
  $$
- **Hierarchical Softmax（层次 softmax）**：用一棵哈夫曼树替代扁平 softmax，把计算量从 $O(|V|)$ 降到 $O(\log |V|)$。

```text
# Skip-gram with Negative Sampling 伪代码
for each sentence in corpus:
    for t, center_word in enumerate(sentence):
        for j in [-c, c]:  # 窗口内每个上下文词
            if j == 0: continue
            context_word = sentence[t + j]
            pos = v_context[context_word] · v_center[center_word]
            loss += -log(sigmoid(pos))
            for neg in sample_k_negatives():
                neg_score = v_context[neg] · v_center[center_word]
                loss += -log(sigmoid(-neg_score))
            # 反向传播更新 v_context, v_center
```

#### 复杂度分析

- 训练复杂度：CBOW 每个样本 $O(|V|)$（原始 softmax）或 $O(k)$（负采样，$k$ 为负样本数，通常 5~20）；Skip-gram 是 CBOW 的 $2c$ 倍，因为每个中心词要预测 $2c$ 个上下文。
- 推理复杂度：$O(1)$，一次向量查表。
- 空间复杂度：$O(|V| \cdot d)$，$d$ 是向量维度。

#### Agent 开发中的应用场景

Word2Vec 在现代 Agent 系统里已经不是首选（被 BERT/Sentence-BERT 替代），但它的思想仍然是整个 Embedding 体系的源头，仍有几个场景会用：

1. **冷启动 / 资源受限场景**：本地部署 Agent、IoT 设备、边缘节点上做轻量词向量，Word2Vec 模型小（几十 MB）、加载快、CPU 即可推理。
2. **关键词扩展与同义改写**：用户输入"提现失败"，用 Word2Vec 找到 "取款"、"转账" 等近义词，扩展检索 query，提升召回。
3. **聚类与去重**：对工具描述、提示词模板做 Word2Vec + KMeans 聚类，找出语义重复的模板合并。
4. **面试与原理讲解**：理解 Word2Vec 是理解 BERT、Sentence-BERT 的前置条件——它们都继承了 "上下文决定语义" 这一核心假设。

#### 简单示例

```python
# 用 gensim 训练一个最小 Word2Vec
from gensim.models import Word2Vec

sentences = [
    ["用户", "登录", "失败", "提示", "密码", "错误"],
    ["用户", "注册", "成功", "发送", "短信", "验证码"],
    ["登录", "失败", "重试", "三次", "锁定", "账号"],
    ["注册", "成功", "跳转", "首页"],
]

# sg=1 表示 Skip-gram；sg=0 表示 CBOW
model = Word2Vec(sentences, vector_size=64, window=2, min_count=1, sg=1, epochs=200)

# 取出"登录"的词向量
vec_login = model.wv["登录"]

# 查找语义相近的词
print(model.wv.most_similar("登录", topn=3))
# 输出形如: [('失败', 0.45), ('注册', 0.38), ('密码', 0.31)]
```

可以看到，即使在这个小语料上，"登录"与"失败"、"注册"这些常一起出现的词也确实排到了最近邻的前几位——这就是分布假设的直观体现。

---

### 1.2 BERT Embedding

#### 原理与核心思想

Word2Vec 的根本问题是**静态向量**：同一个词"苹果"在"我吃苹果"和"苹果发布会"里是同一个向量，语义差异完全丢失。BERT（Bidirectional Encoder Representations from Transformers，Devlin et al., 2018）解决了这个问题——它给出的是**上下文相关的动态向量**。

BERT 的核心是 Transformer Encoder 堆叠（Base 版 12 层，Large 版 24 层），每个 token 的表示都经过双向 Self-Attention 与所有其他 token 交互，所以"苹果"在两个句子里的向量是不同的。BERT 的预训练任务有两个：

1. **MLM（Masked Language Model）**：随机 mask 掉 15% 的 token，让模型根据上下文预测被 mask 的词。这迫使模型真正理解上下文，而不是单向抄词。
2. **NSP（Next Sentence Prediction）**：判断两个句子是否相邻，让模型学习句间关系（后续研究 [RoBERTa] 发现 NSP 作用不大，但原始 BERT 有）。

如何从 BERT 拿到一个句子的向量？早期做法是取 `[CLS]` token 的最后一层隐状态，或者对所有 token 的隐状态做 mean pooling。但这两种方式后来被证明**不适合直接做语义检索**——BERT 原生训练目标是 token 级别的 MLM，并没有显式优化句向量之间的语义距离，导致 [CLS] 向量在语义相似度任务上表现一般，甚至不如平均的 GloVe 词向量（Reimers & Gurevych, 2019 指出）。所以 BERT Embedding 更多用作下游任务的 feature extractor，而不是直接做检索。

#### 关键公式与伪代码

Transformer Encoder 单层的前向计算：

$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right) V
$$

其中 $Q = H W_Q,\; K = H W_K,\; V = H W_V$，$H$ 是上一层隐状态。Multi-Head Attention 就是把 $d$ 维拆成 $h$ 个头并行算 attention 再拼接。

对于长度为 $n$ 的输入，BERT 的输出是 $n \times d$ 的矩阵（$d=768$ for Base）。取句向量的方式：

```text
# 从 BERT 取句向量的两种典型方式
def bert_sentence_embedding(tokens):
    hidden_states = bert(tokens)  # shape: [n, 768]
    # 方式 A: [CLS] pooling
    cls_vec = hidden_states[0]
    # 方式 B: mean pooling
    mean_vec = mean(hidden_states, dim=0)
    return cls_vec  # 或 mean_vec
```

#### 复杂度分析

- Self-Attention 计算：$O(n^2 \cdot d)$，$n$ 是序列长度，$d$ 是隐层维度。这是 BERT 长文本受限的根本原因（默认 max_length=512）。
- 推理：单层 $O(n^2 d)$，$L$ 层就是 $O(L n^2 d)$。
- 空间：模型参数 Base 版约 110M，Large 版约 340M。

#### Agent 开发中的应用场景

1. **作为下游任务的 feature extractor**：分类、NER、情感分析等传统 NLU 任务，用 BERT 微调效果远好于 Word2Vec。Agent 里"用户意图分类"、"槽位抽取"这类任务，BERT 仍是首选基座。
2. **RAG 中的文档 chunk embedding（旧方案）**：早期 RAG 有人用 BERT [CLS] 做文档向量，但效果不如 Sentence-BERT，现在基本被替代。这里出现更多是**作为对比基线**。
3. **Cross-Encoder Rerank 的底座**：RAG 二阶段的 Rerank 模型（如 `bge-reranker`、`ms-marco-MiniLM-L-12`）本质上是用 BERT 同时编码 query 和 doc，输出相似度分数。这种"双塔变单塔"的用法充分发挥了 BERT 的交互能力。
4. **理解 LLM Tokenizer 与上下文窗口**：BERT 的 tokenizer（WordPiece）和 token 化机制跟 GPT 系列一脉相承，理解 BERT 有助于理解 LLM。

#### 简单示例

```python
# 用 transformers 直接取 BERT 句向量（演示 [CLS] 与 mean pooling 两种方式）
import torch
from transformers import BertTokenizer, BertModel

tokenizer = BertTokenizer.from_pretrained("bert-base-chinese")
model = BertModel.from_pretrained("bert-base-chinese")

def embed(text, pooling="cls"):
    inputs = tokenizer(text, return_tensors="pt", max_length=128, truncation=True)
    with torch.no_grad():
        outputs = model(**inputs)
    last_hidden = outputs.last_hidden_state  # [1, seq_len, 768]
    if pooling == "cls":
        return last_hidden[0, 0]              # [CLS] 向量
    else:  # mean pooling，注意要 mask padding
        mask = inputs["attention_mask"].unsqueeze(-1)  # [1, seq_len, 1]
        summed = (last_hidden * mask).sum(dim=1)
        counts = mask.sum(dim=1).clamp(min=1)
        return summed / counts

v1 = embed("我要查询订单状态")
v2 = embed("帮我看看我的订单到哪了")

cos = torch.nn.functional.cosine_similarity(v1, v2, dim=0)
print(f"cosine = {cos.item():.4f}")
# 输出形如: cosine = 0.78xx
```

注意：直接用 BERT 算出来的 cosine 相似度通常**偏高且区分度差**——这就是后面 Sentence-BERT 要解决的核心问题。

---

### 1.3 Sentence Embedding（Sentence-BERT）

#### 原理与核心思想

Sentence-BERT（简称 SBERT，Reimers & Gurevych, 2019）的目标明确：**训练一个能直接产出高质量句向量的模型，让"语义相似的句子"在向量空间中距离更近**。原 motivation 是 BERT 在语义检索场景的两个痛点：

1. **没有合适的句向量**：BERT 的 [CLS] 或 mean pooling 向量做检索效果差（cosine 区分度低）。
2. **Cross-Encoder 太慢**：如果直接用 BERT 把 (query, doc) 拼一起算相似度，10 万文档就要跑 10 万次 BERT forward，根本没法做检索。

SBERT 的架构改造：用 Siamese（孪生）网络结构——两个共享权重的 BERT 编码器分别编码 query 和 doc，各自 pool 出句向量，然后在向量空间里算 cosine 或欧氏距离。这样可以把所有 doc 向量**预计算并入库**，线上检索只需算 1 次 query 向量 + ANN 检索，10 万文档从分钟级降到毫秒级。

训练目标上有三种典型方式：

- **Classification Objective**：拼接 $[u, v, |u - v|]$ 接一个分类头，判断两句话是否语义相关。
- **Regression Objective**：直接用 cosine 相似度去拟合 ground-truth 相似度分数（如 STS-B 数据集的 0~5 分）。
- **Triplet Objective**：用 (anchor, positive, negative) 三元组，最小化 anchor 与 positive 距离，同时拉开与 negative 的距离，margin-based loss。

训练数据来自 NLI（自然语言推理）、STS（语义文本相似度）等标注语料。训出来的句向量在 STS 任务上比 BERT [CLS] 提升非常显著（Spearman 相关性从 ~0.50 提到 ~0.80+）。

#### 关键公式与伪代码

Siamese 结构 + Cosine Similarity + Regression loss：

$$
u = \text{Pool}(\text{BERT}(x_A)), \quad v = \text{Pool}(\text{BERT}(x_B))
$$
$$
\text{sim}(u, v) = \cos(u, v) = \frac{u \cdot v}{\|u\| \cdot \|v\|}
$$
$$
\mathcal{L} = \text{MSE}(\text{sim}(u, v),\; y)
$$

Triplet loss 形式（常用 margin $\epsilon$）：

$$
\mathcal{L} = \max\left(0,\; \|s_a - s_p\| - \|s_a - s_n\| + \epsilon\right)
$$

```text
# SBERT 推理流程（双塔预计算 + 线上 ANN）
# 离线阶段：把知识库所有 chunk 编码入库
for chunk in knowledge_base:
    chunk_vec = sbert.encode(chunk)         # 一次 BERT forward
    vector_db.add(chunk_vec, metadata=chunk)

# 在线阶段：query 来了
query_vec = sbert.encode(query)             # 1 次 BERT forward
top_k_chunks = vector_db.search(query_vec, k=5)  # HNSW 毫秒级返回
```

#### 复杂度分析

- 编码复杂度：单句 $O(L n^2 d)$，跟 BERT 一致。
- 检索复杂度：编码后是纯向量 ANN 检索，$O(\log N)$（HNSW）或 $O(N)$（暴力），与 BERT forward 解耦。
- 空间：每个 chunk 存一个 $d$ 维向量（典型 384/768/1024 维），10 万 chunk 约 300 MB。

#### Agent 开发中的应用场景

Sentence-BERT 是**现代 Agent 系统语义检索的事实标准**，几乎所有 RAG 模块都基于它或其衍生模型：

1. **RAG 文档向量化（核心场景）**：把知识库 chunk 全部编码成向量存入 Chroma / FAISS / Qdrant，线上 query 编码后做 ANN 检索。这是 RAG 检索阶段的标配。
2. **长期记忆（Long-term Memory）**：把 Agent 的历史对话、做过的事编码成向量存入记忆库，下次遇到类似问题时检索回来作为上下文。LangChain 的 `VectorStoreRetrieverMemory` 就是这个思路。
3. **意图路由 / Semantic Router**：把每个工具/子 Agent 的描述预先编码成向量，query 来了算相似度路由到最相关的工具——这比写一堆 if-else 规则更鲁棒，是"语义路由"的实现基础。
4. **示例选择（Few-shot Example Selection）**：从示例池里检索与当前 query 最相似的几个示例塞进 prompt，提升 in-context learning 效果。
5. **去重与聚类**：用户问题聚类、相似工单合并、prompt 模板去重。

#### 简单示例

```python
# 用 sentence-transformers 做语义检索（RAG 核心代码骨架）
from sentence_transformers import SentenceTransformer, util

# 常用中文友好模型: BAAI/bge-small-zh-v1.5 / bge-large-zh-v1.5
model = SentenceTransformer("BAAI/bge-small-zh-v1.5")

# 知识库（实际场景是从文档 chunk 出来的）
documents = [
    "退款流程：用户在订单页点击申请退款，客服 48 小时内审核。",
    "登录失败：请检查账号是否被锁定，或通过短信验证码登录。",
    "发票开具：在订单详情页点击'申请发票'，填写税号即可。",
    "修改密码：进入账号设置-安全中心-修改密码。",
]
doc_vecs = model.encode(documents, normalize_embeddings=True)  # 预计算并归一化

# 用户问题
query = "我密码忘了怎么办"
query_vec = model.encode([query], normalize_embeddings=True)

# 余弦相似度（向量已归一化，等价于点积）
scores = (query_vec @ doc_vecs.T)[0]
top_k = scores.argsort()[::-1][:2]
for i in top_k:
    print(f"[{scores[i]:.4f}] {documents[i]}")
# 输出形如:
# [0.83xx] 修改密码：进入账号设置-安全中心-修改密码。
# [0.61xx] 登录失败：请检查账号是否被锁定，或通过短信验证码登录。
```

注意几个工程细节：(1) `normalize_embeddings=True` 让余弦相似度退化为点积，ANN 库通常默认用点积更快；(2) `bge` 系列对中文检索任务做了对比学习微调，效果远好于直接用 `bert-base-chinese`；(3) 文档向量要**离线编码入库**，不要每次查询都重算。

---

## 二、相似度计算

相似度计算看起来简单，但在 Agent 系统里**选错度量会导致检索效果断崖式下降**。比如向量没归一化时用点积、归一化后又用欧氏距离，都是常见踩坑。下面三种是工程里真正常用的。

### 2.1 余弦相似度

#### 原理与核心思想

余弦相似度衡量两个向量方向上的夹角，公式：

$$
\cos(\mathbf{a}, \mathbf{b}) = \frac{\mathbf{a} \cdot \mathbf{b}}{\|\mathbf{a}\| \cdot \|\mathbf{b}\|} = \frac{\sum_i a_i b_i}{\sqrt{\sum_i a_i^2} \sqrt{\sum_i b_i^2}}
$$

值域 $[-1, 1]$，越接近 1 越相似。它的核心特点是**只看方向不看模长**——这对 Embedding 检索至关重要，因为 LLM/Encoder 产出的向量模长可能因句子长度、词汇分布而抖动，但方向才是语义本质。所以语义检索场景默认用余弦相似度。

工程实现上有一个非常常用的等价优化：**先把向量归一化到单位长度**（$\mathbf{v} \leftarrow \mathbf{v} / \|\mathbf{v}\|$），此时 $\|\mathbf{a}\| = \|\mathbf{b}\| = 1$，余弦相似度就退化成点积 $\mathbf{a} \cdot \mathbf{b}$。这就是为什么 FAISS、Chroma、Qdrant 在选择 `metric="cosine"` 时内部其实是先归一化再做点积，效率更高。

#### 复杂度分析

- 时间：$O(d)$，$d$ 是向量维度。
- 空间：$O(1)$。
- 与 brute-force 检索结合：$O(N \cdot d)$，$N$ 是文档数。

#### Agent 开发中的应用场景

1. **RAG 语义检索默认度量**：几乎所有向量库的默认 metric。
2. **Few-shot 示例选择**：从示例池里按 cosine 选 Top-K。
3. **意图路由**：query 与每个意图模板算 cosine，取最大。
4. **去重过滤**：cosine > 0.95 视为重复（具体阈值看模型与任务）。

#### 简单示例

```python
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

a = np.array([[0.1, 0.2, 0.3, 0.4]])
b = np.array([[0.2, 0.3, 0.4, 0.5]])

sim = cosine_similarity(a, b)[0, 0]
print(f"cosine = {sim:.4f}")

# 归一化后点积等价
a_n = a / np.linalg.norm(a)
b_n = b / np.linalg.norm(b)
print(f"dot(normalized) = {(a_n @ b_n.T)[0, 0]:.4f}")
# 两者数值相同
```

---

### 2.2 点积

#### 原理与核心思想

点积（内积）是最朴素的相似度度量：

$$
\mathbf{a} \cdot \mathbf{b} = \sum_i a_i b_i
$$

值域无界，受向量模长影响。当两个向量都归一化时，点积等于余弦相似度；不归一化时，点积同时反映了"方向相似"和"模长都大"两个信号。

**什么时候用点积而不是余弦**？关键是看训练目标。一些现代 Embedding 模型（如 OpenAI `text-embedding-3-*`、Cohere `embed-english-v3`）在训练时直接用点积作为相似度度量，并且**不对输出向量做归一化约束**——这种情况下向量模长本身承载了"语义浓度"信息，强行归一化反而会丢信息。这时检索时必须用点积（FAISS 的 `IndexFlatIP`）而不是 cosine。

#### 复杂度分析

- 时间：$O(d)$，比余弦少了归一化除法开销，更快。
- 空间：$O(1)$。

#### Agent 开发中的应用场景

1. **使用某些闭源 Embedding API 时**：OpenAI、Cohere 等模型的官方文档明确建议用点积，不要强制归一化。
2. **注意力机制内部**：Transformer 的 Self-Attention $QK^\top$ 本质就是点积打分，模长反映了 token 重要性。
3. **追求极致性能**：归一化除法在大规模检索里也是开销，工程上能省则省。

#### 简单示例

```python
import numpy as np

# 模拟 OpenAI text-embedding-3 输出（未归一化）
a = np.array([0.8, 0.1, 0.3, 0.5])
b = np.array([0.7, 0.2, 0.4, 0.6])

dot = a @ b
cos = dot / (np.linalg.norm(a) * np.linalg.norm(b))
print(f"dot = {dot:.4f}, cosine = {cos:.4f}")
# dot=0.95, cosine=0.96  —— 数值不同，排序可能不同
```

---

### 2.3 欧氏距离

#### 原理与核心思想

欧氏距离（L2 距离）是最直观的几何距离：

$$
d(\mathbf{a}, \mathbf{b}) = \|\mathbf{a} - \mathbf{b}\|_2 = \sqrt{\sum_i (a_i - b_i)^2}
$$

值域 $[0, +\infty)$，越小越相似。

**关键等价关系**：当所有向量都归一化时（$\|\mathbf{a}\| = \|\mathbf{b}\| = 1$），欧氏距离与余弦相似度单调相关：

$$
\|\mathbf{a} - \mathbf{b}\|^2 = 2(1 - \cos(\mathbf{a}, \mathbf{b}))
$$

这意味着**归一化向量空间下，用 L2 排序和用 cosine 排序结果完全一致**。所以 FAISS 的 `IndexFlatL2` 和归一化后的 `IndexFlatIP` 在 RAG 检索里结果等价，区别只是工程实现。

那什么时候必须用欧氏距离、不能用余弦？**当模长本身是重要信号时**。典型场景是聚类、异常检测、图像 embedding（模长可能代表置信度）。

#### 复杂度分析

- 时间：$O(d)$。
- 空间：$O(1)$。
- 在 ANN 索引（HNSW、IVF）里，L2 和 IP 的索引构建和查询性能基本一致。

#### Agent 开发中的应用场景

1. **聚类与去重**：KMeans 默认用 L2 距离。对 prompt 模板、用户问题聚类时常用。
2. **异常检测**：找出与历史分布距离特别远的 query，触发兜底策略。
3. **跨模态检索**：图像/音频 embedding 模长可能有意义，用 L2 更稳妥。
4. **FAISS 默认 metric**：`IndexFlatL2` 是 FAISS brute-force 检索的默认选项，配合归一化向量等价于 cosine。

#### 简单示例

```python
import numpy as np
from sklearn.metrics.pairwise import euclidean_distances

a = np.array([[0.1, 0.2, 0.3, 0.4]])
b = np.array([[0.5, 0.6, 0.7, 0.8]])

dist = euclidean_distances(a, b)[0, 0]
print(f"euclidean = {dist:.4f}")

# 验证归一化下 L2 与 cosine 的单调关系
a_n = a / np.linalg.norm(a)
b_n = b / np.linalg.norm(b)
l2 = euclidean_distances(a_n, b_n)[0, 0]
cos = (a_n @ b_n.T)[0, 0]
print(f"L2(normalized)={l2:.4f}, 1-cos={1 - cos:.4f}, sqrt(2*(1-cos))={np.sqrt(2*(1-cos)):.4f}")
# L2(normalized) == sqrt(2*(1-cos))
```

---

## 三、向量检索算法

RAG 系统的延迟瓶颈几乎都在向量检索。10 万文档暴力检索是 $O(N \cdot d)$，单机几秒级；上亿文档根本不可行。ANN（Approximate Nearest Neighbor，近似最近邻）算法就是为这个问题而生的——**牺牲一点点精度，换取几个数量级的速度提升**。下面三种是工业界主流方案。

### 3.1 HNSW（Hierarchical Navigable Small World）

#### 原理与核心思想

HNSW（Malkov & Yashunin, 2018）是目前向量库（FAISS、Chroma、Qdrant、Milvus、pgvector）的默认索引算法，也是 RAG 系统最常用的 ANN 方案。它的核心思想是**构建一个分层图结构，上层稀疏下层稠密，查询时从顶层入口点贪心下降，逐层细化**——可以类比跳表（skip list），但每个节点维护多个邻居而不是单向链表。

HNSW 的两个关键概念：

1. **Navigable Small World（NSW）图**：每个节点维护 $M$ 个邻居（典型 $M=16$）。NSW 图同时存在长程边（跨大距离的邻居）和短程边（近邻），让从任意节点出发都能在 $O(\log N)$ 跳数内到达任意其他节点。
2. **层级结构（Hierarchy）**：节点按指数概率分布分配到不同层，最高层最稀疏，第 0 层包含所有节点。查询从最高层入口点开始，每层做贪心搜索（向更近的邻居跳），到当前层局部最优就下降一层，最终在第 0 层用 `efSearch` 参数做更精细的 beam search 返回 Top-K。

这种"先粗后细"的策略让 HNSW 在保持高召回率（>95%）的同时，查询复杂度接近 $O(\log N)$。

#### 关键公式与伪代码

节点插入第 $l$ 层的概率分布（指数衰减）：

$$
l = \lfloor -\ln(\text{Uniform}(0, 1)) \cdot m_L \rfloor, \quad m_L = 1 / \ln(M)
$$

```text
# HNSW 查询伪代码
def search(query_vec, K, efSearch):
    # 从最高层入口点 entry_point 开始
    curr = entry_point
    for layer in range(top_layer, 0, -1):       # 顶层到第 1 层：贪心下降
        curr = greedy_search_layer(query_vec, curr, ef=1, layer=layer)
    # 第 0 层：beam search，候选集大小 efSearch
    candidates = beam_search_layer(query_vec, curr, ef=efSearch, layer=0)
    return top_K(candidates, K)
```

关键参数：
- `M`：每个节点的邻居数，默认 16。越大召回越高、内存越大。
- `efConstruction`：构建时候选集大小，默认 200。越大构建越慢但图质量越好。
- `efSearch`：查询时候选集大小，默认 50。**这是线上调参最频繁的旋钮**——调大召回提升但延迟上升。

#### 复杂度分析

- 查询：$O(\log N)$（理论值，实测百万级数据毫秒级）。
- 构建：$O(N \log N)$，但常数较大，百万向量构建可能几分钟到几十分钟。
- 空间：$O(N \cdot M)$，每个节点存 $M$ 个邻居 ID。百万 768 维向量，索引约 1~2 GB。
- 召回率：典型配置下 95%~99%。

#### Agent 开发中的应用场景

1. **RAG 核心依赖**：99% 的 Agent 项目向量检索都用 HNSW。Chroma、Qdrant、Milvus、pgvector、FAISS（`IndexHNSWFlat`）全部支持。
2. **长期记忆检索**：Agent 历史对话、经验库的向量检索。
3. **实时性要求高的场景**：用户 query 来了要 <100ms 返回 Top-K，HNSW 是首选。
4. **中小规模（<1000 万）事实标准**：超过这个量级才需要考虑 IVF-PQ 做内存压缩。

#### 简单示例

```python
# 用 faiss 构建 HNSW 索引
import numpy as np
import faiss

dim = 768
n_docs = 100_000
data = np.random.randn(n_docs, dim).astype("float32")
faiss.normalize_L2(data)  # 配合 IndexFlatIP 等价 cosine

# 构建 HNSW 索引
index = faiss.IndexHNSWFlat(dim, M=16)
index.hnsw.efConstruction = 200
index.hnsw.efSearch = 50
index.add(data)

# 检索
query = np.random.randn(1, dim).astype("float32")
faiss.normalize_L2(query)
D, I = index.search(query, k=5)
print("top-5 indices:", I[0])
print("top-5 scores:", D[0])
```

工程上更常见的是直接用 Chroma/Qdrant 的封装，不用手写 FAISS——但理解这些参数对调参至关重要。

---

### 3.2 IVF-PQ（倒排文件 + 乘积量化）

#### 原理与核心思想

IVF-PQ 是 FAISS 的招牌组合算法，专门解决**超大规模向量检索的内存与速度问题**。它由两部分组合而成：

**第一部分：IVF（Inverted File，倒排文件）**

IVF 先用 k-means 把向量空间聚成 `nlist` 个聚类（典型 nlist = $\sqrt{N}$，如 100 万向量配 1000 个 list）。检索时先算 query 到 `nlist` 个聚类中心的距离，选出最近的 `nprobe` 个聚类（典型 nprobe = 8~64），然后只在这些聚类内做 brute-force。这就是"先粗筛再精排"。

IVF 的复杂度从 $O(N \cdot d)$ 降到 $O(nlist \cdot d + nprobe \cdot \frac{N}{nlist} \cdot d)$，调大 `nprobe` 召回提升但变慢。

**第二部分：PQ（Product Quantization，乘积量化）**

PQ 是一种向量压缩技术。把 $d$ 维向量切成 $m$ 段（如 768 维切成 96 段，每段 8 维），每段独立做 k-means 聚成 256 个簇（用 1 字节编码）。这样原始 768 维 float32 向量（3072 字节）被压缩成 96 字节的 PQ 码，**压缩比约 32 倍**。

检索时距离计算用查表（Asymmetric Distance Computation, ADC）：query 不压缩，但 doc 用 PQ 码，对每段查预计算的 256 个距离表，求和得到近似距离。

**IVF-PQ 组合**：先用 IVF 选聚类，再用 PQ 码做聚类内 brute-force。这是 FAISS 在 10 亿级向量上能跑进 GB 级内存的关键。

#### 关键公式与伪代码

PQ 编码：把向量 $\mathbf{x} \in \mathbb{R}^d$ 切成 $m$ 段 $\mathbf{x}^{(1)}, \dots, \mathbf{x}^{(m)}$，每段独立量化：

$$
\mathbf{x}^{(j)} \approx \mathbf{c}_{q_j}, \quad q_j = \arg\min_{i} \|\mathbf{x}^{(j)} - \mathbf{c}_i^{(j)}\|^2
$$

其中 $\mathbf{c}_i^{(j)}$ 是第 $j$ 段的第 $i$ 个聚类中心。编码后向量变成 $(q_1, q_2, \dots, q_m)$，每段 1 字节，共 $m$ 字节。

ADC 距离计算：

$$
d(\mathbf{q}, \mathbf{x}) \approx \sum_{j=1}^{m} \|\mathbf{q}^{(j)} - \mathbf{c}_{q_j}^{(j)}\|^2
$$

```text
# IVF-PQ 训练与查询
# 训练阶段
kmeans = KMeans(n_clusters=nlist, data=train_set)
centroids = kmeans.centroids  # [nlist, d]
for each segment j in 1..m:
    pq_centroids[j] = KMeans(n_clusters=256, data=train_set[:, segment_j])

# 编码：每个向量 -> 1 个 list_id + m 字节 PQ 码
for vec in dataset:
    list_id = nearest_centroid(vec, centroids)
    pq_code = [nearest_centroid(vec[j], pq_centroids[j]) for j in 1..m]
    inverted_file[list_id].append(pq_code)

# 查询
def search(query, k, nprobe):
    nearest_lists = top_n_centroids(query, n=nprobe)
    candidates = []
    for list_id in nearest_lists:
        for pq_code in inverted_file[list_id]:
            # ADC：查表求和
            dist = sum(distance_table[j][pq_code[j]] for j in 1..m)
            candidates.append((dist, doc_id))
    return top_k(candidates, k)
```

#### 复杂度分析

- 训练：$O(N \cdot d \cdot \text{iter})$（k-means 迭代）。
- 编码：$O(d)$ 每个向量。
- 查询：$O(nlist \cdot d + nprobe \cdot \frac{N}{nlist} \cdot m)$，其中 $m$ 是 PQ 段数（远小于 $d$）。
- 内存：$O(N \cdot m)$，1 亿 768 维向量，PQ 用 $m=64$，仅约 6.4 GB（原始要 300 GB）。
- 召回率：典型配置 90%~95%，比 HNSW 略低但内存优势巨大。

#### Agent 开发中的应用场景

1. **超大规模知识库**：文档量 >1000 万的 RAG 系统，HNSW 内存撑不住时上 IVF-PQ。
2. **内存受限场景**：单机部署、边缘节点，需要把向量库塞进几 GB 内存。
3. **冷数据检索**：访问频率不高的历史归档数据，可以用 IVF-PQ 压缩存储。
4. **与 HNSW 组合（IVF-HNSW）**：FAISS 提供 `IndexIVF_HNSW`，用 HNSW 替代暴力找聚类中心，进一步加速。

#### 简单示例

```python
# 用 faiss 构建 IVF-PQ 索引
import numpy as np
import faiss

dim = 768
n_docs = 1_000_000
data = np.random.randn(n_docs, dim).astype("float32")

nlist = 4096   # 聚类数
m = 64         # PQ 段数，dim 必须能被 m 整除（这里 768/64=12 维/段）

quantizer = faiss.IndexFlatL2(dim)
index = faiss.IndexIVFPQ(quantizer, dim, nlist, m, 8)  # 8 bits/段
index.train(data[:50_000])   # 用子集训练
index.add(data)
index.nprobe = 16            # 查询时探查 16 个聚类

query = np.random.randn(1, dim).astype("float32")
D, I = index.search(query, k=5)
print("top-5 indices:", I[0])

# 内存对比
flat_size = n_docs * dim * 4 / 1e9  # GB
pq_size = n_docs * m / 1e9          # GB
print(f"Flat: {flat_size:.1f} GB, IVF-PQ: {pq_size:.1f} GB")
# Flat: ~3.0 GB, IVF-PQ: ~0.06 GB  —— 压缩 50 倍
```

---

### 3.3 LSH（局部敏感哈希）

#### 原理与核心思想

LSH（Locality-Sensitive Hashing）走的是与 HNSW/IVF 完全不同的路线——**用哈希函数把相近向量尽量哈希到同一个桶**。它的核心定义是：

一个哈希函数族 $\mathcal{H}$ 是 $(r_1, r_2, p_1, p_2)$-sensitive 的，如果对任意 $\mathbf{a}, \mathbf{b}$：

$$
\begin{cases}
\Pr[h(\mathbf{a}) = h(\mathbf{b})] \ge p_1, & \text{if } d(\mathbf{a}, \mathbf{b}) \le r_1 \\
\Pr[h(\mathbf{a}) = h(\mathbf{b})] \le p_2, & \text{if } d(\mathbf{a}, \mathbf{b}) \ge r_2
\end{cases}
$$

且 $p_1 > p_2$。也就是说**距离近的向量哈希碰撞概率高，距离远的碰撞概率低**——这与传统哈希（追求均匀分散）完全相反。

具体构造（以余弦相似度为例）使用 **SimHash**：随机生成 $k$ 个超平面法向量 $\mathbf{r}_1, \dots, \mathbf{r}_k$，每个哈希位 $h_i(\mathbf{v}) = \text{sign}(\mathbf{r}_i \cdot \mathbf{v})$。两个向量在某个超平面同侧则哈希位相同。$k$ 位组合成一个桶 ID。

为提升召回，常用 **$L$ 个哈希表并行**：每个表用独立的 $k$ 个超平面，查询时取所有表碰撞桶的并集。$k$ 越大精度越高但召回降低，$L$ 越大召回越高但内存与时间成本上升。

#### 关键公式与伪代码

SimHash 单哈希位：

$$
h_i(\mathbf{v}) = \mathbb{1}[\mathbf{r}_i \cdot \mathbf{v} > 0], \quad \mathbf{r}_i \sim \mathcal{N}(0, I)
$$

两向量在一位上碰撞的概率：

$$
\Pr[h_i(\mathbf{a}) = h_i(\mathbf{b})] = 1 - \frac{\theta(\mathbf{a}, \mathbf{b})}{\pi}
$$

其中 $\theta$ 是夹角。$k$ 位都碰撞的概率是 $(1 - \theta/\pi)^k$。

```text
# SimHash + 多表 LSH
class LSH:
    def __init__(self, d, k, L):
        # L 个表，每表 k 个随机超平面
        self.planes = [np.random.randn(k, d) for _ in range(L)]
        self.tables = [defaultdict(list) for _ in range(L)]

    def hash(self, vec, table_id):
        bits = (self.planes[table_id] @ vec > 0).astype(int)
        return "".join(map(str, bits))

    def add(self, vec, doc_id):
        for t in range(L):
            self.tables[t][self.hash(vec, t)].append(doc_id)

    def query(self, vec, k):
        candidates = set()
        for t in range(L):
            candidates |= set(self.tables[t][self.hash(vec, t)])
        # 对候选集做 brute-force 重排
        return rerank_and_topk(candidates, vec, k)
```

#### 复杂度分析

- 构建：$O(N \cdot L \cdot k \cdot d)$（计算 $L$ 个表的哈希）。
- 查询：$O(L \cdot k \cdot d + |C| \cdot d)$，其中 $|C|$ 是候选集大小，通常远小于 $N$。
- 空间：$O(N \cdot L)$（存 $L$ 份倒排）。
- 召回率：可调，但实际工程里同等召回下通常不如 HNSW。

#### Agent 开发中的应用场景

LSH 在现代 Agent 系统里**用得越来越少**，主要因为 HNSW 在大多数场景下性能与召回都更优。但 LSH 仍有几个独特价值：

1. **近似去重 / 文档指纹**：SimHash 是大规模网页去重的经典算法（Google 早期用），Agent 场景里用于知识库去重、爬虫结果去重。
2. **流式数据 / 增量插入友好**：LSH 不需要全局重建索引，新向量直接哈希入桶，适合数据持续流入的场景。
3. **理论分析与教学**：理解 LSH 对理解 ANN 算法边界、概率检索理论有帮助。
4. **超低资源场景**：哈希函数计算极轻量，适合嵌入式或极简部署。

实际 RAG 项目里，**优先选 HNSW，规模太大才考虑 IVF-PQ，LSH 一般不作为主检索方案**。

#### 简单示例

```python
# 用 datasketch 实现 MinHash LSH（用于集合近似匹配，与 SimHash 思想相同）
from datasketch import MinHash, MinHashLSH

def shingle(text, k=3):
    return {text[i:i+k] for i in range(len(text) - k + 1)}

docs = {
    "d1": "用户登录失败提示密码错误",
    "d2": "用户登录失败密码错误",
    "d3": "发票申请流程指南",
}

# 构建 LSH 索引
lsh = MinHashLSH(threshold=0.5, num_perm=128)
minhashes = {}
for doc_id, text in docs.items():
    m = MinHash(num_perm=128)
    for s in shingle(text):
        m.update(s.encode("utf-8"))
    minhashes[doc_id] = m
    lsh.insert(doc_id, m)

# 查询与 d1 近似的文档
query_m = minhashes["d1"]
result = lsh.query(query_m)
print("近似文档:", result)  # ['d1', 'd2']
```

---

## 四、分词 / Tokenization

分词是 LLM 与 Embedding 模型的最底层模块——**输入文本必须先切成 token 序列才能进入模型**。分词器的选择直接影响：上下文窗口的有效长度、中文等非拉丁文字的成本、新词/OOV 处理能力、生成质量。下面两种是工业界最主流的 subword（子词）分词算法。

### 4.1 BPE（Byte Pair Encoding）

#### 原理与核心思想

BPE 最初是 1994 年提出的数据压缩算法，2015 年被 Sennrich 等人引入 NLP 作为 subword 分词方法。它的核心思想是**从字符级别出发，反复合并出现频率最高的相邻 token 对，逐步构建子词词表**。

为什么需要 subword？三个极端都有问题：
- **字符级**：词表小（几十），但序列太长，模型学不到语义。
- **词级**：词表巨大（几十万），OOV（Out-of-Vocabulary）严重，新词、错字都找不到。
- **Subword（BPE）**：常见词整体作为一个 token，罕见词切成有意义的子词片段，兼顾词表大小和序列长度，且**没有 OOV 问题**——任何文本都能用字符级 token 组合出来。

BPE 的训练过程：

1. 在所有词末尾加 `</w>` 标记（区分词内子串与词尾），把每个词拆成字符序列。
2. 统计所有相邻 token 对的频率（频率 = 两 token 共现的两个词的频率之和）。
3. 选频率最高的 token 对合并成新 token，加入词表。
4. 重复 2~3 直到词表达到目标大小（如 50k）。

GPT-2、GPT-3、GPT-4、LLaMA、Qwen、ChatGLM 等几乎所有主流 LLM 都用 BPE 或其变体（如 Byte-level BPE，BBPE）作为分词器。

#### 关键公式与伪代码

```text
# BPE 训练
vocab = set(all_chars)  # 初始词表 = 所有字符
word_freqs = Counter(corpus)  # {("l","o","w","</w>"): 5, ...}

while len(vocab) < target_vocab_size:
    pair_freqs = Counter()
    for word, freq in word_freqs.items():
        for i in range(len(word) - 1):
            pair_freqs[(word[i], word[i+1])] += freq
    if not pair_freqs: break
    best_pair = pair_freqs.most_common(1)[0][0]
    vocab.add(best_pair[0] + best_pair[1])
    # 在所有词中合并这个 pair
    word_freqs = {merge(word, best_pair): freq for word, freq in word_freqs.items()}

# BPE 编码（推理）
def encode(word):
    tokens = list(word) + ["</w>"]
    while len(tokens) > 1:
        # 找词表中存在且优先级最高（合并最早）的相邻 pair
        pair = select_highest_priority_pair(tokens)
        if pair is None: break
        tokens = merge(tokens, pair)
    return tokens
```

#### 复杂度分析

- 训练：$O(V \cdot N)$，$V$ 是目标词表大小，$N$ 是语料词数。词表 50k、语料百万级，单机几小时。
- 编码：单词 $O(L^2)$，$L$ 是词长（通常 <20，可忽略）。
- 空间：词表 $O(V)$。

#### Agent 开发中的应用场景

1. **LLM 分词器基础**：理解 BPE 就理解了 GPT/Qwen 等模型分词器的行为，比如为什么"你好"被切成 2 个 token 而"hello"是 1 个。
2. **Token 成本估算**：调用 OpenAI API 按 token 计费，BPE 分词直接决定成本。中文每字通常 1~2 token，英文每词约 1.3 token——这就是为什么中文 prompt 成本更高。
3. **上下文窗口管理**：RAG 切 chunk、对话历史截断都要按 token 数算，必须用 BPE 分词器精确计数，不能按字符数估算。
4. **Embedding 模型输入处理**：BERT 系 Embedding 模型用 WordPiece（见下节），GPT 系用 BPE，调 API 时要注意 max_length 是按 token 算的。

#### 简单示例

```python
# 用 tiktoken 计算 GPT-4 的 token 数（OpenAI 官方分词器）
import tiktoken

enc = tiktoken.encoding_for_model("gpt-4")
text_zh = "我要查询订单状态"
text_en = "I want to check my order status"

tokens_zh = enc.encode(text_zh)
tokens_en = enc.encode(text_en)

print(f"中文: {len(tokens_zh)} tokens -> {tokens_zh}")
print(f"英文: {len(tokens_en)} tokens -> {tokens_en}")
# 中文可能 8~10 个 token，英文 6~7 个 token —— 中文更贵

# 用 transformers 训练自己的 BPE
from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.trainers import BpeTrainer
from tokenizers.pre_tokenizers import Whitespace

tokenizer = Tokenizer(BPE(unk_token="[UNK]"))
tokenizer.pre_tokenizer = Whitespace()
trainer = BpeTrainer(vocab_size=5000, special_tokens=["[UNK]", "[PAD]"])
tokenizer.train_from_iterator(["用户登录失败 密码错误", "注册成功 发送验证码"], trainer)
print(tokenizer.encode("用户登录").tokens)  # ['用户', '登', '录']
```

---

### 4.2 WordPiece

#### 原理与核心思想

WordPiece 由 Schuster & Nakajima 在 2012 年提出，被 BERT、DistilBERT、Electra 等模型采用。它跟 BPE 极其相似——都是从字符出发反复合并 token 对构建子词词表——但**合并标准不同**：

- **BPE**：合并频率最高的 pair（频率 = 共现次数）。
- **WordPiece**：合并让语言模型似然增益最大的 pair，公式：

$$
\text{score}(x, y) = \frac{f(xy)}{f(x) \cdot f(y)}
$$

即 pair $(x, y)$ 的共现频率除以两个单独 token 频率的乘积。这本质是一个**点互信息（PMI）**的变体——优先合并那些"虽然可能频率不是最高，但单独出现的概率低、合在一起更合理"的 pair。这样能避免 BPE 把高频但语义无关的字符误合并。

**编码（推理）时的差异**：
- BPE 按训练时合并顺序贪心匹配。
- WordPiece 用**最长前缀匹配**（greedy longest-match-first）：从左到右，对每个位置找词表里能匹配的最长子词。这种贪心策略实现简单但不是全局最优，可能导致切分次优，但工程上够用。

**BBPE（Byte-level BPE）**：现代 LLM（GPT-2 之后）普遍用 Byte-level BPE——先把文本编码成 UTF-8 字节（256 种），再在字节序列上跑 BPE。这样彻底消除了 OOV（任何字节序列都能表示），多语言、emoji、特殊符号统一处理。BERT 的 WordPiece 是字符级而非字节级，处理罕见 Unicode 字符时会有 `[UNK]`。

#### 关键公式与伪代码

```text
# WordPiece 训练
vocab = set(all_chars)
word_freqs = Counter(corpus)

while len(vocab) < target_vocab_size:
    pair_scores = {}
    for (x, y), freq_xy in count_pairs(word_freqs).items():
        # PMI 风格打分
        pair_scores[(x, y)] = freq_xy / (char_freq[x] * char_freq[y])
    if not pair_scores: break
    best_pair = max(pair_scores, key=pair_scores.get)
    vocab.add(best_pair[0] + best_pair[1])
    word_freqs = {merge(word, best_pair): freq for word, freq in word_freqs.items()}

# WordPiece 编码（最长前缀匹配）
def encode(text):
    tokens = []
    for word in text.split():
        sub_tokens = []
        start = 0
        while start < len(word):
            end = len(word)
            # 从最长开始尝试匹配
            while end > start:
                substr = word[start:end]
                candidate = substr if start == 0 else "##" + substr
                if candidate in vocab:
                    sub_tokens.append(candidate)
                    start = end
                    break
                end -= 1
            else:
                sub_tokens.append("[UNK]")
                start += 1
        tokens.extend(sub_tokens)
    return tokens
```

注意 WordPiece 用 `##` 前缀标记"非词首子词"，比如 `playing` 切成 `["play", "##ing"]`。

#### 复杂度分析

- 训练：$O(V \cdot N)$，与 BPE 同量级。
- 编码：单词 $O(L^2)$（最长匹配）。
- 空间：词表 $O(V)$，BERT 中文词表约 21k，英文约 30k。

#### Agent 开发中的应用场景

1. **BERT 系列 Embedding 模型的分词**：用 `bert-base-chinese`、`bge-*-zh` 时，输入文本由 WordPiece 切分。理解它能帮你诊断"为什么某段中文被切得很碎、向量质量差"。
2. **Embedding 长度控制**：BERT max_length=512 是按 WordPiece token 算的，不是按字符。中文一字可能 1 token，复杂词可能多 token。
3. **跨模型对齐**：当 Agent 同时用 BERT 系（WordPiece）做 Embedding 和 GPT 系（BPE）做生成时，两端 token 数会不一致，做 chunk 时要分别用各自 tokenizer 计数。
4. **选型权衡**：BERT 系用 WordPiece 历史原因较多，新模型多倾向 BBPE；选 Embedding 模型时不必纠结分词器，看效果即可。

#### 简单示例

```python
# 用 transformers 观察 BERT WordPiece 切分
from transformers import BertTokenizer

tokenizer = BertTokenizer.from_pretrained("bert-base-chinese")

texts = ["我要查询订单状态", "unaffable 是个罕见英文词"]
for t in texts:
    tokens = tokenizer.tokenize(t)
    ids = tokenizer.encode(t, add_special_tokens=True)
    print(f"{t}")
    print(f"  tokens: {tokens}")
    print(f"  ids:    {ids}  (len={len(ids)})")
# 输出:
#   tokens: ['我', '要', '查', '询', '订', '单', '状', '态']
#   tokens: ['un', '##aff', '##able', '是', '个', '罕', '见', '英', '文', '词']
# 注意 ## 标记子词前缀，'unaffable' 被切成 3 个子词

# 对比 GPT 的 BPE
import tiktoken
enc = tiktoken.encoding_for_model("gpt-4")
print(enc.encode("unaffable"))  # 通常是 1~2 个 token
```

---

## 小结

本篇串起了 NLP / Embedding 在 Agent 开发中需要掌握的四层算法：

**向量化层**（Word2Vec → BERT → Sentence-BERT）的演化主线是"**静态 → 动态 → 检索优化**"。Word2Vec 把词带入了向量空间但忽略了上下文；BERT 用双向 Transformer 解决了上下文相关却没针对句向量检索做优化；Sentence-BERT 用孪生结构 + 对比学习训练出真正适合 ANN 检索的句向量，成为 RAG 的事实标准。**做 Agent 选 Embedding 模型，默认从 Sentence-BERT 家族（bge、e5、gte 等）开始选**，不要直接拿 BERT [CLS] 上。

**相似度层**看似简单，但选错度量会出问题。三句话总结：
- 语义检索默认 **cosine**（或归一化后的点积）。
- 用闭源 Embedding API（OpenAI/Cohere）按文档建议用 **点积**，不要强制归一化。
- 归一化空间下 **L2 与 cosine 等价**，FAISS 的 `IndexFlatL2` 配归一化向量等价于 cosine 检索。

**向量检索层**是 RAG 性能瓶颈。优先级建议：
- 中小规模（<1000 万）：**HNSW**，召回高、延迟低，是默认选择。
- 超大规模、内存受限：**IVF-PQ**，压缩比高，召回略低但可接受。
- **LSH** 现代项目里很少作主检索方案，但 SimHash/MinHash 在去重场景仍有价值。

**分词层**是 LLM 与 Embedding 的最底座。BPE 是 GPT 系列与现代 LLM 的标配，WordPiece 是 BERT 系列的标配——理解它们能帮你算清 token 成本、管理上下文窗口、调试 Embedding 质量问题。**工程上记住一条：用模型自带的 tokenizer 精确计数，永远不要按字符数估算 token**。

把这些算法串起来看一个完整的 RAG 链路：用户 query → BPE/WordPiece 分词 → Sentence-BERT 编码成句向量 → HNSW 在向量库里检索 Top-K chunk → cosine 相似度排序 → Cross-Encoder Rerank → 拼进 LLM prompt 生成答案。每一环都对应本篇的一个算法。掌握这一篇，相当于掌握了 Agent "记忆与检索"部分的底层逻辑。

下一篇我们将进入 RAG 全链路专题——BM25、混合检索、Rerank、Chunking 策略，把本篇的 Embedding 与向量检索算法组装成生产级 RAG 系统。
