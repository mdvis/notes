`gh` 是 GitHub 官方命令行工具，把仓库、Issue、PR、Actions、Release、Gist 等搬到终端，避免频繁切换浏览器。本文覆盖安装认证、仓库管理、Issue、Pull Request、Actions、Release、搜索、删除、Star 查询、脚本化与进阶配置。
## 目录

1. [安装与认证](#1-安装与认证)
2. [仓库（repo）](#2-仓库repo)
3. [删除仓库](#3-删除仓库)
4. [获取 Star 数](#4-获取-star-数)
5. [Issue](#5-issue)
6. [Pull Request](#6-pull-request)
7. [GitHub Actions](#7-github-actions)
8. [Release / Gist](#8-release--gist)
9. [搜索（search）](#9-搜索search)
10. [脚本化与 jq 批处理](#10-脚本化与-jq-批处理)
11. [别名、补全与配置](#11-别名补全与配置)
12. [底层 API 调用](#12-底层-api-调用)
13. [典型工作流](#13-典型工作流)
14. [常用命令速查表](#14-常用命令速查表)
## 1. 安装与认证

### 安装

```bash
# macOS
brew install gh

# Windows
winget install GitHub.cli

# Debian / Ubuntu
sudo apt install gh

# 验证
gh --version
```

### 认证登录

```bash
# 交互式登录（选择 github.com 或 GHES，可顺带接管 git 凭证）
gh auth login

# 查看当前账号与 scopes
gh auth status

# CI / 自动化：用 token 登录
echo "$GH_TOKEN" | gh auth login --with-token

# 让 git push/pull 走 gh 凭证助手
gh auth setup-git

# 刷新权限 scope（如删除仓库需要 delete_repo）
gh auth refresh -s delete_repo
```

> **自动化场景**优先用细粒度 PAT 写入 `GH_TOKEN` 环境变量，避免交互。

## 2. 仓库（repo）

### 克隆 / 创建 / Fork

```bash
gh repo clone owner/repo
gh repo create my-proj --public --clone --gitignore python --license mit
gh repo create --source=. --private --push   # 把当前本地目录推上去建仓
gh repo fork owner/repo --clone
```

### 查看 / 列出 / 同步

```bash
gh repo view                         # 看当前仓 README + 描述
gh repo view owner/repo --web        # 浏览器打开
gh repo list owner                   # 列出某用户/组织仓库
gh repo set-default owner/repo       # 固定默认仓（多 remote 时）
gh repo sync                         # 把 fork 同步到上游
```

### 归档仓库

```bash
gh repo archive owner/repo
```

> 归档后只读，可作为删除前的保护。

## 3. 删除仓库

```bash
# 交互确认删除
gh repo delete owner/repo

# 跳过确认直接删（脚本/CI 用，危险）
gh repo delete owner/repo --yes
```

### 权限前提

```bash
gh auth refresh -s delete_repo
```

需要对目标仓库有**管理员权限**。

### 底层 API 等价

```bash
gh api -X DELETE repos/owner/repo
```

### ⚠️ 注意事项

- 删除是**永久的**：代码、Issues、PR、Wiki、Actions、Releases、secrets 全部丢失
- 本地 clone 不会删，但再 push/pull 会 404
- 普通仓库删除后可在 **90 天内**从 *Settings → Repositories → Deleted repositories* 恢复
- **删前建议先归档**：`gh repo archive owner/repo`

### 批量删除（极危险）

```bash
gh repo list owner --limit 100 --json name --jq '.[].name' \
  | xargs -I{} gh repo delete owner/{} --yes
```

> 跑之前务必先去掉 `--yes` 干跑一遍确认清单。

### 安全脚本模板（推荐）

```bash
#!/bin/bash
set -e
REPOS=("owner/repo1" "owner/repo2")

echo "待删除清单："
printf '%s\n' "${REPOS[@]}"
read -r -p "确认删除以上仓库？(yes/no): " CONFIRM

if [ "$CONFIRM" = "yes" ]; then
  for r in "${REPOS[@]}"; do
    echo "归档：$r"
    gh repo archive "$r" || true
    echo "删除：$r"
    gh repo delete "$r" --yes
  done
else
  echo "已取消"
fi
```

## 4. 获取 Star 数

### 方式一：REST API

```bash
gh api repos/owner/repo --jq '.stargazers_count'
```

当前仓库目录下动态获取：

```bash
gh api "repos/$(gh repo view --json owner,name --jq '.owner.login + "/" + .name')" \
  --jq '.stargazers_count'
```

### 方式二：`repo view --json`

```bash
gh repo view owner/repo --json name,stargazerCount \
  --jq '"\(.name): \(.stargazerCount) stars"'
```

### 方式三：GraphQL

```bash
gh api graphql -f query='
  query {
    repository(owner: "owner", name: "repo") {
      stargazerCount
    }
  }' --jq '.data.repository.stargazerCount'
```

### 一次拿 stars / forks / issues

```bash
gh api repos/owner/repo --jq '{stars:.stargazers_count, forks:.forks_count, open_issues:.open_issues_count}'
```

### 列出某用户仓库并按 star 排序

```bash
gh repo list owner --limit 100 \
  --json name,stargazerCount \
  --jq 'sort_by(-.stargazerCount)[] | "\(.stargazerCount)\t\(.name)"'
```

### 检查是否已 star

```bash
gh api user/starred/owner/repo --silent && echo "已 star" || echo "未 star"
```

> ⚠️ GitHub REST 中 star 字段是 `stargazers_count`，**不是** `watchers_count`。

## 5. Issue

```bash
gh issue list --assignee @me --state open
gh issue list --label bug --milestone "v2.0"
gh issue create --title "崩溃复现" --body "步骤..." --label bug,urgent
gh issue view 123 --web
gh issue close 123 --comment "已在 #456 修复"
gh issue reopen 123
gh issue edit 123 --add-assignee alice --add-label priority
gh issue status                     # 我相关 / 被指派 / 被提及概览
```

## 6. Pull Request

```bash
gh pr list --author @me --state open
gh pr status                        # 当前分支 / 我创建 / 等我 review

gh pr create --fill                 # 用最近 commit 自动填标题正文
gh pr create --title "fix: ..." --body "Closes #123" --draft
gh pr create --base develop --reviewer alice,bob --label ready

gh pr checkout 42                   # 拉取 PR 分支到本地
gh pr diff 42
gh pr view 42 --web

gh pr review 42 --approve --body "LGTM"
gh pr review 42 --request-changes -b "请修下空指针"

gh pr merge 42 --squash --delete-branch
gh pr merge 42 --auto --squash       # 开启 auto-merge
gh pr close 42
```

> PR 正文中写 `Closes #123`，合并后 Issue 自动关闭。

## 7. GitHub Actions

```bash
gh workflow list
gh workflow run ci.yml --ref main
gh run list --workflow ci.yml --limit 5
gh run view 123456 --log-failed
gh run watch 123456                 # 实时盯日志
gh run rerun 123456 --failed        # 只重跑失败 job
gh run cancel 123456
gh run download 123456 --dir ./artifacts
```

## 8. Release / Gist

```bash
# Release
gh release create v1.2.0 --title "v1.2.0" --notes "修复登录崩溃"
gh release upload v1.2.0 ./dist/*.tar.gz
gh release list

# Gist
gh gist create -p script.py         # 创建 public gist
gh gist list
```

## 9. 搜索（search）

```bash
gh search prs "author:@me state:open"
gh search issues "label:bug repo:owner/repo"
gh browse main.py:340               # 浏览器打开某文件某行
```

## 10. 脚本化与 jq 批处理

```bash
# 列出带 fix 的 PR
gh pr list --json number,title --jq '.[] | select(.title|test("fix"))'

# 批量关闭 stale issue
gh issue list --state open --label stale --json number --jq '.[].number' \
  | xargs -I{} gh issue close {} --comment "stale"
```

## 11. 别名、补全与配置

```bash
# 别名
gh alias set pv 'pr view'
gh alias set bugs 'issue list --label=bug'

# 全局配置
gh config set editor "code --wait"
gh config set git_protocol ssh

# 补全（bash/zsh/fish 同理）
eval "$(gh completion -s bash)"
```

## 12. 底层 API 调用

```bash
# REST
gh api repos/owner/repo/issues

# GraphQL
gh api graphql -f query='{ viewer { login } }'
```

## 13. 典型工作流

```bash
gh issue develop 123 --branch fix/123   # 从 issue 拉分支
# ... 改代码、git commit、git push ...
gh pr create --fill
gh pr status
gh run watch                           # 盯 CI
gh pr review 42 --approve
gh pr merge 42 --squash
```

## 14. 常用命令速查表

| 功能        | 命令                                                 |
| --------- | -------------------------------------------------- |
| 登录        | `gh auth login`                                    |
| 克隆        | `gh repo clone owner/repo`                         |
| 创建仓库      | `gh repo create my-proj --public --clone`          |
| 删除仓库      | `gh repo delete owner/repo --yes`                  |
| 归档仓库      | `gh repo archive owner/repo`                       |
| 查 star 数  | `gh api repos/owner/repo --jq '.stargazers_count'` |
| 列 Issue   | `gh issue list --assignee @me`                     |
| 建 Issue   | `gh issue create --title "..." --label bug`        |
| 建 PR      | `gh pr create --fill`                              |
| Review PR | `gh pr review 42 --approve`                        |
| 合并 PR     | `gh pr merge 42 --squash`                          |
| 查 CI      | `gh run list --workflow ci.yml`                    |
| 盯日志       | `gh run watch <run_id>`                            |
| 发版        | `gh release create v1.0 --title "v1.0"`            |
| 搜索        | `gh search issues "label:bug"`                     |
| 调 API     | `gh api repos/owner/repo`                          |