find
===

在指定目录下查找文件

## 补充说明

**find命令** 用来在指定目录下查找文件。任何位于参数之前的字符串都将被视为欲查找的目录名。如果使用该命令时，不设置任何参数，则find命令将在当前目录下查找子目录与文件。并且将查找到的子目录和文件全部进行显示。

### 语法

```shell
find(选项)(参数)
```

#### 常见测试选项（Tests）

- -name '模式'：按文件名匹配，支持通配符（如 *.txt）。
- -type X：按文件类型匹配（f：普通文件，d：目录，l：符号链接等）。
- -user 用户名：匹配文件所有者（可用 ${USER} 表示当前用户）。
- -path '模式'：匹配完整路径（如隐藏目录 */.*/*）。
- -not：否定条件（如 -not -path 排除某些路径）。

#### 常见动作（Actions）

- -print：打印匹配路径（默认动作）。
- -prune：阻止 find 进入匹配的目录（用于剪枝，提高效率，避免不必要的子目录搜索）。
- -printf '格式'：自定义输出格式（如 %TY-%Tm-%Td %p\n 输出年-月-日 + 路径）。
- -o：逻辑 OR（或）操作符。

- #### 剪枝（Pruning）技巧

- 排除隐藏目录（如 .git 等）：常用 -path '*/.*/*' -prune。
- 要同时打印非隐藏路径：-path '*/.*/*' -prune -o -print。
- 替代方式（不使用 prune）：-not -path '*/.*/*'（更简洁，但 prune 在大目录中更高效）。
### 选项

```shell
-amin<分钟>：查找在指定时间曾被存取过的文件或目录，单位以分钟计算；
-anewer<参考文件或目录>：查找其存取时间较指定文件或目录的存取时间更接近现在的文件或目录；
-atime<24小时数>：查找在指定时间曾被存取过的文件或目录，单位以24小时计算；
-cmin<分钟>：查找在指定时间之时被更改过的文件或目录；
-cnewer<参考文件或目录>查找其更改时间较指定文件或目录的更改时间更接近现在的文件或目录；
-ctime<24小时数>：查找在指定时间之时被更改的文件或目录，单位以24小时计算；
-daystart：从本日开始计算时间；
-depth：从指定目录下最深层的子目录开始查找；
-empty：寻找文件大小为0 Byte的文件，或目录下没有任何子目录或文件的空目录；
-exec<执行指令>：假设find指令的回传值为True，就执行该指令；
-false：将find指令的回传值皆设为False；
-fls<列表文件>：此参数的效果和指定“-ls”参数类似，但会把结果保存为指定的列表文件；
-follow：排除符号连接；
-fprint<列表文件>：此参数的效果和指定“-print”参数类似，但会把结果保存成指定的列表文件；
-fprint0<列表文件>：此参数的效果和指定“-print0”参数类似，但会把结果保存成指定的列表文件；
-fprintf<列表文件><输出格式>：此参数的效果和指定“-printf”参数类似，但会把结果保存成指定的列表文件；
-fstype<文件系统类型>：只寻找该文件系统类型下的文件或目录；
-gid<群组识别码>：查找符合指定之群组识别码的文件或目录；
-group<群组名称>：查找符合指定之群组名称的文件或目录；
-help或--help：在线帮助；
-ilname<范本样式>：此参数的效果和指定“-lname”参数类似，但忽略字符大小写的差别；
-iname<范本样式>：此参数的效果和指定“-name”参数类似，但忽略字符大小写的差别；
-inum<inode编号>：查找符合指定的inode编号的文件或目录；
-ipath<范本样式>：此参数的效果和指定“-path”参数类似，但忽略字符大小写的差别；
-iregex<范本样式>：此参数的效果和指定“-regexe”参数类似，但忽略字符大小写的差别；
-links<连接数目>：查找符合指定的硬连接数目的文件或目录；
-lname<范本样式>：指定字符串作为寻找符号连接的范本样式；
-ls：假设find指令的回传值为True，就将文件或目录名称列出到标准输出；
-maxdepth<目录层级>：设置最大目录层级；
-mindepth<目录层级>：设置最小目录层级；
-mmin<分钟>：查找在指定时间曾被更改过的文件或目录，单位以分钟计算；
-mount：此参数的效果和指定“-xdev”相同；
-mtime<24小时数>：查找在指定时间曾被更改过的文件或目录，单位以24小时计算；
-name<范本样式>：指定字符串作为寻找文件或目录的范本样式；
-newer<参考文件或目录>：查找其更改时间较指定文件或目录的更改时间更接近现在的文件或目录；
-nogroup：找出不属于本地主机群组识别码的文件或目录；
-noleaf：不去考虑目录至少需拥有两个硬连接存在；
-nouser：找出不属于本地主机用户识别码的文件或目录；
-ok<执行指令>：此参数的效果和指定“-exec”类似，但在执行指令之前会先询问用户，若回答“y”或“Y”，则放弃执行命令；
-path<范本样式>：指定字符串作为寻找目录的范本样式；
-perm<权限数值>：查找符合指定的权限数值的文件或目录；
-print：假设find指令的回传值为True，就将文件或目录名称列出到标准输出。格式为每列一个名称，每个名称前皆有“./”字符串；
-print0：假设find指令的回传值为True，就将文件或目录名称列出到标准输出。格式为全部的名称皆在同一行；
-printf<输出格式>：假设find指令的回传值为True，就将文件或目录名称列出到标准输出。格式可以自行指定；
-prune：不寻找字符串作为寻找文件或目录的范本样式;
-regex<范本样式>：指定字符串作为寻找文件或目录的范本样式；
-size<文件大小>：查找符合指定的文件大小的文件；
-true：将find指令的回传值皆设为True；
-type<文件类型>：只寻找符合指定的文件类型的文件；
-uid<用户识别码>：查找符合指定的用户识别码的文件或目录；
-used<日数>：查找文件或目录被更改之后在指定时间曾被存取过的文件或目录，单位以日计算；
-user<拥有者名称>：查找符和指定的拥有者名称的文件或目录；
-version或——version：显示版本信息；
-xdev：将范围局限在先行的文件系统中；
-xtype<文件类型>：此参数的效果和指定“-type”参数类似，差别在于它针对符号连接检查。
```

### 参数

起始目录：查找文件的起始目录。

### 实例

```shell
# 当前目录搜索所有文件，文件内容 包含 “140.206.111.111” 的内容
find . -type f -name "*" | xargs grep "140.206.111.111"
```

#### 根据文件或者正则表达式进行匹配

列出当前目录及子目录下所有文件和文件夹

```shell
find .
```

在`/home`目录下查找以.txt结尾的文件名

```shell
find /home -name "*.txt"
```

同上，但忽略大小写

```shell
find /home -iname "*.txt"
```

当前目录及子目录下查找所有以.txt和.pdf结尾的文件

```shell
find . \( -name "*.txt" -o -name "*.pdf" \)

或

find . -name "*.txt" -o -name "*.pdf"
```

匹配文件路径或者文件

```shell
find /usr/ -path "*local*"
```

基于正则表达式匹配文件路径

```shell
find . -regex ".*\(\.txt\|\.pdf\)$"
```

同上，但忽略大小写

```shell
find . -iregex ".*\(\.txt\|\.pdf\)$"
```

#### 否定参数

找出/home下不是以.txt结尾的文件

```shell
find /home ! -name "*.txt"
```

#### 根据文件类型进行搜索

```shell
find . -type 类型参数
```

类型参数列表：

*    **f**  普通文件
*    **l**  符号连接
*    **d**  目录
*    **c**  字符设备
*    **b**  块设备
*    **s**  套接字
*    **p**  Fifo

#### 基于目录深度搜索

向下最大深度限制为3

```shell
find . -maxdepth 3 -type f
```

搜索出深度距离当前目录至少2个子目录的所有文件

```shell
find . -mindepth 2 -type f
```

#### 根据文件时间戳进行搜索

```shell
find . -type f 时间戳
```

UNIX/Linux文件系统每个文件都有三种时间戳：

*    **访问时间** （-atime/天，-amin/分钟）：用户最近一次访问时间。
*    **修改时间** （-mtime/天，-mmin/分钟）：文件最后一次修改时间。
*    **变化时间** （-ctime/天，-cmin/分钟）：文件数据元（例如权限等）最后一次修改时间。

搜索最近七天内被访问过的所有文件

```shell
find . -type f -atime -7
```

搜索恰好在七天前被访问过的所有文件

```shell
find . -type f -atime 7
```

搜索超过七天内被访问过的所有文件

```shell
find . -type f -atime +7
```

搜索访问时间超过10分钟的所有文件

```shell
find . -type f -amin +10
```

找出比file.log修改时间更长的所有文件

```shell
find . -type f -newer file.log
```

#### 根据文件大小进行匹配

```shell
find . -type f -size 文件大小单元
```

文件大小单元：

*    **b**  —— 块（512字节）
*    **c**  —— 字节
*    **w**  —— 字（2字节）
*    **k**  —— 千字节
*    **M**  —— 兆字节
*    **G**  —— 吉字节

搜索大于10KB的文件

```shell
find . -type f -size +10k
```

搜索小于10KB的文件

```shell
find . -type f -size -10k
```

搜索等于10KB的文件

```shell
find . -type f -size 10k
```

#### 删除匹配文件

删除当前目录下所有.txt文件

```shell
find . -type f -name "*.txt" -delete
```

#### 根据文件权限/所有权进行匹配

当前目录下搜索出权限为777的文件

```shell
find . -type f -perm 777
```

找出当前目录下权限不是644的php文件

```shell
find . -type f -name "*.php" ! -perm 644
```

找出当前目录用户tom拥有的所有文件

```shell
find . -type f -user tom
```

找出当前目录用户组sunk拥有的所有文件

```shell
find . -type f -group sunk
```

#### 借助`-exec`选项与其他命令结合使用

找出当前目录下所有root的文件，并把所有权更改为用户tom

```shell
find .-type f -user root -exec chown tom {} \;
```

上例中， **{}**  用于与 **-exec** 选项结合使用来匹配所有文件，然后会被替换为相应的文件名。

找出自己家目录下所有的.txt文件并删除

```shell
find $HOME/. -name "*.txt" -ok rm {} \;
```

上例中， **-ok** 和 **-exec** 行为一样，不过它会给出提示，是否执行相应的操作。

查找当前目录下所有.txt文件并把他们拼接起来写入到all.txt文件中

```shell
find . -type f -name "*.txt" -exec cat {} \;> /all.txt
```

将30天前的.log文件移动到old目录中

```shell
find . -type f -mtime +30 -name "*.log" -exec cp {} old \;
```

找出当前目录下所有.txt文件并以“File:文件名”的形式打印出来

```shell
find . -type f -name "*.txt" -exec printf "File: %s\n" {} \;
```

因为单行命令中-exec参数中无法使用多个命令，以下方法可以实现在-exec之后接受多条命令

```shell
-exec ./text.sh {} \;
```

#### 搜索但跳过指定的目录

查找当前目录或者子目录下所有.txt文件，但是跳过子目录sk

```shell
find . -path "./sk" -prune -o -name "*.txt" -print
```

> :warning: ./sk 不能写成 ./sk/ ，否则没有作用。

忽略两个目录

```shell
find . \( -path ./sk -o  -path ./st \) -prune -o -name "*.txt" -print
```

> :warning: 如果写相对路径必须加上`./`

#### find其他技巧收集

要列出所有长度为零的文件

```shell
find . -empty
```

#### 其它实例

```shell
find ~ -name '*jpg' # 主目录中找到所有的 jpg 文件。 -name 参数允许你将结果限制为与给定模式匹配的文件。
find ~ -iname '*jpg' # -iname 就像 -name，但是不区分大小写
find ~ ( -iname 'jpeg' -o -iname 'jpg' ) # 一些图片可能是 .jpeg 扩展名。幸运的是，我们可以将模式用“或”（表示为 -o）来组合。
find ~ \( -iname '*jpeg' -o -iname '*jpg' \) -type f # 如果你有一些以 jpg 结尾的目录呢？ （为什么你要命名一个 bucketofjpg 而不是 pictures 的目录就超出了本文的范围。）我们使用 -type 参数修改我们的命令来查找文件。
find ~ \( -iname '*jpeg' -o -iname '*jpg' \) -type d # 也许你想找到那些命名奇怪的目录，以便稍后重命名它们
```

最近拍了很多照片，所以让我们把它缩小到上周更改的文件

```shell
find ~ \( -iname '*jpeg' -o -iname '*jpg' \) -type f -mtime -7
```

你可以根据文件状态更改时间 （ctime）、修改时间 （mtime） 或访问时间 （atime） 来执行时间过滤。 这些是在几天内，所以如果你想要更细粒度的控制，你可以表示为在几分钟内（分别是 cmin、mmin 和 amin）。 除非你确切地知道你想要的时间，否则你可能会在 + （大于）或 - （小于）的后面加上数字。

但也许你不关心你的照片。也许你的磁盘空间不够用，所以你想在 log 目录下找到所有巨大的（让我们定义为“大于 1GB”）文件：

```shell
find /var/log -size +1G
```

或者，也许你想在 /data 中找到 bcotton 拥有的所有文件：

```shell
find /data -owner bcotton
```

你还可以根据权限查找文件。也许你想在你的主目录中找到对所有人可读的文件，以确保你不会过度分享。

```shell
find ~ -perm -o=r
```

删除 mac 下自动生成的文件

```shell
find ./ -name '__MACOSX' -depth -exec rm -rf {} \;
```

统计代码行数

```shell
find . -name "*.java"|xargs cat|grep -v ^$|wc -l # 代码行数统计, 排除空行
```



---

title: Find  
date: 2020-12-28 16:52:20  
tags:

- search
- file
- directory  
    categories:
- Linux Command  
    intro: |  
    This is a quick reference list of cheatsheet for linux find command, contains common options and examples.  
    plugins:
- copyCode

---

## Getting Started

### Usage

```
$ find [path...] [options] [expression]
```

Wildcard

```
$ find . -name "*.txt"
$ find . -name "2020*.csv"
$ find . -name "json_*"
```

---

- [Regex reference](/regex "/regex") _(cheatsheets.zip)_
- [Find cheatsheet](https://gist.github.com/gr1ev0us/3a9b9d9dbdd38f6379288eb2686fc538 "https://gist.github.com/gr1ev0us/3a9b9d9dbdd38f6379288eb2686fc538") _(gist.github.com)_

### Option Examples {.col-span-2}

|Option|Example|Description|
|---|---|---|
|`-type`|find . -type d|Find only directories|
|`-name`|find . -type f -name "*.txt"|Find file by name|
|`-iname`|find . -type f -iname "hello"|Find file by name (case-insensitive)|
|`-size`|find . -size +1G|Find files larger than 1G|
|`-user`|find . -type d -user jack|Find jack's file|
|`-regex`|find /var -regex '.*/tmp/.*[0-9]*.file'|Using Regex with find. See [regex](/regex "/regex")|
|`-maxdepth`|find . -maxdepth 1 -name "a.txt"|In the current directory and subdirectories|
|`-mindepth`|find / -mindepth 3 -maxdepth 5 -name pass|Between sub-directory level 2 and 4|

