
## Getting Started

### Create a Repository

Create a new local repository

```shell script
$ git init [project name]
```

Clone a repository

```shell script
$ git clone git_url
```

Clone a repository into a specified directory

```shell script
$ git clone git_url my_directory
```

### Make a change {.row-span-2}

Show modified files in working directory, staged for your next commit

```shell script
$ git status
```

Stages the file, ready for commit

```shell script
$ git add [file]
```

Stage all changed files, ready for commit

```shell script
$ git add .
```

Commit all staged files to version history

```shell script
$ git commit -m "commit message"
```

Commit all your tracked files to version history

```shell script
$ git commit -am "commit message"
```

Discard changes in working directory which is not staged

```shell script
$ git restore [file]
```

Unstage a staged file or file which is staged

```shell script
$ git restore --staged [file]
```

Unstage a file, keeping the file changes

```shell script
$ git reset [file]
```

Revert everything to the last commit

```shell script
$ git reset --hard
```

Diff of what is changed but not staged

```shell script
$ git diff
```

Diff of what is staged but not yet committed

```shell script
$ git diff --staged
```

Apply any commits of current branch ahead of specified one

```shell script
$ git rebase [branch]
```

### Configuration

Set the name that will be attached to your commits and tags

```shell script
$ git config --global user.name "name"
```

Set an email address that will be attached to your commits and tags

```shell script
$ git config --global user.email "email"
```

Enable some colorization of Git output

```shell script
$ git config --global color.ui auto
```

Edit the global configuration file in a text editor

```shell script
$ git config --global --edit
```

### Working with Branches

List all local branches

```shell script
$ git branch
```

List all branches, local and remote

```shell script
$ git branch -av
```

Switch to my_branch, and update working directory

```shell script
$ git checkout my_branch
```

Create a new branch called new_branch

```shell script
$ git checkout -b new_branch
```

Delete the branch called my_branch

```shell script
$ git branch -d my_branch
```

Merge branchA into branchB

```shell script
$ git checkout branchB
$ git merge branchA
```

Tag the current commit

```shell script
$ git tag my_tag
```

### Observe your Repository

Show the commit history for the currently active branch

```shell script
$ git log
```

Show the commits on branchA that are not on branchB

```shell script
$ git log branchB..branchA
```

Show the commits that changed file, even across renames

```shell script
$ git log --follow [file]
```

Show the diff of what is in branchA that is not in branchB

```shell script
$ git diff branchB...branchA
```

Show any object in Git in human-readable format

```shell script
$ git show [SHA]
```

### Synchronize

Fetch down all the branches from that Git remote

```shell script
$ git fetch [alias]
```

Merge a remote branch into your current branch to bring it up to date

```shell script
$ git merge [alias]/[branch]
# No fast-forward
$ git merge --no-ff [alias]/[branch]
# Only fast-forward
$ git merge --ff-only [alias]/[branch]
```

Transmit local branch commits to the remote repository branch

```shell script
$ git push [alias] [branch]
```

Fetch and merge any commits from the tracking remote branch

```shell script
$ git pull
```

Merge just one specific commit from another branch to your current branch

```shell script
$ git cherry-pick [commit_id]
```

### Remote

Add a git URL as an alias

```shell script
$ git remote add [alias] [url]
```

Show the names of the remote repositories you've set up

```shell script
$ git remote
```

Show the names and URLs of the remote repositories

```shell script
$ git remote -v
```

Remove a remote repository

```shell script
$ git remote rm [remote repo name]
```

Change the URL of the git repo

```shell script
$ git remote set-url origin [git_url]
```

### Temporary Commits

Save modified and staged changes

```shell script
$ git stash
```

List stack-order of stashed file changes

```shell script
$ git stash list
```

Write working from top of stash stack

```shell script
$ git stash pop
```

Discard the changes from top of stash stack

```shell script
$ git stash drop
```

### Tracking path Changes

Delete the file from project and stage the removal for commit

```shell script
$ git rm [file]
```

Change an existing file path and stage the move

```shell script
$ git mv [existing-path] [new-path]
```

Show all commit logs with indication of any paths that moved

