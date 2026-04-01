- `--quiet` 不输出任何内容，只用“退出码”告诉你有没有差异;
	- `0` → 没有差异
	- `1` → 有差异
	- `>1` → 出错
- `--cached/--staged` 暂存内容和仓库差异
- `--name-only` 只显示文件名
- `--name-status` 显示修改类型 `M/A/D`
- `-w` 忽略空白变化
- `--stat`  单行显示 diff
- `-U` 上下文行数
- `-W` 查看整个函数的（改动）上下文
- `-G "string"` 包含指定字符的改动
- `-M` 查看重命名
- 忽略某些文件 `git diff -- . ':(exclude)package-lock.json'` （`--` 告诉 Git，后面全部都是“路径”，不是参数）
# Pathspec 魔法语法（重点理解）
Git 支持这种高级写法：
```
:(<magic>)<pattern>
```
常见的：

|写法 |含义|
|---|---|
|`:(exclude)file`|排除|
|`:(icase)file`|忽略大小写|
|`:(glob)*.js`|glob 模式|
|`:(top)file`|从 repo 根路径匹配|
