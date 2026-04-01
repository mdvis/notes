`status` 命令主要面向人类，`ls-files` 主要面向命令行、ai 等
其核心作用是**列出 Git 索引（index）中跟踪的文件**
- `--others` 列出未被追踪的文件
- `----exclude-standard` 根据 `.gitignore` 过滤文件显示（不显示 ignore 中的文件）
- `--cached` 默认，列出已跟踪文件
- `-m` 列出修改的文件
- `-d` 列出删除的文件
- `-u` 列出冲突的文件
- `-t` 文件前添加状态标记 cac(H)ed，(M)odified，(R)emoved
- `-s` 显示 stage 信息，`<mode> <blob hash> <stage> <path>`
- `--full-name` 显示从根开始的路径
- `--exclude=<pattern>` 排除规则
- `--exclude-from=<file>` 排除规则