{.show-header}

### Type

|||
|---|---|
|`-type d`|Directory|
|`-type f`|File|
|`-type l`|Symbolic link|
|`-type b`|Buffered block|
|`-type c`|Unbuffered character|
|`-type p`|Named pipe|
|`-type s`|Socket|

### Size

|||
|---|---|
|`-size b`|512-byte blocks (default)|
|`-size c`|Bytes|
|`-size k`|Kilobytes|
|`-size M`|Megabytes|
|`-size G`|Gigabytes|
|`-size T`|Terabytes _(only BSD)_|
|`-size P`|Petabytes _(only BSD)_|

### Size +/-

Find all bigger than 10MB files

```
$ find / -size +10M
```

Find all smaller than 10MB files

```
$ find / -size -10M
```

Find all files that are exactly 10M

```
$ find / -size 10M
```

Find Size between 100MB and 1GB

```
$ find / -size +100M -size -1G
```

The `+` and `-` prefixes signify greater than and less than, as usual.

### Names

Find files using name in current directory

```
$ find . -name tecmint.txt
```

Find files under home directory

```
$ find /home -name tecmint.txt
```

Find files using name and ignoring case

```
$ find /home -iname tecmint.txt
```

Find directories using name

```
$ find / -type d -name tecmint
```

Find php files using name

