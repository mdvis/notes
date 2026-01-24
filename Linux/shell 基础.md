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
echo {A,B}.js
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
echo ${food:-Cake}  #=> $food 或者 "Cake"
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
echo "${var%"${var##*[![:space:]]}"}"   # => hello

# 移除两端的空白字符
trimmed="${var#"${var%%[![:space:]]*}"}"
trimmed="${trimmed%"${trimmed##*[![:space:]]}"}"
echo "$trimmed"  # => hello
```

### 字符串长度 (String length)

```bash
STR="Hello"
echo ${#STR}      # => 5

# 数组长度
arr=(a b c)
echo ${#arr[@]}   # => 3
echo ${#arr}      # => 1 (第一个元素的长度)
```

### 字符类匹配 (Character class matching)

```bash
[[ $STR =~ [a-z] ]] && echo "Contains lowercase" # 包含小写字母
[[ $STR =~ [A-Z] ]] && echo "Contains uppercase" # 包含大写字母
[[ $STR =~ [0-9] ]] && echo "Contains numbers"   # 包含数字
[[ $STR =~ ^[A-Z] ]] && echo "Starts with uppercase" # 以大写字母开头
[[ $STR =~ [A-Z]$ ]] && echo "Ends with uppercase"   # 以大写字母结尾
```

### 切片 (Slicing)

```bash
name="John"
echo ${name}           # => John
echo ${name:0:2}       # => Jo
echo ${name::2}        # => Jo
echo ${name::-1}       # => Joh
echo ${name:(-1)}      # => n
echo ${name:(-2)}      # => hn
echo ${name:(-2):2}    # => hn
length=2
echo ${name:0:length}  # => Jo
```

### 文件名与目录路径 (basepath & dirpath)

```bash
SRC="/path/to/foo.cpp"
BASEPATH=${SRC##*/}
echo $BASEPATH  # => "foo.cpp"
DIRPATH=${SRC%$BASEPATH}
echo $DIRPATH   # => "/path/to/"
```

### 变换 (Transform)

```bash
STR="HELLO WORLD!"
echo ${STR,}   # => hELLO WORLD!
echo ${STR,,}  # => hello world!
STR="hello world!"
echo ${STR^}   # => Hello world!
echo ${STR^^}  # => HELLO WORLD!
ARR=(hello World)
echo "${ARR[@],}" # => hello world
echo "${ARR[@]^}" # => Hello World
```
## Bash 数组 (Bash Arrays)

### 定义数组 (Defining arrays)

```bash
Fruits=('Apple' 'Banana' 'Orange')
Fruits[0]="Apple"
Fruits[1]="Banana"
Fruits[2]="Orange"
ARRAY1=(foo{1..2}) # => foo1 foo2
ARRAY2=({A..D})    # => A B C D
# 合并 => foo1 foo2 A B C D
ARRAY3=(${ARRAY1[@]} ${ARRAY2[@]})
# declare 构造
declare -a Numbers=(1 2 3)
Numbers+=(4 5) # 追加 => 1 2 3 4 5
```

### 索引 (Indexing)

| 表达式 | 含义 |
| :--- | :--- |
| `${Fruits[0]}` | 第一个元素 |
| `${Fruits[-1]}` | 最后一个元素 |
| `${Fruits[*]}` | 所有元素 |
| `${Fruits[@]}` | 所有元素 |
| `${#Fruits[@]}` | 所有元素的个数 |
| `${#Fruits}` | 第一个元素的长度 |
| `${#Fruits[3]}` | 第 n 个元素的长度 |
| `${Fruits[@]:3:2}` | 范围 |
| `${!Fruits[@]}` | 所有键 (Keys) |

### 迭代 (Iteration)

```bash
Fruits=('Apple' 'Banana' 'Orange')
for e in "${Fruits[@]}"; do
    echo $e
done
```

#### 带索引

```bash
for i in "${!Fruits[@]}"; do
  printf "%s\t%s\n" "$i" "${Fruits[$i]}"
done
```

### 操作 (Operations)

```bash
Fruits=("${Fruits[@]}" 'Watermelon')     # 推入 (Push)
Fruits+=('Watermelon')                   # 也是推入
Fruits=( ${Fruits[@]/Ap*/} )             # 通过正则匹配移除
unset Fruits[2]                          # 移除一个项目
Fruits=("${Fruits[@]}")                  # 复制
Fruits=("${Fruits[@]}" "${Veggies[@]}")  # 连接 (Concatenate)
lines=(`cat "logfile"`)                  # 从文件读取
```

### 数组作为参数 (Arrays as arguments)

```bash
function extract() {
    local -n myarray=$1
    local idx=$2
    echo "${myarray[$idx]}"
}
Fruits=('Apple' 'Banana' 'Orange')
extract Fruits 2     # => Orange
```

## Bash 字典 (Bash Dictionaries)

### 定义 (Defining)

```bash
declare -A sounds
sounds[dog]="bark"
sounds[cow]="moo"
sounds[bird]="tweet"
sounds[wolf]="howl"
```

### 使用字典 (Working with dictionaries)

```bash
echo ${sounds[dog]} # 狗的声音
echo ${sounds[@]}   # 所有值
echo ${!sounds[@]}  # 所有键
echo ${#sounds[@]}  # 元素个数
unset sounds[dog]   # 删除 dog
```

### 迭代 (Iteration)

```bash
for val in "${sounds[@]}"; do
    echo $val
done
```

```bash
for key in "${!sounds[@]}"; do
    echo $key
done
```

## Bash 条件判断 (Bash Conditionals)

### 整数条件 (Integer conditions)

| 条件 | 描述 |
| :--- | :--- |
| `[[ NUM -eq NUM ]]` | 等于 |
| `[[ NUM -ne NUM ]]` | 不等于 |
| `[[ NUM -lt NUM ]]` | 小于 |
| `[[ NUM -le NUM ]]` | 小于或等于 |
| `[[ NUM -gt NUM ]]` | 大于 |
| `[[ NUM -ge NUM ]]` | 大于或等于 |
| `(( NUM < NUM ))` | 小于 |
| `(( NUM <= NUM ))` | 小于或等于 |
| `(( NUM > NUM ))` | 大于 |
| `(( NUM >= NUM ))` | 大于或等于 |

### 字符串条件 (String conditions)

| 条件 | 描述 |
| :--- | :--- |
| `[[ -z STR ]]` | 空字符串 |
| `[[ -n STR ]]` | 非空字符串 |
| `[[ STR == STR ]]` | 等于 |
| `[[ STR = STR ]]` | 等于 (同上) |
| `[[ STR < STR ]]` | 小于 _(ASCII)_ |
| `[[ STR > STR ]]` | 大于 _(ASCII)_ |
| `[[ STR != STR ]]` | 不等于 |
| `[[ STR =~ STR ]]` | 正则表达式 |

### 文件条件 (File conditions) {.row-span-2}

| 条件 | 描述 |
| :--- | :--- |
| `[[ -e FILE ]]` | 存在 |
| `[[ -d FILE ]]` | 是目录 |
| `[[ -f FILE ]]` | 是文件 |
| `[[ -h FILE ]]` | 是符号链接 |
| `[[ -s FILE ]]` | 大小 > 0 字节 |
| `[[ -r FILE ]]` | 可读 |
| `[[ -w FILE ]]` | 可写 |
| `[[ -x FILE ]]` | 可执行 |
| `[[ f1 -nt f2 ]]` | f1 比 f2 新 |
| `[[ f1 -ot f2 ]]` | f2 比 f1 旧 |
| `[[ f1 -ef f2 ]]` | 是同一个文件 |

### 更多条件 (More conditions)

| 条件 | 描述 |
| :--- | :--- |
| `[[ -o noclobber ]]` | 如果 OPTION 选项已启用 |
| `[[ ! EXPR ]]` | 非 (Not) |
| `[[ X && Y ]]` | 与 (And) |
| `[[ X || Y ]]` | 或 (Or) |

### 示例 (Example)

#### 字符串与正则

```bash
if [[ -z "$string" ]]; then
    echo "String is empty"
elif [[ -n "$string" ]]; then
    echo "String is not empty"
fi

if [[ '1. abc' =~ ([a-z]+) ]]; then
    echo ${BASH_REMATCH[1]}
fi
```

#### 组合逻辑

```bash
if [[ X && Y ]]; then
    ...
fi

if [ "$1" = 'y' -a $2 -gt 0 ]; then
    echo "yes"
fi
```

## Bash 循环 (Bash Loops)

### 基本 for 循环 (Basic for loop)

```bash
for i in /etc/rc.*; do
    echo $i
done
```

### C 风格 for 循环 (C-like for loop)

```bash
for ((i = 0 ; i < 100 ; i++)); do
    echo $i
done
```

### 范围 (Ranges) {.row-span-2}

```bash
for i in {1..5}; do
    echo "Welcome $i"
done
```

#### 带步长

```bash
for i in {5..50..5}; do
    echo "Welcome $i"
done
```

### While / Until 循环

```bash
i=1
while [[ $i -lt 4 ]]; do
    echo "Number: $i"
    ((i++))
done

count=0
until [ $count -gt 10 ]; do
    echo "$count"
    ((count++))
done
```

### 死循环 (Forever)

```bash
while true; do
    # here is some code.
    break # 防止真死循环演示
done

# 简写
while :; do
    # here is some code.
    break
done
```

### 循环控制 (Loop Control)

```bash
# Continue
for number in $(seq 1 3); do
    if [[ $number == 2 ]]; then
        continue;
    fi
    echo "$number"
done

# Break
for number in $(seq 1 3); do
    if [[ $number == 2 ]]; then
        break;
    fi
    echo "$number"
done
```

### 读取行 (Reading lines)

```bash
cat file.txt | while read line;
    echo $line
done
```

## Bash 函数 (Bash Functions)

### 定义函数 (Defining functions)

```bash
myfunc() {
    echo "hello $1"
}

# 另一种语法
function myfunc() {
    echo "hello $1"
}

myfunc "John"
```

### 返回值与错误 (Returning values & Errors)

```bash
myfunc() {
    local myresult='some value'
    echo $myresult
}
result="$(myfunc)"

# 引发错误
failfunc() {
    return 1
}

if failfunc; then
    echo "success"
else
    echo "failure"
fi
```

## Bash 进程管理 (Bash Process Management)

### 进程控制 (Process control)

```bash
# 在后台运行
command &

# 进程 ID
echo $!  # 上一个后台进程的 PID

# 等待进程
wait $PID

# 杀死进程
kill $PID           # SIGTERM
kill -9 $PID        # SIGKILL
kill -15 $PID       # SIGTERM (默认)
```

### 作业控制 (Job control)

```bash
# 挂起当前作业
Ctrl+Z

# 列出作业
jobs

# 将作业带回前台
fg %1

# 将作业送往后台
bg %1
```

### 进程替换 (Process substitution)

```bash
# 将进程作为文件处理
diff <(sort file1.txt) <(sort file2.txt)

# 将进程作为数组处理
files=($(ls))
```

### 并行执行 (Parallel execution)

```bash
# 并行运行命令
{
    command1 &
    command2 &
    command3 &
    wait
}

# 使用 xargs 进行并行
find . -name "*.txt" | xargs -P4 -I{} grep "pattern" {}
```

### 信号处理 (Signal handling)

```bash
trap 'echo "Signal received"' SIGINT SIGTERM

# 自定义清理函数
cleanup() {
    echo "Cleaning up..."
}
trap cleanup EXIT
```

## I/O 重定向 (I/O Redirection)

### 基本重定向 (Basic Redirection) {.row-span-2 .col-span-2}

```bash
python hello.py > output.txt   # stdout 重定向到 (文件)
python hello.py >> output.txt  # stdout 重定向到 (文件)，追加
python hello.py 2> error.log   # stderr 重定向到 (文件)
python hello.py 2>&1           # stderr 重定向到 stdout
python hello.py 2>/dev/null    # stderr 重定向到 (null)
python hello.py &>/dev/null    # stdout 和 stderr 重定向到 (null)
python hello.py < foo.txt      # 将 foo.txt 传给 python 的 stdin
```

### 高级重定向 (Advanced redirection)

```bash
# Tee - 读取 stdin 并写入 stdout 和文件
command | tee output.txt          # stdout 到文件和屏幕
command | tee -a output.txt       # 追加到文件

# 仅将 stderr 重定向到屏幕，stdout 重定向到文件
command 2>&1 >/dev/null

# 交换 stdout 和 stderr
command 3>&1 1>&2 2>&3-

# Here documents
cat <<EOF
This is a here document
Multiple lines
EOF

# Here strings
cmd <<< "input string"

# 逐行处理文件
while IFS= read -r line;
    echo "Processing: $line"
done < input.txt
```

### 文件描述符 (File descriptors)

```bash
# 保存文件描述符
exec 3>&1  # 保存 stdout 到 fd 3
exec 1>output.txt  # 重定向 stdout 到文件
echo "This goes to file"
exec 1>&3  # 恢复 stdout
echo "This goes to screen"

# 命名管道
mkfifo my_pipe
command1 > my_pipe &
command2 < my_pipe &
```

## Bash 配置与环境 (Configuration & Environment)

### 配置文件顺序 (Configuration file order) 

```bash
# 交互式登录 Shell (按顺序): 
/etc/profile          # 系统级设置
~/.bash_profile       # 用户级设置 (如果存在)
~/.bash_login         # 如果 ~/.bash_profile 不存在则回退到此
~/.profile            # 如果以上两个都不存在则回退到此

# 交互式非登录 Shell:
/etc/bash.bashrc      # 系统级 rc
~/.bashrc             # 用户级 rc
```

### 选项 (Options) 

```bash
set -o noclobber  # 避免覆盖文件
set -o errexit    # 出错时退出 (set -e)
set -o pipefail   # 管道中任意命令失败则失败
set -o nounset    # 使用未定义变量报错 (set -u)

# Glob 选项
shopt -s nullglob    # 不匹配的 glob 移除
shopt -s failglob    # 不匹配的 glob 报错
shopt -s nocaseglob  # 大小写不敏感 glob
shopt -s dotglob     # 通配符匹配点文件
shopt -s globstar    # ** 递归匹配
```

## 杂项 (Miscellaneous) 

### 数值计算 (Numeric calculations) 

```bash
$((a + 200))      # 给 $a 加上 200
$(($RANDOM%200))  # 0..199 之间的随机数
echo "scale=2; 10/3" | bc  # 3.33 (使用 bc 处理浮点)
```

### 子 Shell (Subshells) 

```bash
(cd somedir; echo "I'm now in $PWD")
pwd # 仍然在原来的目录
```

### 调试 (Debugging) 

```bash
# 启用调试
set -x  # 打印执行的命令
set -v  # 打印读取的输入
set -n  # 仅读取不执行 (语法检查)
```

### 错误处理 (Error Handling) 

```bash
# 严格模式 (Strict Mode)
set -euo pipefail
IFS=$'\n\t'

# Trap 捕获错误
trap 'echo Error at about $LINENO' ERR
```

### 实用工具 (Utilities) 

```bash
# 获取脚本所在目录
DIR="${0%/*}"

# 相对路径加载
source "${0%/*}/../share/foo.sh"

# 检查命令是否存在
command -v git >/dev/null && echo "Git installed"

# 获取选项 (getopts 简易版)
while [[ "$1" =~ ^- && ! "$1" == "--" ]]; do case $1 in
    -V | --version ) echo $version; exit ;; 
    -s | --string ) shift; string=$1 ;; 
    -f | --flag ) flag=1 ;; 
esac; shift; done
if [[ "$1" == '--' ]]; then shift; fi
```

### 特殊变量 (Special variables) {.row-span-2} 

| 表达式 | 描述 |
| :--- | :--- |
| `$?` | 上一个任务的退出状态 |
| `$!` | 上一个后台任务的 PID |
| `$$` | Shell 的 PID |
| `$0` | Shell 脚本的文件名 |

## 实用的 Shell 技巧 (Practical Shell Tips) 

### 文件操作 (File operations) 

```bash
# 带进度的安全复制
cp -v source.txt dest.txt

# 查找并删除 30 天前的文件
find /path -name "*.log" -mtime +30 -delete

# 创建包含父目录的目录
mkdir -p /path/to/directory

# 带进度的创建归档
tar -czf archive.tar.gz --verbose /path/to/directory/

# 按大小排序显示磁盘使用情况
du -sh * | sort -rh
```

### 文本处理 (Text processing) 

```bash
# 移除重复行，保持顺序
sort -u file.txt > file_unique.txt

# 统计行数、单词数、字符数
wc -l file.txt  # 行数
wc -w file.txt  # 单词数
wc -c file.txt  # 字符数

# 提取列
cut -d',' -f2,4 data.csv

# 替换文件中的文本
sed -i 's/old/new/g' file.txt

# 将文本转换为大写
tr '[:lower:]' '[:upper:]' < input.txt
```

### 系统监控 (System monitoring) 

```bash
# 监控系统资源
top -b -n 1 | head -20

# 显示网络连接
netstat -tuln

# 显示打开的文件
lsof -i :8080

# 监控文件系统使用情况
df -h

# 显示最近的系统日志
tail -f /var/log/syslog
```

### 时间操作 (Time operations) 

```bash
# 测量命令执行时间
time command

# 带倒计时的休眠
for i in {10..1}; do echo -n "$i "; sleep 1; done; echo "GO!"

# 日期计算
date +%Y%m%d_%H%M%S  # 时间戳格式

# 计算文件年龄
file="test.txt"
if [[ -f $file ]]; then
    age=$(( $(date +%s) - $(stat -f %m "$file") ))
    echo "File is $age seconds old"
fi
```

### 快速计算 (Quick calculations) 

```bash
# 单位转换
echo "1024" | numfmt --to=iec       # 1.0K
echo "1K" | numfmt --from=iec --to=bytes  # 1024

# 计算百分比
awk '{printf "%.2f%%\n", $1/$2*100}' <(echo 75) <(echo 100)

# 随机数
echo $((RANDOM % 100 + 1))
```

### 路径操作 (Path operations) 

```bash
# 获取绝对路径
realpath relative/path

# 获取当前脚本的目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 获取不带扩展名的文件名
filename="archive.tar.gz"
basename="${filename##*/}"
echo "${basename%.*}"  # archive.tar

# 连接路径部分
printf -v joined "%s/%s" "/path/to" "file.txt"
echo $joined  # /path/to/file.txt
```

## 另请参阅 (Also see) {.cols-1} 

- [Devhints](https://devhints.io/bash "https://devhints.io/bash") _(devhints.io)_
- [Bash-hackers wiki](http://wiki.bash-hackers.org/ "http://wiki.bash-hackers.org/") _(bash-hackers.org)_
- [Learn bash in y minutes](https://learnxinyminutes.com/docs/bash/ "https://learnxinyminutes.com/docs/bash/") _(learnxinyminutes.com)_
- [ShellCheck](https://www.shellcheck.net/ "https://www.shellcheck.net/") _(shellcheck.net)_
