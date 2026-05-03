grep 是 Linux/Unix 下非常常用的文本搜索工具，用于在文件或输入流中查找匹配指定模式（通常是正则表达式）的行。下面是一些常用选项及简要说明：
基本用法
grep [选项] 模式 [文件...]
常用选项

1. 匹配控制
   • -i：忽略大小写
    grep -i "hello" file.txt

• -v：反向匹配，显示不匹配的行
 grep -v "error" log.txt

• -w：匹配整个单词
 grep -w "cat" file.txt

• -x：只匹配整行
 grep -x "exact line" file.txt

• -F：将模式当作固定字符串，而不是正则表达式
 grep -F ".\*" file.txt

2. 输出控制
   • -n：显示匹配行的行号
    grep -n "foo" file.txt

• -H：打印文件名（默认当搜索多个文件时）
 grep -H "foo" file1.txt file2.txt

• -h：不打印文件名
 grep -h "foo" file1.txt file2.txt

• --color：高亮匹配内容
 grep --color "foo" file.txt

3. 文件和目录
   • -r 或 -R：递归搜索目录
    grep -r "main" src/

• -l：只显示包含匹配内容的文件名
 grep -l "foo" \*.txt

• -L：只显示不包含匹配内容的文件名
 grep -L "foo" \*.txt

4. 上下文显示
   • -A n：显示匹配行及后面 n 行
    grep -A 2 "error" log.txt

• -B n：显示匹配行及前面 n 行
 grep -B 2 "error" log.txt

• -C n：显示匹配行及前后各 n 行
 grep -C 2 "error" log.txt

5. 统计和退出状态
   • -c：只显示匹配行数
    grep -c "foo" file.txt

• -q：静默模式，不输出结果，只通过退出状态表示是否匹配
 grep -q "foo" file.txt && echo "found"

6. 使用扩展正则表达式
   • -E：使用扩展正则表达式（等价于 egrep）
    grep -E "foo|bar" file.txt

• -P（GNU grep）：使用 Perl 正则表达式
 grep -P "\d+" file.txt
