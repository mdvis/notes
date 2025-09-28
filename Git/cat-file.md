# cat-file
提供资源库对象的内容或类型和大小信息

```shell
// 提供存储库中对象的内容或类型
// 如果指定 type 则显示 object 的原始内容
git cat-file (-t [--allow-unknown-type]| -s [--allow-unknown-type]| -e | -p | <type> | --textconv | --filters ) [--path=<path>] <object> 

// 在 stdin 上提供一个对象列表，每个对象的 SHA-1，类型和大小都打印在 stdout 上
git cat-file (--batch | --batch-check) [ --textconv | --filters ] [--follow-symlinks]
```

*   \-t 显示标识的 object 类型
*   \-p 显示 pretty-print 打印的 object 的内容
*   \-s 显示标识的 object 大小
*   \-e 控制所有输出，如果 object 为有效对象，则返回零状态
*   \--textconv 显示由 textconv 过滤器转换的内容