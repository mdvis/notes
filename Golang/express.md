# express
表达式

* * *

\[TOC\]

保留字

* * *

| 1   | 2   | 3   | 4   | 5   |
| --- | --- | --- | --- | --- |
| break | default | func | interface | select |
| case | defer | go  | map | struct |
| chan | else | goto | package | switch |
| const | fallthrough | if  | range | type |
| continue | for | import | return | var |

运算符

* * *

| 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ()  | \-  | ^   | \*= | <<= | ++  | \-- | !   |
| +   | .   | &   | +=  | &=  | &&  | \== | !=  |
| \|  | \-= | \|= | \|  | <   | <=  | \[\] | \*  |
| ^=  | <-  | \>  | \>= | {}  | /   | <<  | /=  |
| \=  | :=  | ,   | ;   | %   | \>> | %=  | \>>= |
| ... | :   | &^  | &^= |     |     |     |     |

幂等 math.Pow 绝对值 math.Abs

位移右操作数必须是无符号整数，或可以转换的无显示类型常量。非常量位移表达式，会优先将无显式类型的常量左操作数转型

*   AND &
*   OR |
*   XOR a^b
*   NOT ^a
*   AND NOT(按位清除) &^
*   LEFT SHIFT(位左移) <<
*   RIGHT SHIFT >>

位清除：左右操作数对应二进制位都为1的重置为0

```go
const( 
   read  byte=1<<iota
   write
   exec
   freeze
) 

func main() { 
   a:=read|write|freeze
   b:=read|freeze|exec
   c:=a&^b     // 相当于a^read^freeze，但不包括exec

   fmt.Printf("%04b&^ %04b= %04b\n",a,b,c) 
}
```

自增 自减不再是运算符。只能作为独立语句，不能用于表达式

指针
--

*   不能将内存地址与指针混为一谈
*   内存地址：内存中每个字节单元的唯一编号
*   指针： 一个实体，会分配内存空间，相当于一个专门用来保存地址的整型变量
*   取址运算符 “&” 用于获取对象地址
*   指针运算符 “\*” 用于间接引用目标对象
*   二级指针\*\_T，如包含包名则可写成\_package.T

并非所有对象都能进行取地址操作，但变量总是能正确返回（addressable）。指针运算符为左值时，我们可更新目标对象状态；而为右值时则是为了获取目标状态。

初始化

* * *

复合类型（arr, splice, map,struct)

*   初始化表达式必须含类型标签
*   左花括号必须在类型尾部，不能另起一行
*   多个成员初始值以逗号分隔
*   允许多行，但每行须以逗号或右花括号结束

流控制

* * *

### if

初始化语句支持，可定义块局部变量或执行初始函数，局部变量的有效范围包含整个if/else块

```go
if xinit();x==0{}
if a,b:=x,y;a<b{}
```

### switch

*   switch 也支持初始化语句
*   省略switch条件默认值为true
*   空case不构成多条件匹配，隐式 break，case执行完毕后自动中断。
*   **如须贯通后续case（源码顺序），须执行fallthrough，但不再匹配后续条件表达式。**
*   fallthrough 必须在case结尾，可使用breake阻止

```go
switch x：=5， x {
    case a,b: // 多条件满足其一即可OR
    ...
    case 5:
    fallthrough
    case 6:
    ...
    case 7：
    if x > 10 {
    break
    }
    fallthrough
    default:
    ...
}
```

### for

初始化语句仅被执行一次。条件表达式中如有函数调用，须确认是否会重复执行。可能会被编译器优化掉，也可能是动态结果须每次执行确认。

for...range 迭代支持字符串 数组 数组指针 切片 字典 通道 返回索引和键值数据

### goto continue break

*   goto 使用goto前必须先定义标签，区分大小写 不能跳转到其他函数或内层代码块
*   break 用于 Switch for select，终止整个语句块执行
*   continue 仅用于for，终止后续逻辑，进入下次循环

break 和 continue 可以配合标签在多层嵌套中指定目标层级

```go
func main() { 
outer: 
   for x:=0;x<5;x++ { 
       for y:=0;y<10;y++ { 
           if y>2{ 
               println() 
               continue outer
            } 
           if x>2{ 
               break outer
            } 

           print(x, ":",y, " ") 
        } 
    } 
}
```

二级指针

```go
func test(p **int){
    x:=100
    *p =&x
}
func main(){
var i *int
test(&i)
fmt.Println(*i)
}
```

函数参数过多建议使用一个复合结构类型

```go
type serverOption struct{ 
   address string
   port  int
   path  string
   timeout time.Duration
   log    *log.Logger
} 

func newOption() *serverOption{ 
   return &serverOption{             // 默认参数 
       address: "0.0.0.0", 
       port:   8080, 
       path:    "/var/test", 
       timeout:time.Second*5, 
       log:    nil, 
    } 
} 

func server(option *serverOption) {} 

func main() { 
   opt:=newOption() 
   opt.port=8085         // 命名参数设置 

   server(opt) 
}
```

