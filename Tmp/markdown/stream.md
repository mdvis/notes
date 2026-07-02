## 一、语音识别（Speech Recognition）
### 核心原理
语音识别的本质是：**将一段连续的声波信号，转换为离散的文字序列**。这个过程可以分为"信号处理"和"模型推理"两大阶段。

在浏览器中，声音从麦克风进入后，会经历如下完整的数据转换链路：
### 语音识别详解
#### 1. 信号采集阶段
麦克风捕获的是**模拟信号**（连续的气压变化）。浏览器通过 `AudioContext` + `MediaStream` 自动完成模数转换（ADC），输出 PCM 采样数据：
```javascript
// 浏览器中获取麦克风音频数据
const audioCtx = new AudioContext({ sampleRate: 16000 }); // 语音识别常用 16kHz
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const source = audioCtx.createMediaStreamSource(stream);
const processor = audioCtx.createScriptProcessor(4096, 1, 1);

processor.onaudioprocess = (e) => {
  const float32Array = e.inputBuffer.getChannelData(0); // Float32Array, 值域 [-1, 1]
  // 这就是 PCM 数据 —— 每个浮点数代表一个采样点的振幅
};
```
**关键理解**：`Float32Array` 中的每个值是一个 32 位浮点数（4 字节），表示某个时刻声波的振幅。44100Hz 采样率意味着每秒 44100 个这样的浮点数。
#### 2. 特征提取阶段
原始 PCM 数据不能直接送入模型，需要提取声学特征：

| 步骤         | 作用                  | 字节操作               |
| ---------- | ------------------- | ------------------ |
| **分帧**     | 将连续信号切为 20-30ms 的短帧 | 切分 Float32Array    |
| **加窗**     | 减少帧边缘的频谱泄漏          | 逐元素乘以窗函数           |
| **FFT**    | 时域 → 频域             | 输出复数数组（实部+虚部）      |
| **Mel 滤波** | 模拟人耳对频率的感知          | 矩阵运算，输出 Fbank 特征   |
| **MFCC**   | 进一步降维               | DCT 变换，通常输出 40 维向量 |
这个阶段在前端 WASM 或 WebGPU 推理时需要手动实现，如果调用远程 API 则由服务端完成。
#### 3. 声学模型推理
主流方案（如 OpenAI Whisper）采用 **Encoder-Decoder** 架构：
- **Encoder**：将声学特征编码为高维隐状态（也是连续向量，本质是字节序列）
- **Decoder**：逐 token 生成文字，每步输出一个概率分布，取最高概率的 token
如果在前端推理（如用 `whisper.cpp` 编译为 WASM），需要将模型权重文件（本质是巨大的 Float32Array）加载到 ArrayBuffer 中。
#### 4. 前端字节转换的核心代码
```javascript
// Float32Array → Uint8Array（用于网络传输或 WAV 编码）
function float32ToUint8(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 4);
  new Float32Array(buffer).set(float32Array);
  return new Uint8Array(buffer);
}

// Uint8Array → Float32Array（接收端还原）
function uint8ToFloat32(uint8Array) {
  return new Float32Array(uint8Array.buffer);
}

// 生成 WAV 文件头 + PCM 数据
function encodeWAV(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  // 写入 44 字节 WAV 头...
  // 写入 16bit PCM 数据（Float32 → Int16）
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}
```
## 二、Embedding（向量嵌入）
### 核心原理
Embedding 是将任意一段文本（或图像、音频）**映射为一个固定长度的浮点数向量**。这个向量在高维空间中"编码"了原文的语义信息——语义相近的文本，向量距离也近。
### Embedding 详解
#### 1. 为什么需要 Embedding？
大语言模型不能直接理解文字，它只能处理数字。Embedding 就是这个"文字 → 数字"的桥梁：
- **"猫坐在垫子上"** → `[0.023, -0.871, 0.445, ..., -0.132]`（1536 个浮点数）
- **"小狗趴在毯子上"** → `[0.019, -0.862, 0.451, ..., -0.128]`（与上者距离很近）
- **"汽车停在路边"** → `[-0.412, 0.334, -0.788, ..., 0.567]`（与前两者距离很远）
这就是"语义相近 → 向量距离近"的核心直觉。
#### 2. Embedding 的字节本质
一个 1536 维的 Float32 向量，在内存中就是 1536 × 4 = **6144 字节** 的连续内存块：
```javascript
// 调用 OpenAI Embedding API
const response = await fetch('https://api.openai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: 'text-embedding-3-small',
    input: '猫坐在垫子上',
  }),
});

const data = await response.json();
const embedding = data.data[0].embedding; // 普通数组 [0.023, -0.871, ...]

// 转为 Float32Array —— 用于计算和存储
const vector = new Float32Array(embedding);
console.log(vector.length); // 1536
console.log(vector.byteLength); // 6144 字节

// 转为 Uint8Array 视图 —— 用于网络传输或 IndexedDB 存储
const bytes = new Uint8Array(vector.buffer);
console.log(bytes.length); // 6144
```
#### 3. 向量相似度计算
最常用的是**余弦相似度**：
```javascript
function cosineSimilarity(a, b) {
  // a, b 都是 Float32Array
  let dotProduct = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```
