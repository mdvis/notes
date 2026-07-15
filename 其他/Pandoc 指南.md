### 🚀 完整示例命令（推荐）

```bash
pandoc Android.md -o a.pdf \
  --pdf-engine=xelatex \
  -V mainfont="Noto Sans CJK SC"
```

如果你是 macOS 用户，也可以换成系统字体：

```bash
pandoc Android.md -o a.pdf \
  --pdf-engine=xelatex \
  -V mainfont="PingFang SC"
```

Windows 用户可以用：

```bash
pandoc Android.md -o a.pdf \
  --pdf-engine=xelatex \
  -V mainfont="SimSun"
```

Linux 用户常用：

```bash
pandoc Android.md -o a.pdf \
  --pdf-engine=xelatex \
  -V mainfont="WenQuanYi Micro Hei"
```

---

### 📦 如果还没安装字体

你可以先查看系统字体：

```bash
fc-list :lang=zh
```

然后挑一个支持中文的字体名称填到 `-V mainfont="..."` 里。

---

### 🧰 可选增强项（更美观）

```bash
pandoc Android.md -o a.pdf \
  --pdf-engine=xelatex \
  -V mainfont="Noto Sans CJK SC" \
  -V geometry:margin=1in \
  --toc \
  --highlight-style=espresso
```

---

是否希望我帮你生成一个 **可直接运行的模板命令 + 字体检测脚本（自动选中文字体）**？  
这样你下次直接运行一条命令就能生成中文 PDF。