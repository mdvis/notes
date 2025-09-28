# flag
内置 flag 包实现命令行参数的解析，使得开发命令行工具更简单

os.Args

* * *

简单的获取命令行参数

flag

* * *

### 参数类型

| flag类型 | 有效值 |
| --- | --- |
| 字符串(String) | 字符串 |
| 整数(Int,int64,Uint,Uint64) | 12，064，0x88，复数等 |
| 浮点数(Float64) | 浮点数 |
| 布尔类型(Bool) | 1, 0, t, f, T, F, true, false, TRUE, FALSE, True, False |
| 时间段(Duration) | ns/us/ms/s/m/h,eg. -1.5h, 30ms |

### 定义 flag

```go
flag.<Type>(flag_name, default_value, help_message) *Type

name := flag.String("name", "张三", "姓名")
age := flag.Int("age", "18", "年龄")
```

```go
flag.<Type>Var(*Type, flag_name, default_value, help_message)

var name string
var age int
flag.StringVar(&name, "name", "张三", "姓名")
flag.IntVar(&age, "age", "18", "年龄")
```

flag.Parse()

* * *

参数解析，支持的参数格式如下（布尔类型必须使用等号方式）

*   `-flag xxx`
*   `--flag xxx`
*   `-flag=xxx`
*   `--flag=xxx`

Parse 解析在第一个非 flag 参数停止，或者终止符 “-” 后停止

### flag.Args()

其他参数

### flag.NArg()

其它参数个数

### flag.NFlag()

使用的参数个数