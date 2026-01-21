# Git 必备命令参考手册

## 🚀 日常开发核心命令（必须精通）

### 基础操作
- **`git init`** - 初始化新仓库
- **`git clone`** - 克隆远程仓库
- **`git status`** - 查看工作区状态
- **`git diff`** - 查看文件差异

### 提交流程
- **`git add`** - 添加文件到暂存区
- **`git commit`** - 提交更改
- **`git push`** - 推送到远程仓库
- **`git pull`** - 拉取远程更新

### 分支管理
- **`git branch`** - 分支管理（创建、删除、列表）
- **`git checkout`** - 切换分支或恢复文件
- **`git merge`** - 合并分支

## 🔧 进阶命令（建议熟练）

### 历史和日志
- **`git log`** - 查看提交历史
- **`git reset`** - 重置提交（软重置/硬重置）
- **`git revert`** - 创建反向提交撤销更改

### 远程操作
- **`git remote`** - 管理远程仓库
- **`git fetch`** - 获取远程更新（不合并）

### 临时存储
- **`git stash`** - 临时存储未提交的更改

## ⚡ 专业技能命令（按需掌握）

### 高级分支操作
- **`git rebase`** - 变基操作，整理提交历史
- **`git cherry-pick`** - 挑选特定提交

### 文件恢复
- **`git restore`** - 恢复文件（Git 2.23+新命令）
- **`git clean`** - 清理未跟踪文件

### 项目管理
- **`git tag`** - 标签管理
- **`git submodule`** - 子模块管理
- **`git worktree`** - 工作树管理

### 调试和维护
- **`git bisect`** - 二分查找定位问题
- **`git grep`** - 在Git仓库中搜索
- **`git config`** - 配置Git设置

### 高级功能
- **`git subtree`** - 子树管理（替代submodule）
- **`git archive`** - 创建项目归档

## 📊 优先级建议

### 🔴 必须掌握（核心 8 个）
1. `clone`, `init`
2. `status`, `diff`  
3. `add`, `commit`
4. `push`, `pull`

### 🟡 应该掌握（进阶 8 个）
1. `branch`, `checkout`, `merge`
2. `log`, `reset`, `revert`
3. `remote`, `fetch`

### 🟢 可选掌握（专业 11 个）
根据工作需要学习：`rebase`, `stash`, `cherry-pick`, `restore`, `clean`, `tag`, `config`, `grep`, `bisect`, `submodule`, `worktree`, `subtree`, `archive`

## 💡 学习路径建议

1. **第一周**：熟练掌握红色标记的8个核心命令
2. **第二周**：学习黄色标记的8个进阶命令
3. **后续**：根据实际工作场景，按需学习绿色标记的专业命令

## 🎯 实际应用场景

- **日常开发**：主要使用前16个命令
- **团队协作**：重点掌握分支操作和远程同步
- **项目维护**：需要了解标签、子模块等高级功能
- **问题排查**：bisect、grep等调试命令很有用

---

*建议将此文档保存并定期复习，根据实际使用频率调整学习重点*