#### 4. 浏览器端向量存储与检索
在 RAG（检索增强生成）场景中，前端有时需要在本地存储向量：
```javascript
// 存入 IndexedDB
async function storeVector(id, vector) {
  const db = await openDB('embeddings', 1, {
    upgrade(db) {
      db.createObjectStore('vectors', { keyPath: 'id' });
    },
  });
  // Float32Array 可以直接存入 IndexedDB（结构化克隆算法支持）
  await db.put('vectors', { id, vector, timestamp: Date.now() });
}

// 暴力搜索最相似的向量（小规模可用）
async function findSimilar(queryVector, topK = 5) {
  const db = await openDB('embeddings');
  const all = await db.getAll('vectors');
  const scored = all.map((item) => ({
    ...item,
    score: cosineSimilarity(queryVector, item.vector),
  }));
  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}
```
#### 5. 量化压缩（进阶）
6KB/条 向量在百万级数据下很昂贵，实践中常用**量化**压缩：

| 方法          | 原始      | 压缩后 | 压缩比 |
| ----------- | ------- | --- | --- |
| Float32     | 6144 字节 | -   | 1×  |
| Float16     | 3072 字节 | -   | 2×  |
| Int8 (标量量化) | 1536 字节 | -   | 4×  |
| 二值量化        | 192 字节  | -   | 32× |
```javascript
// Float32 → Int8 标量量化
function quantizeToInt8(float32Array) {
  const max = Math.max(...float32Array.map(Math.abs));
  const scale = 127 / max;
  const int8 = new Int8Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    int8[i] = Math.round(float32Array[i] * scale);
  }
  return { int8, scale }; // 保存 scale 用于反量化
}
```
## 三、流式 AI 响应（Streaming AI Response）
### 核心原理
大模型生成文本是**逐 token 递归**的——每一步都依赖前一步的输出。如果等全部生成完再返回，用户要等十几秒甚至更久。流式响应的核心思想是：**生成一个 token，就立即推送一个 token**。
### 流式 AI 响应详解
#### 1. 为什么必须流式？
大模型（如 GPT-4、GLM）的生成过程是**自回归**的：
```
输入: "介绍一下量子计算"
→ step 1: "量" (依赖输入)
→ step 2: "子" (依赖输入 + "量")
→ step 3: "计" (依赖输入 + "量子")
→ ...
→ step N: [EOS] (结束标记)
```
如果生成 500 个 token，每个 token 约 30ms，总耗时约 15 秒。非流式意味着用户盯着空白等 15 秒；流式则让用户在 0.3 秒后就开始看到文字。
#### 2. SSE 方式实现（最主流）
SSE（Server-Sent Events）是基于 HTTP 的单向流式协议，是 OpenAI、Anthropic 等主流 API 的默认方式：
```javascript
// 前端调用流式 Chat API
async function streamChat(prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      stream: true, // 关键：开启流式
    }),
  });

  // 核心：读取 ReadableStream
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8'); // 字节 → 字符串
  let buffer = ''; // 处理不完整的数据帧
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    // value 是 Uint8Array —— 这就是字节处理的切入点！
    if (done) break;

    // Uint8Array → 字符串
    const chunk = decoder.decode(value, { stream: true });
    buffer += chunk;

    // SSE 格式：每个事件以 \n\n 分隔
    const lines = buffer.split('\n');
    buffer = lines.pop(); // 最后一个可能不完整，留到下次

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);

      if (data === '[DONE]') {
        console.log('生成完成:', fullText);
        return;
      }

      try {
        const parsed = JSON.parse(data);
        const token = parsed.choices[0]?.delta?.content || '';
        fullText += token;
        // 实时渲染到页面
        appendToUI(token);
      } catch (e) {
        // JSON 解析失败，可能是不完整的数据帧
      }
    }
  }
}
```
#### 3. WebSocket 二进制方式（更高效）
对于需要更低延迟或双向通信的场景（如语音对话），WebSocket + 二进制协议更合适：
```javascript
// WebSocket 二进制流式
const ws = new WebSocket('wss://api.example.com/chat');
ws.binaryType = 'arraybuffer'; // 关键：接收二进制而非字符串

ws.onmessage = (event) => {
  // event.data 是 ArrayBuffer
  const view = new DataView(event.data);

  // 解析自定义二进制帧头
  const frameType = view.getUint8(4); // 帧类型：0=token, 1=error, 2=done
  const payloadLen = view.getUint32(5); // payload 长度
  const tokenId = view.getUint32(9); // token 序号

  if (frameType === 0) {
    // 提取 token 的 UTF-8 字节
    const tokenBytes = new Uint8Array(event.data, 13, payloadLen);
    const token = new TextDecoder().decode(tokenBytes);
    appendToUI(token);
  } else if (frameType === 2) {
    console.log('生成完成');
  }
};

ws.onopen = () => {
  // 发送请求（也可以用二进制）
  ws.send(
    JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: '你好' }],
      stream: true,
    }),
  );
};
```
#### 4. UTF-8 边界问题（字节处理的关键难点）
流式传输中，一个 UTF-8 字符可能被分割在两个 chunk 中。这是前端字节处理最典型的坑：
```javascript
// 中文字符 "你" 的 UTF-8 编码是 3 字节: E4 BD A0
// 如果 chunk1 的末尾是 [E4 BD]，chunk2 的开头是 [A0]
// 直接 decode chunk1 会得到乱码！

const decoder = new TextDecoder('utf-8');

// 正确做法：使用 stream: true 选项
// TextDecoder 内部会缓存不完整的字节序列
const chunk1 = new Uint8Array([0xe4, 0xbd]); // "你" 的前两字节
const chunk2 = new Uint8Array([0xa0]); // "你" 的最后一字节

console.log(decoder.decode(chunk1, { stream: true })); // "" (空，缓存中)
console.log(decoder.decode(chunk2, { stream: true })); // "你" (拼完整了)
console.log(decoder.decode()); // 刷新剩余
```
`{ stream: true }` 告诉 TextDecoder："数据还没完，遇到不完整的 UTF-8 序列先缓存着，等下次调用再拼"。
#### 5. 三种传输方式对比

