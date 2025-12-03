# Shell脚本完全指南

## 基础语法与变量

### 变量操作
* 变量` = `两边不可有空格
* 局部变量(函数体内)使用 `local` 关键字
* 变量的使用 `echo $name` 或者 `echo${name}`
* 只读变量使用 `readonly` 关键字, 无法删除
* 变量的删除使用 `unset` 关键字

### 字符串变量 

#### 单引号
* 单引号变量 `var='test'` ，只能原样输出，变量无效
* 单引号中不能出现一个单独的单引号，转义也不可以

#### 双引号
* 双引号变量 `var="my name is ${name}"`，变量有效
* 可出现转义符

#### 拼接字符串
* 中间无任何 `+` 之类的字符
```
name="this is"" my name";
name="this is my name";
name="this" is "my name"

name='this is'' my name';
name='this is my name';
name='this' is 'my name' 
```

#### 获取字符串长度
*   在 `${}` 中使用 `#` 获取长度
```
name="test";
echo ${#name};
```

#### 提取子字符串
* `str:1:4` 从第2个开始 往后截取4个字符
* `str::4` 从第一个字符开始 往后截取4个字符
* `str:0-n:4` 从右边第n个字符开始 往后截取4个字符
```
name="this is my name";
echo ${name:1:4}   # his
echo ${name::4}    # this
echo ${name:0-4:4} # name
```

#### 截取子字符串
- `string#substr` 向右第一次匹配 `substr` 的位置之后向右截取所有
- `string##substr` 向右最后匹配 `substr` 的位置之后向右截取所有
- `string%substr` 向左第一次匹配 `substr` 的位置之前向左截取所有
- `string%%substr` 向左最后匹配 `substr` 的位置之前向左截取所有
```
echo ${name#*is}   # is my name
echo ${name##*is}  # my name
echo ${name%is*}   # this
echo ${name%%is*}  # th
```

#### 替换字符串
- `string/substr/substr2` 将第一次匹配的 sbustr 替换为 substr2
- `string//substr/substr2` 将所有匹配的 sbustr 替换为 substr2

#### 延伸知识：shell 变量扩展语法
- `${VAR:-default}`：VAR 未定义或为空时使用 default
- `${VAR:=default}`：VAR 未定义或为空时将其设为 default
- `${VAR:+value}`：VAR 非空时使用 value，否则为空
- `${VAR#pattern}`：从 VAR 开头删除最短匹配 pattern 的部分
- `${VAR##pattern}`：从 VAR 开头删除最长匹配 pattern 的部分

### 数组
只支持一维数组，小括号做边界，空格分离每个元素
```
array_name=(li wang xiang zhang)
array_name[0]="li"
array_name[3]="zhang"
echo ${array_name[0]} ## 输出"li"
echo ${array_name[1]} ## 输出" "
echo ${array_name[3]} ## 输出"zhang"
```
*   取得所有元素：`${array_name[@]}` 或者 `${array_name[*]}`
*   取得元素个数：`${#array_name[@]}` 或者 `${#array_name[*]}`

### 运算

#### 算数运算
```
# 语法
# $((arithmetic_operation))
$((1+1))

# $[arithmetic_operation]
$[2+2]
```

#### 关系运算符(数字)
关系运算符只支持数字，不支持字符串，除非字符串的值是数字。 
* `-eq` 检测两个数是否相等
* `-ne` 检测两个数是否不相等
* `-gt` 检测左边的数是否大于右边的
* `-lt` 检测左边的数是否小于右边的
* `-ge`检测左边的数是否大于等于右边的
* `-le` 检测左边的数是否小于等于右边的

#### 关系运算符(字符串)
* ` = ` 检测两个字符串是否相等，相等返回 true。
- ` =~ ` 正则匹配
* `!=` 检测两个字符串是否不相等，不相等返回 true。
* `-z` 检测字符串长度是否为0，为0返回 true。
* `-n` 检测字符串长度是否不为0，不为0返回 true。

#### 布尔运算符
* `!` 非运算，表达式为 true 则返回 false，否则返回 true。
* `-o` 或运算，有一个表达式为 true 则返回 true。
* `-a` 与运算，两个表达式都为 true 才返回 true。

#### 逻辑运算符
* `&&` 逻辑的 AND
* `||` 逻辑的 OR

#### 文件运算符
* `-b file` 检测文件是否是块设备文件
* `-c file` 检测文件是否是字符设备文件
* `-d file` 检测文件是否是目录
* `-f file` 检测文件是否是普通文件（不是目录、设备文件）
* `-g file` 检测文件是否设置了 SGID 位
* `-k file` 检测文件是否设置了粘着位(Sticky Bit)
* `-p file` 检测文件是否是有名管道
* `-u file` 检测文件是否设置了 SUID 位
* `-r file` 检测文件是否可读
* `-w file` 检测文件是否可写
* `-x file` 检测文件是否可执行
* `-s file` 检测文件是否为空（文件大小是否大于0）
* `-e file` 检测文件（包括目录）是否存在
- `-nt 文件名` 比...更新 
- `-ot 文件名` 比...更旧