```
$ find . -type f -name tecmint.php
```

Find all php files in directory

```
$ find . -type f -name "*.php"
```

### Permissions

Find the files whose permissions are 777.

```
$ find . -type f -perm 0777 -print
```

Find the files without permission 777.

```
$ find / -type f ! -perm 777
```

Find SUID set files.

```
$ find / -perm /u=s
```

Find SGID set files.

```
$ find / -perm /g=s
```

Find Read Only files.

```
$ find / -perm /u=r
```

Find Executable files.

```
$ find / -perm /a=x
```

### Owners and Groups

Find single file based on user

```
$ find / -user root -name tecmint.txt
```

Find all files based on user

```
$ find /home -user tecmint
```

Find all files based on group

```
$ find /home -group developer
```

Find particular files of user

```
$ find /home -user tecmint -iname "*.txt"
```

### Multiple filenames

```
$ find . -type f \( -name "*.sh" -o -name "*.txt" \)
```

Find files with `.sh` and `.txt` extensions

### Multiple dirs

```
$ find /opt /usr /var -name foo.scala -type f
```

Find files with multiple dirs

### Empty

```
$ find . -type d -empty
```

Delete all empty files in a directory

```
$ find . -type f -empty -delete
```

## Find Date and Time

### Means {.col-span-2}

