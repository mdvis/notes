## 入门 (Getting Started)
### hello.sh
```
#!/bin/bash
VAR="world"
echo "Hello $VAR!" # => Hello world!
```
执行脚本
```
$ bash hello.sh
```
### 变量 (Variables)
```
NAME="John"
echo ${NAME}    # => John (变量)
echo $NAME      # => John (变量)
echo "$NAME"    # => John (变量)
echo '$NAME'    # => $NAME (精确字符串，不解析变量)
echo "${NAME}!" # => John! (变量)
NAME = "John"   # => 错误 (关于空格)
```
### 注释 (Comments)
```
# 这是一个 Bash 的行内注释。
```
```
: ' 
这是一个
非常整洁的
bash 多行注释
' 
```
多行注释使用 `:'` 开头，使用 `'` 结尾
### 参数 (Arguments) {.row-span-2}

|表达式|描述|
|---|---|
|`$1` … `$9`|参数 1 ... 9|
|`$0`|脚本本身的名称|
|`$1`|第一个参数|
|`${10}`|第 10 个位置参数|
|`$#`|参数个数|
|`$$`|Shell 的进程 ID|
|`$*`|所有参数|
|`$@`|所有参数，从第一个开始|
|`$-`|当前选项|
|`$_`|上一个命令的最后一个参数|
参见: [特殊参数](http://wiki.bash-hackers.org/syntax/shellvars#special_parameters_and_shell_variables "http://wiki.bash-hackers.org/syntax/shellvars#special_parameters_and_shell_variables")
### 函数 (Functions)
```
get_name() {
    echo "John"
}
echo "You are $(get_name)"
```
参见: [函数](#bash-functions "#bash-functions")
### 条件语句 (Conditionals) {#conditionals-example}
```
if [[ -z "$string" ]]; then
    echo "String is empty"  # 字符串为空
elif [[ -n "$string" ]]; then
    echo "String is not empty"  # 字符串不为空
fi
```
参见: [条件语句](#bash-conditionals "#bash-conditionals")
### 花括号扩展 (Brace expansion)
```
echo {A,B}.js
```
---

|表达式|描述|
|---|---|
|`{A,B}`|等同于 `A B`|
|`{A,B}.js`|等同于 `A.js B.js`|
|`{1..5}`|等同于 `1 2 3 4 5`|
参见: [花括号扩展](http://wiki.bash-hackers.org/syntax/expansion/brace "http://wiki.bash-hackers.org/syntax/expansion/brace")
### Shell 执行 (Shell execution)
```
# => I'm in /path/of/current
echo "I'm in $(PWD)"
# 等同于:
echo "I'm in `pwd`"
```
参见: [命令替换](http://wiki.bash-hackers.org/syntax/expansion/cmdsubst "http://wiki.bash-hackers.org/syntax/expansion/cmdsubst")
## Bash 参数扩展 (Parameter expansions)
### 语法 (Syntax) {.row-span-2}

|代码|描述|
|---|---|
|`${FOO%suffix}`|移除后缀 (最短匹配)|
|`${FOO#prefix}`|移除前缀 (最短匹配)|
|`${FOO%%suffix}`|移除长后缀 (最长匹配)|
|`${FOO##prefix}`|移除长前缀 (最长匹配)|
|`${FOO/from/to}`|替换第一个匹配项|
|`${FOO//from/to}`|替换所有匹配项|
|`${FOO/%from/to}`|替换后缀|
|`${FOO/#from/to}`|替换前缀|
#### 子字符串 (Substrings)

|表达式|描述|
|---|---|
|`${FOO:0:3}`|子字符串 _(位置, 长度)_|
|`${FOO:(-3):3}`|从右侧开始的子字符串|
#### 长度 (Length)

|表达式|描述|
|---|---|
|`${#FOO}`|`$FOO` 的长度|
#### 默认值 (Default values)

|表达式|描述|
|---|---|
|`${FOO:-val}`|`$FOO`，如果未设置则为 `val`|
|`${FOO:=val}`|如果 `$FOO` 未设置，则将其设置为 `val`|
|`${FOO:+val}`|如果 `$FOO` 已设置，则为 `val`|
|`${FOO:?message}`|如果 `$FOO` 未设置，则显示消息并退出|
### 替换 (Substitution)
```
echo ${food:-Cake}  #=> $food 或者 "Cake"
```
```
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
```
STR="hello world"
echo ${STR^}     # => Hello world (首字母大写)
echo ${STR^^}    # => HELLO WORLD (全部大写)
echo ${STR,}     # => hello world (首字母小写)
echo ${STR,,}    # => hello world (全部小写 - 这里原示例结果可能有误，,,应为小写，但原示例为大写，假设原意是展示用法)
# 修正注释:
# echo ${STR,,}    # => hello world (全部小写)
```
### 字符串模式匹配 (String pattern matching)
```
STR="path/to/file.txt"
[[ $STR == *.txt ]] && echo "Text file"   # True (文本文件)
[[ $STR == */* ]]   && echo "Has path"    # True (包含路径)
[[ $STR == f* ]]    && echo "Starts with f"# True (以 f 开头)
```
### 字符串修剪 (String trimming)
```
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
```
STR="Hello"
echo ${#STR}      # => 5

# 数组长度
arr=(a b c)
echo ${#arr[@]}   # => 3
echo ${#arr}      # => 1 (第一个元素的长度)
```
### 字符类匹配 (Character class matching)
```
[[ $STR =~ [a-z] ]] && echo "Contains lowercase" # 包含小写字母
[[ $STR =~ [A-Z] ]] && echo "Contains uppercase" # 包含大写字母
[[ $STR =~ [0-9] ]] && echo "Contains numbers"   # 包含数字
[[ $STR =~ ^[A-Z] ]] && echo "Starts with uppercase" # 以大写字母开头
[[ $STR =~ [A-Z]$ ]] && echo "Ends with uppercase"   # 以大写字母结尾
```
### 切片 (Slicing)
```
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
参见: [参数扩展](http://wiki.bash-hackers.org/syntax/pe "http://wiki.bash-hackers.org/syntax/pe")
### 文件名与目录路径 (basepath & dirpath)
```
SRC="/path/to/foo.cpp"
```
```
BASEPATH=${SRC##*/}
echo $BASEPATH  # => "foo.cpp"
DIRPATH=${SRC%$BASEPATH}
echo $DIRPATH   # => "/path/to/"
```
### 变换 (Transform)
```
STR="HELLO WORLD!"
echo ${STR,}   # => hELLO WORLD!
echo ${STR,,}  # => hello world!
STR="hello world!"
echo ${STR^}   # => Hello world!
echo ${STR^^}  # => HELLO WORLD!
ARR=(hello World)
echo "${ARR[@],}" # => hello world
echo "${ARR[@]^" # => Hello World
```
## Bash 数组 (Bash Arrays)
### 定义数组 (Defining arrays)
```
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
|-|-|
|---|---|
|`${Fruits[0]}`|第一个元素|
|`${Fruits[-1]}`|最后一个元素|
|`${Fruits[*]}`|所有元素|
|`${Fruits[@]}`|所有元素|
|`${#Fruits[@]}`|所有元素的个数|
|`${#Fruits}`|第一个元素的长度|
|`${#Fruits[3]}`|第 n 个元素的长度|
|`${Fruits[@]:3:2}`|范围|
|`${!Fruits[@]}`|所有键 (Keys)|
### 迭代 (Iteration)
```
Fruits=('Apple' 'Banana' 'Orange')
for e in "${Fruits[@]}"; do
    echo $e
done
```
#### 带索引
```
for i in "${!Fruits[@]}"; do
  printf "%s\t%s\n" "$i" "${Fruits[$i]}"
done
```
### 操作 (Operations) {.col-span-2}
```
Fruits=("${Fruits[@]}" "Watermelon")     # 推入 (Push)
Fruits+=('Watermelon')                   # 也是推入
Fruits=( ${Fruits[@]/Ap*/} )             # 通过正则匹配移除
unset Fruits[2]                          # 移除一个项目
Fruits=("${Fruits[@]}")                  # 复制
Fruits=("${Fruits[@]}" "${Veggies[@]}")  # 连接 (Concatenate)
lines=(`cat "logfile"`)                  # 从文件读取
```
### 数组作为参数 (Arrays as arguments)
```
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
```
declare -A sounds
```
```
sounds[dog]="bark"
sounds[cow]="moo"
sounds[bird]="tweet"
sounds[wolf]="howl"
```
### 使用字典 (Working with dictionaries)
```
echo ${sounds[dog]} # 狗的声音
echo ${sounds[@]}   # 所有值
echo ${!sounds[@]}  # 所有键
echo ${#sounds[@]}  # 元素个数
unset sounds[dog]   # 删除 dog
```
### 迭代 (Iteration)
```
for val in "${sounds[@]}"; do
    echo $val
done
```
---
```
for key in "${!sounds[@]}"; do
    echo $key
done
```
## Bash 条件判断 (Bash Conditionals)
### 整数条件 (Integer conditions)
|条件|描述|
|---|---|
|`[[ NUM -eq NUM ]]`|等于|
|`[[ NUM -ne NUM ]]`|不等于|
|`[[ NUM -lt NUM ]]`|小于|
|`[[ NUM -le NUM ]]`|小于或等于|
|`[[ NUM -gt NUM ]]`|大于|
|`[[ NUM -ge NUM ]]`|大于或等于|
|`(( NUM < NUM ))`|小于|
|`(( NUM <= NUM ))`|小于或等于|
|`(( NUM > NUM ))`|大于|
|`(( NUM >= NUM ))`|大于或等于|
### 字符串条件 (String conditions)
|条件|描述|
|---|---|
|`[[ -z STR ]]`|空字符串|
|`[[ -n STR ]]`|非空字符串|
|`[[ STR == STR ]]`|等于|
|`[[ STR = STR ]]`|等于 (同上)|
|`[[ STR < STR ]]`|小于 _(ASCII)_|
|`[[ STR > STR ]]`|大于 _(ASCII)_|
|`[[ STR != STR ]]`|不等于|
|`[[ STR =~ STR ]]`|正则表达式|
### 示例 (Example) {.row-span-3}
#### 字符串
```
if [[ -z "$string" ]]; then
    echo "String is empty"
elif [[ -n "$string" ]]; then
    echo "String is not empty"
else
    echo "This never happens"
fi
```
#### 组合
```
if [[ X && Y ]]; then
    ...
fi
```
#### 等于
```
if [[ "$A" == "$B" ]]; then
    ...
fi
```
#### 正则表达式
```
if [[ '1. abc' =~ ([a-z]+) ]]; then
    echo ${BASH_REMATCH[1]}
fi
```
#### 小于
```
if (( $a < $b )); then
   echo "$a is smaller than $b"
fi
```
#### 存在
```
if [[ -e "file.txt" ]]; then
    echo "file exists"
fi
```
### 文件条件 (File conditions) {.row-span-2}
|条件|描述|
|---|---|
|`[[ -e FILE ]]`|存在|
|`[[ -d FILE ]]`|是目录|
|`[[ -f FILE ]]`|是文件|
|`[[ -h FILE ]]`|是符号链接|
|`[[ -s FILE ]]`|大小 > 0 字节|
|`[[ -r FILE ]]`|可读|
|`[[ -w FILE ]]`|可写|
|`[[ -x FILE ]]`|可执行|
|`[[ f1 -nt f2 ]]`|f1 比 f2 新|
|`[[ f1 -ot f2 ]]`|f2 比 f1 旧|
|`[[ f1 -ef f2 ]]`|是同一个文件|
### 更多条件 (More conditions)
| 条件 | 描述 |  
| -------------------- | -------------------- | ----- | --- |  
| `[[ -o noclobber ]]` | 如果 OPTION 选项已启用 |  
| `[[ ! EXPR ]]` | 非 (Not) |  
| `[[ X && Y ]]` | 与 (And) |  
| `[[ X | | Y ]]` | 或 (Or) |
### 逻辑与、或 (logical and, or)
```
if [ "$1" = 'y' -a $2 -gt 0 ]; then
    echo "yes"
fi
if [ "$1" = 'n' -o $2 -lt 0 ]; then
    echo "no"
fi
```
## Bash 循环 (Bash Loops)
### 基本 for 循环 (Basic for loop)
```
for i in /etc/rc.*; do
    echo $i
done
```
### C 风格 for 循环 (C-like for loop)
```
for ((i = 0 ; i < 100 ; i++)); do
    echo $i
done
```
### 范围 (Ranges) {.row-span-2}
```
for i in {1..5}; do
    echo "Welcome $i"
done
```
#### 带步长
```
for i in {5..50..5}; do
    echo "Welcome $i"
done
```
### 自增 (Auto increment)
```
i=1
while [[ $i -lt 4 ]]; do
    echo "Number: $i"
    ((i++))
done
```
### 自减 (Auto decrement)
```
i=3
while [[ $i -gt 0 ]]; do
    echo "Number: $i"
    ((i--))
done
```
### Continue (跳过本次循环)
```
for number in $(seq 1 3); do
    if [[ $number == 2 ]]; then
        continue;
    fi
    echo "$number"
done
```
### Break (跳出循环)
```
for number in $(seq 1 3); do
    if [[ $number == 2 ]]; then
        # 跳过剩余的循环
        break;
    fi
    # 这只会打印 1
    echo "$number"
done
```
### Until 循环
```
count=0
until [ $count -gt 10 ]; do
    echo "$count"
    ((count++))
done
```
### 死循环 (Forever)
```
while true; do
    # 这里的代码会一直运行
    # here is some code.
done
```
### 死循环 (简写)
```
while :; do
    # 这里的代码会一直运行
    # here is some code.
done
```
### 读取行 (Reading lines)
```
cat file.txt | while read line; do
    echo $line
done
```
## Bash 进程管理 (Bash Process Management)
### 进程控制 (Process control)
```
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
```
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
```
# 将进程作为文件处理
diff <(sort file1.txt) <(sort file2.txt)

# 将进程作为数组处理
files=($(ls))
```
### 并行执行 (Parallel execution)
```
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
```
trap 'echo "Signal received"' SIGINT SIGTERM

# 自定义清理函数
cleanup() {
    echo "Cleaning up..."
    # 清理代码
}
trap cleanup EXIT
```
## Bash 函数 (Bash Functions)
### 定义函数 (Defining functions)
```
myfunc() {
    echo "hello $1"
}
```
```
# 同上 (另一种语法)
function myfunc() {
    echo "hello $1"
}
```
```
myfunc "John"
```
### 返回值 (Returning values)
```
myfunc() {
    local myresult='some value'
    echo $myresult
}
```
```
result="$(myfunc)"
```
### 引发错误 (Raising errors)
```
myfunc() {
    return 1
}
```
```
if myfunc; then
    echo "success"
else
    echo "failure"
fi
```
## Bash 选项 (Bash Options) {.cols-2}
### 选项 (Options)
```
# 避免覆盖文件
# (echo "hi" > foo)
set -o noclobber
# 出错时退出
# 避免级联错误
set -o errexit
# 揭示隐藏的管道故障
set -o pipefail
# 暴露未设置的变量
set -o nounset
```
### Glob 选项 (Glob options)
```
# 不匹配的 glob 被移除
# ('*.foo' => '')
shopt -s nullglob
# 不匹配的 glob 抛出错误
shopt -s failglob
# 大小写不敏感的 glob
shopt -s nocaseglob
# 通配符匹配点文件 (dotfiles)
# ("*.sh" => ".foo.sh")
shopt -s dotglob
# 允许 ** 进行递归匹配
# ('lib/**/*.rb' => 'lib/a/b/c.rb')
shopt -s globstar
```
## Bash 配置文件 (Bash Configuration Files)
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

# 非交互式 Shell:
/etc/bash.bashrc      # 系统级 rc
~/.bashrc             # 用户级 rc
```
### 常见的 .bashrc 配置 (Common .bashrc configurations)
```bash
# 别名 (Aliases)
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias grep='grep --color=auto'

# 环境变量
export EDITOR=vim
export PAGER=less
export PS1='\u@\h:\w\$ '

# 历史记录设置
export HISTCONTROL=ignoredups:erasedups  # 无重复
export HISTSIZE=10000
export HISTFILESIZE=20000
shopt -s histappend  # 追加到历史记录，不要覆盖

# 更好的补全
bind "\e[A": history-search-backward"
bind "\e[B": history-search-forward"

# 彩色手册页 (man pages)
man() {
    LESS_TERMCAP_md=$'\e[01;31m' \
    LESS_TERMCAP_me=$'\e[0m' \
    LESS_TERMCAP_se=$'\e[0m' \
    LESS_TERMCAP_so=$'\e[01;33m' \
    LESS_TERMCAP_ue=$'\e[0m' \
    LESS_TERMCAP_us=$'\e[01;32m' \
    command man "$@"
}
```
### Shell 启动函数 (Shell startup functions)
```bash
# 添加到 PATH 的函数
add_to_path() {
    if [[ -d "$1" ]] && [[ ":$PATH:" != *":$1:"* ]]; then
        PATH="$1${PATH:+:$PATH}"
    fi
}

# 加载补全的函数
load_completion() {
    if [[ -f "$1/completion.bash" ]]; then
        source "$1/completion.bash"
    fi
}

# 示例用法
add_to_path "$HOME/.local/bin"
add_to_path "$HOME/.rbenv/bin"
load_completion "$HOME/.completions"
```
### Shell 类型 (Shell types)
```bash
# 检查 Shell 类型
echo $0                    # 当前 Shell 名称
echo $SHELL                # 默认 Shell
ps -p $$ -o comm=          # 当前 Shell 进程名称

# 切换 Shell
bash -l                    # 启动登录 Shell
bash -c "echo 'non-interactive'"  # 非交互式
zsh                        # 切换到 zsh (如果已安装)
```
## Bash 历史记录 (Bash History) {.cols-2}
### 命令 (Commands)
|命令|描述|
|---|---|
|`history`|显示历史记录|
|`sudo !!`|使用 sudo 运行上一个命令|
|`shopt -s histverify`|不要立即执行扩展结果|
### 扩展 (Expansions)
|表达式|描述|
|---|---|
|`!$`|扩展上一个命令的最后一个参数|
|`!*`|扩展上一个命令的所有参数|
|`!-n`|扩展倒数第 n 个命令|
|`!n`|扩展历史记录中的第 n 个命令|
|`!<command>`|扩展最近一次调用的 `<command>`|
### 操作 (Operations)
|代码|描述|
|---|---|
|`!!`|再次执行上一个命令|
|`!!:s/<FROM>/<TO>/`|将上一个命令中的第一个 `<FROM>` 替换为 `<TO>`|
|`!!:gs/<FROM>/<TO>/`|将上一个命令中的所有 `<FROM>` 替换为 `<TO>`|
|`!$:t`|仅扩展上一个命令的最后一个参数的基本名称 (basename)|
|`!$:h`|仅扩展上一个命令的最后一个参数的目录 (directory)|
`!!` 和 `!$` 可以被任何有效的扩展替换。
### 切片 (Slices)
|代码|描述|
|---|---|
|`!!:n`|仅扩展上一个命令的第 `n` 个标记 (命令是 `0`; 第一个参数是 `1`)||
|`!^`|扩展上一个命令的第一个参数|
|`!$`|扩展上一个命令的最后一个标记|
|`!!:n-m`|扩展上一个命令的标记范围|
|`!!:n-$`|扩展上一个命令从第 `n` 个标记到最后一个|
`!!` 可以替换为任何有效的扩展，例如 `!cat`, `!-2`, `!42` 等。
## 杂项 (Miscellaneous)
### 数值计算 (Numeric calculations)
```
$((a + 200))      # 给 $a 加上 200
```
```
$(($RANDOM%200))  # 0..199 之间的随机数
```
### 子 Shell (Subshells)
```
(cd somedir; echo "I'm now in $PWD")
pwd # 仍然在原来的目录
```
### 检查命令 (Inspecting commands)
```
command -V cd
#=> "cd is a function/alias/whatever"
```
### 重定向 (Redirection) {.row-span-2 .col-span-2}
```
python hello.py > output.txt   # stdout 重定向到 (文件)
python hello.py >> output.txt  # stdout 重定向到 (文件)，追加
python hello.py 2> error.log   # stderr 重定向到 (文件)
python hello.py 2>&1           # stderr 重定向到 stdout
python hello.py 2>/dev/null    # stderr 重定向到 (null)
python hello.py &>/dev/null    # stdout 和 stderr 重定向到 (null)
```
```
python hello.py < foo.txt      # 将 foo.txt 传给 python 的 stdin
```
### 高级重定向 (Advanced redirection)
```
# Tee - 读取 stdin 并写入 stdout 和文件
command | tee output.txt          # stdout 到文件和屏幕
command | tee -a output.txt       # 追加到文件
command | tee file1.txt file2.txt # 写入多个文件

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
while IFS= read -r line; do
    echo "Processing: $line"
done < input.txt
```
### 文件描述符重定向 (Redirection with file descriptors)
```
# 保存文件描述符
exec 3>&1  # 保存 stdout 到 fd 3
exec 1>output.txt  # 重定向 stdout 到文件
echo "This goes to file"  # 进入 output.txt
exec 1>&3  # 恢复 stdout
echo "This goes to screen"  # 进入屏幕

# 命名管道
mkfifo my_pipe
command1 > my_pipe &
command2 < my_pipe &
```
### 相对路径加载 (Source relative)
```
source "${0%/*}/../share/foo.sh"
```
### 脚本所在目录 (Directory of script)
```
DIR="${0%/*}"
```
### Case/Switch 语句
```
case "$1" in
    start | up)
    vagrant up
    ;;
    *)
    echo "Usage: $0 {start|stop|ssh}"
    ;;
esac
```
### 调试选项 (Debugging options)
```
# 启用调试
set -x              # 在执行命令时打印命令
set -v              # 在读取 Shell 输入行时打印它们
set -n              # 读取命令但不执行它们

# 调试特定函数
debug_function() {
    local func_name="$1"
    shift
    bash -xvc "source '$0'; $func_name $*"
}
```
### 错误处理策略 (Error handling strategies)
```
# 严格模式 (推荐用于生产环境)
set -euo pipefail
IFS=$'\n\t'

# 自定义错误处理程序
error_handler() {
    local exit_code=$?
    local line_number=$1
    echo "Error on line $line_number with exit code $exit_code" >&2
    echo "Command failed: $(history 1 | sed -e 's/^[ ]*//;s/[ ]*$//')" >&2
    exit $exit_code
}
trap 'error_handler $LINENO' ERR

# 验证必需变量
check_required_vars() {
    local var
    for var in "$@"; do
        if [[ -z "${!var}" ]]; then
            echo "Error: Required variable '$var' is not set" >&2
            exit 1
        fi
    done
}

# 示例用法
check_required_vars DB_HOST DB_USER DB_PASS
```
### 日志记录 (Logging)
```
# 简单日志记录
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >&2
}

# 带级别的日志记录
log_level=INFO

log_with_level() {
    local level="$1"
    shift
    if [[ $level == $log_level ]] || [[ $level == "ERROR" ]]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*" >&2
    fi
}

log_with_level "INFO" "Starting script"
log_with_level "DEBUG" "Debug information"
log_with_level "ERROR" "Something went wrong"
```
### 断言 (Assertion)
```
assert() {
    local condition="$1"
    local message="$2"
    if ! eval "$condition"; then
        echo "Assertion failed: $message" >&2
        echo "Condition: $condition" >&2
        exit 1
    fi
}

# 用法
assert "$count -gt 0" "Count must be positive"
assert "[[ -f '$file' ]]" "File must exist"
```
### 捕获错误 (Trap errors) {.col-span-2}
```
trap 'echo Error at about $LINENO' ERR
```
或者
```
traperr() {
    echo "ERROR: ${BASH_SOURCE[1]} at about ${BASH_LINENO[0]}"
}
set -o errtrace
trap traperr ERR
```
### printf 格式化输出
```
printf "Hello %s, I'm %s" Sven Olga
#=> "Hello Sven, I'm Olga
printf "1 + 1 = %d" 2
#=> "1 + 1 = 2"
printf "Print a float: %f" 2
#=> "Print a float: 2.000000"
```
### 获取选项/参数解析 (Getting options) {.col-span-2}
```
while [[ "$1" =~ ^- && ! "$1" == "--" ]]; do case $1 in
    -V | --version )
    echo $version
    exit
    ;; 
    -s | --string )
    shift; string=$1
    ;; 
    -f | --flag )
    flag=1
    ;; 
esac; shift; done
if [[ "$1" == '--' ]]; then shift; fi
```
### 检查命令结果 (Check for command's result) {.col-span-2}
```
if ping -c 1 google.com; then
    echo "It appears you have a working internet connection"
fi
```
### 特殊变量 (Special variables) {.row-span-2}
|表达式|描述|
|---|---|
|`$?`|上一个任务的退出状态|
|`$!`|上一个后台任务的 PID|
|`$$`|Shell 的 PID|
|`$0`|Shell 脚本的文件名|
参见 [特殊参数](http://wiki.bash-hackers.org/syntax/shellvars#special_parameters_and_shell_variables "http://wiki.bash-hackers.org/syntax/shellvars#special_parameters_and_shell_variables")。
### Grep 检查 (Grep check) {.col-span-2}
```
if grep -q 'foo' ~/.bash_history; then
    echo "You appear to have typed 'foo' in the past"
fi
```
### 反斜杠转义 (Backslash escapes) {.row-span-2}
- !
- "
- #
- &
- '
- (
- )
- ,
- ;
- <
- >
- [
- |
- \
- ]
- ^
- {
- }
- `
- $
- *
- ?
{.cols-4 .marker-none}
使用 `\` 转义这些特殊字符
### Heredoc (文档块)
```
cat <<END
hello world
END
```
### 返回上级/前一个目录 (Go to previous directory)
```
pwd # /home/user/foo
cd bar/
pwd # /home/user/foo/bar
cd -
pwd # /home/user/foo
```
### 读取输入 (Reading input)
```
echo -n "Proceed? [y/n]: "
read ans
echo $ans
```
```
read -n 1 ans    # 仅读取一个字符
```
### 条件执行 (Conditional execution)
```
git commit && git push
git commit || echo "Commit failed"
```
### 严格模式 (Strict mode)
```
set -euo pipefail
IFS=$'\n\t'
```
参见: [非官方 bash 严格模式](http://redsymbol.net/articles/unofficial-bash-strict-mode/ "http://redsymbol.net/articles/unofficial-bash-strict-mode/")
### 可选参数 (Optional arguments)
```
args=($@)
args+=(foo)
args+=(bar)
echo "${args[@]}"
```
将参数放入数组中，然后追加
### 实用的 Shell 技巧 (Practical Shell Tips)
### 文件操作 (File operations)
```
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
```
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
```
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
```
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
```
# 单位转换
echo "1024" | numfmt --to=iec       # 1.0K
echo "1K" | numfmt --from=iec --to=bytes  # 1024

# 计算百分比
awk '{printf "%.2f%%\n", $1/$2*100}' <(echo 75) <(echo 100)

# 数学运算
echo "scale=2; 10/3" | bc  # 3.33

# 随机数
echo $((RANDOM % 100 + 1))
```
### 条件快捷方式 (Conditional shortcuts)
```
# 检查命令是否存在
command -v git >/dev/null && echo "Git installed"

# 检查端口是否开放
nc -z localhost 8080 && echo "Port 8080 is open"

# 检查字符串是否包含子串
[[ "hello world" == *"world"* ]] && echo "Contains"

# 检查数组是否包含元素
arr=(a b c)
if [[ " ${arr[@]} " =~ " b " ]]; then
    echo "Array contains b"
fi
```
### 路径操作 (Path operations)
```
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
- [Shell vars](http://wiki.bash-hackers.org/syntax/shellvars "http://wiki.bash-hackers.org/syntax/shellvars") _(bash-hackers.org)_
- [Learn bash in y minutes](https://learnxinyminutes.com/docs/bash/ "https://learnxinyminutes.com/docs/bash/") _(learnxinyminutes.com)_
- [Bash Guide](http://mywiki.wooledge.org/BashGuide "http://mywiki.wooledge.org/BashGuide") _(mywiki.wooledge.org)_
- [ShellCheck](https://www.shellcheck.net/ "https://www.shellcheck.net/") _(shellcheck.net)_
- [shell - Standard Shell](https://devmanual.gentoo.org/tools-reference/bash/index.html "https://devmanual.gentoo.org/tools-reference/bash/index.html") _(devmanual.gentoo.org)_