#### 链接
`-L` 是否是链接

#### 逻辑判断
1. **中括号**和**运算符**两边必须添加空格
2. `[[]]` 适用于字符串，`(())` 适用于数值
3.  使用 `[[ ... ]]` 条件判断结构，而不是 `[ ... ]`，能防止许多逻辑错误。
	1. 如，`&&`、`||`、`<` 和 `>` 操作符在`[[]]`条件判断结构中正常，在`[]`结构中的话，会报错。
	2. 如，可直接用`if [[ $a != 1 && $a != 2 ]]`, 如果不适用双括号, 则为 `if [ $a -ne 1 ] && [ $a != 2 ]`或者 `if [ $a -ne 1 -a $a != 2 ]`。
	3. `[[]]`中增加模式匹配特效； 
	4. `(( ))`不需要再将表达式里面的大小于符号转义

### printf
- **echo** 仅用于字符串的输出
- **printf** 移植性好，**printf** 不会像 **echo** 自动添加换行符，我们可以手动添加 `\n` 无大括号，直接以空格分隔
```
# format-string: 格式控制字符串
# arguments: 参数列表

printf format-string [arguments...] 

```
案例
```
printf "%-10s %-8s %-4.2f\\n" 郭靖 男 66.1234
```
* `%d`：Decimal 十进制整数
* `%s`：String 字符串
* `%c`：Char 字符
* `%f`：Float 浮点
* `-`：表示左对齐
* `%-10s` ： 宽度10个字符，不足以空格填充，超过会全部显示
* `%-4.2f`：指格式化为小数，宽度为4个字符，其中.2指保留2位小数

转义符：
* `\a` ：警告字符，通常为 ASCII 的 BEL 字符
* `\b` ：后退
* `\c` ：抑制（不显示）输出结果中任何结尾的换行字符（只在%b格式指示符控制下的参数字符串中有效），而且，任何留在参数里的字符、任何接下来的参数以及任何留在格式字符串中的字符，都被忽略
* `\f` ：换页（formfeed）
* `\n` ：换行
* `\r` ：回车（Carriage return）
* `\t` ：水平制表符
* `\v` ：垂直制表符
* `\`：一个字面上的反斜杠字符
* `\d`dd ：表示1到3位数八进制值的字符。仅在格式字符串中有效
* `\0`ddd ：表示1到3位的八进制值字符

## Here Document 特性

Here document 是一种特殊重定向方式。
```
# 其作用是将两个 delimiter 之间内容（here document content 部分）传递给 cmd 作为输入参数
cmd << delimiter
    here document content
delimiter
```
*   这里的 delimiter 只是一个标识，可以是任意合法字符（约定大于配置）
*   起始 deliniter 前后空格会被省略
*   结尾 deliniter 顶格，前后不能有任意字符

Here document 可以用于终端命令，也可以在文件中使用
```
cat << EOF > output.txt
echo "hello"
echo "world"
EOF

// output.txt
echo "hello"
echo "world"
```

### 变量处理
在脚本中
```
cat << EOF > output.sh
echo $1
EOF // 变量会替换为脚本执行输入的变量

cat << "EOF" > output.sh
echo $1
EOF // $1 原样输出
```
将 `<<` 替换为 `<<-` ，Here Document 内容前的tab（制表符）会被删除

## 流程控制

### **1. `if` 语句**
**语法**：
```bash
if [ 条件判断 ]; then
	命令1
	命令2
elif [ 条件判断2 ]; then
	命令3
else
	命令4
fi
```
**注意事项**：
- 条件判断需用 `[ ]` 或 `[[ ]]` 包裹，后者功能更强大（支持正则、逻辑运算符）。
- 条件与方括号之间需有空格，例如 `[ "$a" -eq 1 ]`。
- 使用 `&&` 和 `||` 时需用双括号 `(( ))` 或 `[[ ]]`，例如 `[[ "$a" -eq 1 && "$b" -eq 2 ]]`。

### **2. `for` 循环**
**语法**：
```bash
for 变量 in 值1 值2 值3; do
	命令1
	命令2
done

# C 风格语法（Bash 支持）
for ((初始值; 条件; 步进)); do
	命令
done
```
**注意事项**：
- 值列表默认以空格分隔，若值包含空格需用引号包裹。
- C 风格语法需用双括号 `(( ))`，变量无需 `$` 前缀。

### **3. `while` 循环**
**语法**：
```bash
while [ 条件判断 ]; do
	命令1
	命令2