```shell script
$ git log --stat -M
```

### Ignoring Files

```
/logs/*

# "!" means don't ignore
!logs/.gitkeep

/# Ignore Mac system files
.DS_store

# Ignore node_modules folder
node_modules

# Ignore SASS config files
.sass-cache
```

A `.gitignore` file specifies intentionally untracked files that Git should ignore

## Git Tricks

### Rename branch

- #### **Renamed** to `new_name`
  ```shell script
  $ git branch -m <new_name>
  ```
- #### **Push** and reset
  ```shell script
  $ git push origin -u <new_name>
  ```
- #### **Delete** remote branch
  ```shell script
  $ git push origin --delete <old>
  ```
  {.marker-timeline}

### Log

Search change by content

```shell script
$ git log -S'<a term in the source>'
```

Show changes over time for specific file

```shell script
$ git log -p <file_name>
```

Print out a cool visualization of your log

```shell script {.wrap}
$ git log --pretty=oneline --graph --decorate --all
```

### Branch {.row-span-2}

List all branches and their upstreams

```shell script
$ git branch -vv
```

Quickly switch to the previous branch

```shell script
$ git checkout -
```

Get only remote branches

```shell script
$ git branch -r
```

Checkout a single file from another branch

```shell script
$ git checkout <branch> -- <file>
```

### Rewriting history

Rewrite last commit message

```shell script
$ git commit --amend -m "new message"
```

Amend the latest commit without changing the commit message.

```shell script
$ git commit --amend --no-edit
```

