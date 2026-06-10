`git checkout` 是一个多功能命令，在 Git 2.23 之后部分功能被 `git switch` 和 `git restore` 替代，但依然广泛使用。常用选项分类如下：
### 1️⃣ 切换分支
| 选项                              | 说明                               |
| ------------------------------- | -------------------------------- |
| `<branch>`                      | 切换到已存在的本地分支                      |
| `-b <new-branch>`               | 创建新分支并立即切换                       |
| `-B <new-branch>`               | 强制创建新分支（如已存在则重置到当前 HEAD）         |
| `-b <new-branch> <start-point>` | 从指定起点（commit/tag/分支）创建新分支        |
| `--detach`                      | 切换到游离 HEAD 状态（基于某个 commit 或 tag） |
| `-t` / `--track`                | 创建新分支并设置上游跟踪（常与 `-b` 连用）         |
### 2️⃣ 恢复/放弃文件修改
| 选项                    | 说明                           |
| --------------------- | ---------------------------- |
| `-- <file>`           | 将工作区的文件恢复到索引（暂存区）的状态         |
| `<commit> -- <file>`  | 从指定提交中恢复文件到工作区（不影响 HEAD 或索引） |
| `--ours` / `--theirs` | 在合并冲突时，选择保留当前分支或对方分支的版本      |
| `-p` / `--patch`      | 交互式地选择性丢弃工作区修改（按 hunk 恢复）    |
### 3️⃣ 处理未提交修改的切换
| 选项                   | 说明                           |
| -------------------- | ---------------------------- |
| `-f` / `--force`     | 强制切换分支，丢弃工作区和暂存区的未提交修改       |
| `--merge`            | 切换时尝试将当前修改合并到新分支（遇冲突则阻止切换）   |
| `--conflict=<style>` | 合并冲突时指定冲突标记风格（merge 或 diff3） |
### 4️⃣ 查看/操作远程分支
| 选项                              | 说明                                                     |
| ------------------------------- | ------------------------------------------------------ |
| `--track`                       | 创建跟踪远程分支的本地分支（如 `git checkout --track origin/feature`） |
| `--no-track`                    | 创建分支时不自动设置上游跟踪                                         |
| `-b <branch> <remote>/<branch>` | 基于远程分支创建本地分支并设置跟踪（等价于 `-b` + `--track`）                |
### 5️⃣ 其他高级选项
| 选项                         | 说明                           |
| -------------------------- | ---------------------------- |
| `--orphan <new-branch>`    | 创建一个孤儿分支（无父提交，历史为空）          |
| `--ignore-other-worktrees` | 允许切换已被其他 worktree 使用的分支（需谨慎） |
| `--recurse-submodules`     | 切换时同步更新子模块                   |
| `--pathspec-from-file`     | 从文件读取路径规格（用于恢复文件）            |
### 📌 常见示例
```bash
git checkout main                 # 切换到 main 分支
git checkout -b feature/login     # 创建并切换到 feature/login
git checkout -b fix origin/fix    # 基于远程分支创建本地分支并跟踪
git checkout -- hello.txt         # 放弃工作区对 hello.txt 的修改
git checkout HEAD~2 -- file.c     # 从两个提交前恢复 file.c 到工作区
git checkout --merge develop      # 切换时尝试合并本地未提交的修改
git checkout --detach v1.0        # 切换到标签 v1.0 的游离状态
```
### ⚠️ 注意
- `git checkout -- <file>` 会**丢弃工作区修改**，无法恢复，小心使用。
- 在 Git 2.23+ 中，推荐分支切换用 `git switch`，恢复文件用 `git restore`，使意图更清晰。但 `checkout` 依然广泛存在于脚本和习惯中。