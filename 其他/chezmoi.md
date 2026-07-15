| 类别           | 命令                                    | 说明                                                   |
| :----------- | :------------------------------------ | :--------------------------------------------------- |
| **⚡ 快速开始**   | `chezmoi init --apply <Git仓库URL>`     | **一键恢复**：在新电脑上初始化并直接应用所有配置。                          |
|              | `chezmoi init`                        | 仅初始化，克隆仓库到源目录，但不应用，用于检查后再手动执行 `apply`。               |
|              | `chezmoi update`                      | **一键更新**：从远程拉取最新配置并自动应用到系统。                          |
| **📂 文件管理**  | `chezmoi add ~/.zshrc`                | 将家目录下的文件加入 chezmoi 管理，文件会被重命名为 `dot_zshrc`。          |
|              | `chezmoi add --template ~/.gitconfig` | 将文件添加为**模板**，可以使用变量来根据不同机器生成不同配置。                    |
|              | `chezmoi add --encrypt ~/.ssh/id_rsa` | 添加并加密敏感文件，可安全提交到公开仓库。                                |
|              | `chezmoi edit ~/.zshrc`               | 编辑源目录中的配置文件（即 `dot_zshrc`）。                          |
|              | `chezmoi edit --apply ~/.zshrc`       | 编辑后**立即应用**变更，无需再执行 `apply`。                         |
|              | `chezmoi forget ~/.vimrc`             | 从管理中移除文件，但**不删除**家目录中的原文件。                           |
|              | `chezmoi destroy ~/.vimrc`            | **危险**：从管理中移除并同时删除家目录中的目标文件。                         |
| **👀 检查预览**  | `chezmoi diff`                        | 查看源目录与当前家目录文件的详细差异。                                  |
|              | `chezmoi status`                      | 类似 `git status`，概要显示哪些文件被修改、新增或将要被删除。                |
|              | `chezmoi managed`                     | 列出所有被 chezmoi 管理的文件列表。                               |
|              | `chezmoi apply --dry-run --verbose`   | **干运行**：模拟执行，显示将会发生的所有变更，但不实际写入文件。                   |
| **🛠️ 高级功能** | `chezmoi cd`                          | 快速切换到源目录（`~/.local/share/chezmoi/`），方便手动执行 `git` 命令。 |
|              | `chezmoi data`                        | 查看当前可用的所有模板数据（如主机名、用户名、自定义变量等）。                      |
|              | `chezmoi cat ~/.gitconfig`            | 预览模板文件被解析渲染后的最终内容。                                   |
## 模板 (Templates)
文件名带 `.tmpl` 后缀的就是模板文件。chezmoi 用 Go 标准库的 `text/template` 渲染，渲染时机在 `apply` 写入目标文件之前。
**核心变量**全部挂在 `.chezmoi.*` 命名空间下，最常用的几个：

| 变量                            | 含义     | 典型值                            |
| ----------------------------- | ------ | ------------------------------ |
| `{{ .chezmoi.os }}`           | 操作系统   | `darwin` / `linux` / `windows` |
| `{{ .chezmoi.arch }}`         | CPU 架构 | `amd64` / `arm64`              |
| `{{ .chezmoi.hostname }}`     | 主机名    | `mbp-2023`                     |
| `{{ .chezmoi.username }}`     | 当前用户   | `alice`                        |
| `{{ .chezmoi.osRelease.id }}` | 发行版 ID | `ubuntu` / `arch`              |

**典型场景**——一份 git 配置，在 Mac 上用 `osxkeychain` 凭据助手，Linux 上用 `store`：

```
# ~/.local/share/chezmoi/dot_gitconfig.tmpl
[user]
    name = Alice
    email = alice@example.com
[credential]
{{- if eq .chezmoi.os "darwin" }}
    helper = osxkeychain
{{- else if eq .chezmoi.os "linux" }}
    helper = store
{{- end }}
```

**几个关键点**：
- 用 `chezmoi data` 查看本机当前可见的所有模板变量，包括你自己在 `chezmoi.toml` 里写的自定义字段。
- 想加自定义变量，编辑 `~/.config/chezmoi/chezmoi.toml`：
  ```toml
  [data]
  workEmail = "alice@company.com"
  ```
  模板里就能用 `{{ .workEmail }}`。
- 测试模板用 `chezmoi execute-template < file.tmpl`，避免每次 apply 才能看到结果。
- 不要把密钥塞进模板变量，那是加密文件该干的事。
## 加密 (Encryption)
支持 `age` 和 `gpg` 两种，**强烈建议用 age**——密钥短、无依赖、跨平台一致。gpg 的密钥管理是出了名的难搞。

**初始配置**（编辑 `~/.config/chezmoi/chezmoi.toml`）：

```toml
encryption = "age"
[age]
    identity = "~/.config/age/key.txt"
    recipient = "age1ql3z7hjy54pw3hyv...你的公钥"
```

