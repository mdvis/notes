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
### 🚀 进阶用法亮点
- **模板 (Templates)**：如果你在 Mac 和 Linux 上的配置稍有不同（比如软件安装路径），可以利用 Go 模板语法。通过 `{{ .chezmoi.os }}` 判断系统类型，动态生成配置内容。
- **加密 (Encryption)**：对于 `.ssh/id_rsa` 这类密钥，使用 `chezmoi add --encrypt` 配合 `age` 或 `gpg` 加密。加密后的文件可以放心 Push 到公开的 GitHub 仓库。
- **脚本 (Scripts)**：在源目录创建以 `run_`、`run_once_` 等开头的脚本，chezmoi 会在 `apply` 时自动执行。这非常适用于自动安装软件包、克隆插件仓库等无法仅靠复制文件完成的操作。
- **外部文件 (Externals)**：在 `.chezmoiexternal.toml` 文件中配置 URL，chezmoi 可以自动下载并放置特定文件（如 Shell 补全脚本、字体压缩包等）到指定位置。