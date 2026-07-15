**rg（ripgrep）用法总结**  
（基于官方 GUIDE.md 精炼，核心命令行用法全覆盖）

### 1. 基本命令格式
```bash
rg <pattern> [path...]
```
- 默认递归搜索当前目录及子目录。
- 示例：
  - `rg fast` → 当前目录搜索 "fast"
  - `rg 'fn write\(' src/` → 只在 src 目录搜索 Rust 函数
  - `rg -F 'fn write('` → 用 `-F` 把模式当成普通字符串（不用转义）

### 2. 最常用选项（flags）
| 选项 | 作用 | 示例 |
|------|------|------|
| `-i` | 忽略大小写 | `rg -i fast` |
| `-S` | 智能大小写（推荐默认） | 模式有大写才区分大小写 |
| `-w` | 仅匹配整词 | `rg -w fast`（不匹配 faster） |
| `-F` | 固定字符串模式（不解析正则） | `rg -F 'a.b'` |
| `-n` | 显示行号（默认已开） | - |
| `-c` | 只显示匹配行数 | `rg -c TODO` |
| `-C N` | 显示上下文 N 行 | `rg -C 2 error` |
| `-o` | 只输出匹配部分 | `rg -o '\d+'` |
| `-a` | 把二进制文件也当成文本搜 | `rg -a password` |
| `-L` | 跟随符号链接 | `rg -L pattern` |
| `-u` / `-uu` / `-uuu` | 逐步解除忽略（gitignore → 隐藏文件 → 二进制） | `-uu` 最常用 |

### 3. 文件类型过滤（超级实用）
```bash
--type rust / -t rust          # 只搜 .rs 文件
--type-not rust                # 排除 Rust 文件
--type-add 'web:*.{html,css,js}'   # 自定义类型（本次命令有效）
--type-list                    # 查看所有支持类型
```
示例：`rg title -tweb`（只搜网页文件）

### 4. 忽略规则（默认行为）
- 自动尊重 `.gitignore`、`.ignore`、`.rgignore`
- 自动跳过隐藏文件和二进制文件
- 覆盖方式：
  - `-u` 关闭忽略
  - `--glob '!*.toml'` 手动排除
  - `.ignore` 文件里写 `!log/` 可白名单

### 5. 输出与格式控制
- `--color always/never/auto`
- `--heading`（默认）文件名分组显示
- `--max-columns 150` 截断超长行
- `-r '替换文本'` 替换输出（不改文件！）
  - 支持捕获组：`rg 'fast\s+(\w+)' -r 'fast-$1'`

### 6. 高级功能
- **多行搜索**：`-U` / `--multiline`
- **搜索压缩文件**：`-z`（gzip/bz2）
- **预处理器**（搜 PDF 等）：`--pre pdftotext --pre-glob '*.pdf'`
- **编码指定**：`-E utf-16` 或 `-E none`（原始字节）
- **只列文件不搜索**：`--files`
- **调试忽略**：`rg --debug`（看为什么某个文件被跳过）

### 7. 性能与配置小技巧
- 默认并行搜索，速度极快
- 全局配置：设置环境变量 `RIPGREP_CONFIG_PATH=~/.config/ripgrep/config`  
  里面可写常用选项：
  ```
  --smart-case
  --hidden
  --type-add 'log:*.log'
  ```

**最常用组合推荐**（直接复制粘贴）：
```bash
# 日常代码搜索
rg -S --hidden TODO

# 只看 Rust 文件里的错误
rg -t rust error

# 忽略大小写 + 上下文 + 只看匹配部分
rg -i -C 1 -o 'TODO|FIXME'

# 全局替换预览（不改文件）
rg 'old' -r 'new' -o
```

这样基本就把 `rg` 80% 的日常用法都覆盖了！  
想看更完整的帮助直接运行 `rg --help` 或 `man rg` 即可。需要我再给你做一个「一页纸 Cheat Sheet」版本吗？随时说～