变参
--

变参本质上是一个切片，只能接收同类型参数，在最尾部

```go
func test(s string, a ...int){}
```

变参中，参数是数组时需要转为切片，切片需要展开传入

```go
a := [2]int{1,2}
test(a[:]...)
```

既然变参是切片，那么参数复制的仅是切片自身，并不包括底层数组，也因此可修改原数据。如果需要，可用内置函数copy复制底层数据

```go
a:=[]int{1,2}
test(b ...int){b[1]=10}
println(a) //[]int{1,10}
```

返回值

* * *

```go
func F1() (int,error){}
// 命名返回值
func F1() (i int, err error){
  return  // 相当于 return i,err 隐式返回
}
```

命名返回值和参数一样，可当做局部变量使用，最后由return隐式返回 如果返回值类型能明确表明其含义，就尽量不要对其命名

匿名函数

* * *

```go
func a(){
    func (s int){}(1) // 自执行
    b:=func(){} // 赋值给变量
    func test(f func()){f()}
    test(func(){}) // 作为参数
    return func(){} // 作为返回值
}
```

将匿名函数赋值给变量，与为普通函数提供名字标识符有着根本的区别。当然，编译器会为匿名函数生成一个“随机”符号名。

普通函数和匿名函数都可作为结构体字段，或经通道传递。

```go
type A struct {
    F func(x,y int)int
}
x:=A{F:func(x,y int)int{return x+y}}
```

### 闭包

闭包是函数和引用环境的组合体，闭包让我们不用传递参数就可读取或修改环境状态，当然也要为此付出额外代价。对于性能要求较高的场合，须慎重使用。

延迟调用

* * *

defer 常用于资源释放 解除锁定以及错误处理等

延迟调用注册的是调用，参数值在注册时被复制并缓存起来，如对状态敏感可用指针

```go
func main(){
    x,y:=1,2
    defer func(a int){
        a,y // 1,202
    }(x) // 注册时就被缓存
    x=101
    y=202
    x,y // 101,202
}
```

编译器通过插入额外指令来实现延迟调用执行，而return和panic语句都会终止当前函数流程，引发延迟调用。另外，return语句不是ret汇编指令，它会先更新返回值。

延迟调用需要额外开销，对性能有要求的地方应避免使用

错误处理

* * *

在最后一个参数返回error类型的错误状态

```go
type error interface{
    Error()string
}
```

错误变量通常以err作为前缀，且字符串内容全部小写，没有结束标点，以便于嵌入到其他格式化字符串中输出。

*   errors.New
*   fmt.Errorf 返回一个格式化内容的错误对象

自定义错误类型, 自定义错误类型通常以Error为后缀

```go
type DivError struct{              // 自定义错误类型 
   x,y int
} 

func(DivError)Error()string{          // 实现error接口方法 
   return"division by zero" 
} 

func div(x,y int) (int,error) { 
   if y==0{ 
       return 0,DivError{x,y}            // 返回自定义错误类型 
    }
    return x/y,nil
} 

func main() { 
   z,err:=div(5,0) 

   if err!=nil{ 
       switch e:=err.(type) {            // 根据类型匹配 
       case DivError: 
           fmt.Println(e,e.x,e.y) 
       default: 
           fmt.Println(e) 
        } 

       log.Fatalln(err) 
    } 

   println(z) 
}
```

大量的函数方法返回error，使得调用代码变得很难看，一堆堆检查语句充斥在代码行间。解决思路

*   使用专门的检查函数处理错误逻辑(比如记录日志)简化检查代码
*   在不影响逻辑的情况下，使用defer延后处理错误状态（err退化赋值）
*   在不中断逻辑的情况下，将错误作为内部状态保存，等最终提交时在处理

### panic recover

与error相比，panic、recover使用上像try/catch结构化异常

panic 会立即中断当前函数流程，执行延迟调用。延迟调用中可以使用recover捕获panic返回的提交的错误对象，panic会一直沿着调用栈向外传递。要么被捕获要么程序崩溃

连续多次调用panic仅最后一个会被recover捕获

在延迟函数中panic，不会影响后续延迟调用执行。而recover之后panic，可被再次捕获。另外，**recover必须在延迟调用函数中执行才能正常工作。**

调试阶段，可使用runtime/debug.PrintStack函数输出完整调用堆栈信息。

建议：除非是不可恢复性、导致系统无法正常工作的错误，否则不建议使用panic 例如：文件系统没有操作权限，服务端口被占用，数据库未启动等情况。