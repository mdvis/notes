`git fetch` 本身没有直接指定 SSH 密钥的参数，因为它底层依赖 `ssh` 来完成认证。不过，可以通过以下几种方式“临时”指定：

### 🚀 方案一：使用 `GIT_SSH_COMMAND` 环境变量 (最推荐)

这是最直接、最现代的方法，适用于 Git 2.3.0 及以上版本。通过 `-i` 参数明确指定私钥文件路径。

*   **单次命令**：该环境变量仅对当前这条 `git fetch` 命令生效。
    ```bash
    GIT_SSH_COMMAND="ssh -i /path/to/your/private_key" git fetch origin
    ```

*   **当前会话**：在当前终端会话中，后续所有 Git 命令都会使用这个密钥。
    ```bash
    export GIT_SSH_COMMAND="ssh -i /path/to/your/private_key"
    git fetch origin
    git pull origin main
    ```
    如需取消，可执行 `unset GIT_SSH_COMMAND`。

### 🔑 方案二：使用 `ssh-agent` (通用方案)

将私钥临时添加到 `ssh-agent` 中，Git 会通过 agent 自动完成认证。

```bash
ssh-agent sh -c 'ssh-add /path/to/your/private_key; git fetch origin'
```
这条命令会在一个临时的 `ssh-agent` 环境中执行 `git fetch`，命令结束后 agent 也随之关闭，不会影响系统其他部分。

### 🛠️ 方案三：使用 `GIT_SSH` 环境变量 (旧版方案)

适用于不支持 `GIT_SSH_COMMAND` 的旧版 Git。需要创建一个临时的 SSH 包装脚本并告诉 Git 去使用它。

```bash
# 1. 创建一个名为 'my_ssh' 的脚本，内容为指定密钥的 ssh 命令
echo 'ssh -i /path/to/your/private_key $*' > my_ssh
# 2. 赋予执行权限
chmod +x my_ssh
# 3. 执行 git fetch，通过 GIT_SSH 指定使用这个脚本
GIT_SSH="./my_ssh" git fetch origin
```

### 📝 方案四：配置 `~/.ssh/config` (持久方案)

虽然这不是“临时”方案，但它是管理多个密钥最优雅的方式，尤其适合需要长期、稳定地使用不同密钥访问不同服务的情况。

在 `~/.ssh/config` 文件中为不同的 Host 配置不同的 `IdentityFile`：
```
# 为 github.com 配置工作专用密钥
Host github.com-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/work_key
    IdentitiesOnly yes
```
之后，通过修改仓库的远程地址来临时切换密钥：
```bash
# 将远程地址从 git@github.com 改为 git@github.com-work
git remote set-url origin git@github.com-work:username/repo.git
git fetch origin
```

### ⚙️ 补充：使用 `core.sshCommand` (仓库级配置)

也可以在仓库内部进行配置，这样在该仓库下的所有 Git 操作都会自动使用指定密钥。
```bash
git config core.sshCommand "ssh -i /path/to/your/private_key"
git fetch origin
```
这个配置会写入当前仓库的 `.git/config` 文件中，仅对当前仓库生效。

### 💎 总结

*   **最灵活**：用 **`GIT_SSH_COMMAND`**，适合临时单次或单次会话使用。
*   **最干净**：用 **`ssh-agent`**，不会污染环境变量。
*   **最优雅**：用 **`~/.ssh/config`**，适合需要长期管理多个密钥的场景。