|Option|Description|
|---|---|
|`atime`|access time (last time file opened)|
|`mtime`|modified time (last time file contents was modified)|
|`ctime`|changed time (last time file inode was changed)|

#### Example

|Option|Description|
|---|---|
|`-mtime +0`|Modified greater than 24 hours ago|
|`-mtime 0`|Modified between now and 1 day ago|
|`-mtime -1`|Modified less than 1 day ago (same as `-mtime 0`)|
|`-mtime 1`|Modified between 24 and 48 hours ago|
|`-mtime +1`|Modified more than 48 hours ago|
|`-mtime +1w`|Last modified more than 1 week ago|
|`-atime 0`|Last accessed between now and 24 hours ago|
|`-atime +0`|Accessed more than 24 hours ago|
|`-atime 1`|Accessed between 24 and 48 hours ago|
|`-atime +1`|Accessed more than 48 hours ago|
|`-atime -1`|Accessed less than 24 hours ago (same as `-atime 0`)|
|`-ctime -6h30m`|File status changed within the last 6 hours and 30 minutes|

### Examples

Find last 50 days modified files

```
$ find / -mtime 50
```

find last 50 days accessed files

```
$ find / -atime 50
```

find last 50-100 days modified files

```
$ find / -mtime +50 –mtime -100
```