如果你还没 age 密钥对，先生成：
```bash
age-keygen -o ~/.config/age/key.txt
# 公钥在文件第二行 age1...，私钥不要提交
```

**添加一个要加密的文件**：

```bash
chezmoi add --encrypt ~/.ssh/id_rsa
```

chezmoi 会做三件事：
1. 在源目录创建 `encrypted_dot_ssh/id_rsa.age`（文件名带 `encrypted_` 前缀，内容是密文）。
2. 把这个密文文件留在源目录，可以安全 push 到公开仓库。
3. `chezmoi apply` 时用本机私钥解密，写回 `~/.ssh/id_rsa`，权限 600。

**关键风险点**——**私钥 `key.txt` 绝不能进源目录**。它要么放本机别处（如 `~/.config/age/`），要么用别的方式备份（如密码管理器）。如果用公开仓库存加密文件，至少要确保：

- 备份好私钥，丢了等于丢了所有加密内容。
- recipient 公钥写死在配置里，别用环境变量动态读——CI/无头环境会出错。
- 多机解密时，每台机器生成自己的密钥对，把所有 recipient 都列进配置，这样任何一个私钥都能解密。

```toml
[age]
    identity = "~/.config/age/key.txt"
    recipient = ["age1xxx...", "age1yyy..."]  # 多 recipient
```
## 脚本 (Scripts)
脚本文件名前缀决定执行时机。文件名结构 `run_<时机>_<名字>.<ext>`：

| 前缀              | 执行时机          | 典型用途           |
| --------------- | ------------- | -------------- |
| `run_`          | 每次 `apply` 都跑 | 状态检查、刷新        |
| `run_once_`     | 内容哈希变了才跑      | 装软件、克隆插件仓库     |
| `run_onchange_` | 内容变了才跑        | 重启 daemon、重载配置 |
| `run_before_`   | apply 写文件前    | 提前清理目录         |
| `run_after_`    | apply 写文件后    | 启动服务、刷新缓存      |

**为什么 `run_once_` 比 `run_` 更常用**：脚本内容没改就跳过，避免每次 apply 都重新 brew install。判定依据是文件内容的 SHA-256，记录在 `~/.config/chezmoi/chezmoistate.boltdb`。

**示例**——`run_once_install-packages.sh.tmpl`（注意 `.tmpl` 后缀，意味着脚本本身也能用模板）：

```bash
{{ if eq .chezmoi.os "darwin" -}}
#!/bin/bash
brew install ripgrep fzf bat
brew install --cask raycast
{{ else if eq .chezmoi.os "linux" -}}
#!/bin/bash
sudo apt update && sudo apt install -y ripgrep fzf bat
{{ end -}}
```

**几个坑**：

- 文件必须有可执行权限（`chmod +x`），chezmoi 不会自动 chmod 脚本。
- 脚本的退出码非零，apply 会中止并报错——别写 `set -e` 又吞错误。
- `run_once_` 想强制重跑：删 `chezmoistate.boltdb` 里那条记录，或改脚本内容（哪怕加个空格）。
- 脚本里调 `chezmoi` 命令要小心，可能死循环——一般只在脚本里调系统命令。
## 外部文件 (Externals)

在源目录根的 `.chezmoiexternal.toml` 配置。支持两种来源：git 仓库、archive（tar.gz / zip）。

**拉一个 git 仓库到指定目录**——例如把 Tmux 插件管理器 TPM 放到 `~/.tmux/plugins/tpm`：

```toml
[".tmux/plugins/tpm"]
    type = "archive"
    url = "https://github.com/tmux-plugins/tpm/archive/master.tar.gz"
    stripComponents = 1
    refreshPeriod = "168h"
```

**拉一个 git 仓库（保留 .git）**——例如 dotbot 这类需要保留仓库结构的：

```toml
[".config/dotbot"]
    type = "git-repo"
    url = "https://github.com/anishathalye/dotbot.git"
    refreshPeriod = "168h"
```

**关键字段**：

| 字段                    | 含义                                     |
| --------------------- | -------------------------------------- |
| `type`                | `archive` 或 `git-repo`                 |
| `url`                 | 下载地址                                   |
| `stripComponents`     | 解压时剥掉的路径层级（同 `tar --strip-components`） |
| `refreshPeriod`       | 多久检查一次更新，如 `168h`（7 天）                 |
| `sha256` / `checksum` | 校验哈希，强烈建议加，防供应链篡改                      |
| `path`                | git-repo 类型可选，只取仓库子目录                  |

**几个关键点**：

- 文件名以 `.` 开头（`.chezmoiexternal.toml`）说明 chezmoi 自己用、不渲染到目标目录。
- `chezmoi update` 会刷新所有 external，不等到 refreshPeriod。
- 别用它拉超大仓库——每次 apply 都会 stat 检查，巨仓库拖慢启动。
- 加密文件和 external 不要混用——external 内容由外部仓库管，chezmoi 不会加密它。