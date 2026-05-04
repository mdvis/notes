## `git status`用来查看工作区和暂存区的状态，常用选项可以按**人类友好**（可读性强）和**脚本友好**（适合自动化解析）两类来理解。

## 一、人类友好（日常使用）

这些选项输出格式清晰、带颜色提示，适合直接在终端阅读。

### 1. 基础用法

```
git status
```

显示：

- 当前分支
- 是否有未跟踪文件
- 已修改但未暂存的文件
- 已暂存待提交的文件

---

### 2. 简洁模式

```
git status -s
# 或
git status --short
```

示例输出：

```
M src/main.java
A  README.md
?? test.txt
```

含义说明：

- `M`：已修改（左侧表示暂存区，右侧表示工作区）
- `A`：新增到暂存区
- `??`：未跟踪文件

---

### 3. 忽略子模块状态

```
git status --ignore-submodules
```

## 适合子模块较多、不想被干扰的场景。

### 4. 显示未跟踪文件

```
git status -u
# 或
git status --untracked-files
```

可选参数：

- `-uno`：不显示未跟踪文件
- `-uall`：显示所有未跟踪文件（包括目录下的）

---

### 5. 显示分支跟踪信息

```
git status -b
# 或
git status --branch
```

会在开头显示：

```
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
```

---

## 二、脚本友好（自动化 / CI）

这些选项强调**稳定输出、可解析性**，适合在脚本或 CI 中使用。

### 1. 机器可读格式

```
git status --porcelain
```

特点：

- 输出格式固定
- 不受语言环境、颜色影响
- 每一行格式统一，方便 `awk / grep`

示例：

```
M foo.txt
A  bar.txt
?? baz.txt
```

---

### 2. 更严格的机器格式（推荐）

```
git status --porcelain=v2
```

特点：

- 明确字段定义
- 支持更多状态信息
- 更适合脚本精确解析

示例（片段）：

```
1 .M N... 100644 100644 100644 foo.txt
```

## 字段含义可通过 `git help status`查看。

### 3. 仅判断是否有变更（无输出）

```
git status --porcelain | grep -q .
```

常用于 CI 判断：

```
if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is dirty"
fi
```

---

### 4. 只关心特定路径

```
git status -- path/to/file
```

## 脚本中限定检查范围，减少噪音。

## 三、常见组合速查

| 场景              | 推荐命令                         |
| ----------------- | -------------------------------- |
| 日常查看          | `git status`                     |
| 快速概览          | `git status -s`                  |
| CI 判断是否有改动 | `git status --porcelain`         |
| 脚本精确解析      | `git status --porcelain=v2`      |
| 忽略子模块        | `git status --ignore-submodules` |

如果你有具体使用场景（比如：只想看是否有未提交改动、或只关心某个目录），我可以帮你给出最合适的一条命令。