done
```
**注意事项**：
- 条件判断失败时退出循环，需确保循环内有改变条件的操作，避免死循环。

### **4. `until` 循环**
**语法**：
```bash
until [ 条件判断 ]; do
	命令1
	命令2
done
```
**注意事项**：
- 与 `while` 相反，条件**不满足**时执行循环，直到条件满足时退出。

### **5. `case` 语句**
**语法**：
```bash
case "$变量" in
	值1)
		命令1
		;;
	值2)
		命令2
		;;
	*)
		默认命令
		;;
esac
```
**注意事项**：
- 每个分支以 `)` 结尾，以 `;;` 结束执行。
- `*)` 表示默认分支，需放在最后。

### **6. `break` 语句**
**语法**：
```bash
break [n] # n 可选，表示跳出 n 层循环（默认 1）
```
**注意事项**：
- 用于立即终止当前循环，执行循环后的代码。

### **7. `continue` 语句**
**语法**：
```bash
continue [n] # n 可选，表示跳到 n 层循环的下一次迭代（默认 1）
```
**注意事项**：
- 用于跳过当前循环的剩余代码，直接进入下一次迭代。

### **示例代码**
以下是一个综合示例，展示上述结构的用法：
```bash
#!/bin/bash

# if 示例
if [ "$1" = "start" ]; then
	echo "启动服务..."
elif [ "$1" = "stop" ]; then
	echo "停止服务..."
else
	echo "用法: $0 [start|stop]"
fi

# for 示例
for i in {1..5}; do
	echo "循环 $i"
	if [ "$i" -eq 3 ]; then
		break # 跳出循环
	fi
done

# while 示例
count=1
while [ "$count" -le 5 ]; do
	if [ "$count" -eq 4 ]; then
		count=$((count + 1))
		continue # 跳过当前迭代
	fi
	echo "计数: $count"
	count=$((count + 1))
done

# until 示例
num=5
until [ "$num" -lt 1 ]; do
	echo "倒数: $num"
	num=$((num - 1))
done

# case 示例
case "$2" in
	debug)
		echo "启用调试模式"
		;;
	verbose)
		echo "启用详细输出"
		;;
	*)
		echo "使用默认配置"
		;;
esac
```

### **常见错误与建议**
1. **条件判断的空格**：`[ "$a" = "b" ]` 而非 `[$a="b"]`。
2. **变量引用**：始终用双引号包裹变量（如 `"$var"`），避免分词和通配符扩展问题。
3. **死循环**：确保 `while`/`until` 循环内有改变条件的操作。
4. **权限问题**：脚本开头添加 `#!/bin/bash`，并通过 `chmod +x` 赋予执行权限。

## 函数

### 函数定义
```bash
name(){} # 通用性最好

function name(){}
```

### 参数传递
* `$0` 代表执行的文件名
* `$1` 代表传入的第1个参数
* `$n` 代表传入的第n个参数
* `$#` 参数个数
* `$@` 与 `$*` 所有参数
	1. `$*` 所有参数组成的一个字符串，参数间默认空格分隔；
	2. `$@` 每个参数作为独立字符串，可以用循环处理每个参数。
* `$$`  脚本运行的当前进程号
* `$!` 后台运行的最后一个进程的ID
* `$?` 显示最后命令的退出状态。0表示没有错误，其他任何值表明有错误。

## 脚本执行方式

### fork
```sh
path/script.sh
```
会在子shell中执行，从父shell继承环境变量，子shell环境变量不会带回父shell，执行完返回父shell

### exec
```sh
exec path/script.sh
```
不需要子shell，脚本在同一个shell执行，但是父脚本exec语句后的部分不再执行(与source区别)

### source
```sh
source path/script.sh
```
无子shell，在同一个shell中执行。被调用脚本变量和环境变量都可在主脚本中进行

| Name            | File Desc. | Desc. | Abbr.  |
| --------------- | ---------- | ----- | ------ |
| Standard Input  | 0          |       | stdin  |
| Standard Output | 1          |       | stdout |
| Standard Error  | 2          |       | stderr |
## 输出重定向
`File_Desc >& Pointer`

`0<` 标准输入
`1>` 标准输出，简写 `>`
`2>` 错误输出
`&>` 为 `2>&1` 缩写这段内容详细介绍了编写高效、可靠和用户友好的 Shell 脚本的最佳实践。以下是对其内容的总结和概括：
### **1. 提供帮助信息 (--help)**
- 脚本应支持 `--help` 或 `-h` 参数，打印使用说明。
- 示例：
  ```sh
  if [ ${#@} -ne 0 ] && [ "${@#"--help"}" = "" ]; then
    printf -- '...help...\n';
    exit 0;
  fi;
  ```
