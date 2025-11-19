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
## 变量
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