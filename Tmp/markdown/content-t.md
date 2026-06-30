**常用的 Content-Type（HTTP 请求头）**

Content-Type 是 HTTP 协议中非常重要的请求/响应头，用于告诉对方**发送的数据是什么格式**。下面按**使用频率从高到低**整理最常用的几种（以实际开发中最常遇到的场景排序）：

### 1. **application/json** （最常用）

- **用途**：前后端 API、RESTful 接口、Ajax/fetch/axios 等发送 JSON 数据
- **示例**：
  ```http
  Content-Type: application/json
  ```
  ```json
  { "name": "张三", "age": 18 }
  ```

### 2. **application/x-www-form-urlencoded** （表单提交经典方式）

- **用途**：普通 HTML 表单提交（`<form>` 不设置 enctype 时默认就是这个）、jQuery $.ajax 默认方式
- **特点**：键值对形式，类似 URL 参数
- **示例**：
  ```http
  Content-Type: application/x-www-form-urlencoded
  ```
  ```
  name=张三&age=18&city=北京
  ```

### 3. **multipart/form-data** （文件上传必用）

- **用途**：上传文件、表单中同时有文本+文件
- **特点**：支持二进制文件，每个字段用 boundary 分隔
- **示例**：
  ```http
  Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
  ```

### 4. **text/plain**

- **用途**：纯文本数据（很少单独用，偶尔用于简单字符串传输）

### 5. **application/xml** / **text/xml**

- **用途**：老系统、SOAP 接口、部分企业级接口仍在使用 XML

### 6. **其他常见媒体类型**（响应头常用，请求头偶尔用到）

| Content-Type                                            | 用途                     |
| ------------------------------------------------------- | ------------------------ |
| `text/html`                                             | HTML 页面                |
| `text/css`                                              | CSS 文件                 |
| `application/javascript`                                | JS 文件                  |
| `image/jpeg` / `image/png` / `image/gif` / `image/webp` | 图片                     |
| `application/pdf`                                       | PDF 文件                 |
| `application/octet-stream`                              | 任意二进制文件（下载用） |

### 实用小贴士（开发中常踩的坑）

- **POST/PUT 请求** 时，如果不手动设置 Content-Type：
  - 浏览器原生 `fetch` 默认是 `text/plain`（容易被后端误判）
  - Axios 默认是 `application/json`（推荐）
  - jQuery $.ajax 默认是 `application/x-www-form-urlencoded`

- **带字符集** 的写法（强烈建议加上）：

  ```http
  Content-Type: application/json; charset=utf-8
  ```

- **Node.js / Python / Java** 等后端框架自动设置的常见值：
  - Express + body-parser：默认 `application/json`
  - Spring Boot：默认 `application/json`
  - Flask：默认 `application/json`

**一句话总结**：
日常开发中 **90% 的情况** 只需记住前三个：
**JSON** → `application/json`
**普通表单** → `application/x-www-form-urlencoded`
**文件上传** → `multipart/form-data`

需要我再给你配上各种语言（JavaScript、Python、Java、Go）的具体代码示例吗？
