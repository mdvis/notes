`qpdf` 的核心逻辑是：**“从一个或多个 PDF 中挑选页面，放入一个新的 PDF”。**
## 合并 PDF
将多个文件合并为一个。
```
qpdf --empty --pages file1.pdf file2.pdf -- output.pdf
```
## 提取特定页面
从 `input.pdf` 中提取第 1、3、5 到 10 页。
```
qpdf --empty --pages input.pdf 1,3,5-10 -- output.pdf
```
## 拆分每一页为独立文件
如果你想把一个 PDF 的每一页都存成单独的文件（例如 `page-01.pdf`）：
```
qpdf input.pdf --split-pages=1 output-%02d.pdf
```
## 页面旋转
将前 5 页顺时针旋转 90 度：
```
qpdf input.pdf --rotate=90:1-5 output.pdf
```
## 去除密码 (解密)
如果 PDF 有密码（且你知道密码），可以将其去除以方便以后直接打开。
```
qpdf --decrypt --password=你的密码 input.pdf output.pdf
```
## 添加密码 (加密)
为 PDF 设置打开密码（User Password）和管理权限密码（Owner Password）：
```
qpdf --encrypt 用户密码 管理密码 256 --print=full -- input.pdf output.pdf
```
- `256`: 使用 256 位加密。
- `--print=full`: 允许打印。
## 线性化 (用于网页快速加载)
所谓的“Web 优化”，允许用户在下载完整个文件之前查看第一页。
```
qpdf --linearize input.pdf output.pdf
```
## 压缩/减小文件体积
虽然 `qpdf` 不是专门的图像压缩工具，但它可以压缩 PDF 的内部流对象。
```
qpdf --compress-streams=y --object-streams=generate input.pdf output.pdf
```
## 叠加 (Overlay) / 水印
将 `watermark.pdf` 的内容覆盖在 `input.pdf` 的每一页上：
```
qpdf input.pdf --overlay watermark.pdf --repeat=1-z -- output.pdf
```
## 查看 PDF 信息
不生成新文件，仅在终端查看 PDF 的基本信息（页数、加密状态等）：
```
qpdf --show-pages input.pdf
# 或者查看详细元数据
qpdf --show-encryption input.pdf
```
## 检查 PDF 是否损坏
```
qpdf --check input.pdf
```

| **参数**                      | **说明**                  |
| --------------------------- | ----------------------- |
| `--empty`                   | 创建一个空文档作为起点，常用于合并或提取。   |
| `--pages [file] [range] --` | 指定源文件和页面范围。`z` 代表最后一页。  |
| `--replace-input`           | 直接修改输入文件（谨慎使用）。         |
| `--decrypt`                 | 移除限制和密码。                |
| `--rotate=[angle]:[range]`  | 旋转页面 (支持 90, 180, 270)。 |
| `--password=...`            | 提供已加密文件的密码。             |

---

> 💡 小贴士：
> 
> 如果你在处理页面范围时感到困惑，记住 z 是你的好朋友。例如 5-z 表示从第 5 页到最后，z-1 表示倒序（从最后一页到第一页）。

**你想了解如何将这些命令整合进 Python 脚本或自动化工作流中吗？**