| 特性     | SSE               | WebSocket 二进制                 | WebSocket 文本 |
| ------ | ----------------- | ----------------------------- | ------------ |
| 协议     | HTTP/1.1+         | WS                            | WS           |
| 方向     | 单向（服务端→客户端）       | 双向                            | 双向           |
| 数据格式   | 纯文本               | 二进制帧                          | 文本帧          |
| 开销     | 较高（JSON 包裹）       | 低（紧凑帧头）                       | 中等           |
| 断线重连   | 内置（Last-Event-ID） | 需自己实现                         | 需自己实现        |
| 适用场景   | 文本聊天、通用 LLM API   | 语音对话、实时协作                     | 简单聊天         |
| 字节处理需求 | TextDecoder 解码    | Uint8Array 解析帧头 + TextDecoder | 无需           |
## 三者之间的关联
语音识别、Embedding、流式响应并非孤立存在，在实际 AI 应用中它们紧密协作：
```
用户语音输入
  → 语音识别（字节 → PCM → 文字）
    → 文字送入 LLM（Embedding 检索相关上下文 → 拼入 prompt）
      → 流式响应（SSE/WebSocket 逐 token 返回）
        → 前端渲染（Markdown → DOM）
          → 如果是语音助手：文字 → TTS → 音频播放
```
贯穿这整条链路的，正是**字节数据的处理能力**——从麦克风捕获的 PCM 字节，到 Embedding 向量的 Float32 字节，再到流式响应的 UTF-8 字节。前端开发者如果能理解这些字节在不同环节的形态和转换规则，就能在 AI 应用开发中游刃有余。

以上就是三大 AI 前端场景的完整讲解。核心要点回顾：
1. **语音识别**：麦克风 → PCM(Float32Array) → 特征提取 → 声学模型 → 文字。前端的关键是 Float32Array ↔ Uint8Array 的转换和 WAV 编码。
2. **Embedding**：文本 → Tokenizer → 模型 → Float32Array(1536)。向量存储和相似度检索都建立在字节操作之上，量化压缩可减少 4-32 倍存储。
3. **流式响应**：LLM 逐 token 生成 → SSE/WebSocket 传输 → 前端 TextDecoder 解码 → 实时渲染。UTF-8 边界处理是最容易踩的坑。