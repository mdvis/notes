# Agent 开发需要掌握的算法

做 Agent 开发需要掌握的算法大致分为以下几类：

## 1. 基础算法
- **搜索算法**：BFS、DFS、A*、启发式搜索（用于规划与路径决策）
- **图算法**：最短路径、拓扑排序、PageRank（知识图谱检索）
- **字符串匹配**：KMP、Trie（关键词检索）
- **排序与去重**：Top-K、SimHash、MinHash（候选过滤）

## 2. NLP / Embedding 相关
- **向量化算法**：Word2Vec、BERT Embedding、Sentence Embedding
- **相似度计算**：余弦相似度、点积、欧氏距离
- **向量检索算法**：HNSW、IVF-PQ、LSH（RAG 核心依赖）
- **分词 / Tokenization**：BPE、WordPiece

## 3. RAG 相关
- **Chunking 策略**：滑动窗口、语义切分
- **检索算法**：BM25、混合检索（sparse + dense）、Re-ranking（Cross-Encoder）
- **Rerank 模型**：Cohere Rerank、bge-reranker

## 4. 推理与决策算法
- **ReAct**：Reason + Act 循环（Agent 主流范式）
- **Tree of Thoughts (ToT)** / **Graph of Thoughts (GoT)**：多路径推理
- **Chain of Thought (CoT)**：思维链
- **MCTS（蒙特卡洛树搜索）**：复杂决策空间探索
- **Beam Search**：多步规划候选生成

## 5. 规划与任务分解
- **HTN（层次任务网络）**：任务分解
- **PDDL / 状态机**：符号化规划
- **DAG 调度**：多步骤并行执行

## 6. 记忆与状态管理
- **LRU / LFU**：短期记忆淘汰
- **摘要压缩算法**：长对话上下文管理
- **向量数据库写入/更新**：长期记忆

## 7. 多 Agent 协作
- **博弈论**：纳什均衡、拍卖机制（资源分配）
- **共识算法**：多 Agent 协同决策
- **角色分工调度**：基于图的任务分发

## 8. 强化学习（进阶）
- **Q-Learning / DQN**：环境反馈学习
- **PPO / RLHF**：策略优化
- **Bandit 算法**：工具选择 / 探索-利用权衡

## 9. 工具调用与函数选择
- **Function Calling**：基于 LLM 的意图识别
- **Top-K 路由**：多工具场景下的候选筛选
- **语义路由**：基于 Embedding 的意图分发

## 10. 评估与优化
- **A/B Testing、MAB**：策略对比
- **LLM-as-a-Judge**：自动化评估
- **Trajectory Evaluation**：多步 Agent 轨迹评估

---

## 入门优先级建议 3->9->4

1. 先吃透 **RAG 全链路**（Embedding + 向量检索 + Rerank）——这是 90% Agent 项目的地基
2. 掌握 **ReAct / Function Calling** 范式——Agent 的核心循环
3. 理解 **CoT / ToT 推理框架**——提升复杂任务表现
4. 进阶再学 **MCTS、RL、多 Agent 博弈**
