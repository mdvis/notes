# Shell 基础 (Bash Cheatsheet)

## 入门 (Getting Started)

### 变量 (Variables)

```bash
NAME="John"
 echo ${NAME}    # => John (变量)
 echo $NAME      # => John (变量)
 echo "$NAME"    # => John (变量)
 echo '$NAME'    # => $NAME (精确字符串，不解析变量)
 echo "${NAME}!" # => John! (变量)
NAME = "John"   # => 错误 (关于空格)
```

### 注释 (Comments)

```bash
# 这是一个 Bash 的行内注释。
```

```bash
: ' 
这是一个
非常整洁的
bash 多行注释
' 
```

多行注释使用 `: '` 开头，使用 `'` 结尾，注意空格符。

### 参数 (Arguments)

| 表达式 | 描述 |
| :--- | :--- |
| `$1` … `$9` | 参数 1 ... 9 |
| `$0` | 脚本本身的名称 |
| `$1` | 第一个参数 |
| `${10}` | 第 10 个位置参数 |
| `$#` | 参数个数 |
| `$$` | Shell 的进程 ID |
| `$*` | 所有参数, `"$*"` 视为一个字符串 |
| `$@` | 所有参数, `"$@"` 视为一个列表 |
| `$-` | 当前选项 |
| `$_` | 上一个命令的最后一个参数 |

### 函数 (Functions)

```bash
get_name() {
    echo "John"
}
 echo "You are $(get_name)"
```

### 条件语句 (Conditionals)

```bash
if [[ -z "$string" ]]; then
    echo "String is empty"  # 字符串为空
elif [[ -n "$string" ]]; then
    echo "String is not empty"  # 字符串不为空
fi
```

### 花括号扩展 (Brace expansion)

```bash
 echo "{A,B}.js"
```

| 表达式 | 描述 |
| :--- | :--- |
| `{A,B}` | 等同于 `A B` |
| `{A,B}.js` | 等同于 `A.js B.js` |
| `{1..5}` | 等同于 `1 2 3 4 5` |

### Shell 执行 (Shell execution)

```bash
# => I'm in /path/of/current
 echo "I'm in $(PWD)"
# 等同于:
 echo "I'm in `pwd`"
```

## Bash 参数扩展 (Parameter expansions)

### 语法 (Syntax)

| 代码 | 描述 |
| :--- | :--- |
| `${FOO%suffix}` | 移除后缀 (最短匹配) |
| `${FOO#prefix}` | 移除前缀 (最短匹配) |
| `${FOO%%suffix}` | 移除长后缀 (最长匹配) |
| `${FOO##prefix}` | 移除长前缀 (最长匹配) |
| `${FOO/from/to}` | 替换第一个匹配项 |
| `${FOO//from/to}` | 替换所有匹配项 |
| `${FOO/%from/to}` | 替换后缀 |
| `${FOO/#from/to}` | 替换前缀 |

#### 子字符串 (Substrings)

| 表达式 | 描述 |
| :--- | :--- |
| `${FOO:0:3}` | 子字符串 _(位置, 长度)_ |
| `${FOO:(-3):3}` | 从右侧开始的子字符串 |

#### 长度 (Length)

| 表达式 | 描述 |
| :--- | :--- |
| `${#FOO}` | `$FOO` 的长度 |

#### 默认值 (Default values)

| 表达式 | 描述 |
| :--- | :--- |
| `${FOO:-val}` | `$FOO`，如果未设置则为 `val` |
| `${FOO:=val}` | 如果 `$FOO` 未设置，则将其设置为 `val` |
| `${FOO:+val}` | 如果 `$FOO` 已设置，则为 `val` |
| `${FOO:?message}` | 如果 `$FOO` 未设置，则显示消息并退出 |

### 替换 (Substitution)

```bash
 echo "${food:-Cake}"  #=> $food 或者 "Cake"
```

```bash
STR="/path/to/foo.cpp"
 echo ${STR%.cpp}    # /path/to/foo
 echo ${STR%.cpp}.o  # /path/to/foo.o
 echo ${STR%/*}      # /path/to
 echo ${STR##*.}     # cpp (扩展名)
 echo ${STR##*/}     # foo.cpp (基本路径)
 echo ${STR#*/}      # path/to/foo.cpp
 echo ${STR##*/}     # foo.cpp
 echo ${STR/foo/bar} # /path/to/bar.cpp
```

### 字符串大小写转换 (String case conversion)

```bash
STR="HeLLo World"
 echo ${STR^}     # => HeLLo World (如果第一个字符已经是大写则不变，否则大写)
STR="hello world"
 echo ${STR^}     # => Hello world (首字母大写)
 echo ${STR^^}    # => HELLO WORLD (全部大写)

STR="HELLO WORLD"
 echo ${STR,}     # => hELLO WORLD (首字母小写)
 echo ${STR,,}    # => hello world (全部小写)
```

### 字符串模式匹配 (String pattern matching)

```bash
STR="path/to/file.txt"
[[ $STR == *.txt ]] && echo "Text file"   # True (文本文件)
[[ $STR == */* ]]   && echo "Has path"    # True (包含路径)
[[ $STR == f* ]]    && echo "Starts with f"# True (以 f 开头)
```

### 字符串修剪 (String trimming)

```bash
# 移除开头的空白字符
var="   hello   "
 echo "${var#"${var%%[![:space:]]*}"}"  # => hello

# 移除结尾的空白字符
 echo "${var%"${var##*[![:space:]]}