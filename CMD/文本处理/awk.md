`awk`是一个强大的文本处理工具，常用于对结构化文本（如日志、CSV等）进行提取、计算和格式化。以下是 **常用 `awk`命令示例**，涵盖大部分日常场景：
### **1. 基本结构**
```
awk 'pattern {action}' file
```
- 按行处理文本，若行匹配 `pattern`则执行 `{action}`。
- 省略 `pattern`则对所有行执行；省略 `{action}`则打印匹配行。
### **2. 常用内置变量**
|变量|含义|
|---|---|
|`$0`|当前行完整内容|
|`$1, $2...`|第1、2...个字段（默认以空格/TAB分隔）|
|`NF`|当前行的字段数|
|`NR`|当前行号（所有文件累计）|
|`FNR`|当前文件的行号（每个文件单独计数）|
|`FS`|输入字段分隔符（默认空格/TAB）|
|`OFS`|输出字段分隔符（默认空格）|
### **3. 常用示例**
#### **① 提取指定列**
```
awk '{print $1, $3}' file.txt        # 打印第1列和第3列
awk '{print $NF}' file.txt           # 打印最后一列
```
#### **② 指定分隔符**
```
awk -F ',' '{print $1, $2}' data.csv  # 输入分隔符为逗号
awk -F '[: ]' '{print $1}' file       # 分隔符可以是正则（冒号或空格）
```
#### **③ 条件过滤行**
```
awk '$3 > 100 {print $0}' file        # 第3列大于100的行
awk '/error/ {print NR, $0}' file     # 包含"error"的行，并显示行号
awk '$1 ~ /^192\.168/ {print $0}' file  # 第1列匹配正则
```
#### **④ 内置计算**
```
awk '{sum += $1} END {print sum}' file     # 对第1列求和
awk '{sum+=$1; count++} END {print sum/count}' file  # 计算平均值
awk 'NR==1 {min=$1} $1<min {min=$1} END {print min}' file  # 找最小值
```
#### **⑤ 修改输出分隔符**
```
awk -v OFS='\t' '{print $1, $2}' file   # 输出用TAB分隔
awk -v OFS=',' '{print $1, $2}' file    # 输出CSV格式
```
#### **⑥ 多文件处理**
```
awk '{print FILENAME, NR, FNR, $0}' file1 file2  # 显示文件名和行号
```
#### **⑦ 复杂逻辑（if/for）**
```
awk '{if ($1 > 10) print "large:" $1; else print "small:" $1}' file
awk '{for (i=1; i<=NF; i++) print $i}' file  # 拆分所有字段
```
### **4. 实用单行命令**
```
# 统计文件行数（等效 wc -l）
awk 'END {print NR}' file
# 去重（按某列）
awk '!seen[$1]++' file  # 按第1列去重首次出现的行
# 提取两个模式之间的行
awk '/start/,/end/' file
# 打印第10-20行
awk 'NR>=10 && NR<=20' file
# 替换字段内容
awk '{$2="new"; print $0}' file
# 分组统计（如统计IP访问次数）
awk '{ip[$1]++} END {for (i in ip) print i, ip[i]}' log.txt
```
### **5. 常用参数**
- `-F`：指定输入分隔符（`-F:`, `-F'[, ]'`）
- `-v var=value`：定义变量（`awk -v OFS=','`）
- `-f script.awk`：从文件读取awk脚本
### **示例文件测试**
假设 `data.txt`内容：
```
Alice 85 90
Bob 72 88
Carol 95 91
```
运行：
```
awk '{avg=($2+$3)/2; print $1, avg}' data.txt
```
输出：
```
Alice 87.5
Bob 80
Carol 93
```
掌握这些基本可以解决 80% 的文本处理需求。更复杂的逻辑可结合**数组、函数、多行处理**等高级特性。
