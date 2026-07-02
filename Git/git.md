**`--bare` 本质上是 `--git-dir=当前路径 --work-tree=不合法路径` 的组合**。设置 `--bare` 后，Git 会强制认为没有工作树，且 `GIT_DIR` 不会被自动设置。

## `--bare` – 裸仓库
**作用**：创建一个**没有工作目录**的仓库。裸仓库只存储 `.git` 目录内的内容（对象、引用、钩子等），没有可供编辑的实际文件。
**典型用法**：作为**远程中央仓库**（如 GitHub、GitLab 上的仓库），用于推送和拉取，不允许直接提交或修改文件。
**创建**：
```bash
git init --bare my-project.git
```

> 约定裸仓库目录名以 `.git` 结尾，但不是强制要求。

**特点**：
- 无法执行 `git status`、`git add` 等需要工作目录的命令（会报错）。
- 允许 `git push` 到它（作为远程端）。
- 裸仓库本身就是 `.git` 的内容，所以不需要 `--git-dir` 指向内部目录。
## `--git-dir` – 指定 .git 目录路径
**作用**：手动指定 **Git 数据库**（即 `.git` 目录）的位置。Git 默认会从当前目录向上查找 `.git`，使用此选项可覆盖该行为。
**典型用法**：
- 多个工作目录共享同一个 `.git` 目录（例如大型仓库节省空间）。
- 脚本或服务中明确指定仓库位置。
**示例**：
```bash
git --git-dir=/path/to/repo.git status
```
即使当前在 `/tmp` 目录，Git 也会使用 `/path/to/repo.git` 作为仓库数据库。
## `--work-tree` – 指定工作目录路径
**作用**：手动指定**工作树**（实际签出文件所在目录）的位置。与 `--git-dir` 配合使用，可将仓库数据库和文件分离。
**典型用法**：
- 在非标准目录中执行 Git 命令（例如，仓库数据库在 `/opt/git/repo.git`，工作树在 `/var/www/html`）。
- 脚本部署：从裸仓库直接检出到指定路径。
**示例**：
```bash
git --git-dir=/opt/git/repo.git --work-tree=/var/www/html checkout -f
```
这会将 `repo.git` 中的最新代码强制签出到 `/var/www/html`，非常适合部署脚本。
## 实际应用场景
### 场景 1：创建中央裸仓库（团队协作）
```bash
git init --bare /srv/git/project.git
```
其他成员用 `git clone /srv/git/project.git` 拉取。
### 场景 2：从裸仓库部署代码（CI/CD）
```bash
git --git-dir=/srv/git/project.git --work-tree=/var/www/html checkout main
```
每次部署前可先 `fetch`。
### 场景 3：修复仓库位置（工作树与 .git 分离）
```bash
git --git-dir=/some/strange/path/.git --work-tree=/home/user/project status
```
当 `.git` 目录被意外移动时使用。
## 环境变量替代
- `GIT_DIR` 环境变量等效于 `--git-dir`
- `GIT_WORK_TREE` 等效于 `--work-tree`
```bash
export GIT_DIR=/path/to/bare.git
export GIT_WORK_TREE=/path/to/working
git status  # 相当于带两个选项
```
灵活使用这三个选项，可以突破 Git 默认的“父子目录”结构，实现更高级的工作流和脚本控制。
