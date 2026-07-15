1. **application/json** （最常用）- **用途**：前后端 API、RESTful 接口、Ajax/fetch/axios 等发送 JSON 数据
2. **application/x-www-form-urlencoded** （表单提交经典方式） - **用途**：普通 HTML 表单提交（`<form>` 不设置 enctype 时默认就是这个）、jQuery $.ajax 默认方式 - **特点**：键值对形式，类似 URL 参数 `name=张三&age=18&city=北京`
3. **multipart/form-data** （文件上传必用） - **用途**：上传文件、表单中同时有文本+文件 - **特点**：支持二进制文件，每个字段用 boundary 分隔

| Content-Type                                            | 用途           |
| ------------------------------------------------------- | ------------ |
| `text/html`                                             | HTML 页面      |
| `text/css`                                              | CSS 文件       |
| `application/javascript`                                | JS 文件        |
| `image/jpeg` / `image/png` / `image/gif` / `image/webp` | 图片           |
| `application/pdf`                                       | PDF 文件       |
| `application/octet-stream`                              | 任意二进制文件（下载用） |
