**`git filter-repo`** 是 Git 官方推荐的用于重写仓库历史记录的工具，比 `git filter-branch` 更快、更安全、功能更强大。它常用于移除大文件、删除敏感信息、提取子目录、路径重命名、替换文本等操作。

### 重要提醒
- **破坏性操作**：它会重写历史，**务必在干净的 fresh clone 上操作**（否则会拒绝运行，可用 `--force` 强制）。
- 操作后通常需要 `git push --force` 到远程。
- 先用 `--analyze` 分析仓库（生成报告，帮助决定过滤内容）。

### 安装
通常从 GitHub 下载单个 Python 脚本 `git-filter-repo` 放入 `$PATH`，或通过包管理器安装（需 Python 3.6+ 和 Git 2.36+）。

### 常见用法（Examples）

1. **只保留特定路径（提取子目录）**：
   ```bash
   git filter-repo --path src/
   ```
   只保留 `src/` 下的文件和相关历史。

2. **删除特定文件/目录（从历史中彻底移除）**：
   ```bash
   git filter-repo --path largefile.zip --invert-paths
   # 或删除多个
   git filter-repo --path secrets.txt --path *.log --invert-paths
   ```

3. **路径重命名**：
   ```bash
   # 重命名目录
   git filter-repo --path-rename olddir/:newdir/
   
   # 移动所有内容到子目录
   git filter-repo --to-subdirectory-filter my-module/
   ```

4. **提取子目录并作为新根**：
   ```bash
   git filter-repo --subdirectory-filter module/
   ```

5. **移除大文件**：
   ```bash
   git filter-repo --strip-blobs-bigger-than 10M
   ```

6. **替换敏感文本**（密码、API Key 等）：
   创建 `replacements.txt`：
   ```
   password123==>***REMOVED***
   regex:\bsecret\b==>REDACTED
   ```
   然后：
   ```bash
   git filter-repo --replace-text replacements.txt
   ```

7. **重命名 Tag**：
   ```bash
   git filter-repo --tag-rename '':'my-module-'
   ```

8. **分析仓库**（推荐先做）：
   ```bash
   git filter-repo --analyze
   ```
   生成 `.git/filter-repo/analysis/` 下的报告。

9. **结合使用**（常见场景：提取 + 重命名 + tag）：
   ```bash
   git filter-repo --path src/ --to-subdirectory-filter my-module --tag-rename '':'my-module-'
   ```

### 常见选项（Path Filtering）

| 选项 | 说明 |
|------|------|
| `--path <dir_or_file>` / `--path-match` | 精确路径（可多个，取并集） |
| `--path-glob <glob>` | glob 匹配（如 `*.log`） |
| `--path-regex <regex>` | 正则匹配 |
| `--invert-paths` | **反选**（保留未匹配的路径，常用于删除） |
| `--use-base-name` | 只匹配文件名（而非完整路径），与 `--path-rename` 不兼容 |
| `--paths-from-file <file>` | 从文件读取大量过滤/重命名规则（支持 literal/glob/regex 和 `==>` 重命名） |
| `--subdirectory-filter <dir>` | 提取子目录并作为新根 |
| `--to-subdirectory-filter <dir>` | 把整个仓库内容移到子目录下 |

### 常见选项（Renaming & Content）

| 选项 | 说明 |
|------|------|
| `--path-rename <old:new>` | 路径重命名（支持目录） |
| `--replace-text <file>` | 替换文件内容中的文本 |
| `--replace-message <file>` | 替换 commit/tag message |
| `--strip-blobs-bigger-than <size>` | 移除超过指定大小的文件（支持 K/M/G） |
| `--strip-blobs-with-ids <file>` | 根据 blob ID 列表移除文件 |
| `--tag-rename <old:new>` | 重命名 tag 前缀 |
| `--mailmap <file>` / `--use-mailmap` | 使用 mailmap 重写作者/提交者信息 |

### 其他实用选项

- `--force` / `-f`：强制运行（忽略 fresh clone 检查）。
- `--prune-empty {always,auto,never}`：控制是否删除因过滤变空的 commit（默认 auto）。
- `--preserve-commit-hashes`：不更新 commit message 中的旧 hash 引用。
- `--analyze`：仅分析，不修改仓库。
- Callback 高级用法（如 `--filename-callback`、`--message-callback` 等）：用 Python 代码自定义过滤逻辑。

### 最佳实践
- **总是先 clone 一个干净副本** 操作。
- 操作后运行 `git reflog expire --expire=now --all && git gc --prune=now` 清理。
- 多步操作时可连续运行 `git filter-repo`（它会基于当前状态继续）。
- 查看完整文档：`git filter-repo --help` 或官方手册。

更多示例可参考官方手册的 **EXAMPLES** 部分或 GitHub 项目。

有具体场景（如移除某个文件、拆分子仓库等）可以提供更多细节，我可以给出精确命令！