### **2. 检查命令的可用性**
- 使用 `command -v` 检查依赖命令是否存在。
- 如果命令不可用，提示用户如何安装并退出脚本。
- 示例：
  ```sh
  _=$(command -v docker);
  if [ "$?" != "0" ]; then
    printf -- 'You don'\''t seem to have Docker installed.\n';
    printf -- 'Get it: https://www.docker.com/community-edition\n';
    exit 127;
  fi;
  ```
### **3. 独立于当前工作目录**
- 使用绝对路径或脚本相对路径（`dirname $0`）避免路径问题。
- 示例：
  ```sh
  CURR_DIR="$(dirname $0)";
  mv "${CURR_DIR}/application.jar" /opt/app.jar;
  ```
### **4. 输入方式：环境变量 vs. 标记**
- **环境变量**：用于不影响脚本行为的值（如访问令牌）。
  ```sh
  export AWS_ACCESS_TOKEN='xxxxxxxxxxxx';
  ./provision-everything
  ```
- **标记**：用于影响脚本行为的值（如异步模式、实例数量）。
  ```sh
  ./provision-everything --async --instance-count 400
  ```
### **5. 打印操作步骤**
- 在终端上打印脚本执行的操作步骤，方便用户回溯。
- 示例：
  ```sh
  printf -- 'Downloading required document to ./downloaded... ';
  wget -o ./downloaded https://some.site.com/downloaded;
  printf -- 'Moving ./downloaded to /opt/downloaded... ';
  mv ./downloaded /opt/;
  ```
### **6. 提供静默模式 (--silent)**
- 使用 `stty -echo` 和 `trap` 实现静默模式，并在必要时恢复输出。
- 示例：
  ```sh
  if [ ${#@} -ne 0 ] && [ "${@#"--silent"}" = "" ]; then
    stty -echo;
    trap 'stty echo' EXIT;
  fi;
  ```
### **7. 显示进度**
- 使用循环和动画显示长时间任务的进度。
- 示例：
  ```sh
  printf -- 'Performing asynchronous action..';
  DONE=0;
  while [ $DONE -eq 0 ]; do
    ./async-checker;
    if [ "$?" = "0" ]; then
      DONE=1;
    fi;
    printf -- '.';
    sleep 1;
  done;
  printf -- ' DONE!\n';
  ```
### **8. 颜色编码输出**
- 使用 ANSI 转义序列为输出添加颜色，区分成功、警告和错误。
- 示例：
  ```sh
  printf -- '\033[32m SUCCESS: yay \033[0m\n';
  printf -- '\033[31m ERROR: fubar \033[0m\n';
  ```
### **9. 错误处理**
- 使用 `set -e` 让脚本在出现错误时立即退出。
- 使用 `trap` 捕获信号并执行清理工作。
- 示例：
  ```sh
  set -e;
  trap 'handle_exit_code' EXIT;
  ```
### **10. 清理工作**
- 在脚本结束时执行清理操作。
- 示例：
  ```sh
  handle_exit_code() {
    printf -- "Cleaning up now... ";
    # 清理代码
    printf -- "DONE.\n";
  }
  trap "handle_exit_code" EXIT;
  ```
### **11. 使用不同的错误码**
- 为不同错误分配唯一错误码，便于调试。
- 示例：
  ```sh
  if [ "$?" != "0" ]; then
    printf -- 'X happened. Exiting with status code 1.\n';
    exit 1;
  fi;
  ```
### **12. 打印新行**
- 在脚本结束时打印一个新行，保持控制台整洁。
- 示例：
  ```sh
  printf -- '\n';
  exit 0;
  ```
### **13. 其他最佳实践**
- **本地变量**：在函数内部使用 `local` 定义变量。
- **只读变量**：使用 `readonly` 定义不可修改的变量。
- **`$()` 替代反引号**：更易读且嵌套方便。
- **双中括号 `[[ ]]`**：支持更多条件操作符（如 `&&`, `||`）。
- **数组**：支持复杂数据结构。
  ```sh
  Arr=(1 2 3 4);
  echo "${#Arr[@]}";  # 输出数组长度
  ```
### **14. 调试和跟踪**
- 使用 `set -x` 打印每条命令的执行内容。
- 使用 `set -e` 在错误时立即退出。
- 使用 `set -o pipefail` 解决管道问题。
### **15. 不适合使用 Bash 脚本的场景**
- 脚本过长（几百行以上）。
- 需要复杂数据结构或大量字符串操作。
- 性能要求高。
### **总结**
这些最佳实践旨在提高脚本的可读性、可靠性和用户体验，同时减少潜在的错误和维护成本。遵循这些原则，可以编写出更专业、高效的 Shell 脚本。