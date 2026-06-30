`git show` 用于查看 Git 对象的详细内容，最常见的是查看某次提交（commit）的变更内容。

## 基本用法

### 查看最新一次提交

```bash
git show
```

等价于：

```bash
git show HEAD
```

输出内容包括：

- Commit ID
- Author
- Date
- Commit Message
- Diff（代码变更）

---

### 查看指定提交

```bash
git show <commit-id>
```

例如：

```bash
git show a1b2c3d
```

---

## 查看文件内容

### 查看某次提交中的文件

```bash
git show <commit-id>:<file>
```

例如：

```bash
git show HEAD:README.md
```

查看当前 HEAD 版本中的 README.md。

查看历史版本：

```bash
git show a1b2c3d:src/main.py
```

---

## 只看提交信息

### 单行摘要

```bash
git show --oneline
```

### 不显示 Diff

```bash
git show --no-patch
```

或：

```bash
git show -s
```

例如：

```bash
git show -s --format=fuller HEAD
```

---

## 自定义输出格式

### 查看作者和提交说明

```bash
git show -s --format="%h %an %ad %s"
```

常用占位符：

| 参数  | 含义           |
| ----- | -------------- |
| `%H`  | 完整 Commit ID |
| `%h`  | 短 Commit ID   |
| `%an` | 作者名         |
| `%ae` | 作者邮箱       |
| `%ad` | 日期           |
| `%s`  | 提交标题       |
| `%b`  | 提交正文       |

例如：

```bash
git show -s --format="%h %an %s"
```

输出：

```text
3f8c2ab Alice Fix login bug
```

---

## 查看某个 Tag

```bash
git show v1.0.0
```

显示：

- Tag 信息
- 对应 Commit
- Diff 内容

---

## 查看某个 Branch 指向的提交

```bash
git show main
```

显示 main 分支最新提交。

---

## 查看某个文件最近一次修改

```bash
git show HEAD~1 -- src/main.py
```

查看指定提交中该文件的变更。

---

## 仅显示统计信息

### 文件统计

```bash
git show --stat
```

示例：

```text
 src/main.py | 12 ++++++++----
 README.md   |  3 ++-
 2 files changed, 10 insertions(+), 5 deletions(-)
```

### 简略统计

```bash
git show --shortstat
```

输出：

```text
2 files changed, 10 insertions(+), 5 deletions(-)
```

---

## 查看 Merge Commit

```bash
git show <merge-commit-id>
```

显示 Merge 提交详情及合并结果。

只看提交信息：

```bash
git show --no-patch <merge-commit-id>
```

---

## 常用组合

### 查看最近一次提交详情

```bash
git show HEAD
```

### 查看指定提交但不看 Diff

```bash
git show -s <commit-id>
```

### 查看某次提交修改了哪些文件

```bash
git show --name-only <commit-id>
```

### 查看文件列表和状态

```bash
git show --name-status <commit-id>
```

输出示例：

```text
M src/main.py
A test/test_main.py
D old.sh
```

### 查看某文件历史版本内容

```bash
git show <commit-id>:path/to/file
```

---

## 与 `git log` 的区别

| 命令       | 用途                   |
| ---------- | ---------------------- |
| `git log`  | 查看提交历史           |
| `git show` | 查看某个对象的详细内容 |
| `git diff` | 比较两个版本差异       |

典型工作流：

```bash
git log --oneline
git show <commit-id>
```

先找到提交，再查看详细变更。

---

### 最实用的 5 个命令

```bash
git show                      # 最新提交详情
git show <commit>             # 指定提交详情
git show --stat <commit>      # 变更统计
git show --name-status HEAD   # 修改文件列表
git show <commit>:file.txt    # 查看历史文件内容
```

这几个已经覆盖了日常开发中约 90% 的 `git show` 使用场景。
