`status` 命令主要面向人类，`ls-files` 主要面向命令行、ai 等
其核心作用是**列出 Git 索引（index）中跟踪的文件**
- `--others` 列出未被追踪的文件
- `----exclude-standard` 根据 `.gitignore` 过滤文件显示（不显示 ignore 中的文件）