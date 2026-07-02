`git show` 是 Git 中非常强大的命令，主要用于**显示 commit、tag、tree、blob 等对象的内容**。
## 1. 最常用基础用法

| 命令                       | 说明                                                               |
| ------------------------ | ---------------------------------------------------------------- |
| `git show`               | 显示当前 HEAD 的 commit 信息（含 diff）commitId,author,date,commitMsg,diff |
| `git show <tag-name>`    | tab,commit,diff                                                  |
| `git show HEAD`          | 同上                                                               |
| `git show HEAD~1`        | 显示上一个 commit                                                     |
| `git show <commit-hash>` | 显示指定 commit（如 `git show a1b2c3d`）                                |
| `git show branch-name`   | 显示某个分支最新 commit                                                  |
### 2. 查看特定文件内容（超级常用）
```bash
# 查看某次 commit 中某个文件的内容
git show <commit>:<文件名>

# 示例
git show HEAD~2:src/app.js
git show a1b2c3d:README.md
git show origin/main:package.json
```
### 3. 常用选项（强烈推荐记住）

| 选项                | 作用                                     |
| ----------------- | -------------------------------------- |
| `-p` / `--patch`  | 显示 patch（默认行为）                         |
| `--stat`          | 只显示文件改动统计                              |
| `--name-only`     | 只显示修改的文件名                              |
| `--name-status`   | 显示文件名和状态（A/M/D 等）                      |
| `-S <关键词>`        | 显示代码中添加/删除该关键词的 commit（pickaxe search） |
| `-G <正则>`         | 显示代码改动匹配正则的 commit                     |
| `--oneline`       | 简洁显示 commit 信息                         |
| `--pretty=fuller` | 显示更完整的 commit 信息                       |
| `--no-patch`      |                                        |
| `-s`              |                                        |
| `--format`        |                                        |
| `--shortstat`     |                                        |
format 常用占位符：

| 参数    | 含义           |
| ----- | ------------ |
| `%H`  | 完整 Commit ID |
| `%h`  | 短 Commit ID  |
| `%an` | 作者名          |
| `%ae` | 作者邮箱         |
| `%ad` | 日期           |
| `%s`  | 提交标题         |
| `%b`  | 提交正文         |
**组合示例**：
```bash
# 最推荐的查看方式
git show --stat HEAD
git show --name-only HEAD
git show --oneline -S "login"          # 查找改动过 login 关键词的 commit
git show -p --stat a1b2c3d             # 同时显示统计和详细 diff
```

### 4. 其他实用场景

```bash
# 查看某个 tag 的信息
git show v1.2.3

# 查看 stash
git show stash@{0}

# 查看 merge commit 的两边差异
git show --first-parent HEAD          # 只看主线
git show -m HEAD                      # 显示 merge 的两边 diff

# 比较两个 commit 中某个文件的差异
git show commit1:文件 commit2:文件    # （老版本写法）
# 推荐用：
git diff commit1 commit2 -- 文件
```

### 5. 日常推荐别名（建议加入 ~/.gitconfig）

```ini
[alias]
    s = show --stat
    sn = show --name-only
    sd = show --stat -p
    sl = show --oneline
```

使用后就可以这样操作：

- `git s` → 看当前 commit 的改动统计
- `git sn` → 只看修改的文件列表

---

**你最常用 `git show` 做什么场景？**
我可以针对你的使用习惯再给你更精准的命令组合。
