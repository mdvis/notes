### mise 常用命令

mise（以前称为 rtx）是一个多语言版本管理工具，用于管理如 Node.js、Python 等编程语言的版本。它类似于 asdf，但更快速和简单。下面是 mise 的常用命令列表，包括描述和示例。这些命令基于官方文档和手册整理。

| 命令 | 描述 | 示例 |
|------|------|------|
| mise install [tool]@[version] | 安装特定工具的版本。如果未指定，会根据配置文件安装。 | `mise install node@20` – 安装 Node.js 20 版本。 |
| mise use [tool]@[version] | 在当前目录或全局设置工具版本，会更新 .mise.toml 文件。 | `mise use python@3.11` – 在当前项目设置 Python 3.11。 |
| mise use --global [tool]@[version] | 全局设置工具的默认版本。 | `mise use --global node@latest` – 全局使用最新 Node.js。 |
| mise ls | 列出已安装和当前激活的工具版本。 | `mise ls` – 显示所有工具的版本列表。 |
| mise ls-remote [tool] | 列出工具的可安装版本。 | `mise ls-remote ruby` – 显示 Ruby 的可用版本。 |
| mise exec [tool]@[version] -- [command] | 使用指定版本的工具执行命令，而不改变当前环境。 | `mise exec node@22 -- node -v` – 使用 Node 22 检查版本。 |
| mise activate [shell] | 在 shell 中激活 mise（例如 bash、zsh 或 fish），以自动切换版本。 | `mise activate zsh` – 为 zsh shell 激活 mise。 |
| mise doctor | 检查 mise 安装是否正常，诊断潜在问题。 | `mise doctor` – 运行诊断检查。 |
| mise prune | 删除未使用的工具版本，以清理空间。 | `mise prune` – 移除所有未引用的版本。 |
| mise self-update | 更新 mise 工具本身到最新版本。 | `mise self-update` – 更新 mise CLI。 |
| mise alias [subcommand] | 管理版本别名，例如设置或列出别名。 | `mise alias set node lts 20.9.0` – 为 Node LTS 设置别名。 |
| mise run [task] | 执行定义在 .mise.toml 中的任务。 | `mise run build` – 运行名为 "build" 的任务。 |
| mise uninstall [tool]@[version] | 卸载特定工具版本。 | `mise uninstall python@3.10` – 移除 Python 3.10。