See also: [Rewriting history](https://www.atlassian.com/git/tutorials/rewriting-history)

### Git Aliases

```cmd
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
```

See also: [More Aliases](https://gist.github.com/johnpolacek/69604a1f6861129ef088)

## Advanced Git

### Submodules

Create a new submodule within your repository:

```shell script
$ git submodule add <repository_url> <path>
```

Clone a repository and initialize its submodules:

```shell script
$ git clone --recursive <repository_url>
```

Update all the submodules in your repository to the latest commit of their respective branches:

```shell script
$ git submodule update
```

Pull the latest changes from the remote repositories of the submodules and update them in your main repository:

```shell script
$ git submodule update --remote
```

Remove a submodule from your repository:

```shell script
$ git submodule deinit <path>
$ git rm <path>
$ git commit -m "Removed submodule"
```

### Cherry-picking

Cherry-picking allows you to apply a specific commit from one branch to another branch.

```shell script
$ git cherry-pick <commit_hash>
```

### Reflog

Display the reflog, showing the history of HEAD and branch movements:

```shell script
$ git reflog
```

Find the hash of the lost commit or branch using the reflog and then checkout to that hash to restore it:

```shell script
$ git checkout <commit_or_branch_hash>
```
这是一个 Git 过滤分支命令，用于从整个 Git 历史记录中永久删除特定文件。让我详细解释每个部分：

## 命令结构分解

```bash
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch 文件路径' \
--prune-empty --tag-name-filter cat -- --all
```

### 1. 主要命令
- `git filter-branch`: 重写 Git 历史记录的核心命令
- `--force`: 强制运行，即使存在备份或之前的过滤操作

### 2. 过滤器类型
- `--index-filter`: 只操作暂存区（索引），不检出文件到工作目录，速度更快

### 3. 删除操作
```bash
'git rm --cached --ignore-unmatch 文件路径'
```
- `git rm --cached`: 从版本控制中删除文件，但保留本地文件
- `--ignore-unmatch`: 如果文件不存在，不报错继续执行
- `文件路径`: 要删除的文件路径（可以是具体文件或通配符）

### 4. 清理选项
- `--prune-empty`: 自动删除因文件删除而变成空的提交
- `--tag-name-filter cat`: 更新标签指向新的提交（cat 表示保持标签名不变）

### 5. 作用范围
- `-- --all`: 对所有分支和标签进行操作

## 使用示例

```bash
# 删除单个文件
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch sensitive-data.txt' \
--prune-empty --tag-name-filter cat -- --all

# 删除整个目录
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch -r logs/' \
--prune-empty --tag-name-filter cat -- --all

# 使用通配符删除特定类型文件
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch *.jpg' \
--prune-empty --tag-name-filter cat -- --all
```

## 注意事项

1. **永久性操作**: 这会重写整个 Git 历史，改变所有提交的 SHA 值
2. **备份重要**: 操作前务必备份仓库
3. **协作影响**: 如果仓库已共享，需要所有协作者重新克隆
4. **后续清理**: 执行后需要运行垃圾回收来彻底清除文件

```bash
# 操作后的清理
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

这个命令常用于删除误提交的敏感信息（如密码、密钥）或大文件。

好的，我们来详细解释一下这个命令：

```bash
git push origin master --force --all
```

这个命令由几个部分组成，其中一些是**冗余和矛盾**的，所以理解每个部分的作用至关重要。

### 命令分解

1.  **`git push`**
    *   这是 Git 的基本命令，用于将本地仓库的提交上传到远程仓库。

2.  **`origin`**
    *   这是远程仓库的别名，通常指向你最初克隆下来的那个仓库的 URL。

3.  **`master`**
    *   这是你希望推送的**本地分支名**。这里指定了 `master` 分支（在许多现代项目中，主分支可能叫 `main`）。

4.  **`--force`**（或 `-f`）
    *   这是命令中**最危险**的部分。它强制用你本地分支的状态**覆盖**远程分支。
    *   **工作原理**：正常情况下，`git push` 会检查远程分支是否有你本地还没有的新提交。如果有，Git 会拒绝推送，要求你先执行 `git pull` 来合并这些新提交。`--force` 选项会忽略这种检查，直接让远程分支变得和你的本地分支一模一样。
    *   **风险**：如果远程分支上有其他人推送的、你本地没有的提交，这些提交将被**永久丢失**。因此，只有在绝对确定的情况下才使用它。

5.  **`--all`**
    *   这个选项告诉 Git 推送**所有本地分支**到远程仓库。如果远程仓库不存在对应的分支，则会创建它们。

---

### 关键矛盾：`master` 与 `--all`

现在我们来分析这个命令的核心问题：**`master` 和 `--all` 是互斥的**。

*   当你指定一个分支名（如 `master`）时，你是在说：“我只想推送这一个分支”。
*   当你使用 `--all` 时，你是在说：“我想推送所有分支”。

**Git 会如何处理这个矛盾？**
Git 的规则是：**如果显式指定了分支名，则 `--all` 选项会被忽略。**

### 所以，这个命令的实际效果是：

它等价于：

```bash
git push origin master --force
```

**含义：强制用本地 `master` 分支覆盖远程 `origin` 仓库的 `master` 分支。`--all` 选项在此命令中不起任何作用。**

---

### 你可能想表达的意思及正确用法

1.  **如果你想强制推送 `master` 分支（例如，在 rebase 之后）**
    *   **正确命令**：`git push origin master --force`
    *   或者更安全的选择，使用 `--force-with-lease`，它在强制推送前会检查远程分支是否已被其他人更新，从而避免覆盖他人的工作：
        ```bash
        git push origin master --force-with-lease
        ```

2.  **如果你想强制推送所有本地分支**
    *   **正确命令**：`git push origin --force --all`
    *   **警告**：这非常危险！它会用你本地所有分支的状态去覆盖远程所有同名分支。这可能会破坏团队中其他成员正在工作的多个分支。

### 总结

| 命令 | 实际效果 | 风险等级 |
| :--- | :--- | :--- |
| `git push origin master --force --all` | **只**强制推送 `master` 分支。`--all` 被忽略。 | **高**（对 `master` 分支） |
| `git push origin master --force` | 强制推送 `master` 分支。 | **高**（对 `master` 分支） |
| `git push origin --force --all` | 强制推送**所有**本地分支。 | **极高**（对所有分支） |

**最佳实践建议：**
*   **尽量避免使用 `--force`**。优先考虑 `git pull --rebase` 来整理历史记录。
*   如果必须强制推送，**优先使用 `--force-with-lease`**，因为它更安全。
*   在推送前，务必**清楚知道你要覆盖什么**。在团队协作的环境中，强制推送必须经过沟通和同意。
*   理解 `--all` 选项的含义，并谨慎使用。
这段代码是一系列用于深度清理和优化 Git 仓库的命令，主要用于**永久删除历史记录**和**回收存储空间**。以下是逐行解释：

## 命令详解

### 1. `rm -rf .git/refs/original/`
- **作用**: 删除 Git 过滤操作时创建的原始引用备份
- **说明**: 当使用 `git filter-branch` 等重写历史的命令时，Git 会备份原始引用到这个目录
- **风险**: 直接删除文件系统上的 Git 数据

### 2. `git reflog expire --expire=now --all`
- **作用**: 立即使所有 reflog 记录过期
- **reflog**: Git 的记录日志，包含 HEAD、分支等的变更历史
- `--expire=now`: 设置过期时间为"现在"
- `--all`: 应用于所有引用
- **效果**: 标记所有 reflog 记录为可删除状态

### 3. `git gc --prune=now`
- **作用**: 执行垃圾回收并立即修剪过期对象
- `gc` (garbage collection): Git 的垃圾回收机制
- `--prune=now`: 立即删除已过期的松散对象
- **效果**: 清理第一步中标记的 reflog 记录对应的实际对象

### 4. `git gc --aggressive --prune=now`
- **作用**: 进行更激进的垃圾回收优化
- `--aggressive`: 使用更耗时的优化算法，产生更优的压缩效果
- **效果**: 进一步压缩仓库大小，优化存储结构

## 使用场景

这种操作通常用于：
- **永久删除敏感数据**（如密码、密钥）
- **清理误提交的大文件**
- **深度优化仓库体积**
- **重写历史记录后彻底清理**

## ⚠️ 重要警告

1. **数据不可恢复**: 执行后历史记录将永久丢失
2. **影响协作**: 如果仓库已共享，会与其他人的仓库产生冲突
3. **备份建议**: 执行前务必备份仓库
4. **适用场景**: 主要用于本地仓库或确定需要永久清理的情况

## 替代方案

对于更安全的清理，可以考虑：
```bash
# 使用 git filter-repo（更现代的工具）
git filter-repo --invert-paths --path PATH_TO_REMOVE

# 或使用 BFG Repo-Cleaner
bfg --delete-files FILE_TO_REMOVE
```

这些命令组合起来是一个"核选项"，应谨慎使用。

好的，.git 目录是 Git 版本控制系统的核心，它是一个隐藏目录，位于你的 Git 工作区的根目录下。这个目录包含了项目所有的版本历史、配置、分支信息等元数据。

**重要警告**：除非你非常清楚自己在做什么，否则**不要手动修改或删除**.git 目录内的任何文件。这可能会导致你的版本历史丢失或仓库损坏。

下面我们来详细说明 .git 目录下的主要文件和文件夹。

### 核心目录和文件结构

一个典型的 .git 目录结构如下：

```
.git/
├── HEAD
├── config
├── description
├── hooks/
├── info/
│   └── exclude
├── objects/
│   ├── info/
│   └── pack/
├── refs/
│   ├── heads/
│   └── tags/
└── index
```

---

### 详细说明

#### 1. **HEAD** (文件)
*   **作用**：指向当前你正在工作的**分支**，或者一个特定的**提交**（“分离头指针”状态）。
*   **内容示例**：
    *   在 `main` 分支上时：`ref: refs/heads/main`
    *   在分离头指针状态时：一个具体的提交哈希值，如 `a1b2c3d4...`

#### 2. **config** (文件)
*   **作用**：存放当前仓库的**本地配置**。这些配置会覆盖全局的 Git 配置（`~/.gitconfig`）。
*   **常见配置**：
    *   用户姓名和邮箱
    *   远程仓库的地址（URL）
    *   分支的上游跟踪关系（upstream）
    *   各种别名（alias）
*   **查看命令**：`git config --local --list`

#### 3. **objects/** (目录)
*   **作用**：这是 Git 的**对象数据库**，是 Git 的核心。所有文件内容、提交、目录树等都作为对象存储在这里。
*   **工作原理**：Git 将内容（文件数据、提交信息等）通过 SHA-1 算法生成一个唯一的 40 位哈希值。这个哈希值的前两位用作目录名，后 38 位用作文件名，存储在该目录下。
*   **子目录**：
    *   `info/`：包含一些附加信息。
    *   `pack/`：为了节省空间和效率，Git 会将很多松散的对象打包成 `.pack` 文件（数据包）和 `.idx` 文件（索引）。

#### 4. **refs/** (目录)
*   **作用**：存放**引用**（指针），这些引用指向具体的提交对象。
*   **子目录**：
    *   `heads/`：存放**本地分支**的引用。每个文件代表一个分支，文件名是分支名，文件内容是该分支最新提交的 SHA-1 哈希值。
        *   例如：`refs/heads/main` 文件的内容就是 `main` 分支的顶端提交。
    *   `tags/`：存放**标签**的引用。每个文件代表一个标签。
    *   `remotes/`：存放从远程仓库抓取下来的**远程跟踪分支**的引用。
        *   例如：`refs/remotes/origin/main` 记录了上次与远程仓库 `origin` 通信时，它的 `main` 分支的位置。

#### 5. **index** (文件)
*   **作用**：这就是我们常说的 **暂存区** 或 **缓存**。它是一个二进制文件，保存了下次将要提交的文件列表信息（文件的路径、SHA-1 值、时间戳等）。当你执行 `git add` 时，文件的信息就被写入 index 文件。

#### 6. **hooks/** (目录)
*   **作用**：存放**客户端或服务端的钩子脚本**。这些脚本可以在特定的 Git 操作（如提交、推送、接收等）前后自动触发，用于实现自定义逻辑，如代码检查、测试、部署等。
*   **示例**：`pre-commit`（提交前执行）、`post-receive`（推送到服务端后执行）。默认的脚本文件都以 `.sample` 结尾，需要移除后缀才能生效。

#### 7. **info/** (目录)
*   **作用**：存放一些不希望在 `.gitignore` 文件中管理的全局性排除模式。
*   **重要文件**：
    *   `exclude`：功能类似于 `.gitignore`，但只对当前本地仓库有效，且不会被提交和共享给其他协作者。

#### 8. **packed-refs** (文件)
*   **作用**：为了提高效率，Git 有时会将 `refs/` 目录下的大量松散引用打包压缩到这个单一文件中。格式为：一行是哈希值，下一行是引用路径。

#### 9. **logs/** (目录)
*   **作用**：记录所有引用（分支、HEAD）的**变更历史**。这个目录是实现 `git reflog` 命令的基础，它让你能够找回“丢失”的提交（比如误删分支或重置）。
*   **文件**：
    *   `logs/HEAD`：记录 HEAD 的移动历史。
    *   `logs/refs/heads/`：记录各个本地分支的历史。

#### 10. **COMMIT_EDITMSG** (文件)
*   **作用**：保存你**最后一次提交的注释信息**。如果提交时因为注释格式问题需要重新编辑，Git 会从这个文件中读取上次输入的内容。

---

### 总结

| 路径 | 核心作用 | 类比 |
| :--- | :--- | :--- |
| `HEAD` | 指向当前检出的分支或提交 | 你当前正在阅读的书页 |
| `config` | 项目特定的配置 | 这本书的阅读笔记和书签设置 |
| `objects/` | 存储所有数据（文件快照、提交信息） | 书的全部内容（所有章节、版本）的仓库 |
| `refs/heads/` | 存储本地分支指针 | 每个章节的目录页 |
| `refs/tags/` | 存储标签指针 | 重要的书签或高亮标记 |
| `index` | 暂存区，准备下次提交的内容 | 你正在编辑、准备提交的草稿页 |
| `hooks/` | 特定事件触发的自定义脚本 | 自动化工具（如自动校对、排版） |
| `logs/` | 引用移动的历史记录 | 你的阅读历史记录 |

简单来说，**.git 目录就是你的项目仓库**，而你的工作目录只是这个仓库的一个“当前视图”。理解 .git 目录的结构，能帮助你更深入地理解 Git 的工作原理。