find changed files in last 1 hour

```
$ find / -cmin -60
```

find modified files in last 1 hour

```
$ find / -mmin -60
```

find accessed files in last 1 hour

```
$ find / -amin -60
```

## Find and {.cols-2}

### Find and delete {.row-span-2}

Find and remove multiple files

```
$ find . -type f -name "*.mp3" -exec rm -f {} \;
```

Find and remove single file

```
$ find . -type f -name "tecmint.txt" -exec rm -f {} \;
```

Find and delete 100mb files

```
$ find / -type f -size +100m -exec rm -f {} \;
```

Find specific files and delete

```
$ find / -type f -name *.mp3 -size +10m -exec rm {} \;
```

### Find and replace

Find all files and modify the content `const` to `let`

```
$ find ./ -type f -exec sed -i 's/const/let/g' {} \;
```

Find readable and writable files and modify the content `old` to `new`

```
$ find ./ -type f -readable -writable -exec sed -i "s/old/new/g" {} \;
```

See also: [sed cheatsheet](/sed "/sed")

### Find and rename

Find and suffix (added `.bak`)

```
$ find . -type f -name 'file*' -exec mv {} {}.bak\;
```

Find and rename extension (`.html` => `.gohtml`)

```
$ find ./ -depth -name "*.html" -exec sh -c 'mv "$1" "${1%.html}.gohtml"' _ {} \;
```

### Find and move

```
$ find . -name '*.mp3' -exec mv {} /tmp/music \;
```

Find and move it to a specific directory (`/tmp/music`)

### Find and copy

```
$ find . -name '*2020*.xml' -exec cp -r "{}" /tmp/backup \;
```

Find matching files and copy to a specific directory (`/tmp/backup`)

### Find and concatenate

Merge all csv files in the download directory into `merged.csv`

```
$ find download -type f -iname '*.csv' | xargs cat > merged.csv
```

Merge all sorted csv files in the download directory into `merged.csv`

```
$ find download -type f -iname '*.csv' | sort | xargs cat > merged.csv
```

### Find and sort

Find and sort in ascending

```
$ find . -type f | sort
```

find and sort descending

```
$ find . -type f | sort -r
```

### Find and chmod {.row-span-1}

Find files and set permissions to 644.

```
$ find / -type f -perm 0777 -print -exec chmod 644 {} \;
```

Find directories and set permissions to 755.

```
$ find / -type d -perm 777 -print -exec chmod 755 {} \;
```

### Find and compress

Find all `.java` files and compress it into `java.tar`

```
$ find . -type f -name "*.java" | xargs tar cvf java.tar
```

Find all `.csv` files and compress it into `cheatsheets.zip`

```
$ find . -type f -name "*.csv" | xargs zip cheatsheets.zip
```