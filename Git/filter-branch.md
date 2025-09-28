`git filter-branch`是Git中一个强大但危险的命令，用于批量修改历史提交记录。它可以重写提交历史，例如修改作者信息、删除敏感文件、修改提交信息等。由于直接修改历史记录，该命令会改变提交的哈希值，因此**仅适用于未推送至远程的本地分支**，或在团队协作中与所有人协调后使用。
### **1. 核心原理**
- **遍历历史提交**：`git filter-branch`会递归遍历指定范围内的所有提交。
- **应用过滤器**：对每个提交应用指定的过滤器（如修改文件内容、删除文件等）。
- **生成新提交**：基于过滤器的结果创建新的提交对象，每个新提交的哈希值都会改变。
- **更新引用**：最后更新分支引用，指向新的提交历史。
### **2. 基本语法**
```bash
git filter-branch [--<filter-type> <args>] [<rev-list options>] -- <branches>
```
- **常用过滤器**：
  - `--commit-filter`：修改提交信息（如作者、日期）。
  - `--tree-filter`：修改提交的文件树（如删除文件）。
  - `--index-filter`：类似`tree-filter`，但性能更高。
  - `--env-filter`：修改提交的环境变量（如`GIT_AUTHOR_NAME`）。
- **修订范围**：例如`HEAD`（所有提交）、`master`（仅`master`分支）。
### **3. 常见使用场景**
#### **场景1：删除敏感文件**
假设你意外提交了包含密码的`config.ini`文件：
```bash
git filter-branch --tree-filter 'rm -f config.ini' HEAD
```
- **说明**：递归删除所有提交中的`config.ini`文件。
- **优化**：使用`--index-filter`提升性能：
  ```bash
  git filter-branch --index-filter 'git rm --cached --ignore-unmatch config.ini' HEAD
  ```
#### **场景2：修改作者信息**
将所有提交的作者从`old@example.com`改为`new@example.com`：
```bash
git filter-branch --env-filter '
    if [ "$GIT_AUTHOR_EMAIL" = "old@example.com" ]; then
        GIT_AUTHOR_EMAIL="new@example.com";
        GIT_AUTHOR_NAME="New Name";
    fi
    if [ "$GIT_COMMITTER_EMAIL" = "old@example.com" ]; then
        GIT_COMMITTER_EMAIL="new@example.com";
        GIT_COMMITTER_NAME="New Name";
    fi
' --tag-name-filter cat -- --all
```
- **参数说明**：
  - `--tag-name-filter cat`：保留标签引用。
  - `-- --all`：处理所有分支和标签。
#### **场景3：修改提交信息**
将所有包含`"fix typo"`的提交信息替换为`"Fix typo"`：
```bash
git filter-branch --msg-filter '
    sed "s/fix typo/Fix typo/g"
' HEAD
```
#### **场景4：重命名根目录下的文件夹**
将`src/`重命名为`source/`：
```bash
git filter-branch --tree-filter '
    if [ -d "src" ]; then
        mv src source
    fi
' HEAD
```
### **4. 高级过滤器**
#### **`--commit-filter`**
自定义提交处理逻辑，例如跳过特定提交：
```bash
git filter-branch --commit-filter '
    if [ "$GIT_COMMITTER_NAME" = "Unwanted Author" ]; then
        skip_commit "$@";
    else
        git commit-tree "$@";
    fi
' HEAD
```
#### **`--subdirectory-filter`**
将子目录提升为根目录，删除其他所有内容：
```bash
git filter-branch --subdirectory-filter my-app HEAD
```
- **场景**：从大型仓库中提取子项目为独立仓库。
### **5. 安全与恢复**
#### **备份引用**
`git filter-branch`会创建原始提交的备份引用，存储在`refs/original/`中：
```bash
ls .git/refs/original/
```
若操作失误，可通过以下命令恢复：
```bash
git reset --hard refs/original/refs/heads/master
```
#### **使用`--dry-run`测试**
在实际执行前，先预览修改效果：
```bash
git filter-branch --dry-run --tree-filter 'rm -f secret.txt' HEAD
```
#### **处理标签**
若需要更新标签，使用`--tag-name-filter cat`参数：
```bash
git filter-branch --tag-name-filter cat -- --all
```
### **6. 性能优化**
- **使用`--index-filter`**：直接操作Git索引，比`--tree-filter`更快。
- **限制修订范围**：只处理必要的提交，例如：
  ```bash
  git filter-branch ... master~10..master  # 只处理最近10个提交
  ```
- **使用`--prune-empty`**：自动删除空提交：
  ```bash
  git filter-branch --prune-empty ...
  ```
### **7. 替代方案**
由于`git filter-branch`性能较差且容易出错，Git 2.20+ 推荐使用以下替代命令：
#### **`git filter-repo`**
（需单独安装，功能更强大）
```bash
# 删除敏感文件
git filter-repo --path config.ini --invert-paths

# 修改作者邮箱
git filter-repo --replace-refs delete-no-add --email-callback '
    return email if email == b"new@example.com" else b"old@example.com"
'
```
#### **`git rebase -i`**
对于少量提交的修改，使用交互式变基更安全：
```bash
git rebase -i HEAD~5  # 修改最近5个提交
```
### **8. 风险警告**
- **不可逆操作**：修改历史后，旧提交无法直接访问（除非通过`refs/original`）。
- **团队协作冲突**：若已推送至远程，强制推送重写的历史会导致协作者的仓库与远程冲突。
- **性能问题**：处理大型仓库时可能非常缓慢。
### **总结**
`git filter-branch`是一个强大但危险的工具，适用于需要彻底清理或重构项目历史的场景。使用前务必备份仓库，并优先考虑使用`git filter-repo`或`git rebase`等更安全的替代方案。在团队环境中，修改历史记录前需与所有协作者沟通确认。