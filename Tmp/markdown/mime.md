在前后端开发和 AI 开发中，MIME 类型（Multipurpose Internet Mail Extensions）主要用于 HTTP 协议中的 `Content-Type` 和 `Accept` 请求头，告诉客户端或服务器如何处理传输的数据。

以下是这两个领域中最常用的 MIME 类型分类整理：
### 1. 前后端核心数据交互
这是 API 接口开发中最常打交道的类型。

| 数据格式        | MIME 类型                             | 常见使用场景                              |
| ----------- | ----------------------------------- | ----------------------------------- |
| **JSON**    | `application/json`                  | RESTful API 默认数据交换格式，前后端通信最常用。      |
| **表单默认**    | `application/x-www-form-urlencoded` | HTML 表单默认提交格式，数据以键值对拼接在请求体中。        |
| **文件上传**    | `multipart/form-data`               | 用于上传文件、图片，或混合包含文本和文件的复杂表单。          |
| **XML**     | `application/xml` 或 `text/xml`      | 老旧系统、SOAP 协议或部分支付接口（如微信支付）的数据交互。    |
| **GraphQL** | `application/graphql`               | GraphQL API 请求体格式（有时也直接包装在 JSON 中）。 |
### 2. 前端基础静态资源
浏览器解析页面时依赖这些类型来正确渲染内容或执行脚本。

| 文件类型            | MIME 类型                                      | 常见使用场景                           |
| --------------- | -------------------------------------------- | -------------------------------- |
| **HTML**        | `text/html`                                  | 网页基础结构。                          |
| **CSS**         | `text/css`                                   | 网页样式表。                           |
| **JavaScript**  | `text/javascript` 或 `application/javascript` | 前端交互逻辑脚本。                        |
| **WebAssembly** | `application/wasm`                           | 在浏览器中运行高性能的编译代码（常用于前端 AI 推理、游戏）。 |
| **纯文本**         | `text/plain`                                 | 简单的文本响应，如日志文件查看或 `robots.txt`。   |
### 3. 多媒体资源 (前端展示 & AI 视觉/语音处理)
在开发 AI 图像识别（CV）、语音识别（ASR）或前端多媒体展示时极其常见。

| 资源类型 | 扩展名 | MIME 类型 |
| --- | --- | --- |
| **图像 (PNG)** | `.png` | `image/png` |
| **图像 (JPEG)** | `.jpg`, `.jpeg` | `image/jpeg` |
| **图像 (WebP)** | `.webp` | `image/webp` (体积小，前后端推荐) |
| **矢量图** | `.svg` | `image/svg+xml` |
| **音频 (WAV)** | `.wav` | `audio/wav` (AI 语音训练/推理最常用无损格式) |
| **音频 (MP3)** | `.mp3` | `audio/mpeg` |
| **视频 (MP4)** | `.mp4` | `video/mp4` |
### 4. AI 开发与数据工程专属
在构建机器学习管道、提供大模型 API 或处理大型数据集时，常需要处理以下特定格式。

| 文件/数据类型 | MIME 类型 | AI 领域具体场景 |
| --- | --- | --- |
| **未知二进制** | `application/octet-stream` | **非常重要**。当提供 AI 模型权重下载（如 `.bin`, `.pt`, `.safetensors`）或 ONNX 模型时，通常以此类型传输。 |
| **CSV 数据集** | `text/csv` | 结构化表格数据读取，用于训练传统机器学习模型或进行数据分析。 |
| **JSON Lines** | `application/x-ndjson` 或 `application/jsonlines+json` | 大模型微调或海量数据流式处理常用的 `.jsonl` 格式（每行一个独立的 JSON 对象）。 |
| **Parquet** | `application/vnd.apache.parquet` | 列式存储大数据格式，Hugging Face 和 Pandas 处理大规模数据集的标准格式。 |
| **Jupyter 笔记** | `application/x-ipynb+json` | Jupyter Notebook (`.ipynb`) 文件格式。 |
| **HDF5** | `application/x-hdf5` | 用于存储庞大科学数据集（`.h5` 文件），常用于深度学习（如旧版 Keras 模型）。 |
| **Server-Sent Events** | `text/event-stream` | **流式输出核心**。ChatGPT、Gemini 等大模型 API 打字机效果（Stream 响应）所依赖的类型。 |

> **开发建议：** 当你开发一个让前端下载 AI 模型（如 `.onnx`）的接口时，务必将 `Content-Type` 设为 `application/octet-stream`，并配置 `Content-Disposition: attachment; filename="model.onnx"`，以确保浏览器触发下载机制而不是尝试直接打开它。
